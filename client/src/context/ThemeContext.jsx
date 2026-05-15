import { createContext, useContext, useState } from "react";
import { THEMES, DEFAULT_THEME } from "../utils/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem("roshan-theme") || DEFAULT_THEME
  );

  const theme = THEMES[themeName] || THEMES[DEFAULT_THEME];

  const setTheme = (name) => {
    setThemeName(name);
    localStorage.setItem("roshan-theme", name);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
