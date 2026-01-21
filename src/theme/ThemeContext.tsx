import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { LIGHT_THEME, DARK_THEME } from "./constants";
import { themeCache } from "./themeCache";

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

  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--edge-color', theme.colors.accent.primary);
    root.style.setProperty('--edge-selected-color', theme.colors.selection.border);
    root.style.setProperty('--bg-primary', theme.colors.background.primary);
    root.style.setProperty('--bg-secondary', theme.colors.background.secondary);
    root.style.setProperty('--bg-tertiary', theme.colors.background.tertiary);
    root.style.setProperty('--border-primary', theme.colors.border.primary);
    root.style.setProperty('--text-primary', theme.colors.text.primary);
    root.style.setProperty('--text-secondary', theme.colors.text.secondary);
    
    themeCache.invalidate();
  }, [theme]);

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