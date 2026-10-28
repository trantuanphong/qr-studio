const root = document.documentElement;
const button = document.querySelector("#theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

function updateTheme(theme, persist = true) {
  root.dataset.theme = theme;
  const isDark = theme === "dark";
  button.innerHTML = `${isDark ? "☀️" : "🌙"}`;
  button.setAttribute("aria-label", `Chuyển sang giao diện ${isDark ? "sáng" : "tối"}`);
  themeColor.content = isDark ? "#080d18" : "#f3f6fa";
  if (!persist) return;
  try {
    localStorage.setItem("qr-studio-theme", theme);
  } catch (error) {
    console.error("Could not save the selected color theme:", error);
  }
}

let initialTheme = "light";
try {
  const savedTheme = localStorage.getItem("qr-studio-theme");
  if (savedTheme === "light" || savedTheme === "dark") initialTheme = savedTheme;
} catch (error) {
  console.error("Could not read the saved color theme:", error);
}
updateTheme(initialTheme, false);
button.addEventListener("click", () => {
  updateTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
