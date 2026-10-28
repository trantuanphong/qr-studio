import { createQrRenderer } from "./qr-renderer.js";
import { localizeStyleLabel } from "./localization.js";
import { createPayloadBuilder } from "./payload-builder.js";
import { createQrShapes } from "./qr-shapes.js";
import { codeTypes, qrStyles, quickStyles, fieldSchemas } from "./data.js";
import { builtInLogos, deleteSavedLogo, getSavedLogos, saveLogo } from "./logo-library.js";
import "./pwa.js";
import "./theme.js";
(() => {
  const form = document.querySelector("#qr-form");
  const dynamicFields = document.querySelector("#dynamic-fields");
  const sizeField = document.querySelector("#qr-size");
  const customSizeControl = document.querySelector("#custom-size-control");
  const customSizeField = document.querySelector("#custom-size");
  const darkField = document.querySelector("#qr-dark");
  const lightField = document.querySelector("#qr-light");
  const gradientField = document.querySelector("#qr-gradient-end");
  const useGradientField = document.querySelector("#qr-use-gradient");
  const patternField = document.querySelector("#qr-pattern");
  const eyesField = document.querySelector("#qr-eyes");
  const eyeCenterField = document.querySelector("#qr-eye-center");
  const designButtons = [...document.querySelectorAll("[data-design-style]")];
  const gradientTypeField = document.querySelector("#qr-gradient-type");
  const gradientTypeControl = document.querySelector("#gradient-type-control");
  const advancedStyleControls = document.querySelector("#advanced-style-controls");
  const gradientPreview = document.querySelector("#gradient-preview");
  const logoField = document.querySelector("#qr-logo");
  const logoNote = document.querySelector("#logo-note");
  const logoOptions = document.querySelector("#logo-options");
  const logoPresets = document.querySelector("#logo-presets");
  const clearLogoButton = document.querySelector("#clear-logo-button");
  const logoSizeField = document.querySelector("#qr-logo-size");
  const logoMarginField = document.querySelector("#qr-logo-margin");
  const captionColorField = document.querySelector("#caption-color");
  const captionFontSizeField = document.querySelector("#caption-font-size");
  const captionFontFamilyField = document.querySelector("#caption-font-family");
  const captionColorValue = document.querySelector("#caption-color-value");
  const topCaptionField = document.querySelector("#top-caption");
  const bottomCaptionField = document.querySelector("#bottom-caption");
  const barcodeFormatField = document.querySelector("#barcode-format");
  const barcodeSettings = document.querySelector("#barcode-settings");
  const qrShapeOptions = document.querySelector("#qr-shape-options");
  const gradientToggleControl = document.querySelector("#gradient-toggle-control");
  const canvas = document.querySelector("#qr-canvas");
  const sourceCanvas = document.querySelector("#qr-source-canvas");
  const emptyState = document.querySelector("#empty-state");
  const qrOutput = document.querySelector("#qr-output");
  const feedback = document.querySelector("#feedback");
  const downloadButton = document.querySelector("#download-button");
  const count = document.querySelector("#content-count");
  const caption = document.querySelector("#preview-caption");
  const sizeBadge = document.querySelector("#size-badge");
  const darkValue = document.querySelector("#qr-dark-value");
  const lightValue = document.querySelector("#qr-light-value");
  const gradientValue = document.querySelector("#qr-gradient-value");
  const gradientControl = document.querySelector("#gradient-color-control");
  const typeButtons = [...document.querySelectorAll("[data-code-type]")];
  const contentHelp = document.querySelector("#content-hint");
  const resolutionNote = document.querySelector("#resolution-note");
  const previewHeading = document.querySelector("#preview-heading");
  const emptyStateHeading = emptyState.querySelector("strong");
  const emptyStateMark = emptyState.querySelector(".empty-mark");
  const darkColorLabel = document.querySelector("#dark-color-label");
  const lightColorLabel = document.querySelector("#light-color-label");
  const formatField = document.querySelector("#export-format");
  const backgroundModeField = document.querySelector("#export-background-mode");
  const backgroundColorControl = document.querySelector("#export-background-color-control");
  const backgroundNote = document.querySelector("#export-background-note");
  const previewFrame = document.querySelector(".preview-frame");
  const designDescription = document.querySelector("#design-description");
  const themeToggle = document.querySelector("#theme-toggle");
  const downloadLabel = document.querySelector("#download-label");
  const copyContentButton = document.querySelector("#copy-content-button");
  const copyImageButton = document.querySelector("#copy-image-button");
  const printButton = document.querySelector("#print-button");
  const saveButton = document.querySelector("#save-button");
  let generatedPayload = "";
  let selectedType = "text";
  let logoImage = null;
  let logoDataUrl = "";
  let selectedLogoId = "";
  let livePreviewTimer = 0;
  let isLivePreview = false;
  let alertValidationOnFailure = false;
  let lastAlertedValidation = "";
  let selectedDesignStyle = "vietnam";

  function setFeedback(message, state = "") {
    feedback.textContent = message;
    feedback.dataset.state = state;
  }

  function invalidInput(message) {
    const error = new Error(message);
    error.name = "InvalidInputError";
    return error;
  }

  function populateStyleSelect(select, values, selected) {
    select.replaceChildren();
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = localizeStyleLabel(value);
      option.selected = value === selected;
      select.append(option);
    });
  }

  function initializeStyleControls() {
    populateStyleSelect(patternField, qrStyles.pattern, "Rounded Square QR Pattern");
    populateStyleSelect(eyesField, qrStyles.eye, "Rounded Square QR Eye");
    populateStyleSelect(eyeCenterField, qrStyles.center, "Filled Circle QR Eye Center");
  }

  function setColors(foreground, background, useGradient, gradientType = "linear", gradientEnd = foreground) {
    darkField.value = foreground;
    lightField.value = background;
    gradientField.value = gradientEnd;
    if (!hasReadableContrast(gradientField.value)) gradientField.value = foreground;
    useGradientField.checked = useGradient && gradientField.value !== foreground;
    gradientTypeField.value = gradientType;
    gradientControl.hidden = !useGradientField.checked;
    gradientTypeControl.hidden = !useGradientField.checked;
    updateGradientPreview();
    updateColorLabels();
  }

  function applyDesignStyle() {
    const style = quickStyles.find(({ id }) => id === selectedDesignStyle);
    advancedStyleControls.hidden = selectedDesignStyle !== "custom";
    if (!style) {
      designDescription.textContent = "Tự phối họa tiết, mắt định vị, đường viền và màu sắc trong phần nâng cao.";
      updateAppearanceSamples();
      return;
    }

    setColors(style.foreground, style.background, style.useGradient, style.gradientType, style.gradientEnd);
    patternField.value = style.pattern;
    eyesField.value = style.eye;
    eyeCenterField.value = style.center;
    designDescription.textContent = `Phong cách ${style.label} đã áp dụng. Chọn “Tùy chỉnh” để chỉnh từng chi tiết.`;
    setFeedback(`Đã áp dụng phong cách ${style.label}.`);
    updateAppearanceSamples();
  }

  function selectDesignStyle(styleId) {
    selectedDesignStyle = styleId;
    designButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.designStyle === styleId));
    });
    applyDesignStyle();
  }

  function clearPreview() {
    generatedPayload = "";
    canvas.width = 0;
    canvas.height = 0;
    sourceCanvas.width = 0;
    sourceCanvas.height = 0;
    qrOutput.hidden = true;
    emptyState.hidden = false;
    updateExportAvailability(false);
    caption.textContent = "Chưa có nội dung được mã hóa.";
  }

  function scheduleLivePreview(alertOnFailure = false) {
    window.clearTimeout(livePreviewTimer);
    livePreviewTimer = window.setTimeout(() => {
      const hasText = [...dynamicFields.querySelectorAll("input:not([type='checkbox']), textarea")]
        .some((field) => field.value.trim());
      if (!hasText && !alertOnFailure) {
        clearPreview();
        setFeedback("Nhập thông tin để xem trước mã tự động.");
        return;
      }
      isLivePreview = true;
      alertValidationOnFailure = alertOnFailure;
      try {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      } finally {
        isLivePreview = false;
        alertValidationOnFailure = false;
      }
    }, 180);
  }

  function alertInputProblem(message) {
    if (message === lastAlertedValidation) return;
    lastAlertedValidation = message;
    window.alert(message);
  }

  function alertForValidation(message) {
    if (alertValidationOnFailure) alertInputProblem(message);
  }

  function refreshExistingPreview() {
    if (!generatedPayload) {
      scheduleLivePreview();
      return;
    }
    try {
      renderGenerated(generatedPayload);
    } catch (error) {
      clearPreview();
      setFeedback(error.message || "Không thể cập nhật bản xem trước.", "error");
      console.error("Could not refresh QR preview:", error);
    }
  }

  function updateSizeBadge() {
    try {
      sizeBadge.textContent = `${getOutputSize()} PX`;
    } catch {
      sizeBadge.textContent = "Kích thước không hợp lệ";
    }
  }

  function luminance(hex) {
    const channels = hex.match(/[0-9a-f]{2}/gi).map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function hasReadableContrast(foreground) {
    const first = luminance(foreground);
    const second = luminance(lightField.value);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05) >= 4.5;
  }

  function hasReadableColors() {
    if (!hasReadableContrast(darkField.value)) return false;
    return selectedType === "barcode" ||
      !useGradientField.checked ||
      hasReadableContrast(gradientField.value);
  }

  function isQrLibraryAvailable() {
    const qrGenerator = window.qrcode;
    return typeof qrGenerator === "function" &&
      Boolean(qrGenerator.stringToBytesFuncs) &&
      qrGenerator.stringToBytes === qrGenerator.stringToBytesFuncs["UTF-8"];
  }

  function getOutputSize() {
    const size = sizeField.value === "custom" ? Number(customSizeField.value) : Number(sizeField.value);
    if (!Number.isInteger(size) || size < 128 || size > 4096) {
      throw invalidInput("Kích thước tùy chỉnh phải là số nguyên từ 128 đến 4096 px.");
    }
    return size;
  }

  function getLogoSettings() {
    const rawSize = Number(logoSizeField.value);
    const rawMargin = Number(logoMarginField.value);
    const size = Math.min(30, Math.max(10, Number.isFinite(rawSize) && logoSizeField.value !== "" ? Math.round(rawSize) : 17));
    const margin = Math.min(30, Math.max(0, Number.isFinite(rawMargin) && logoMarginField.value !== "" ? Math.round(rawMargin) : 5));
    logoSizeField.value = String(size);
    logoMarginField.value = String(margin);
    return { size, margin };
  }

  const shapeTools = createQrShapes({ patternField });
  const { moduleStyle, eyeGlyph, shapePath, isCompoundPath, drawPath } = shapeTools;
  const { updateBackgroundControls, renderQRCode, renderBarcode, composeDesign, createSvg } = createQrRenderer({
    canvas, sourceCanvas, darkField, lightField, gradientField, useGradientField, gradientTypeField,
    patternField, eyesField, eyeCenterField, formatField,
    backgroundModeField, backgroundColorControl, backgroundNote, previewFrame, barcodeFormatField,
    captionColorField, captionFontSizeField, captionFontFamilyField, topCaptionField,
    bottomCaptionField, getOutputSize, getLogoSettings, getSelectedType: () => selectedType,
    getLogoImage: () => logoImage, getLogoDataUrl: () => logoDataUrl, shapeTools
  });
  function updateSelectedType(type) {
    selectedType = type;
    typeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.codeType === type));
    });
    const typeInfo = codeTypes.find((item) => item.id === type);
    const isBarcode = !typeInfo.qr;
    const title = typeInfo.label;
    barcodeSettings.hidden = !isBarcode;
    qrShapeOptions.hidden = isBarcode;
    gradientToggleControl.hidden = isBarcode;
    gradientControl.hidden = isBarcode || !useGradientField.checked;
    document.querySelector("#appearance-heading").textContent = isBarcode
      ? "Tùy chỉnh màu sắc mã vạch"
      : "Tùy chỉnh kiểu dáng & màu sắc";
    renderFields(type);
    resolutionNote.textContent = isBarcode
      ? "Độ phân giải đặt chiều rộng ảnh; chiều cao mã vạch được tự cân đối."
      : "Kích thước đã chọn áp dụng cho bản xem trước và ảnh tải xuống.";
    contentHelp.textContent = isBarcode
      ? "Code 128 hỗ trợ chữ và số; EAN / UPC chỉ nhận chữ số."
      : type === "cccd"
        ? "Dữ liệu CCCD chỉ được mã hóa trên thiết bị này; không lưu nội dung nhạy cảm vào lịch sử."
        : `${title} sẽ được mã hóa trực tiếp vào mã QR trên thiết bị này.`;
    previewHeading.textContent = isBarcode ? "Xem trước Barcode" : `Xem trước ${title}`;
    emptyStateHeading.textContent = isBarcode
      ? "Mã vạch sẽ xuất hiện tại đây"
      : `Mã ${title} sẽ xuất hiện tại đây`;
    emptyStateMark.textContent = isBarcode ? "|||" : "QR";
    updateColorLabels();
    lightColorLabel.textContent = isBarcode ? "Màu nền Barcode / ảnh đặc" : "Màu nền QR / ảnh đặc";
    darkField.setAttribute("aria-label", isBarcode ? "Chọn màu vạch" : "Chọn màu mã QR");
    lightField.setAttribute("aria-label", isBarcode
      ? "Chọn màu nền Barcode và ảnh nền đặc"
      : "Chọn màu nền QR và ảnh nền đặc");
    canvas.classList.toggle("barcode-canvas", isBarcode);
    canvas.setAttribute("aria-label", isBarcode
      ? "Mã vạch được tạo từ nội dung đã nhập"
      : "Mã QR được tạo từ nội dung đã nhập");
    updateSizeBadge();
    const libraryAvailable = updateDependencyState();
    clearPreview();
    if (libraryAvailable) setFeedback(`Đã chọn ${title}. Nhập thông tin để tiếp tục.`);
  }

  function updateColorLabels() {
    const isBarcode = selectedType === "barcode";
    darkColorLabel.textContent = isBarcode
      ? "Màu vạch"
      : useGradientField.checked ? "Màu bắt đầu" : "Màu mã QR";
    darkValue.textContent = darkField.value;
    lightValue.textContent = lightField.value;
    gradientValue.textContent = gradientField.value;
    updateGradientPreview();
  }

  function updateGradientPreview() {
    if (!gradientPreview) return;
    gradientPreview.style.background = gradientTypeField.value === "radial"
      ? `radial-gradient(circle, ${darkField.value}, ${gradientField.value})`
      : `linear-gradient(to bottom right, ${darkField.value}, ${gradientField.value})`;
    gradientPreview.classList.toggle("gradient-preview-disabled", !useGradientField.checked);
  }

  function sampleSvg(label, content, viewBox = "0 0 64 48") {
    return `<div class="style-sample-content"><svg viewBox="${viewBox}" role="img" aria-label="${label}">${content}</svg><span>${label}</span></div>`;
  }

  function svgShape(path, x, y, size, fill, stroke = null) {
    const rule = isCompoundPath(path) ? ' fill-rule="evenodd"' : "";
    const strokeAttributes = stroke
      ? ` stroke="${stroke.color}" stroke-width="${stroke.width / size}" stroke-linecap="${stroke.lineCap || "butt"}"${stroke.dash?.length ? ` stroke-dasharray="${stroke.dash.map((value) => value / size).join(" ")}"` : ""}`
      : "";
    return `<path d="${path}" transform="translate(${x} ${y}) scale(${size})" fill="${fill}"${rule}${strokeAttributes}/>`;
  }

  function updateAppearanceSamples() {
    const patternMarks = [];
    for (let row = 0; row < 7; row += 1) {
      for (let column = 0; column < 7; column += 1) {
        if ((row * 3 + column * 5 + row * column) % 4 !== 0) {
          const { path, scale } = moduleStyle(row, column);
          const cell = 6;
          const size = cell * scale;
          patternMarks.push(svgShape(path, 2 + column * cell + (cell - size) / 2,
            2 + row * cell + (cell - size) / 2, size, darkField.value));
        }
      }
    }
    const patternLabel = patternField.selectedOptions[0]?.textContent || "";
    document.querySelector("#pattern-sample").innerHTML =
      sampleSvg(patternLabel, patternMarks.join(""), "0 0 48 48");

    const outer = eyeGlyph(eyesField.value);
    const center = eyeGlyph(eyeCenterField.value);
    const background = lightField.value;
    const foreground = darkField.value;
    const outerPath = svgShape(outer, 0, 0, 48, foreground);
    const innerPath = svgShape(outer, 8, 8, 32, background);
    const centerPath = svgShape(center, 16, 16, 16, foreground);
    const eyeLabel = eyesField.selectedOptions[0]?.textContent || "";
    document.querySelector("#eye-sample").innerHTML =
      sampleSvg(eyeLabel, `${outerPath}${innerPath}${centerPath}`, "0 0 48 48");
    const centerLabel = eyeCenterField.selectedOptions[0]?.textContent || "";
    document.querySelector("#eye-center-sample").innerHTML =
      sampleSvg(centerLabel, `<rect x="4" y="4" width="40" height="40" fill="${foreground}"/>` +
        `<rect x="12" y="12" width="24" height="24" fill="${background}"/>` +
        svgShape(center, 17, 17, 14, foreground), "0 0 48 48");

  }

  function renderFields(type) {
    dynamicFields.replaceChildren();
    const fragment = document.createDocumentFragment();
    fieldSchemas[type].forEach((field) => {
      const wrapper = document.createElement("div");
      wrapper.className = "dynamic-field";
      if (field.wide) wrapper.classList.add("wide");
      const label = document.createElement("label");
      const id = `field-${field.name}`;
      label.className = "field-label";
      label.htmlFor = id;
      label.textContent = field.label;
      const input = document.createElement(field.type === "textarea" ? "textarea" : field.type === "select" ? "select" : "input");
      input.id = id;
      input.name = field.name;
      input.dataset.fieldName = field.name;
      if (field.type === "select") {
        field.options.forEach(([value, text]) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = text;
          input.append(option);
        });
      } else if (field.type !== "textarea" && field.type !== "checkbox") {
        input.type = field.type || "text";
      } else if (field.type === "checkbox") {
        input.type = "checkbox";
      }
      if (field.required) input.required = true;
      if (field.placeholder) input.placeholder = field.placeholder;
      if (field.maxLength) input.maxLength = field.maxLength;
      if (field.min) input.min = field.min;
      if (field.type === "checkbox") {
        wrapper.classList.add("checkbox-field");
        const checkboxLabel = document.createElement("label");
        checkboxLabel.htmlFor = id;
        checkboxLabel.append(input, document.createTextNode(" Có"));
        wrapper.append(checkboxLabel);
      } else {
        wrapper.append(label, input);
      }
      fragment.append(wrapper);
    });
    dynamicFields.append(fragment);
    updateCount();
  }

  function updateCount() {
    const text = [...dynamicFields.querySelectorAll("input:not([type='checkbox']), textarea")]
      .map((field) => field.value).join("");
    count.textContent = `${Array.from(text).length} ký tự`;
  }

  const buildPayload = createPayloadBuilder({ dynamicFields, getSelectedType: () => selectedType, isLivePreview: () => isLivePreview });

  function updateExportAvailability(enabled) {
    [downloadButton, copyContentButton, copyImageButton, printButton].forEach((button) => { button.disabled = !enabled; });
    saveButton.disabled = !enabled || selectedType === "cccd";
  }

  function updateDependencyState() {
    const isBarcode = !codeTypes.find((item) => item.id === selectedType).qr;
    const available = isBarcode
      ? typeof window.JsBarcode === "function"
      : isQrLibraryAvailable();
    if (!available) {
      setFeedback("Thư viện tạo mã không khả dụng. Kiểm tra kết nối Internet rồi tải lại trang.", "error");
    }
    return available;
  }

  function renderGenerated(payload) {
    if (selectedType === "barcode") renderBarcode(payload);
    else renderQRCode(payload);
    composeDesign();
    generatedPayload = payload;
    qrOutput.hidden = false;
    emptyState.hidden = true;
    updateExportAvailability(true);
    caption.textContent = selectedType === "barcode"
      ? `Barcode ${barcodeFormatField.value} · Ảnh ${canvas.width} × ${canvas.height} px.`
      : `Đã mã hóa ${Array.from(payload).length} ký tự.`;
  }

  async function selectLogo(dataUrl, name, id) {
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Không thể mở logo đã chọn."));
        image.src = dataUrl;
      });
      const logoCanvas = document.createElement("canvas");
      logoCanvas.width = 256;
      logoCanvas.height = 256;
      const context = logoCanvas.getContext("2d");
      if (!context) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh logo.");
      const ratio = Math.min(256 / image.naturalWidth, 256 / image.naturalHeight);
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      context.drawImage(image, (256 - width) / 2, (256 - height) / 2, width, height);
      logoImage = image;
      logoDataUrl = logoCanvas.toDataURL("image/png");
      selectedLogoId = id;
      logoOptions.hidden = false;
      logoNote.textContent = `Đang dùng logo: ${name}. Khi có logo, QR dùng mức sửa lỗi H để tăng khả năng quét.`;
      clearPreview();
      renderLogoPresets();
      scheduleLivePreview();
    } catch (error) {
      setFeedback(error.message, "error");
      console.error("Could not select the saved logo:", error);
    }
  }

  function renderLogoPresets() {
    try {
      logoPresets.replaceChildren();
      const choices = [
        ...builtInLogos.map((logo) => ({ ...logo, builtIn: true })),
        ...getSavedLogos().map((logo) => ({ ...logo, builtIn: false }))
      ];
      choices.forEach((logo) => {
        const card = document.createElement("div");
        card.className = "logo-choice";
        const select = document.createElement("button");
        select.className = "logo-preset-button";
        select.type = "button";
        select.setAttribute("aria-pressed", String(selectedLogoId === logo.id));
        select.setAttribute("aria-label", `Dùng logo ${logo.name}`);
        const image = document.createElement("img");
        image.src = logo.dataUrl;
        image.alt = "";
        const name = document.createElement("span");
        name.textContent = logo.name;
        select.append(image, name);
        select.addEventListener("click", () => selectLogo(logo.dataUrl, logo.name, logo.id));
        card.append(select);
        if (!logo.builtIn) {
          const remove = document.createElement("button");
          remove.className = "logo-delete";
          remove.type = "button";
          remove.textContent = "×";
          remove.setAttribute("aria-label", `Xóa logo ${logo.name}`);
          remove.addEventListener("click", () => {
            try {
              deleteSavedLogo(logo.id);
              if (selectedLogoId === logo.id) clearSelectedLogo();
              renderLogoPresets();
            } catch (error) {
              setFeedback(error.message, "error");
            }
          });
          card.append(remove);
        }
        logoPresets.append(card);
      });
    } catch (error) {
      logoPresets.textContent = error.message;
      setFeedback(error.message, "error");
    }
  }

  function clearSelectedLogo() {
    logoImage = null;
    logoDataUrl = "";
    selectedLogoId = "";
    logoField.value = "";
    logoOptions.hidden = true;
    logoNote.textContent = "Logo được xử lý trong trình duyệt; logo tải lên sẽ tự lưu trong thư viện trên thiết bị.";
    clearPreview();
    renderLogoPresets();
    scheduleLivePreview();
  }

  function getHistory() {
    try {
      const value = JSON.parse(localStorage.getItem("qr-studio-history") || "[]");
      if (!Array.isArray(value)) return [];
      const history = value.filter((item) =>
        item && typeof item.payload === "string" && codeTypes.some((type) => type.id === item.type)
      );
      let updated = false;
      history.forEach((item) => {
        if (!item.id) {
          item.id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          updated = true;
        }
      });
      if (updated) localStorage.setItem("qr-studio-history", JSON.stringify(history));
      return history;
    } catch (error) {
      console.error("Could not read QR history:", error);
      throw new Error("Không thể đọc lịch sử từ bộ nhớ trình duyệt.");
    }
  }

  dynamicFields.addEventListener("input", () => {
    updateCount();
    scheduleLivePreview();
  });
  dynamicFields.addEventListener("change", () => {
    updateCount();
    scheduleLivePreview();
  });
  dynamicFields.addEventListener("focusout", (event) => {
    if (!dynamicFields.contains(event.relatedTarget)) scheduleLivePreview(true);
  });

  [
    darkField, lightField, gradientField, patternField, eyesField, eyeCenterField,
    gradientTypeField, barcodeFormatField
  ].forEach((field) => {
    field.addEventListener("change", () => {
      updateColorLabels();
      updateSizeBadge();
      if ([patternField, eyesField, eyeCenterField].includes(field)) {
        updateAppearanceSamples();
      }
      const validateColors = [darkField, lightField, gradientField, useGradientField, barcodeFormatField].includes(field);
      scheduleLivePreview(validateColors);
    });
  });
  sizeField.addEventListener("change", () => {
    customSizeControl.hidden = sizeField.value !== "custom";
    updateSizeBadge();
    scheduleLivePreview();
  });
  customSizeField.addEventListener("input", () => {
    updateSizeBadge();
    scheduleLivePreview();
  });
  customSizeField.addEventListener("blur", () => scheduleLivePreview(true));
  [logoSizeField, logoMarginField].forEach((field) => {
    field.addEventListener("input", () => {
      scheduleLivePreview();
    });
  });
  [captionColorField, captionFontSizeField, captionFontFamilyField, topCaptionField, bottomCaptionField]
    .forEach((field) => {
      const updateDecoration = () => {
        captionColorValue.textContent = captionColorField.value;
        scheduleLivePreview();
      };
      field.addEventListener("input", updateDecoration);
      field.addEventListener("change", updateDecoration);
    });
  designButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectDesignStyle(button.dataset.designStyle);
      scheduleLivePreview();
    });
  });
  useGradientField.addEventListener("change", () => {
    gradientControl.hidden = !useGradientField.checked;
    gradientTypeControl.hidden = !useGradientField.checked;
    updateColorLabels();
    scheduleLivePreview(true);
  });
  formatField.addEventListener("change", () => {
    downloadLabel.textContent = `Tải xuống ${formatField.value.toUpperCase()}`;
    updateBackgroundControls();
    refreshExistingPreview();
  });
  backgroundModeField.addEventListener("change", () => {
    updateBackgroundControls();
    refreshExistingPreview();
  });
  logoField.addEventListener("change", () => {
    const [file] = logoField.files;
    logoImage = null;
    logoDataUrl = "";
    selectedLogoId = "";
    logoOptions.hidden = true;
    clearPreview();
    renderLogoPresets();
    if (!file) {
      logoNote.textContent = "Logo được xử lý trong trình duyệt; logo tải lên sẽ tự lưu trong thư viện trên thiết bị.";
      scheduleLivePreview();
      return;
    }
    const supportedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!supportedTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
      logoNote.textContent = "Chỉ hỗ trợ PNG, JPEG, WebP hoặc SVG tối đa 2 MB.";
      setFeedback(logoNote.textContent, "error");
      alertInputProblem(logoNote.textContent);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => {
      const message = "Không đọc được tệp logo đã chọn.";
      setFeedback(message, "error");
      alertInputProblem(message);
      console.error("Could not read the selected logo file.");
    };
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => {
        const message = "Tệp logo không phải ảnh hợp lệ hoặc không thể giải mã.";
        setFeedback(message, "error");
        alertInputProblem(message);
        console.error("Could not decode the selected logo image.");
      };
      image.onload = () => {
        if (image.naturalWidth > 4096 || image.naturalHeight > 4096) {
          const message = "Logo không được vượt quá 4096 × 4096 px.";
          setFeedback(message, "error");
          alertInputProblem(message);
          return;
        }
        const logoCanvas = document.createElement("canvas");
        logoCanvas.width = 256;
        logoCanvas.height = 256;
        const logoContext = logoCanvas.getContext("2d");
        const ratio = Math.min(256 / image.naturalWidth, 256 / image.naturalHeight);
        const width = image.naturalWidth * ratio;
        const height = image.naturalHeight * ratio;
        logoContext.drawImage(image, (256 - width) / 2, (256 - height) / 2, width, height);
        logoImage = image;
        logoDataUrl = logoCanvas.toDataURL("image/png");
        let savedToLibrary = false;
        try {
          selectedLogoId = saveLogo(file.name, logoDataUrl).id;
          savedToLibrary = true;
          renderLogoPresets();
        } catch (error) {
          selectedLogoId = "";
          setFeedback(error.message, "error");
          alertInputProblem(error.message);
        }
        logoOptions.hidden = false;
        logoNote.textContent = savedToLibrary
          ? `Đã lưu logo “${file.name}” trong thư viện. QR dùng mức sửa lỗi H để tăng khả năng quét.`
          : `Đã tải logo “${file.name}” nhưng không lưu được vào thư viện. QR dùng mức sửa lỗi H để tăng khả năng quét.`;
        scheduleLivePreview();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateSelectedType(button.dataset.codeType);
      scheduleLivePreview();
    });
    clearLogoButton.addEventListener("click", clearSelectedLogo);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearPreview();
    try {
      getOutputSize();
    } catch (error) {
      setFeedback(error.message, "error");
      alertForValidation(error.message);
      return;
    }
    if (!codeTypes.find((item) => item.id === selectedType).qr && typeof window.JsBarcode !== "function") {
      updateDependencyState();
      return;
    }

    if (codeTypes.find((item) => item.id === selectedType).qr && !isQrLibraryAvailable()) {
      updateDependencyState();
      return;
    }

    if (!hasReadableColors()) {
      const message = "Hãy chọn cặp màu mã và màu nền có độ tương phản ít nhất 4.5:1.";
      setFeedback(message, "error");
      alertForValidation(message);
      return;
    }

    try {
      const payload = buildPayload();
      if (!payload) throw invalidInput("Nhập ít nhất một thông tin trước khi tạo mã.");
      renderGenerated(payload);
      lastAlertedValidation = "";
      setFeedback(`${selectedType === "barcode" ? "Barcode" : "Mã QR"} đã được tạo thành công.`, "success");
    } catch (error) {
      clearPreview();
      const message = error.message || (selectedType === "barcode"
        ? `Không thể tạo ${barcodeFormatField.value}. Kiểm tra nội dung và định dạng mã vạch.`
        : "Không thể tạo mã QR với nội dung này. Hãy rút ngắn nội dung rồi thử lại.");
      setFeedback(message, "error");
      alertForValidation(`Không thể tạo ${selectedType === "barcode" ? "Barcode" : "mã QR"}: ${message}`);
      if (error.name !== "InvalidInputError") console.error(`${selectedType} generation failed:`, error);
    }
  });

  downloadButton.addEventListener("click", async () => {
    if (!generatedPayload || canvas.width === 0) {
      setFeedback("Chưa có mã để tải xuống.", "error");
      return;
    }

    try {
      const format = formatField.value;
      let blob;
      if (format === "svg") {
        blob = new Blob([createSvg(generatedPayload)], { type: "image/svg+xml;charset=utf-8" });
      } else {
        const mimeType = format === "jpeg" ? "image/jpeg" : `image/${format}`;
        blob = await new Promise((resolve, reject) => {
          canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Không thể tạo tệp ảnh.")), mimeType, 0.95);
        });
        if (blob.type !== mimeType) {
          throw new Error(`Trình duyệt không hỗ trợ xuất ảnh ${format.toUpperCase()}.`);
        }
      }
      if (!blob) {
        throw new Error(`Không thể xuất ảnh ${formatField.value.toUpperCase()}.`);
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.download = `${selectedType === "barcode" ? "barcode" : "qr-code"}.${formatField.value === "jpeg" ? "jpg" : formatField.value}`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFeedback(`Tệp ${formatField.value.toUpperCase()} đã sẵn sàng để tải xuống.`, "success");
    } catch (error) {
      setFeedback(error.message || "Không thể tải ảnh. Hãy thử lại.", "error");
      console.error("QR export failed:", error);
    }
  });

  copyContentButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(generatedPayload);
      setFeedback("Đã sao chép nội dung mã hóa.", "success");
    } catch (error) {
      setFeedback("Không thể sao chép nội dung. Hãy kiểm tra quyền clipboard của trình duyệt.", "error");
      console.error("Clipboard text copy failed:", error);
    }
  });

  copyImageButton.addEventListener("click", async () => {
    try {
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Không thể tạo ảnh để sao chép.")), "image/png");
      });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setFeedback("Đã sao chép ảnh mã vào clipboard.", "success");
    } catch (error) {
      setFeedback("Không thể sao chép ảnh. Trình duyệt có thể chưa hỗ trợ clipboard ảnh.", "error");
      console.error("Clipboard image copy failed:", error);
    }
  });

  printButton.addEventListener("click", () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setFeedback("Trình duyệt đã chặn cửa sổ in. Hãy cho phép cửa sổ bật lên rồi thử lại.", "error");
      return;
    }
    const image = canvas.toDataURL("image/png");
    printWindow.document.title = "In mã QR / Barcode";
    printWindow.document.body.innerHTML = "";
    const imageElement = printWindow.document.createElement("img");
    imageElement.src = image;
    imageElement.alt = "Mã đã tạo";
    imageElement.style.cssText = "display:block;max-width:100%;height:auto;margin:15mm auto";
    printWindow.document.body.append(imageElement);
    imageElement.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
    setFeedback("Đã mở hộp thoại in.", "success");
  });

  saveButton.addEventListener("click", () => {
    if (selectedType === "cccd") return;
    try {
      const history = getHistory();
      history.unshift({
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: selectedType,
        payload: generatedPayload,
        format: selectedType === "barcode" ? barcodeFormatField.value : undefined,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem("qr-studio-history", JSON.stringify(history));
      setFeedback("Đã lưu mã vào lịch sử trên thiết bị này.", "success");
    } catch (error) {
      setFeedback(error.message || "Không thể lưu lịch sử. Bộ nhớ trình duyệt có thể đã đầy.", "error");
      console.error("Could not save QR history:", error);
    }
  });

  updateColorLabels();
  updateBackgroundControls();
  customSizeControl.hidden = sizeField.value !== "custom";
  logoOptions.hidden = !logoImage;
  captionColorValue.textContent = captionColorField.value;
  updateSizeBadge();
  downloadLabel.textContent = `Tải xuống ${formatField.value.toUpperCase()}`;
  initializeStyleControls();
  applyDesignStyle();
  updateAppearanceSamples();
  updateSelectedType(selectedType);
  renderLogoPresets();
  const historyId = new URLSearchParams(window.location.search).get("history");
  if (historyId) {
    try {
      const saved = getHistory().find((item) => item.id === historyId);
      if (!saved) {
        setFeedback("Không tìm thấy mã trong thư viện. Có thể mã đã bị xóa.", "error");
      } else {
        updateSelectedType(saved.type);
        if (saved.type === "barcode" && saved.format) barcodeFormatField.value = saved.format;
        renderGenerated(saved.payload);
        setFeedback("Đã mở mã đã lưu từ thư viện.", "success");
      }
    } catch (error) {
      setFeedback(error.message || "Không thể mở mã đã lưu.", "error");
      console.error("Could not restore a saved QR code:", error);
    }
  }
  updateDependencyState();
})();
