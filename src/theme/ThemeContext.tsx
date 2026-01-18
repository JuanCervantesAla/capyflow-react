import { createContext, useContext, useState, useMemo, useCallback } from "react";
import { LIGHT_THEME, DARK_THEME } from "./constants";

const ThemeContext = createContext({
  theme: LIGHT_THEME,
});

const ThemeActionContext = createContext({
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = useMemo(() => (isDark ? DARK_THEME : LIGHT_THEME), [isDark]);

  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);

  const themeValue = useMemo(() => ({ theme }), [theme]);
  const actionValue = useMemo(() => ({ toggleTheme, isDark }), [toggleTheme, isDark]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <ThemeActionContext.Provider value={actionValue}>
        {children}
      </ThemeActionContext.Provider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const useThemeActions = () => useContext(ThemeActionContext);