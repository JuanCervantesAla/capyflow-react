import { Text } from "@mantine/core";
import { Modal, Button } from "@mantine/core";
import { Handle, Position } from "@xyflow/react";
import { IconTrash, IconCopy } from "@tabler/icons-react";
import { useTheme } from "../../theme/ThemeContext";
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useFlowActions } from "../Flow/context/FlowActionsContext";
import type { NodeProps } from "@xyflow/react";
import type { NodeData } from "../../components/Flow/types/NodeTypes";
import { getIconComponent } from "../../utils/iconLoader";
import { memo } from "react";

if (typeof window !== "undefined" && !document.getElementById("delete-btn-animation")) {
  const style = document.createElement("style");
  style.id = "delete-btn-animation";
  style.innerHTML = `
    @keyframes popOut {
      0% {
        opacity: 0;
        transform: translate(10px, -10px) scale(0.4);
      }
      60% {
        opacity: 1;
        transform: translate(-3px, 3px) scale(1.15);
      }
      100% {
        transform: translate(0, 0) scale(1);
      }
    }
    .delete-appear {
      animation: popOut 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .delete-hide {
      opacity: 0;
      transform: scale(0.6);
      transition: 0.2s ease;
    }
  `;
  document.head.appendChild(style);
}

export const CustomNode = memo(function CustomNode({ id, data, selected }: NodeProps<NodeData>) {
  const Icon = useMemo(() => getIconComponent(data.icon), [data.icon]);
  const { theme } = useTheme();
  const { deleteNode, duplicateNode } = useFlowActions();
  const [showDelete, setShowDelete] = useState(selected);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (selected) {
      setShowDelete(true);
    } else {
      const t = setTimeout(() => setShowDelete(false), 200);
      return () => clearTimeout(t);
    }
  }, [selected]);

  const handleDelete = useCallback(() => {
    deleteNode(id);
    setConfirmOpen(false);
  }, [deleteNode, id]);

  const handleDuplicate = useCallback(() => {
    duplicateNode(id);
  }, [duplicateNode, id]);

  const handleOpenConfirm = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  
  const nodeStyle = useMemo(() => ({
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    border: selected
      ? `2px solid ${theme.colors.selection.border}`
      : `1px solid ${theme.colors.border.primary}`,
    boxShadow: selected ? theme.effects.glowBlue : theme.effects.shadow,
    background: selected
      ? theme.colors.selection.background
      : theme.colors.background.secondary,
  }), [selected, theme]);

  const topBarStyle = useMemo(() => ({
    height: 6,
    background: selected
      ? theme.colors.selection.border
      : theme.colors.background.tertiary,
  }), [selected, theme]);

  const iconContainerStyle = useMemo(() => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: theme.colors.accent.primary,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  }), [theme]);

  const contentStyle = useMemo(() => ({
    padding: theme.spacing.md,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.md,
  }), [theme]);

  const handleStyle = useMemo(() => ({
    width: 12,
    height: 12,
    background: theme.colors.accent.primary,
    borderRadius: "50%",
    border: `2px solid ${theme.colors.selection.background}`,
  }), [theme]);

  return (
    <div style={{ width: 240, position: "relative" }}>
      <Modal
        opened={confirmOpen}
        onClose={handleCloseConfirm}
        title="¿Eliminar nodo?"
        centered
      >
        <Text>¿Estás seguro de que quieres eliminar este nodo?</Text>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <Button variant="default" onClick={handleCloseConfirm}>
            Cancelar
          </Button>
          <Button color="red" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
      
      {showDelete && (
        <button
          onClick={handleOpenConfirm}
          className={selected ? "delete-appear" : "delete-hide"}
          style={{
            position: "absolute",
            top: -22,
            right: -22,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: theme.colors.background.tertiary,
            border: `1px solid ${theme.colors.border.primary}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 999,
            boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            transition: "0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.14)";
            e.currentTarget.style.background = theme.colors.selection.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = theme.colors.background.tertiary;
          }}
          title="Eliminar nodo"
        >
          <IconTrash size={18} color={theme.colors.accent.primary} />
        </button>
      )}
      
      {showDelete && (
        <button
          onClick={handleDuplicate}
          className={selected ? "delete-appear" : "delete-hide"}
          style={{
            position: "absolute",
            top: -22,
            left: -22,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: theme.colors.background.tertiary,
            border: `1px solid ${theme.colors.border.primary}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 999,
            boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            transition: "0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.14)";
            e.currentTarget.style.background = theme.colors.selection.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = theme.colors.background.tertiary;
          }}
          title="Duplicar nodo"
        >
          <IconCopy size={18} color={theme.colors.accent.primary} />
        </button>
      )}

      <div style={nodeStyle}>
        <div style={topBarStyle} />

        <div style={contentStyle}>
          <div style={iconContainerStyle}>
            <Icon size={22} color="#fff" />
          </div>

          <div>
            <Text fw={700} size="sm" c={theme.colors.text.primary}>
              {data.label}
            </Text>
            <Text size="xs" c={theme.colors.text.secondary}>
              {data.subtitle || "Task"}
            </Text>
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Retorna true si los props son IGUALES (para EVITAR re-render)
  // Retorna false si los props son DIFERENTES (para HACER re-render)
  if (
    prevProps.id !== nextProps.id ||
    prevProps.selected !== nextProps.selected ||
    prevProps.data.label !== nextProps.data.label ||
    prevProps.data.subtitle !== nextProps.data.subtitle ||
    prevProps.data.icon !== nextProps.data.icon ||
    prevProps.data.color !== nextProps.data.color
  ) {
    return false; // Re-render
  }
  return true; // No re-render
});