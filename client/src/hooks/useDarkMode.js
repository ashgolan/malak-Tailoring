/**
 * useDarkMode.js
 * ──────────────
 * Hook لإدارة Dark Mode
 *
 * شימוש:
 *   const { isDark, toggle, setDark } = useDarkMode();
 *
 * يحفظ الإعداد في localStorage ويطبقه على <html data-theme="dark">
 */

import { useState, useEffect } from "react";

const STORAGE_KEY = "roshan-dark-mode";

function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function useDarkMode() {
  const [isDark, setIsDarkState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === "true";
    // Follow OS preference as default
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    applyTheme(isDark);
    localStorage.setItem(STORAGE_KEY, isDark);
  }, [isDark]);

  // Listen for OS preference changes
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setIsDarkState(e.matches);
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const toggle = () => setIsDarkState((d) => !d);
  const setDark = (val) => setIsDarkState(val);

  return { isDark, toggle, setDark };
}
