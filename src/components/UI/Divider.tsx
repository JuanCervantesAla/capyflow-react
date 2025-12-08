import { useTheme } from "../../theme/themeContext";

export function Divider() {
  const { theme } = useTheme();
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${theme.colors.border.primary} 50%, transparent 100%)`,
        margin: `${theme.spacing.xs}px 0`,
      }}
    />
  );
}