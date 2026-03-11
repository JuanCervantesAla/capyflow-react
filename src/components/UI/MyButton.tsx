

import { useState } from "react";
import { UnstyledButton, Text } from "@mantine/core";
import { THEME } from "../../theme/constants";

interface MyButtonProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

export function MyButton({ icon, onClick, children }: MyButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <UnstyledButton
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        padding: "10px 12px",
        background: isHovered ? THEME.colors.background.tertiary : "transparent",
        border: `1px solid ${isHovered ? THEME.colors.accent.primary : THEME.colors.border.primary}`,
        borderRadius: THEME.borderRadius.sm,
        color: isHovered ? THEME.colors.text.primary : THEME.colors.text.secondary,
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "all 0.2s ease",
      }}
    >
      {icon && (
        <span style={{ 
          display: "flex", 
          alignItems: "center",
          color: isHovered ? THEME.colors.accent.primary : THEME.colors.text.secondary,
        }}>
          {icon}
        </span>
      )}
      <Text size="sm" fw={500}>
        {children}
      </Text>
    </UnstyledButton>
  );
}