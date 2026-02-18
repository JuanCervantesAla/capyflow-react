import { Text, Group } from "@mantine/core";
import { Modal, Button } from "@mantine/core";
import { Handle, Position } from "@xyflow/react";
import { IconTrash, IconCopy } from "@tabler/icons-react";
import { useEffect, useState, useCallback, memo, useRef, useMemo } from "react";
import { useFlowActions } from "../Flow/context/FlowActionsContext";
import type { NodeProps } from "@xyflow/react";
import type { NodeData } from "../../components/Flow/types/NodeTypes";
import { getIconComponent } from "../../utils/iconLoader";
import { getThemeColors } from "../../theme/themeCache";
import { NodeExecutionStatus } from "./NodeExecutionStatus";

if (typeof window !== "undefined" && !document.getElementById("node-styles")) {
  const style = document.createElement("style");
  style.id = "node-styles";
  style.innerHTML = `
    @keyframes popOut {
      0% { opacity: 0; transform: translate(10px, -10px) scale(0.4); }
      60% { opacity: 1; transform: translate(-3px, 3px) scale(1.15); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes handlePulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
      50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0); }
    }
    @keyframes handlePulseGreen {
      0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
      50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
    }
    .delete-appear { animation: popOut 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    .delete-hide { opacity: 0; transform: scale(0.6); transition: 0.2s ease; pointer-events: none; }
    .node-action-btn { transition: transform 0.15s ease; }
    .node-action-btn:hover { transform: scale(1.14) !important; }
    .handle-target:hover { 
      transform: scale(1.3) !important;
      animation: handlePulse 1.5s infinite !important;
    }
    .handle-source:hover { 
      transform: scale(1.3) !important;
      animation: handlePulseGreen 1.5s infinite !important;
    }
    .node-container:hover .handle-label { opacity: 1; }
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

const getStyles = (selected: boolean, status: string) => {
  const key = `${selected ? 'selected' : 'normal'}-${status}`;
  
  if (stylesCache.has(key)) {
    return stylesCache.get(key);
  }
  
  const colors = getThemeColors();
  
  let borderColor = colors.borderPrimary;
  let topBarColor = colors.bgTertiary;
  
  if (status === 'running') {
    borderColor = '#3b82f6';
    topBarColor = '#3b82f6';
  } else if (status === 'success') {
    borderColor = '#10b981';
    topBarColor = '#10b981';
  } else if (status === 'error') {
    borderColor = '#ef4444';
    topBarColor = '#ef4444';
  }
  
  if (selected) {
    borderColor = colors.edgeSelectedColor;
  }
  
  const styles = {
    node: {
      borderRadius: 10,
      overflow: "hidden",
      border: selected 
        ? `2px solid ${colors.edgeSelectedColor}`
        : `1px solid ${borderColor}`,
      boxShadow: selected 
        ? "0 0 12px rgba(59,130,246,0.35)"
        : status === 'running'
        ? "0 0 8px rgba(59,130,246,0.3)"
        : "0 1px 3px rgba(0,0,0,0.50)",
      background: selected ? colors.bgPrimary : colors.bgSecondary,
    },
    topBar: {
      height: 6,
      background: selected ? colors.edgeSelectedColor : topBarColor,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: colors.edgeColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    content: {
      padding: 12,
      display: "flex",
      flexDirection: 'column' as const,
      gap: 8,
    },
    mainContent: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    handle: {
      width: 14,
      height: 14,
      background: colors.edgeColor,
      borderRadius: "50%",
      border: `2px solid ${colors.bgPrimary}`,
      transition: 'all 0.2s ease',
    },
    handleTarget: {
      width: 14,
      height: 14,
      background: '#3b82f6',
      borderRadius: "50%",
      border: `2px solid ${colors.bgPrimary}`,
      transition: 'all 0.2s ease',
      boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)',
    },
    handleSource: {
      width: 14,
      height: 14,
      background: '#10b981',
      borderRadius: "50%",
      border: `2px solid ${colors.bgPrimary}`,
      transition: 'all 0.2s ease',
      boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)',
    },
    handleLabel: {
      position: 'absolute' as const,
      fontSize: '9px',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      pointerEvents: 'none' as const,
      opacity: 0.7,
      transition: 'opacity 0.2s ease',
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
    const Icon = getCachedIcon((data as NodeData).icon || 'IconBolt');
    const { deleteNode, duplicateNode } = useFlowActions();
    
    const [showDelete, setShowDelete] = useState(selected);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const timeoutRef = useRef<number | undefined>(undefined);

    const { node, topBar, icon, content, mainContent, handle, handleTarget, handleSource, handleLabel, actionBtn, colors } = useMemo(
      () => getStyles(!!selected, (data as NodeData).executionStatus || 'idle'),
      [selected, (data as NodeData).executionStatus]
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
      deleteNode(id as string);
      setConfirmOpen(false);
    }, [deleteNode, id]);

    const handleDuplicate = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      duplicateNode(id as string);
    }, [duplicateNode, id]);

    const handleOpenConfirm = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmOpen(true);
    }, []);

    const handleCloseConfirm = useCallback(() => {
      setConfirmOpen(false);
    }, []);

    return (
      <div style={{ width: 240, position: "relative" }} className="node-container">
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
              style={actionBtn}
              onClick={handleDuplicate}
              className={selected ? "delete-appear node-action-btn" : "delete-hide"}
            >
              <IconCopy size={18} color={colors.textPrimary} />
            </div>
            <div
              style={actionBtn}
              onClick={handleOpenConfirm}
              className={selected ? "delete-appear node-action-btn" : "delete-hide"}
            >
              <IconTrash size={18} color={colors.errorColor} />
            </div>
          </div>
        )}

        {/* Etiqueta INPUT en la parte superior */}
        {(data as NodeData).type !== 'manual-trigger' && (data as NodeData).category !== 'trigger' && (
          <div style={{
            ...handleLabel,
            top: -18,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#3b82f6',
          }}>
            ▼ INPUT
          </div>
        )}

        {/* Handle de entrada (target) - solo si no es trigger */}
        {(data as NodeData).type !== 'manual-trigger' && (data as NodeData).category !== 'trigger' && (
          <Handle 
            type="target" 
            position={Position.Top} 
            style={handleTarget}
            className="handle-target"
          />
        )}

        <div style={node}>
          <div style={topBar} />
          <div style={content}>
            <div style={mainContent}>
              <div style={icon}>
                <Icon size={22} color={colors.textPrimary} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={500} truncate="end">
                  {(data as NodeData).label}
                </Text>
                {(data as NodeData).subtitle && (
                  <Text size="xs" c="dimmed" truncate="end">
                    {(data as NodeData).subtitle}
                  </Text>
                )}
              </div>
            </div>
            
            {(data as NodeData).executionStatus && (data as NodeData).executionStatus !== 'idle' && (
              <NodeExecutionStatus 
                status={(data as NodeData).executionStatus as any}
                error={(data as NodeData).executionError}
                durationMs={(data as NodeData).executionDuration}
              />
            )}
          </div>
        </div>

        {/* Handles de salida especiales para if-condition */}
        {(data as NodeData).type === 'if-condition' ? (
          <>
            <div style={{
              ...handleLabel,
              bottom: -20,
              left: '35%',
              transform: 'translateX(-50%)',
              color: '#10b981',
            }}>
              ▼ TRUE
            </div>
            <Handle 
              type="source" 
              position={Position.Bottom} 
              id="true"
              style={{ ...handleSource, left: '35%', background: '#10b981' }}
              className="handle-source"
            />
            
            <div style={{
              ...handleLabel,
              bottom: -20,
              left: '65%',
              transform: 'translateX(-50%)',
              color: '#f43f5e',
            }}>
              ▼ FALSE
            </div>
            <Handle 
              type="source" 
              position={Position.Bottom} 
              id="false"
              style={{ ...handleSource, left: '65%', background: '#f43f5e' }}
              className="handle-source"
            />
          </>
        ) : (
          <>
            {/* Etiqueta OUTPUT en la parte inferior */}
            <div style={{
              ...handleLabel,
              bottom: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#10b981',
            }}>
              ▼ OUTPUT
            </div>
            <Handle 
              type="source" 
              position={Position.Bottom} 
              style={handleSource}
              className="handle-source"
            />
          </>
        )}
      </div>
    );
  }
);