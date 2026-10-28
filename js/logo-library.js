const storageKey = "qr-studio-logos";

const logoArtwork = [
  {
    id: "wifi",
    name: "Wi-Fi",
    color: "#087c91",
    artwork: '<path d="M38 104a128 128 0 0 1 180 0M66 132a88 88 0 0 1 124 0M94 160a48 48 0 0 1 68 0" fill="none" stroke="COLOR" stroke-width="18" stroke-linecap="round"/><circle cx="128" cy="197" r="13" fill="COLOR"/>'
  },
  {
    id: "website",
    name: "Website / URL",
    color: "#9d1c2a",
    artwork: '<circle cx="128" cy="128" r="91" fill="none" stroke="COLOR" stroke-width="16"/><path d="M37 128h182M128 37a140 140 0 0 1 0 182M128 37a140 140 0 0 0 0 182M64 76h128M64 180h128" fill="none" stroke="COLOR" stroke-width="11" stroke-linecap="round"/>'
  }
];

export const builtInLogos = logoArtwork.map((logo) => ({
  ...logo,
  dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect x="12" y="12" width="232" height="232" rx="56" fill="#ffffff"/>${logo.artwork.replaceAll("COLOR", logo.color)}</svg>`
  )}`
}));

export function getSavedLogos() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((logo) =>
      logo && typeof logo.id === "string" && typeof logo.name === "string" &&
      typeof logo.dataUrl === "string" && logo.dataUrl.startsWith("data:image/png;base64,")
    );
  } catch (error) {
    console.error("Could not read the saved logo library:", error);
    throw new Error("Không thể đọc thư viện logo trong bộ nhớ trình duyệt.");
  }
}

export function saveLogo(name, dataUrl) {
  const logos = getSavedLogos();
  const existing = logos.find((logo) => logo.dataUrl === dataUrl);
  if (existing) return existing;
  const logo = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: name.trim().slice(0, 80) || "Logo tùy chỉnh",
    dataUrl,
    savedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify([logo, ...logos]));
  } catch (error) {
    console.error("Could not save a logo to the browser library:", error);
    throw new Error("Không thể lưu logo. Bộ nhớ trình duyệt có thể đã đầy.");
  }
  return logo;
}

export function deleteSavedLogo(id) {
  const logos = getSavedLogos().filter((logo) => logo.id !== id);
  try {
    localStorage.setItem(storageKey, JSON.stringify(logos));
  } catch (error) {
    console.error("Could not update the saved logo library:", error);
    throw new Error("Không thể cập nhật thư viện logo.");
  }
}
