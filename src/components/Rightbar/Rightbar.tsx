import { memo, useContext } from "react";
import { Text, Box, ScrollArea, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { NodeParameterEditor } from "../Flow/config/NodeParameterEditor";
import { FlowContext } from "../Flow/context/FlowContext";
import { WebhookPanel } from "../Flow/WebhookPanel/WebhookPanel";
import type { FlowNode } from "../Flow/types/NodeTypes";
import { useTheme } from "../../theme/ThemeContext";

const WIDTH = 360;

interface RightbarProps {
  node: FlowNode | null;
  open: boolean;
  onClose: () => void;
  flowId: string | null;
}

export const Rightbar = memo(function Rightbar({
  node,
  open,
  onClose,
  flowId,
}: RightbarProps) {
  const { updateNodeParameters } = useContext(FlowContext);
  const { theme } = useTheme();

  const handleSaveParameters = (params: Record<string, any>) => {
    if (node) {
      updateNodeParameters(node.id, params);
      onClose();
    }
  };

  return (
    <Box
      style={{
        width: open ? WIDTH : 0,
        transition: "width 0.25s ease",
        background: theme.colors.paper,
        borderLeft: `2px solid ${theme.colors.ink}`,
        position: "relative",
        overflow: "hidden",
        height: "100%",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {open && (
        <>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 8,
              zIndex: 10,
              color: theme.colors.ink,
            }}
          >
            <IconX size={16} />
          </ActionIcon>

          {node && (
            <Box style={{ height: "100%", display: "flex", flexDirection: "column", paddingTop: 40 }}>
              <Box
                px="md"
                pb="sm"
                style={{
                  borderBottom: `2px solid ${theme.colors.ink}`,
                }}
              >
                <Text size="sm" fw={700} mb={4} c={theme.colors.ink}>
                  {node.data.label}
                </Text>
                <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
                  {node.data.type || "custom"}
                </Text>
              </Box>

              <ScrollArea style={{ flex: 1 }} px="md" py="md">
                {/* Webhook Panel - mostrar solo si es webhook-trigger */}
                {node.data.type === 'webhook-trigger' && flowId && (
                  <WebhookPanel 
                    flowId={flowId} 
                    isVisible={true} 
                  />
                )}

                <NodeParameterEditor
                  nodeId={node.id}
                  nodeLabel={node.data.label}
                  nodeType={node.data.type || "custom"}
                  currentParameters={
                    node.data.parameters as Record<string, any>
                  }
                  onSave={handleSaveParameters}
                  onCancel={onClose}
                />
              </ScrollArea>
            </Box>
          )}
        </>
      )}
    </Box>
  );
});