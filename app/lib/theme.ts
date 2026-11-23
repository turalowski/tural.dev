export const THEME_STORAGE_KEY = "theme";

// Runs in <head> before paint so the page never flashes the wrong theme.
// Saved choice wins; otherwise follow the OS setting.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
