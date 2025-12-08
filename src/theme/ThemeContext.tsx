import { createContext, useContext, useState } from "react";
import { LIGHT_THEME, DARK_THEME } from "./Constants";

const ThemeContext = createContext({
  theme: LIGHT_THEME,
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);