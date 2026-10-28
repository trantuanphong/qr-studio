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

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) return;
  installButton.disabled = true;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
  installButton.disabled = false;
});

window.addEventListener("appinstalled", () => {
  installPrompt = null;
  installButton.hidden = true;
});
