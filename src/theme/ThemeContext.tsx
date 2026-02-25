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
    root.style.setProperty('--bg-sidebar', theme.colors.background.sidebar);
    root.style.setProperty('--bg-node', theme.colors.background.node);
    root.style.setProperty('--border-primary', theme.colors.border.primary);
    root.style.setProperty('--border-node', theme.colors.border.node);
    root.style.setProperty('--text-primary', theme.colors.text.primary);
    root.style.setProperty('--text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--text-muted', theme.colors.text.muted);
    root.style.setProperty('--text-ink', theme.colors.text.ink);
    
    // Category colors
    root.style.setProperty('--cat-trigger', theme.colors.category.trigger);
    root.style.setProperty('--cat-data', theme.colors.category.data);
    root.style.setProperty('--cat-io', theme.colors.category.io);
    root.style.setProperty('--cat-logic', theme.colors.category.logic);
    root.style.setProperty('--cat-control', theme.colors.category.control);
    root.style.setProperty('--cat-ai', theme.colors.category.ai);
    root.style.setProperty('--cat-integration', theme.colors.category.integration);
    
    // Category background colors
    root.style.setProperty('--catbg-trigger', theme.colors.categoryBg.trigger);
    root.style.setProperty('--catbg-data', theme.colors.categoryBg.data);
    root.style.setProperty('--catbg-io', theme.colors.categoryBg.io);
    root.style.setProperty('--catbg-logic', theme.colors.categoryBg.logic);
    root.style.setProperty('--catbg-control', theme.colors.categoryBg.control);
    root.style.setProperty('--catbg-ai', theme.colors.categoryBg.ai);
    root.style.setProperty('--catbg-integration', theme.colors.categoryBg.integration);
    
    // Status colors
    root.style.setProperty('--status-idle', theme.colors.status.idle);
    root.style.setProperty('--status-ready', theme.colors.status.ready);
    root.style.setProperty('--status-running', theme.colors.status.running);
    root.style.setProperty('--status-error', theme.colors.status.error);
    root.style.setProperty('--status-success', theme.colors.status.success);
    
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