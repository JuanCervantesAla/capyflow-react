import { Text } from "@mantine/core";
import { Modal, Button } from "@mantine/core";
import { Handle, Position } from "@xyflow/react";
import { IconBrandReact, IconTrash } from "@tabler/icons-react";
import { useTheme } from "../../theme/ThemeContext";
import { useContext, useEffect, useState } from "react";
import { FlowContext } from "../Flow/context/FlowContext";
import { IconCopy } from "@tabler/icons-react";
import type { NodeProps } from "@xyflow/react";
import type { NodeData } from "../../components/Flow/types/NodeTypes";
import { getIconComponent } from "../../utils/iconLoader";

export function CustomNode({ id, data, selected }: NodeProps<NodeData>) {
  const Icon = getIconComponent(data.icon);
  const { theme } = useTheme();
  const { deleteNode, duplicateNode } = useContext(FlowContext);
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

  useEffect(() => {
    if (!document.getElementById("delete-btn-animation")) {
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
  }, []);

  return (
    <div style={{ width: 240, position: "relative" }}>
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="¿Eliminar nodo?"
        centered
      >
        <Text>¿Estás seguro de que quieres eliminar este nodo?</Text>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <Button variant="default" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button
            color="red"
            onClick={() => {
              deleteNode(id);
              setConfirmOpen(false);
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
      
      {showDelete && (
        <button
          onClick={() => setConfirmOpen(true)}
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
            e.currentTarget.style.background =
              theme.colors.selection.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background =
              theme.colors.background.tertiary;
          }}
          title="Eliminar nodo"
        >
          <IconTrash size={18} color={theme.colors.accent.primary} />
        </button>
      )}
      {showDelete && (
        <button
          onClick={() => duplicateNode(id)}
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
            e.currentTarget.style.background =
              theme.colors.selection.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background =
              theme.colors.background.tertiary;
          }}
          title="Duplicar nodo"
        >
          <IconCopy size={18} color={theme.colors.accent.primary} />
        </button>
      )}

      <div
        style={{
          borderRadius: theme.borderRadius.md,
          overflow: "hidden",
          border: selected
            ? `2px solid ${theme.colors.selection.border}`
            : `1px solid ${theme.colors.border.primary}`,
          boxShadow: selected ? theme.effects.glowBlue : theme.effects.shadow,
          background: selected
            ? theme.colors.selection.background
            : theme.colors.background.secondary,
        }}
      >
        <div
          style={{
            height: 6,
            background: selected
              ? theme.colors.selection.border
              : theme.colors.background.tertiary,
          }}
        />

        <div
          style={{
            padding: theme.spacing.md,
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: theme.colors.accent.primary,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
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

      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          background: theme.colors.accent.primary,
          borderRadius: "50%",
          border: `2px solid ${theme.colors.selection.background}`,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          background: theme.colors.accent.primary,
          borderRadius: "50%",
          border: `2px solid ${theme.colors.selection.background}`,
        }}
      />
    </div>
  );
}
