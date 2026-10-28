if ("serviceWorker" in navigator && ["https:", "http:"].includes(window.location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("../service-worker.js", import.meta.url), { scope: "../" })
      .catch((error) => {
        console.error("Could not register the QR Studio offline app:", error);
      });
  }, { once: true });
}

let installPrompt = null;
const installButton = document.querySelector("#install-app-button");
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isInstalled = window.matchMedia("(display-mode: standalone)").matches
  || navigator.standalone === true;

if (isIos && !isInstalled) {
  installButton.hidden = false;
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) {
    if (isIos) {
      const instructions = document.createElement("dialog");
      instructions.className = "install-instructions";
      instructions.innerHTML = `
        <h2>Cài QR Studio trên iPhone hoặc iPad</h2>
        <ol>
          <li>Mở trang này bằng Safari, rồi nhấn nút Chia sẻ.</li>
          <li>Chọn <strong>Thêm vào Màn hình chính</strong>. Nếu chưa thấy, cuộn xuống trong bảng Chia sẻ.</li>
          <li>Nhấn <strong>Thêm</strong> để hoàn tất.</li>
        </ol>
        <form method="dialog"><button class="button button-primary" type="submit">Đã hiểu</button></form>
      `;
      document.body.append(instructions);
      instructions.addEventListener("close", () => instructions.remove(), { once: true });
      instructions.showModal();
    }
    return;
  }

  installButton.disabled = true;
  try {
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  } catch (error) {
    console.error("Could not prompt to install QR Studio:", error);
  } finally {
    installButton.disabled = false;
  }
});

window.addEventListener("appinstalled", () => {
  installPrompt = null;
  installButton.hidden = true;
});
