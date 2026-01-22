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