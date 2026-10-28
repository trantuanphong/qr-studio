import { codeTypes } from "./data.js";
import { deleteSavedLogo, getSavedLogos } from "./logo-library.js";
import "./pwa.js";
import "./theme.js";

const historyRoot = document.querySelector("#saved-codes");
const historyFeedback = document.querySelector("#history-feedback");
const historyCount = document.querySelector("#saved-count");
const logoRoot = document.querySelector("#saved-logos");
const logoFeedback = document.querySelector("#logo-feedback");
const logoCount = document.querySelector("#logo-count");
const historyKey = "qr-studio-history";

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(historyKey) || "[]");
    if (!Array.isArray(stored)) return [];
    const items = stored.filter((item) =>
      item && typeof item.payload === "string" && codeTypes.some((type) => type.id === item.type)
    );
    let updated = false;
    items.forEach((item) => {
      if (!item.id) {
        item.id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        updated = true;
      }
    });
    if (updated) localStorage.setItem(historyKey, JSON.stringify(items));
    return items;
  } catch (error) {
    console.error("Could not read the saved code library:", error);
    throw new Error("Không thể đọc lịch sử mã trong bộ nhớ trình duyệt.");
  }
}

function createPreview(item, canvas) {
  if (item.type === "barcode") {
    if (typeof window.JsBarcode !== "function") throw new Error("Thư viện Barcode chưa tải được.");
    window.JsBarcode(canvas, item.payload, {
      format: item.format || "CODE128",
      lineColor: "#152235",
      background: "#ffffff",
      width: 2,
      height: 70,
      margin: 8,
      displayValue: false
    });
    return;
  }
  if (typeof window.qrcode !== "function") throw new Error("Thư viện QR chưa tải được.");
  const qr = window.qrcode(0, "M");
  qr.addData(item.payload);
  qr.make();
  const count = qr.getModuleCount();
  const quiet = 4;
  const extent = count + quiet * 2;
  const context = canvas.getContext("2d");
  canvas.width = 144;
  canvas.height = 144;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#152235";
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      if (qr.isDark(row, column)) {
        const x = Math.floor((column + quiet) * canvas.width / extent);
        const y = Math.floor((row + quiet) * canvas.height / extent);
        const right = Math.ceil((column + quiet + 1) * canvas.width / extent);
        const bottom = Math.ceil((row + quiet + 1) * canvas.height / extent);
        context.fillRect(x, y, right - x, bottom - y);
      }
    }
  }
}

function formatSavedAt(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Thời gian không xác định" :
    new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function renderHistory() {
  const items = readHistory();
  historyCount.textContent = `(${items.length})`;
  historyRoot.replaceChildren();
  if (!items.length) {
    historyRoot.innerHTML = '<p class="empty-library">Chưa có mã nào được lưu. Tạo mã và chọn “Lưu lịch sử” để thêm vào đây.</p>';
    return;
  }
  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "saved-code-card";
    const preview = document.createElement("div");
    preview.className = "saved-code-preview";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", `Xem trước mã ${codeTypes.find((type) => type.id === item.type).label}`);
    try {
      createPreview(item, canvas);
      preview.append(canvas);
    } catch (error) {
      const notice = document.createElement("span");
      notice.className = "field-hint";
      notice.textContent = error.message;
      preview.append(notice);
    }
    const detail = document.createElement("div");
    detail.className = "saved-code-detail";
    const title = document.createElement("h3");
    title.textContent = codeTypes.find((type) => type.id === item.type).label;
    const date = document.createElement("time");
    date.textContent = formatSavedAt(item.savedAt);
    const payload = document.createElement("p");
    payload.textContent = item.payload.slice(0, 220) + (item.payload.length > 220 ? "…" : "");
    detail.append(title, date, payload);
    const remove = document.createElement("button");
    remove.className = "button button-secondary saved-code-delete";
    remove.type = "button";
    remove.textContent = "Xóa";
    remove.setAttribute("aria-label", `Xóa mã ${index + 1} khỏi thư viện`);
    remove.addEventListener("click", () => {
      try {
        const next = readHistory().filter((saved, savedIndex) => savedIndex !== index);
        localStorage.setItem(historyKey, JSON.stringify(next));
        historyFeedback.textContent = "Đã xóa mã khỏi thư viện.";
        renderHistory();
      } catch (error) {
        historyFeedback.textContent = error.message || "Không thể xóa mã.";
      }
    });
    const actions = document.createElement("div");
    actions.className = "saved-code-actions";
    const reopen = document.createElement("a");
    reopen.className = "button button-secondary";
    reopen.href = `index.html?history=${encodeURIComponent(item.id)}`;
    reopen.textContent = "Mở trong bộ tạo";
    actions.append(reopen, remove);
    card.append(preview, detail, actions);
    historyRoot.append(card);
  });
}

function renderLogos() {
  const logos = getSavedLogos();
  logoCount.textContent = `(${logos.length})`;
  logoRoot.replaceChildren();
  if (!logos.length) {
    logoRoot.innerHTML = '<p class="empty-library">Chưa có logo cá nhân. Tải logo lên ở bộ tạo; logo sẽ tự lưu để dùng lại.</p>';
    return;
  }
  logos.forEach((logo) => {
    const card = document.createElement("article");
    card.className = "saved-logo-card";
    const image = document.createElement("img");
    image.src = logo.dataUrl;
    image.alt = `Logo ${logo.name}`;
    const name = document.createElement("strong");
    name.textContent = logo.name;
    const remove = document.createElement("button");
    remove.className = "button button-secondary";
    remove.type = "button";
    remove.textContent = "Xóa logo";
    remove.addEventListener("click", () => {
      try {
        deleteSavedLogo(logo.id);
        logoFeedback.textContent = `Đã xóa logo “${logo.name}”.`;
        renderLogos();
      } catch (error) {
        logoFeedback.textContent = error.message || "Không thể xóa logo.";
      }
    });
    card.append(image, name, remove);
    logoRoot.append(card);
  });
}

document.querySelector("#clear-history-button").addEventListener("click", () => {
  try {
    localStorage.removeItem(historyKey);
    historyFeedback.textContent = "Đã xóa toàn bộ mã đã lưu.";
    renderHistory();
  } catch (error) {
    historyFeedback.textContent = "Không thể xóa lịch sử khỏi bộ nhớ trình duyệt.";
    console.error("Could not clear the saved code library:", error);
  }
});

try {
  renderHistory();
} catch (error) {
  historyFeedback.textContent = error.message;
}
try {
  renderLogos();
} catch (error) {
  logoFeedback.textContent = error.message;
}
