const SHELL_CACHE = "qr-studio-shell-v3";
const RUNTIME_CACHE = "qr-studio-runtime-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./library.html",
  "./scan.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/app.js",
  "./js/data.js",
  "./js/library.js",
  "./js/localization.js",
  "./js/logo-library.js",
  "./js/payload-builder.js",
  "./js/pwa.js",
  "./js/qr-renderer.js",
  "./js/qr-shapes.js",
  "./js/scanner.js",
  "./js/theme.js",
  "./icons/app-icon.svg",
  "./icons/app-icon-192.png",
  "./icons/app-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function cacheKey(requestUrl) {
  const url = new URL(requestUrl);
  url.search = "";
  url.hash = "";
  return new Request(url.href);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    if (!["https:", "http:"].includes(url.protocol)) return;
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const key = cacheKey(request.url);
        try {
          const response = await fetch(request);
          if (response.ok || response.type === "opaque") {
            try {
              await cache.put(key, response.clone());
            } catch (error) {
              console.warn("Could not cache a remote library response:", error);
            }
          }
          return response;
        } catch (error) {
          const cached = await cache.match(key);
          if (cached) return cached;
          throw error;
        }
      })
    );
    return;
  }

  const key = cacheKey(request.url);
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(SHELL_CACHE);
          await cache.put(key, response.clone());
        }
        return response;
      }).catch(async () => {
        const cached = await caches.match(key) || await caches.match("./index.html");
        return cached || Response.error();
      })
    );
    return;
  }

  event.respondWith(
    caches.match(key).then((cached) => cached || fetch(request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(SHELL_CACHE);
        await cache.put(key, response.clone());
      }
      return response;
    }))
  );
});
