# QR Studio

QR Studio is a browser-based QR code and barcode generator. It creates codes on the device and does not send entered content to an application server.

## Run locally

The app uses JavaScript modules, so open it through a local HTTP server rather than directly as a `file://` URL. Python is sufficient; no package installation or build step is required:

```powershell
py -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). The QR, barcode, and scanner libraries are loaded from public CDNs on first use; the service worker caches the app shell and available libraries for later offline use.

## Project layout

- `index.html` — accessible page structure and form controls.
- `library.html` — locally saved code history and personal logo library.
- `scan.html` — camera and image-file QR / Barcode scanner with result preview.
- `manifest.webmanifest` — installable PWA metadata and app icons.
- `service-worker.js` — offline app-shell and runtime library cache.
- `icons/` — app icons used by the PWA and browser tabs.
- `css/styles.css` — responsive layout, light-by-default and dark themes.
- `js/app.js` — UI events, live preview, history, and download actions.
- `js/data.js` — code types, input schemas, quick design themes, and concise shape options.
- `js/qr-shapes.js` — QR module, finder-eye, and border geometry.
- `js/qr-renderer.js` — Canvas and SVG rendering, frame composition, and background handling.
- `js/payload-builder.js` — payload formatting and validation for supported code types.
- `js/localization.js` — Vietnamese labels for design and shape presets.
- `js/theme.js` — theme switch and saved theme preference.
- `js/library.js` — history and saved-logo management.
- `js/logo-library.js` — built-in logos and local logo storage.
- `js/scanner.js` — explicit camera controls, image scanning, and safe link detection.
- `js/pwa.js` — service worker registration.
- `ref/` — reference versions retained for comparison.

## Features

- QR content types include text, links, Wi-Fi, contacts, events, VietQR, and more; barcode output supports Code 128, EAN-13, UPC-A, and Code 39.
- Live preview updates as content and appearance settings change; missing or invalid values are reported with an alert when leaving the relevant fields.
- Quick QR themes include Việt Nam, Cổ Điển, Ngọc Bích, Biển Xanh, Hoàng Hôn, and Cyberpunk; select “Tùy chỉnh” to reveal shape, eye, and color controls.
- Custom color controls include a gradient preview that updates with its colors and linear or radial mode.
- Barcode users can set the bar and background colors in the same appearance section.
- PNG, SVG, JPEG, and WebP export, with transparent backgrounds for formats that support alpha.
- Optional logo, top/bottom captions with selectable typefaces, and custom output dimensions.
- Saved code history and uploaded logos are managed on the separate Library page and stored in local browser storage. CCCD content is excluded from history.
- The scanner can be started and stopped by the user, or can read a selected image; detected links are shown for review before opening.
- The only built-in logo choices are Wi-Fi and Website / URL; uploaded personal logos remain available for reuse and can be deleted.
- The app can be installed as a PWA and caches its pages, styles, scripts, icons, and libraries for offline use after they have been loaded once.
- On Android, install it with the browser's install prompt. On iPhone or iPad, open the site in Safari, tap Share, then choose “Add to Home Screen”; the install button shows these steps.
- Light is the default website theme; the selected light or dark theme is saved in browser storage.

Test a customized QR with a phone before printing or distributing it, especially when using a logo or decorative shapes.
