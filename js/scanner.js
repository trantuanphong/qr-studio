import "./pwa.js";
import "./theme.js";

const video = document.querySelector("#scan-video");
const cameraPlaceholder = document.querySelector("#camera-placeholder");
const startButton = document.querySelector("#start-camera-button");
const stopButton = document.querySelector("#stop-camera-button");
const scanStatus = document.querySelector("#scan-status");
const fileInput = document.querySelector("#scan-file");
const filePreview = document.querySelector("#scan-file-preview");
const resultSection = document.querySelector("#scan-result");
const resultText = document.querySelector("#scan-result-text");
const openLink = document.querySelector("#open-result-link");
const copyButton = document.querySelector("#copy-result-button");
const clearButton = document.querySelector("#clear-result-button");

const reader = typeof window.ZXingBrowser?.BrowserMultiFormatReader === "function"
  ? new window.ZXingBrowser.BrowserMultiFormatReader()
  : null;
let cameraControls = null;
let cameraActive = false;
let filePreviewUrl = "";
let lastResult = "";

function getNavigableLink(value) {
  const trimmed = value.trim();
  if (/\s/.test(trimmed)) return "";
  const candidate = /^www\./i.test(trimmed) ? `https://${trimmed}` : trimmed;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function displayResult(value, source) {
  lastResult = value;
  resultText.textContent = value;
  resultSection.hidden = false;
  const href = getNavigableLink(value);
  openLink.hidden = !href;
  openLink.href = href || "#";
  scanStatus.textContent = href
    ? `Đã quét ${source}. Hãy kiểm tra địa chỉ trước khi đi tới liên kết.`
    : `Đã quét ${source}. Kiểm tra nội dung bên trên trước khi sử dụng.`;
  scanStatus.dataset.state = "success";
}

function stopCamera() {
  cameraActive = false;
  if (cameraControls) {
    cameraControls.stop();
    cameraControls = null;
  }
  video.srcObject?.getTracks().forEach((track) => track.stop());
  video.srcObject = null;
  video.parentElement.classList.remove("camera-active");
  cameraPlaceholder.hidden = false;
  startButton.disabled = false;
  stopButton.disabled = true;
}

async function startCamera() {
  if (!reader) {
    scanStatus.textContent = "Không tải được thư viện quét mã. Kiểm tra kết nối Internet rồi tải lại trang.";
    scanStatus.dataset.state = "error";
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    scanStatus.textContent = "Trình duyệt không hỗ trợ camera. Hãy chọn ảnh mã để quét.";
    scanStatus.dataset.state = "error";
    return;
  }
  cameraActive = true;
  video.parentElement.classList.add("camera-active");
  startButton.disabled = true;
  stopButton.disabled = false;
  cameraPlaceholder.hidden = true;
  scanStatus.textContent = "Đang bật camera… Hãy đưa mã vào khung hình.";
  scanStatus.dataset.state = "";
  try {
    cameraControls = await reader.decodeFromVideoDevice(undefined, video, (result, error) => {
      if (result) {
        displayResult(result.getText(), "camera");
        stopCamera();
        return;
      }
      if (error && error.name !== "NotFoundException") {
        scanStatus.textContent = "Không thể đọc khung hình camera. Thử căn lại mã hoặc chọn ảnh.";
        scanStatus.dataset.state = "error";
      }
    });
    if (!cameraActive) stopCamera();
  } catch (error) {
    stopCamera();
    scanStatus.textContent = error.name === "NotAllowedError"
      ? "Bạn chưa cấp quyền camera. Cho phép quyền truy cập hoặc chọn ảnh mã."
      : "Không thể bật camera. Hãy kiểm tra quyền truy cập và thử lại.";
    scanStatus.dataset.state = "error";
    console.error("Could not start the QR scanner camera:", error);
  }
}

function showFilePreview(file) {
  if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
  filePreviewUrl = URL.createObjectURL(file);
  filePreview.src = filePreviewUrl;
  filePreview.hidden = false;
}

startButton.addEventListener("click", startCamera);
stopButton.addEventListener("click", () => {
  stopCamera();
  scanStatus.textContent = "Camera đã tắt.";
  scanStatus.dataset.state = "";
});

fileInput.addEventListener("change", async () => {
  stopCamera();
  lastResult = "";
  resultSection.hidden = true;
  openLink.hidden = true;
  const [file] = fileInput.files;
  if (!file) return;
  if (file.size > 12 * 1024 * 1024) {
    scanStatus.textContent = "Ảnh quét không được vượt quá 12 MB.";
    scanStatus.dataset.state = "error";
    return;
  }
  if (!file.type.startsWith("image/")) {
    scanStatus.textContent = "Hãy chọn tệp ảnh có chứa mã QR hoặc Barcode.";
    scanStatus.dataset.state = "error";
    return;
  }
  if (!reader) {
    scanStatus.textContent = "Không tải được thư viện quét mã. Kiểm tra kết nối Internet rồi tải lại trang.";
    scanStatus.dataset.state = "error";
    return;
  }
  showFilePreview(file);
  scanStatus.textContent = "Đang quét ảnh đã chọn…";
  scanStatus.dataset.state = "";
  try {
    const result = await reader.decodeFromImageUrl(filePreviewUrl);
    displayResult(result.getText(), "ảnh");
  } catch (error) {
    scanStatus.textContent = "Không tìm thấy mã đọc được trong ảnh. Thử ảnh rõ nét hơn hoặc chụp gần mã.";
    scanStatus.dataset.state = "error";
  }
});

copyButton.addEventListener("click", async () => {
  if (!lastResult) return;
  try {
    await navigator.clipboard.writeText(lastResult);
    scanStatus.textContent = "Đã sao chép nội dung quét được.";
    scanStatus.dataset.state = "success";
  } catch (error) {
    scanStatus.textContent = "Không thể sao chép. Kiểm tra quyền clipboard của trình duyệt.";
    scanStatus.dataset.state = "error";
    console.error("Could not copy the scanned content:", error);
  }
});

clearButton.addEventListener("click", () => {
  lastResult = "";
  resultSection.hidden = true;
  resultText.textContent = "";
  openLink.hidden = true;
  openLink.removeAttribute("href");
  scanStatus.textContent = cameraActive ? "Camera đang quét. Hãy đưa mã vào khung hình." : "Đã xóa kết quả quét.";
  scanStatus.dataset.state = "";
});

window.addEventListener("pagehide", () => {
  stopCamera();
  if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
});
