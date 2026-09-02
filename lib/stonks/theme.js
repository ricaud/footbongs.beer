const THEMES = ["light", "dark", "golf"];
const STORAGE_KEY = "stonks-theme";

function resolveTheme(stored, prefersDark) {
  if (THEMES.includes(stored)) return stored;
  return prefersDark ? "dark" : "light";
}

function readStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredTheme(theme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode */
  }
}

function prefersDarkScheme() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readTheme() {
  return resolveTheme(readStoredTheme(), prefersDarkScheme());
}

module.exports = {
  THEMES,
  STORAGE_KEY,
  resolveTheme,
  readStoredTheme,
  writeStoredTheme,
  prefersDarkScheme,
  readTheme,
};
