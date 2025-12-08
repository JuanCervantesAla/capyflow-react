import { useTheme } from "../../theme/themeContext";

interface ControlCardProps {
  children: React.ReactNode;
}

export function ControlCard({ children }: ControlCardProps) {
  const { theme } = useTheme();
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background.secondary} 0%, ${theme.colors.background.tertiary} 100%)`,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.xs,
        boxShadow: `${theme.effects.shadow}, ${theme.effects.glowPurple}`,
        backdropFilter: theme.effects.blur,
      }}
    >
      {children}
    </div>
  );
}
