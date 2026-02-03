import { FC, ReactNode, useState } from "react";
import { UnstyledButton, Text } from "@mantine/core";
import { useTheme } from "../../theme/ThemeContext";

interface ActionButtonProps {
  icon: ReactNode;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  hoverColor?: string;
}

export const ActionButton: FC<ActionButtonProps> = ({
  icon,
  children,
  variant = "secondary",
  onClick,
  hoverColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isPrimary = variant === "primary";
  const { theme } = useTheme();

  return (
    <UnstyledButton
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: theme.borderRadius.sm,
        background: isPrimary
          ? theme.colors.accent.primary
          : (isHovered ? theme.colors.background.tertiary : theme.colors.background.secondary),
        border: `1px solid ${isPrimary ? theme.colors.accent.primary : (isHovered ? (hoverColor || theme.colors.accent.primary) : theme.colors.border.primary)}`,
        color: isPrimary ? "#fff" : (isHovered ? (hoverColor || theme.colors.accent.primary) : theme.colors.text.secondary),
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ display: "flex", alignItems: "center" }}>
        {icon}
      </span>
      <Text size="sm" fw={600}>
        {children}
      </Text>
    </UnstyledButton>
  );
};