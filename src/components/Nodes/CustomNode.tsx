import { Text, Group } from "@mantine/core";
import { Modal, Button } from "@mantine/core";
import { Handle, Position } from "@xyflow/react";
import { IconTrash, IconCopy } from "@tabler/icons-react";
import { useEffect, useState, useCallback, memo, useRef, useMemo } from "react";
import { useFlowActions } from "../Flow/context/FlowActionsContext";
import type { NodeProps } from "@xyflow/react";
import type { NodeData } from "../../components/Flow/types/NodeTypes";
import { getThemeColors } from "../../theme/themeCache";

if (typeof window !== "undefined" && !document.getElementById("node-styles")) {
  const style = document.createElement("style");
  style.id = "node-styles";
  style.innerHTML = `
    @keyframes statusBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    @keyframes popOut {
      0% { opacity: 0; transform: translate(10px, -10px) scale(0.4); }
      60% { opacity: 1; transform: translate(-3px, 3px) scale(1.15); }
      100% { transform: translate(0, 0) scale(1); }
    }
    .delete-appear { animation: popOut 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    .delete-hide { opacity: 0; transform: scale(0.6); transition: 0.2s ease; pointer-events: none; }
    .node-action-btn { transition: transform 0.15s ease; }
    .node-action-btn:hover { transform: scale(1.14) !important; }
    
    .react-flow__handle {
      transition: background 0.1s ease, transform 0.1s ease !important;
    }
    .react-flow__handle:hover {
      background: #E8A020 !important;
      transform: scale(1.3) !important;
    }
    .react-flow__handle.handle-top:hover {
      transform: translateY(-50%) scale(1.3) !important;
    }
    .react-flow__handle.handle-bottom-center:hover {
      transform: translateX(50%) scale(1.3) !important;
    }
    .react-flow__handle.handle-bottom-left:hover {
      transform: translateY(50%) scale(1.3) !important;
    }
    .react-flow__handle.handle-bottom-right:hover {
      transform: translateY(50%) scale(1.3) !important;
    }
  `;
  document.head.appendChild(style);
}

const stylesCache = new Map<string, any>();

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    trigger: "trigger",
    data: "data",
    io: "i / o",
    logic: "logic",
    control: "control",
    ai: "ai",
    integration: "api",
  };
  return labels[category] || category;
};

