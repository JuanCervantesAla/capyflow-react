import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from "@tabler/icons-react";

const PAPER = "#FFF8F0";
const INK = "#2d3436";
const ORANGE = "#E8950C";
const RED = "#f43f5e";
const BLUE = "#3b82f6";
const YELLOW = "#eab308";

const baseStyles = {
  root: {
    background: PAPER,
    border: `2px solid ${INK}`,
    padding: '12px 16px',
  },
  title: {
    color: INK,
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '0.3px',
  },
  description: {
    color: INK,
    fontSize: '13px',
    opacity: 0.8,
  },
  closeButton: {
    color: INK,
    '&:hover': {
      background: 'rgba(45, 52, 54, 0.1)',
    },
  },
};

export function toastSuccess(message: string) {
  showNotification({
    title: "SUCCESS",
    message,
    color: ORANGE,
    icon: <IconCheck size={20} />,
    autoClose: 4000,
    styles: {
      ...baseStyles,
      icon: {
        background: ORANGE,
        color: PAPER,
      },
    },
  });
}

export function toastError(message: string) {
  showNotification({
    title: "ERROR",
    message,
    color: RED,
    icon: <IconX size={20} />,
    autoClose: 6000,
    styles: {
      ...baseStyles,
      root: {
        ...baseStyles.root,
        border: `2px solid ${RED}`,
      },
      icon: {
        background: RED,
        color: PAPER,
      },
    },
  });
}

export function showToast(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') {
  const config = {
    success: {
      color: ORANGE,
      icon: <IconCheck size={20} />,
      borderColor: INK,
      iconBg: ORANGE,
    },
    error: {
      color: RED,
      icon: <IconX size={20} />,
      borderColor: RED,
      iconBg: RED,
    },
    info: {
      color: BLUE,
      icon: <IconInfoCircle size={20} />,
      borderColor: BLUE,
      iconBg: BLUE,
    },
    warning: {
      color: YELLOW,
      icon: <IconAlertTriangle size={20} />,
      borderColor: YELLOW,
      iconBg: YELLOW,
    },
  };

  const currentConfig = config[type];
  
  showNotification({
    title: title.toUpperCase(),
    message,
    color: currentConfig.color,
    icon: currentConfig.icon,
    autoClose: type === 'error' ? 6000 : 4000,
    styles: {
      ...baseStyles,
      root: {
        ...baseStyles.root,
        border: `2px solid ${currentConfig.borderColor}`,
      },
      icon: {
        background: currentConfig.iconBg,
        color: PAPER,
      },
    },
  });
}