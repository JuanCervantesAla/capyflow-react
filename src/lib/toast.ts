import { showNotification } from "@mantine/notifications";

export function toastSuccess(message: string) {
  showNotification({
    title: "Success",
    message,
    color: "green",
  });
}

export function toastError(message: string) {
  showNotification({
    title: "Error",
    message,
    color: "red",
  });
}

export function showToast(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') {
  const colorMap = {
    success: 'green',
    error: 'red',
    info: 'blue',
    warning: 'yellow',
  };
  
  showNotification({
    title,
    message,
    color: colorMap[type],
    autoClose: type === 'error' ? 10000 : 5000,
  });
}