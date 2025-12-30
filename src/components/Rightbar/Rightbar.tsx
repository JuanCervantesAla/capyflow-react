import { Paper, Text, Group, CloseButton } from "@mantine/core";
import { useTheme } from "../../theme/ThemeContext";
import { useEffect, useState } from "react";

interface RightbarProps {
  node: any;
  onClose: () => void;
}

export function Rightbar({ node, onClose }: RightbarProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(!!node);

  useEffect(() => {
    if (node) {
      setShouldRender(true);
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [node]);

  if (!shouldRender) return null;

  return (
    <Paper
      shadow="md"
      p="md"
      style={{
        position: "fixed",
        top: 64,
        right: 0,
        width: 320,
        height: "calc(100vh - 64px)",
        background: theme.colors.background.secondary,
        borderLeft: `1px solid ${theme.colors.border.primary}`,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1), opacity 0.2s",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        opacity: visible ? 1 : 0,
      }}
    >
      <Group justify="space-between" align="center" mb="md">
        <Text fw={700} size="lg">
          Node Info
        </Text>
        <CloseButton
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300); 
          }}
        />
      </Group>
      <Text size="sm" c={theme.colors.text.secondary}>
        <b>ID:</b> {node?.id}
        <br />
        <b>Label:</b> {node?.data?.label}
      </Text>
    </Paper>
  );
}