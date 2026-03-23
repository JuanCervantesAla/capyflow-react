import { memo, useContext, useMemo } from "react";
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

type VariableOption = {
  value: string;
  label: string;
};

type UpstreamOutputPreview = {
  nodeId: string;
  nodeLabel: string;
  output: unknown;
};

type NodeExecutionDebug = {
  status?: string;
  durationMs?: number;
  error?: string;
  output?: unknown;
};

function flattenObjectPaths(value: unknown, prefix = '', depth = 0): string[] {
  if (!value || typeof value !== 'object' || depth > 1) {
    return [];
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const paths: string[] = [];

  for (const [key, nestedValue] of entries) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    paths.push(currentPath);
    paths.push(...flattenObjectPaths(nestedValue, currentPath, depth + 1));
  }

  return paths;
}

function buildVariableOptions(
  currentNode: FlowNode | null,
  nodes: FlowNode[],
  edges: Array<{ source: string; target: string }>
): VariableOption[] {
  const baseOptions: VariableOption[] = [
    { value: '{{input}}', label: 'Input (legacy) - {{input}}' },
    { value: '{{item}}', label: 'Current item (loop) - {{item}}' },
    { value: '{{index}}', label: 'Current index (loop) - {{index}}' },
  ];

  if (!currentNode) {
    return baseOptions;
  }

  const upstreamNodeIds = edges
    .filter((edge) => edge.target === currentNode.id)
    .map((edge) => edge.source);

  const upstreamNodes = nodes.filter((flowNode) => upstreamNodeIds.includes(flowNode.id));

  const options: VariableOption[] = [...baseOptions];
  const seen = new Set(options.map((option) => option.value));

  for (const upstreamNode of upstreamNodes) {
    const nodeLabel = `${upstreamNode.data.label || upstreamNode.id}`;
    const baseToken = `{{${upstreamNode.id}.output}}`;

    if (!seen.has(baseToken)) {
      options.push({
        value: baseToken,
        label: `${nodeLabel} output - ${baseToken}`,
      });
      seen.add(baseToken);
    }

    const outputPaths = flattenObjectPaths(upstreamNode.data.executionOutput);
    for (const path of outputPaths) {
      const token = `{{${upstreamNode.id}.output.${path}}}`;
      if (seen.has(token)) continue;
      options.push({
        value: token,
        label: `${nodeLabel}.${path} - ${token}`,
      });
      seen.add(token);
    }
  }

  return options;
}

function buildUpstreamOutputPreviews(
  currentNode: FlowNode | null,
  nodes: FlowNode[],
  edges: Array<{ source: string; target: string }>
): UpstreamOutputPreview[] {
  if (!currentNode) {
    return [];
  }

  const upstreamNodeIds = edges
    .filter((edge) => edge.target === currentNode.id)
    .map((edge) => edge.source);

  const upstreamNodes = nodes.filter((flowNode) => upstreamNodeIds.includes(flowNode.id));

  return upstreamNodes
    .filter((upstreamNode) => upstreamNode.data.executionOutput != null)
    .map((upstreamNode) => ({
      nodeId: upstreamNode.id,
      nodeLabel: upstreamNode.data.label || upstreamNode.id,
      output: upstreamNode.data.executionOutput,
    }));
}

export const Rightbar = memo(function Rightbar({
  node,
  open,
  onClose,
  flowId,
}: RightbarProps) {
  const { nodes, edges, updateNodeParameters } = useContext(FlowContext);
  const { theme } = useTheme();

  const variableOptions = useMemo(
    () => buildVariableOptions(node, nodes, edges),
    [node, nodes, edges],
  );

  const upstreamOutputPreviews = useMemo(
    () => buildUpstreamOutputPreviews(node, nodes, edges),
    [node, nodes, edges],
  );

  const nodeExecutionDebug: NodeExecutionDebug = useMemo(() => ({
    status: node?.data.executionStatus as string | undefined,
    durationMs: node?.data.executionDuration as number | undefined,
    error: node?.data.executionError as string | undefined,
    output: node?.data.executionOutput,
  }), [node]);

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
                {/* Webhook Panel - show only if webhook-trigger */}
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
                  variableOptions={variableOptions}
                  upstreamOutputPreviews={upstreamOutputPreviews}
                  executionDebug={nodeExecutionDebug}
                  currentParameters={
                    node.data.parameters as Record<string, any>
                  }
                  onChangeLive={(params) => {
                    if (node) {
                      updateNodeParameters(node.id, params);
                    }
                  }}
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