import { createContext, useContext, useState, useMemo } from "react";
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

  const value = useMemo(() => ({ theme, toggleTheme, isDark }), [theme, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);