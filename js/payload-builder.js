export function createPayloadBuilder({ dynamicFields, getSelectedType, isLivePreview }) {
  function invalidInput(message) {
    const error = new Error(message);
    error.name = "InvalidInputError";
    return error;
  }

  function getFields() {
    const data = {};
    dynamicFields.querySelectorAll("[data-field-name]").forEach((field) => {
      data[field.dataset.fieldName] = field.type === "checkbox" ? field.checked : field.value.trim();
    });
    return data;
  }

  function escapeVCard(value) {
    return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
  }

  function escapeWifi(value) {
    return value.replace(/([\\;,:"])/g, "\\$1");
  }

  function escapeICalendar(value) {
    return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function createTlv(tag, value) {
    const text = String(value);
    return `${tag}${String(new TextEncoder().encode(text).length).padStart(2, "0")}${text}`;
  }

  function crc16Ccitt(value) {
    let crc = 0xffff;
    for (const byte of new TextEncoder().encode(value)) {
      crc ^= byte << 8;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function createVietQr(fields) {
    if (fields.owner && !/^[A-Za-z0-9 ]+$/.test(fields.owner)) {
      throw invalidInput("Tên chủ tài khoản VietQR cần viết không dấu.");
    }
    const bankAccount = createTlv("00", fields.bank) + createTlv("01", fields.account);
    const merchantAccount = createTlv("00", "A000000727") +
      createTlv("01", bankAccount) +
      createTlv("02", "QRIBFTTA");
    let payload = createTlv("00", "01") +
      createTlv("01", fields.amount ? "12" : "11") +
      createTlv("38", merchantAccount) +
      createTlv("53", "704");
    if (!/^\d{6,19}$/.test(fields.account)) {
      throw invalidInput("Số tài khoản ngân hàng cần có từ 6 đến 19 chữ số.");
    }
    if (fields.amount) {
      if (!Number.isSafeInteger(Number(fields.amount)) || Number(fields.amount) < 1) {
        throw invalidInput("Số tiền chuyển khoản phải là số nguyên dương.");
      }
      payload += createTlv("54", fields.amount);
    }
    payload += createTlv("58", "VN");
    if (fields.owner) payload += createTlv("59", fields.owner.slice(0, 25));
    if (fields.transferNote) payload += createTlv("62", createTlv("08", fields.transferNote.slice(0, 25)));
    const checksumInput = `${payload}6304`;
    return `${checksumInput}${crc16Ccitt(checksumInput)}`;
  }

  function eventDate(value) {
    return value ? value.replace(/[-:]/g, "").replace(/\.\d{3}$/, "") : "";
  }

  function isValidCccdDate(value) {
    if (!/^\d{8}$/.test(value)) return false;
    const day = Number(value.slice(0, 2));
    const month = Number(value.slice(2, 4));
    const year = Number(value.slice(4, 8));
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function buildPayload() {
    const fields = getFields();
    const invalidFields = [...dynamicFields.querySelectorAll(":invalid")];
    if (invalidFields.length) {
      if (!isLivePreview()) {
        invalidFields[0].reportValidity();
        invalidFields[0].focus();
      }
      const labels = invalidFields.map((field) =>
        dynamicFields.querySelector(`label[for="${field.id}"]`)?.textContent || field.name
      );
      throw invalidInput(`Vui lòng kiểm tra các trường: ${labels.join(", ")}.`);
    }
    dynamicFields.querySelectorAll('input[type="url"]').forEach((input) => {
      if (input.value && !/^https?:$/.test(new URL(input.value).protocol)) {
        throw invalidInput(`Đường dẫn tại "${input.previousElementSibling.textContent}" phải bắt đầu bằng http:// hoặc https://.`);
      }
    });
    switch (getSelectedType()) {
      case "text": return fields.message;
      case "url": return fields.url;
      case "vietqr": return createVietQr(fields);
      case "wifi":
        if (fields.security !== "nopass" && !fields.password) throw invalidInput("Nhập mật khẩu Wi‑Fi hoặc chọn mạng không mật khẩu.");
        return `WIFI:T:${fields.security};S:${escapeWifi(fields.ssid)};${fields.security === "nopass" ? "" : `P:${escapeWifi(fields.password)};`}H:${fields.hidden ? "true" : "false"};;`;
      case "vcard":
        return ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeVCard(fields.name)}`,
          fields.company && `ORG:${escapeVCard(fields.company)}`,
          fields.title && `TITLE:${escapeVCard(fields.title)}`,
          fields.phone && `TEL:${escapeVCard(fields.phone)}`,
          fields.email && `EMAIL:${escapeVCard(fields.email)}`,
          fields.address && `ADR:;;${escapeVCard(fields.address)}`,
          "END:VCARD"].filter(Boolean).join("\n");
      case "event":
        if (fields.end && fields.end < fields.start) throw invalidInput("Thời gian kết thúc phải sau thời gian bắt đầu.");
        return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//QR Studio//Event QR//VI", "BEGIN:VEVENT",
          `SUMMARY:${escapeICalendar(fields.title)}`, `DTSTART:${eventDate(fields.start)}`,
          fields.end && `DTEND:${eventDate(fields.end)}`, fields.location && `LOCATION:${escapeICalendar(fields.location)}`,
          fields.description && `DESCRIPTION:${escapeICalendar(fields.description)}`, "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
      case "social": {
        const links = [["Facebook", fields.facebook], ["Instagram", fields.instagram],
          ["TikTok", fields.tiktok], ["Zalo", fields.zalo]].filter(([, url]) => url);
        if (!links.length) throw invalidInput("Nhập ít nhất một đường dẫn mạng xã hội.");
        return [fields.displayName, ...links]
          .map((item) => Array.isArray(item) ? `${item[0]}: ${item[1]}` : item).join("\n");
      }
      case "app": {
        const links = [fields.appStore && `App Store: ${fields.appStore}`,
          fields.playStore && `Google Play: ${fields.playStore}`].filter(Boolean);
        if (!links.length) throw invalidInput("Nhập link App Store hoặc Google Play.");
        return [fields.appName, ...links].filter(Boolean).join("\n");
      }
      case "pdf": case "image": case "playlist": case "landing": case "feedback": return fields.url;
      case "mp3": return fields.url;
      case "menu": return fields.menuUrl || `${fields.restaurant}\n${fields.items}`;
      case "coupon": return [`Mã giảm giá: ${fields.code}`, fields.discount && `Ưu đãi: ${fields.discount}`,
        fields.expiry && `Hạn sử dụng: ${fields.expiry}`, fields.terms && `Điều kiện: ${fields.terms}`].filter(Boolean).join("\n");
      case "product": return `${fields.productName}${fields.price ? `\nGiá: ${fields.price}` : ""}\n${fields.url}`;
      case "cccd": {
        if (!/^\d{12}$/.test(fields.citizenId)) throw invalidInput("Số CCCD phải có đúng 12 chữ số.");
        if (fields.oldId && !/^\d{9}$/.test(fields.oldId)) throw invalidInput("CMND cũ phải có đúng 9 chữ số.");
        if ([fields.fullName, fields.citizenAddress].some((value) => value.includes("|"))) {
          throw invalidInput("Họ tên và địa chỉ CCCD không được chứa ký tự |.");
        }
        if (!isValidCccdDate(fields.birthDate) || (fields.issueDate && !isValidCccdDate(fields.issueDate))) {
          throw invalidInput("Ngày sinh và ngày cấp cần là ngày hợp lệ theo định dạng DDMMYYYY.");
        }
        return [fields.citizenId, fields.oldId, fields.fullName.toUpperCase(), fields.birthDate,
          fields.gender, fields.citizenAddress, fields.issueDate].join("|");
      }
      case "barcode": return fields.barcodeData;
      default: throw invalidInput("Loại nội dung không được hỗ trợ.");
    }
  }

  function updateCount() {
    const text = [...dynamicFields.querySelectorAll("textarea, input:not([type='checkbox']):not([type='password'])")]
      .map((field) => field.value).join("");
    count.textContent = `${Array.from(text).length} ký tự`;
  }
  return buildPayload;
}
