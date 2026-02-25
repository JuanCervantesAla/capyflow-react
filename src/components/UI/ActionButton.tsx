import { FC, ReactNode, useState } from "react";
import { UnstyledButton, Text } from "@mantine/core";
import { useTheme } from "../../theme/ThemeContext";

interface ActionButtonProps {
  icon: ReactNode;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

export const ActionButton: FC<ActionButtonProps> = ({
  icon,
  children,
  variant = "secondary",
  onClick,
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
        gap: 10,
        padding: "6px 12px",
        borderRadius: 4,
        background: isPrimary
          ? theme.colors.accent.primary
          : (isHovered ? "rgba(201, 135, 61, 0.1)" : "transparent"),
        border: "none",
        color: isPrimary ? "#fff" : (isHovered ? theme.colors.text.sidebarItemHover : theme.colors.text.sidebarItem),
        transition: "all 0.15s ease",
        width: "100%",
      }}
    >
      <span style={{ 
        display: "flex", 
        alignItems: "center",
        color: "inherit",
        transition: "color 0.15s ease",
      }}>
        {icon}
      </span>
      <Text 
        size="14px" 
        fw={400} 
        style={{ 
          flex: 1, 
          textAlign: 'left',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {children}
      </Text>
    </UnstyledButton>
  );
};