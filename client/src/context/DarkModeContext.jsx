import { createContext, useContext, useState, useEffect } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const s = localStorage.getItem("roshan-dark");
    if (s !== null) return s === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("roshan-dark", isDark);
  }, [isDark]);

  const toggle = () => {
    setIsDark(d => {
      const next = !d;
      localStorage.setItem("roshan-dark", next);
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);