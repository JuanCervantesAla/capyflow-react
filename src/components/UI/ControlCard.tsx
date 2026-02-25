import { useTheme } from "../../theme/themeContext";

interface ControlCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function ControlCard({ children, style }: ControlCardProps) {
  const { theme } = useTheme();
  return (
    <div
      style={{
        background: theme.colors.paper,
        border: `2px solid ${theme.colors.ink}`,
        borderRadius: 8,
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxShadow: "0 2px 8px rgba(45, 52, 54, 0.1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
