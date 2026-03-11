import { useState } from "react";
import { Tooltip } from "@mantine/core";
import { useTheme } from "../../theme/ThemeContext";

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
        background: theme.colors.ink,
        color: theme.colors.paper,
        borderColor: theme.colors.ink,
      };
    }
    
    if (isHovered) {
      return {
        background: theme.colors.paper,
        color: theme.colors.ink,
        borderColor: theme.colors.ink,
        transform: "translateY(-1px)",
        boxShadow: "0 3px 8px rgba(45, 52, 54, 0.15)",
      };
    }

    return {
      background: theme.colors.paper,
      color: theme.colors.ink,
      borderColor: theme.colors.ink,
      transform: "translateY(0)",
      boxShadow: "0 1px 3px rgba(45, 52, 54, 0.1)",
    };
  };

  const button = (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: 36,
        height: 36,
        border: `2px solid`,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.15s ease",
        fontWeight: 600,
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
            background: theme.colors.paper,
            border: `2px solid ${theme.colors.ink}`,
            color: theme.colors.ink,
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            padding: "6px 10px",
          },
          arrow: {
            borderColor: theme.colors.ink,
          },
        }}
      >
        {button}
      </Tooltip>
    );
  }

  return button;
}
