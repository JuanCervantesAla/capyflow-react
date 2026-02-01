import { Text } from "@mantine/core";
import { Modal, Button } from "@mantine/core";
import { Handle, Position } from "@xyflow/react";
import { IconTrash, IconCopy } from "@tabler/icons-react";
import { useEffect, useState, useCallback, memo, useRef, useMemo } from "react";
import { useFlowActions } from "../Flow/context/FlowActionsContext";
import type { NodeProps } from "@xyflow/react";
import type { NodeData } from "../../components/Flow/types/NodeTypes";
import { getIconComponent } from "../../utils/iconLoader";
import { getThemeColors } from "../../theme/themeCache";

if (typeof window !== "undefined" && !document.getElementById("node-styles")) {
  const style = document.createElement("style");
  style.id = "node-styles";
  style.innerHTML = `
    @keyframes popOut {
      0% { opacity: 0; transform: translate(10px, -10px) scale(0.4); }
      60% { opacity: 1; transform: translate(-3px, 3px) scale(1.15); }
      100% { transform: translate(0, 0) scale(1); }
    }
    .delete-appear { animation: popOut 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    .delete-hide { opacity: 0; transform: scale(0.6); transition: 0.2s ease; pointer-events: none; }
    .node-action-btn { transition: transform 0.15s ease; }
    .node-action-btn:hover { transform: scale(1.14) !important; }
  `;
  document.head.appendChild(style);
}

const iconCache = new Map();
function getCachedIcon(iconName: string) {
  if (!iconCache.has(iconName)) {
    iconCache.set(iconName, getIconComponent(iconName));
  }
  return iconCache.get(iconName);
}

const stylesCache = new Map<string, any>();

const getStyles = (selected: boolean, nodeColor?: string) => {
  // const key = selected ? 'selected' : 'normal';
  const key = `${selected}-${nodeColor || "default"}`;
  
  if (stylesCache.has(key)) {
    return stylesCache.get(key);
  }
  
  const colors = getThemeColors();
  const finalColor = nodeColor || colors.edgeColor;
  const styles = {
    node: {
      borderRadius: 10,
      overflow: "hidden",
      border: selected 
        ? `2px solid ${colors.edgeSelectedColor}`
        : `1px solid ${colors.borderPrimary}`,
      boxShadow: selected 
        ? "0 0 12px rgba(59,130,246,0.35)"
        : "0 1px 3px rgba(0,0,0,0.50)",
      background: selected ? colors.bgPrimary : colors.bgSecondary,
    },
    topBar: {
      height: 6,
      background: selected ? colors.edgeSelectedColor : colors.bgTertiary,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: finalColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    content: {
      padding: 12,
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    handle: {
      width: 12,
      height: 12,
      background: finalColor,
      borderRadius: "50%",
      border: `2px solid ${colors.bgPrimary}`,
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: colors.bgTertiary,
      border: `1px solid ${colors.borderPrimary}`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      zIndex: 999,
      boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
    },
    colors,
  };
  
  stylesCache.set(key, styles);
  return styles;
};

export const CustomNode = memo(
  function CustomNode({ id, data, selected }: NodeProps<NodeData>) {
    const Icon = getCachedIcon(data.icon);
    const { deleteNode, duplicateNode } = useFlowActions();
    
    const [showDelete, setShowDelete] = useState(selected);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const timeoutRef = useRef<number>();

    const { node, topBar, icon, content, handle, actionBtn, colors } = useMemo(
      () => getStyles(!!selected, data.color),
      [selected, data.color]
    );

    useEffect(() => {
      if (selected) {
        setShowDelete(true);
      } else {
        timeoutRef.current = window.setTimeout(() => setShowDelete(false), 200);
        return () => clearTimeout(timeoutRef.current);
      }
    }, [selected]);

    const handleDelete = useCallback(() => {
      deleteNode(id);
      setConfirmOpen(false);
    }, [deleteNode, id]);

    const handleDuplicate = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      duplicateNode(id);
    }, [duplicateNode, id]);

    const handleOpenConfirm = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmOpen(true);
    }, []);

    const handleCloseConfirm = useCallback(() => {
      setConfirmOpen(false);
    }, []);

    return (
      <div style={{ width: 240, position: "relative" }}>
        {confirmOpen && (
          <Modal
            opened={confirmOpen}
            onClose={handleCloseConfirm}
            title="¿Eliminar nodo?"
            centered
            size="sm"
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
        )}

        {showDelete && (
          <>
            <button
              onClick={handleOpenConfirm}
              className={`node-action-btn ${selected ? "delete-appear" : "delete-hide"}`}
              style={{ ...actionBtn, position: "absolute", top: -22, right: -22 }}
              title="Eliminar nodo"
            >
              <IconTrash size={18} color={colors.edgeColor} />
            </button>

            <button
              onClick={handleDuplicate}
              className={`node-action-btn ${selected ? "delete-appear" : "delete-hide"}`}
              style={{ ...actionBtn, position: "absolute", top: -22, left: -22 }}
              title="Duplicar nodo"
            >
              <IconCopy size={18} color={colors.edgeColor} />
            </button>
          </>
        )}

        <div style={node}>
          <div style={topBar} />

          <div style={content}>
            <div style={icon}>
              <Icon size={22} color="#fff" />
            </div>

            <div>
              <Text fw={700} size="sm" style={{ color: colors.textPrimary }}>
                {data.label}
              </Text>
              <Text size="xs" style={{ color: colors.textSecondary }}>
                {data.subtitle || "Task"}
              </Text>
            </div>
          </div>
        </div>

        <Handle type="target" position={Position.Left} style={handle} />
        <Handle type="source" position={Position.Right} style={handle} />
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.id === next.id &&
      prev.selected === next.selected &&
      prev.data.label === next.data.label &&
      prev.data.subtitle === next.data.subtitle &&
      prev.data.icon === next.data.icon
    );
  }
);