const getStyles = (selected: boolean, status: string, category: string, colors: ReturnType<typeof getThemeColors>) => {
  const key = `${selected ? 'selected' : 'normal'}-${status}-${category}`;
  
  if (stylesCache.has(key)) {
    return stylesCache.get(key);
  }
  
  const categoryColor = colors.category[category as keyof typeof colors.category] || colors.textInk;
  const categoryBgColor = colors.categoryBg?.[category as keyof typeof colors.categoryBg] || colors.bgNode;
  const statusColor = colors.status?.[status as keyof typeof colors.status] || 'transparent';
  
  const styles = {
    container: {
      width: 200,
      position: "relative" as const,
    },
    node: {
      background: colors.bgNode,
      border: `2.5px solid ${colors.borderNode}`,
      borderRadius: 0,
      position: "relative" as const,
      cursor: "pointer",
      boxShadow: selected ? `5px 5px 0 ${colors.borderNode}` : "none",
      transform: selected ? "translate(-3px, -3px)" : "translate(0, 0)",
    },
    accentStrip: {
      position: "absolute" as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: 5,
      background: categoryColor,
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px",
      borderBottom: `2.5px solid ${colors.borderNode}`,
    },
    badge: {
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "2px",
      textTransform: "uppercase" as const,
      padding: "2px 7px",
      border: `1.5px solid ${categoryColor}`,
      background: categoryBgColor,
      color: categoryColor,
      lineHeight: 1.5,
    },
    statusContainer: {
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      border: `1.5px solid ${colors.borderNode}`,
      background: statusColor,
      animation: status === 'running' ? 'statusBlink 0.7s ease-in-out infinite' : 'none',
      boxShadow: status === 'ready' ? `0 0 5px ${statusColor}` : 
                 status === 'running' ? `0 0 5px ${statusColor}` : 'none',
    },
    body: {
      padding: "11px 12px 12px",
    },
    nodeName: {
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: "-0.3px",
      lineHeight: 1.2,
      color: colors.textInk,
      marginBottom: 3,
    },
    nodeSub: {
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 3,
    },
    handle: {
      width: 11,
      height: 11,
      background: colors.bgSidebar,
      border: `2.5px solid ${colors.borderNode}`,
      borderRadius: "50%",
      cursor: "crosshair",
      position: "absolute" as const,
      top: "50%",
      transform: "translateY(-50%)",
    },
    handleIn: {
      left: -7,
    },
    handleOut: {
      right: -7,
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
  function CustomNode({ id, data, selected }: NodeProps) {
    const { deleteNode, duplicateNode } = useFlowActions();
    
    const [showDelete, setShowDelete] = useState(selected);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const timeoutRef = useRef<number | undefined>(undefined);

    const nodeData = data as NodeData;
    const category = nodeData.category || 'trigger';
    const executionStatus = nodeData.executionStatus || 'idle';

    // Memoize theme colors once - never changes
    const themeColors = useMemo(() => getThemeColors(), []);

    // Memoize styles - only recalculate when relevant props change
    const styles = useMemo(
      () => getStyles(!!selected, executionStatus, category, themeColors),
      [selected, executionStatus, category, themeColors]
    );

    // Only update showDelete when actually selected changes
    useEffect(() => {
      if (selected && !showDelete) {
        setShowDelete(true);
      } else if (!selected && showDelete) {
        timeoutRef.current = window.setTimeout(() => setShowDelete(false), 200);
        return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
      }
    }, [selected, showDelete]);

    const handleOpenConfirm = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmOpen(true);
    }, []);

    const handleCloseConfirm = useCallback(() => {
      setConfirmOpen(false);
    }, []);

    const handleDelete = useCallback(() => {
      deleteNode(id as string);
      setConfirmOpen(false);
    }, [deleteNode, id]);

    const handleDuplicate = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        duplicateNode(id as string);
      },
      [duplicateNode, id]
    );

    const hasPrevPort = nodeData.type !== 'manual-trigger' && nodeData.category !== 'trigger';
    const hasNextPort = true;

    return (
      <div style={styles.container}>
        {confirmOpen && (
          <Modal opened={confirmOpen} onClose={handleCloseConfirm} title="Confirmar eliminación" size="sm">
            <Text size="sm">¿Estás seguro de que deseas eliminar este nodo?</Text>
            <Group mt="md" justify="flex-end">
              <Button variant="default" onClick={handleCloseConfirm}>Cancelar</Button>
              <Button color="red" onClick={handleDelete}>Eliminar</Button>
            </Group>
          </Modal>
        )}

        {showDelete && (
          <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
            <div
              style={styles.actionBtn}
              onClick={handleDuplicate}
              className={selected ? "delete-appear node-action-btn" : "delete-hide"}
            >
              <IconCopy size={18} color={styles.colors.textPrimary} />
            </div>
            <div
              style={styles.actionBtn}
              onClick={handleOpenConfirm}
              className={selected ? "delete-appear node-action-btn" : "delete-hide"}
            >
              <IconTrash size={18} color={styles.colors.errorColor} />
            </div>
          </div>
        )}

        {hasPrevPort && (
          <Handle 
            type="target" 
            position={Position.Top} 
            className="handle-top"
            style={{
              ...styles.handle,
              ...styles.handleIn,
              top: "50%",
              left: -7,
            }}
          />
        )}

        <div style={styles.node}>
          <div style={styles.accentStrip} />
          
          <div style={styles.header}>
            <span style={styles.badge}>{getCategoryLabel(category)}</span>
            <div style={styles.statusContainer}>
              <div style={styles.statusDot} />
            </div>
          </div>

          <div style={styles.body}>
            <div style={styles.nodeName}>{nodeData.label}</div>
            {nodeData.subtitle && (
              <div style={styles.nodeSub}>{nodeData.subtitle}</div>
            )}
          </div>
        </div>

        {hasNextPort && (
          nodeData.type === 'if-condition' ? (
            <>
              <Handle 
                type="source" 
                position={Position.Bottom} 
                id="true"
                className="handle-bottom-left"
                style={{
                  ...styles.handle,
                  ...styles.handleOut,
                  bottom: -7,
                  right: "65%",
                  top: "auto",
                }}
              />
              <Handle 
                type="source" 
                position={Position.Bottom} 
                id="false"
                className="handle-bottom-right"
                style={{
                  ...styles.handle,
                  ...styles.handleOut,
                  bottom: -7,
                  right: "35%",
                  top: "auto",
                }}
              />
            </>
          ) : (
            <Handle 
              type="source" 
              position={Position.Bottom}
              className="handle-bottom-center"
              style={{
                ...styles.handle,
                ...styles.handleOut,
                bottom: -7,
                right: "50%",
                top: "auto",
                transform: "translateX(50%)",
              }}
            />
          )
        )}
      </div>
    );
  },
  // Custom comparison function to prevent re-renders during drag
  (prevProps, nextProps) => {
    // Always re-render if these core props change
    if (prevProps.id !== nextProps.id) return false;
    if (prevProps.selected !== nextProps.selected) return false;
    if (prevProps.type !== nextProps.type) return false;
    
    const prevData = prevProps.data as NodeData;
    const nextData = nextProps.data as NodeData;
    
    // Re-render if data content changes
    if (prevData.label !== nextData.label) return false;
    if (prevData.subtitle !== nextData.subtitle) return false;
    if (prevData.executionStatus !== nextData.executionStatus) return false;
    if (prevData.executionError !== nextData.executionError) return false;
    if (prevData.executionDuration !== nextData.executionDuration) return false;
    if (prevData.category !== nextData.category) return false;
    if (prevData.type !== nextData.type) return false;
    if (prevData.icon !== nextData.icon) return false;
    
    // Ignore position changes (xPos, yPos) - these change during drag
    // Ignore dragging state changes
    
    return true; // Props are equal, skip re-render
  }
);