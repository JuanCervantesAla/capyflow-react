import { memo, useContext } from "react";
import { Text, Box, ScrollArea, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { NodeParameterEditor } from "../Flow/config/NodeParameterEditor";
import { FlowContext } from "../Flow/context/FlowContext";
import type { FlowNode } from "../Flow/types/NodeTypes";
import { useTheme } from "../../theme/ThemeContext";

const WIDTH = 360;

interface RightbarProps {
  node: FlowNode | null;
  open: boolean;
  onClose: () => void;
}

export const Rightbar = memo(function Rightbar({
  node,
  open,
  onClose,
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
        background: theme.colors.background.primary,
        borderLeft: `1px solid ${theme.colors.border.primary}`,
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
                  borderBottom: `1px solid ${theme.colors.border.primary}`,
                }}
              >
                <Text size="sm" fw={600} mb={4}>
                  {node.data.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {node.data.type || "custom"}
                </Text>
              </Box>

              <ScrollArea style={{ flex: 1 }} px="md" py="md">
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