import { FC, ReactNode, useState } from "react";
import { UnstyledButton } from "@mantine/core";
import { useTheme } from "../../theme/themeContext";

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
}

export const IconButton: FC<IconButtonProps> = ({ icon, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  return (
    <UnstyledButton
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.borderRadius.sm,
        background: isHovered ? theme.colors.background.tertiary : theme.colors.background.secondary,
        border: `1px solid ${isHovered ? theme.colors.accent.primary : theme.colors.border.primary}`,
        color: isHovered ? theme.colors.accent.primary : theme.colors.text.secondary,
        transition: "all 0.2s ease",
      }}
    >
      {icon}
    </UnstyledButton>
  );
};