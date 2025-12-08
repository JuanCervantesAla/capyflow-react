import { useState } from "react";
import { Tooltip } from "@mantine/core";
import { useTheme } from "../../theme/themeContext";

interface ControlButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  active?: boolean;
  highlight?: boolean;
}

export function ControlButton({ 
  icon, 
  onClick, 
  tooltip,
  active = false,
  highlight = false
}: ControlButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const getButtonStyle = () => {
    if (active) {
      return {
        background: `linear-gradient(135deg, ${theme.colors.accent.primary} 0%, ${theme.colors.accent.secondary} 100%)`,
        color: theme.colors.text.primary,
        boxShadow: theme.effects.glowPurpleMedium,
      };
    }
    
    if (highlight && isHovered) {
      return {
        background: `linear-gradient(135deg, ${theme.colors.accent.cyan} 0%, ${theme.colors.accent.cyanDark} 100%)`,
        color: theme.colors.text.primary,
        boxShadow: theme.effects.glowCyan,
      };
    }

    if (isHovered) {
      return {
        background: `rgba(124, 58, 237, 0.2)`,
        color: theme.colors.text.accent,
        boxShadow: "0 0 10px rgba(124, 58, 237, 0.3)",
      };
    }

    return {
      background: "transparent",
      color: theme.colors.text.secondary,
      boxShadow: "none",
    };
  };

  const button = (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: 40,
        height: 40,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius.sm,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...getButtonStyle(),
      }}
    >
      {icon}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip 
        label={tooltip} 
        position="right"
        offset={12}
        withArrow
        styles={{
          tooltip: {
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            color: theme.colors.text.primary,
            fontSize: 12,
            fontWeight: 500,
          },
          arrow: {
            borderColor: theme.colors.border.primary,
          },
        }}
      >
        {button}
      </Tooltip>
    );
  }

  return button;
}
