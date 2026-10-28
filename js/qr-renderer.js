export function createQrRenderer(dependencies) {
  const {
    canvas, sourceCanvas, darkField, lightField, gradientField, useGradientField, gradientTypeField,
    patternField, eyesField, eyeCenterField, formatField,
    backgroundModeField, backgroundColorControl, backgroundNote, previewFrame, barcodeFormatField,
    captionColorField, captionFontSizeField, captionFontFamilyField, topCaptionField,
    bottomCaptionField, getOutputSize, getLogoSettings, getSelectedType, getLogoImage, getLogoDataUrl,
    shapeTools
  } = dependencies;
  const { moduleStyle, eyeGlyph, isCompoundPath, drawPath } = shapeTools;
  let gradientCanvas = null;

  function isTransparentBackground() {
    return backgroundModeField.value === "transparent" && formatField.value !== "jpeg";
  }

  function getBackgroundFill() {
    return isTransparentBackground() ? "none" : lightField.value;
  }

  function updateBackgroundControls() {
    const supportsTransparency = formatField.value !== "jpeg";
    const transparentOption = backgroundModeField.querySelector('option[value="transparent"]');
    transparentOption.disabled = !supportsTransparency;
    if (!supportsTransparency) backgroundModeField.value = "solid";
    const transparent = isTransparentBackground();
    backgroundColorControl.hidden = transparent;
    previewFrame.classList.toggle("transparent-background", transparent);
    backgroundNote.textContent = formatField.value === "jpeg"
      ? "JPEG không hỗ trợ nền trong suốt; ảnh sẽ dùng màu nền đã chọn."
      : transparent
        ? "Vùng nền sẽ trong suốt trong PNG, WebP và SVG."
        : `${formatField.value.toUpperCase()} sẽ dùng màu nền đã chọn.`;
  }

  function gradientBrush(context, size) {
    if (!useGradientField.checked) return darkField.value;
    const gradient = gradientTypeField.value === "radial"
      ? context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.72)
      : context.createLinearGradient(size * 0.08, size * 0.08, size * 0.92, size * 0.92);
    gradient.addColorStop(0, darkField.value);
    gradient.addColorStop(1, gradientField.value);
    return gradient;
  }

  function drawQrArtwork(context, moduleCount, quietZone, moduleSize, fill, isDark, maskOnly = false) {
    const isFinderModule = (row, column) =>
      (row < 7 && column < 7) ||
      (row < 7 && column >= moduleCount - 7) ||
      (row >= moduleCount - 7 && column < 7);

    for (let row = 0; row < moduleCount; row += 1) {
      for (let column = 0; column < moduleCount; column += 1) {
        if (!isFinderModule(row, column) && isDark(row, column)) {
          const { path, scale } = moduleStyle(row, column);
          const x = (column + quietZone + (1 - scale) / 2) * moduleSize;
          const y = (row + quietZone + (1 - scale) / 2) * moduleSize;
          drawPath(context, path, x, y, moduleSize * scale, fill);
        }
      }
    }

    [[0, 0], [0, moduleCount - 7], [moduleCount - 7, 0]].forEach(([row, column]) => {
      const x = (column + quietZone) * moduleSize;
      const y = (row + quietZone) * moduleSize;
      const outer = eyeGlyph(eyesField.value);
      const center = eyeGlyph(eyeCenterField.value);
      drawPath(context, outer, x, y, moduleSize * 7, fill);
      if (maskOnly || isTransparentBackground()) {
        context.save();
        context.globalCompositeOperation = "destination-out";
        drawPath(context, outer, x + moduleSize, y + moduleSize, moduleSize * 5, "#000000");
        context.restore();
      } else {
        drawPath(context, outer, x + moduleSize, y + moduleSize, moduleSize * 5, lightField.value);
      }
      drawPath(context, center, x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, fill);
    });
  }

  function renderQRCode(payload) {
    const qr = window.qrcode(0, getLogoImage() ? "H" : "M");
    qr.addData(payload, "Byte");
    qr.make();

    const size = getOutputSize();
    const quietZone = 4;
    const moduleCount = qr.getModuleCount();
    const moduleSize = size / (moduleCount + quietZone * 2);
    sourceCanvas.width = size;
    sourceCanvas.height = size;
    const context = sourceCanvas.getContext("2d", { alpha: true });
    context.clearRect(0, 0, size, size);
    if (!isTransparentBackground()) {
      context.fillStyle = lightField.value;
      context.fillRect(0, 0, size, size);
    }
    if (useGradientField.checked) {
      if (!gradientCanvas) gradientCanvas = document.createElement("canvas");
      gradientCanvas.width = size;
      gradientCanvas.height = size;
      const gradientContext = gradientCanvas.getContext("2d", { alpha: true });
      drawQrArtwork(gradientContext, moduleCount, quietZone, moduleSize, "#FFFFFF",
        (row, column) => qr.isDark(row, column), true);
      gradientContext.globalCompositeOperation = "source-in";
      gradientContext.fillStyle = gradientBrush(gradientContext, size);
      gradientContext.fillRect(0, 0, size, size);
      gradientContext.globalCompositeOperation = "source-over";
      context.drawImage(gradientCanvas, 0, 0);
    } else {
      drawQrArtwork(context, moduleCount, quietZone, moduleSize, darkField.value, (row, column) => qr.isDark(row, column));
    }
    if (getLogoImage()) {
      const { size: logoPercent, margin: marginPercent } = getLogoSettings();
      const logoSize = size * logoPercent / 100;
      const margin = logoSize * marginPercent / 100;
      const frameSize = logoSize + margin * 2;
      if (isTransparentBackground()) {
        context.globalCompositeOperation = "destination-out";
      } else {
        context.fillStyle = lightField.value;
      }
      context.fillRect((size - frameSize) / 2, (size - frameSize) / 2, frameSize, frameSize);
      context.globalCompositeOperation = "source-over";
      context.drawImage(getLogoImage(), (size - logoSize) / 2, (size - logoSize) / 2, logoSize, logoSize);
    }
  }

  function updateColorLabels() {
    darkValue.textContent = darkField.value;
    lightValue.textContent = lightField.value;
    gradientValue.textContent = gradientField.value;
  }

  function renderBarcode(payload) {
    const size = getOutputSize();
    const estimatedModules = barcodeFormatField.value === "EAN13" || barcodeFormatField.value === "UPC"
      ? 110
      : barcodeFormatField.value === "CODE39"
        ? Math.max(100, payload.length * 16 + 35)
        : Math.max(100, payload.length * 11 + 35);
    const barWidth = size / estimatedModules;
    const barcodeCanvas = document.createElement("canvas");
    window.JsBarcode(barcodeCanvas, payload, {
      format: barcodeFormatField.value,
      lineColor: darkField.value,
      background: isTransparentBackground() ? "rgba(0, 0, 0, 0)" : lightField.value,
      width: barWidth,
      height: Math.round(size * 0.32),
      displayValue: true,
      fontSize: Math.max(14, Math.round(size * 0.035)),
      margin: Math.round(size * 0.045),
      textMargin: Math.round(size * 0.015)
    });
    const outputHeight = Math.round(size * barcodeCanvas.height / barcodeCanvas.width);
    sourceCanvas.width = size;
    sourceCanvas.height = outputHeight;
    sourceCanvas.getContext("2d").drawImage(barcodeCanvas, 0, 0, size, outputHeight);
  }

  function getDecorationSettings() {
    const enteredFontSize = Number(captionFontSizeField.value);
    const fontSize = Number.isFinite(enteredFontSize) && enteredFontSize > 0
      ? Math.min(256, Math.max(8, enteredFontSize))
      : 28;
    return {
      color: captionColorField.value,
      fontSize,
      fontFamily: captionFontFamilyField.value,
      top: topCaptionField.value.trim(),
      bottom: bottomCaptionField.value.trim()
    };
  }

  function getCompositionMetrics(width, height, settings) {
    const inset = 12;
    const topBand = settings.top ? Math.ceil(settings.fontSize * 1.8 + 14) : 0;
    const bottomBand = settings.bottom ? Math.ceil(settings.fontSize * 1.8 + 14) : 0;
    return {
      inset,
      topBand,
      bottomBand,
      width: width + inset * 2,
      height: height + inset * 2 + topBand + bottomBand,
      qrX: inset,
      qrY: inset + topBand
    };
  }

  function composeDesign() {
    const settings = getDecorationSettings();
    const metrics = getCompositionMetrics(sourceCanvas.width, sourceCanvas.height, settings);
    canvas.width = metrics.width;
    canvas.height = metrics.height;
    const context = canvas.getContext("2d", { alpha: true });
    context.fillStyle = lightField.value;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!isTransparentBackground()) context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sourceCanvas, metrics.qrX, metrics.qrY);

    if (settings.top || settings.bottom) {
      context.fillStyle = settings.color;
      context.font = `600 ${settings.fontSize}px ${settings.fontFamily}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const textX = canvas.width / 2;
      if (settings.top) context.fillText(settings.top, textX, metrics.inset + metrics.topBand / 2, canvas.width - metrics.inset * 2);
      if (settings.bottom) {
        context.fillText(settings.bottom, textX, metrics.qrY + sourceCanvas.height + metrics.bottomBand / 2,
          canvas.width - metrics.inset * 2);
      }
    }

  }

  function escapeXml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;"
    })[character]);
  }

  function decorateSvg(baseSvg) {
    const settings = getDecorationSettings();
    const metrics = getCompositionMetrics(sourceCanvas.width, sourceCanvas.height, settings);
    const innerSvg = baseSvg.replace(/^<svg\b[^>]*>/i, "").replace(/<\/svg>\s*$/i, "");
    const textWidth = canvas.getContext("2d");
    textWidth.font = `600 ${settings.fontSize}px ${settings.fontFamily}`;
    const maxTextWidth = canvas.width - metrics.inset * 2;
    const renderCaption = (value, y) => {
      if (!value) return "";
      const measuredWidth = textWidth.measureText(value).width;
      const fit = measuredWidth > maxTextWidth
        ? ` textLength="${maxTextWidth}" lengthAdjust="spacingAndGlyphs"`
        : "";
      return `<text x="${metrics.width / 2}" y="${y}" fill="${settings.color}" font-family="${settings.fontFamily}" font-size="${settings.fontSize}" font-weight="600" text-anchor="middle" dominant-baseline="middle"${fit}>${escapeXml(value)}</text>`;
    };
    const topY = metrics.inset + metrics.topBand / 2;
    const bottomY = metrics.qrY + sourceCanvas.height + metrics.bottomBand / 2;
    const text = [
      renderCaption(settings.top, topY),
      renderCaption(settings.bottom, bottomY)
    ].join("");
    const background = isTransparentBackground() ? "" : `<rect width="100%" height="100%" fill="${lightField.value}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${metrics.width}" height="${metrics.height}" viewBox="0 0 ${metrics.width} ${metrics.height}">${background}<svg x="${metrics.qrX}" y="${metrics.qrY}" width="${sourceCanvas.width}" height="${sourceCanvas.height}" viewBox="0 0 ${sourceCanvas.width} ${sourceCanvas.height}">${innerSvg}</svg>${text}</svg>`;
  }

  function createSvg(payload) {
    const svgNamespace = "http://www.w3.org/2000/svg";
    if (getSelectedType() === "barcode") {
      const svg = document.createElementNS(svgNamespace, "svg");
      const size = getOutputSize();
      const estimatedModules = barcodeFormatField.value === "EAN13" || barcodeFormatField.value === "UPC"
        ? 110
        : barcodeFormatField.value === "CODE39"
          ? Math.max(100, payload.length * 16 + 35)
          : Math.max(100, payload.length * 11 + 35);
      window.JsBarcode(svg, payload, {
        format: barcodeFormatField.value,
        lineColor: darkField.value,
        background: isTransparentBackground() ? "rgba(0, 0, 0, 0)" : lightField.value,
        width: size / estimatedModules,
        height: Math.round(size * 0.32),
        displayValue: true,
        fontSize: Math.max(14, Math.round(size * 0.035)),
        margin: Math.round(size * 0.045),
        textMargin: Math.round(size * 0.015)
      });
      svg.setAttribute("width", sourceCanvas.width);
      svg.setAttribute("height", sourceCanvas.height);
      return decorateSvg(new XMLSerializer().serializeToString(svg));
    }

    const qr = window.qrcode(0, getLogoImage() ? "H" : "M");
    qr.addData(payload, "Byte");
    qr.make();
    const size = getOutputSize();
    const quietZone = 4;
    const moduleCount = qr.getModuleCount();
    const moduleSize = size / (moduleCount + quietZone * 2);
    const gradient = useGradientField.checked
      ? gradientTypeField.value === "radial"
        ? `<defs><radialGradient id="qr-gradient" gradientUnits="userSpaceOnUse" cx="${size / 2}" cy="${size / 2}" r="${size * 0.72}"><stop offset="0" stop-color="${darkField.value}"/><stop offset="1" stop-color="${gradientField.value}"/></radialGradient></defs>`
        : `<defs><linearGradient id="qr-gradient" gradientUnits="userSpaceOnUse" x1="${size * 0.08}" y1="${size * 0.08}" x2="${size * 0.92}" y2="${size * 0.92}"><stop offset="0" stop-color="${darkField.value}"/><stop offset="1" stop-color="${gradientField.value}"/></linearGradient></defs>`
      : "";
    const fill = useGradientField.checked ? "url(#qr-gradient)" : darkField.value;
    const modules = [];
    for (let row = 0; row < moduleCount; row += 1) {
      for (let column = 0; column < moduleCount; column += 1) {
        const finder = (row < 7 && column < 7) ||
          (row < 7 && column >= moduleCount - 7) ||
          (row >= moduleCount - 7 && column < 7);
        if (!finder && qr.isDark(row, column)) {
          const { path, scale } = moduleStyle(row, column);
          const x = (column + quietZone + (1 - scale) / 2) * moduleSize;
          const y = (row + quietZone + (1 - scale) / 2) * moduleSize;
          modules.push(`<path d="${path}" transform="translate(${x} ${y}) scale(${moduleSize * scale})" fill="${fill}"${isCompoundPath(path) ? ' fill-rule="evenodd"' : ""}/>`);
        }
      }
    }
    const finders = [[0, 0], [0, moduleCount - 7], [moduleCount - 7, 0]]
      .map(([row, column]) => {
        const x = (column + quietZone) * moduleSize;
        const y = (row + quietZone) * moduleSize;
        const outer = eyeGlyph(eyesField.value);
        const center = eyeGlyph(eyeCenterField.value);
        const outerRule = isCompoundPath(outer) ? ' fill-rule="evenodd"' : "";
        const centerRule = isCompoundPath(center) ? ' fill-rule="evenodd"' : "";
        return `<path d="${outer}" transform="translate(${x} ${y}) scale(${moduleSize * 7})" fill="${fill}"${outerRule}/><path d="${outer}" transform="translate(${x + moduleSize} ${y + moduleSize}) scale(${moduleSize * 5})" fill="${getBackgroundFill()}"${outerRule}/><path d="${center}" transform="translate(${x + moduleSize * 2} ${y + moduleSize * 2}) scale(${moduleSize * 3})" fill="${fill}"${centerRule}/>`;
      }).join("");
    let logo = "";
    if (getLogoDataUrl()) {
      const { size: logoPercent, margin: marginPercent } = getLogoSettings();
      const logoSize = size * logoPercent / 100;
      const margin = logoSize * marginPercent / 100;
      const boxSize = logoSize + margin * 2;
      const boxPosition = (size - boxSize) / 2;
      const logoPosition = (size - logoSize) / 2;
      const logoBackground = isTransparentBackground() ? "" : `<rect x="${boxPosition}" y="${boxPosition}" width="${boxSize}" height="${boxSize}" fill="${lightField.value}"/>`;
      logo = `${logoBackground}<image href="${getLogoDataUrl()}" x="${logoPosition}" y="${logoPosition}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`;
    }
    const background = isTransparentBackground() ? "" : `<rect width="100%" height="100%" fill="${lightField.value}"/>`;
    const baseSvg = `<svg xmlns="${svgNamespace}" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${background}${gradient}${modules.join("")}${finders}${logo}</svg>`;
    return decorateSvg(baseSvg);
  }
  return { updateBackgroundControls, renderQRCode, renderBarcode, composeDesign, createSvg };
}
