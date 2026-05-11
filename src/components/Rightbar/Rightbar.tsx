import { memo, useContext, useMemo } from "react";
import { Text, Box, ScrollArea, ActionIcon, Checkbox, Group, Badge, CopyButton, Tooltip } from "@mantine/core";
import { IconX, IconCopy, IconCheck } from "@tabler/icons-react";
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
  showConnectionIds: boolean;
  onToggleShowConnectionIds: (value: boolean) => void;
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
  showConnectionIds,
  onToggleShowConnectionIds,
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

  const incomingConnections = useMemo(() => {
    if (!node) return [];
    return edges
      .filter((edge) => edge.target === node.id)
      .map((edge) => {
        const sourceNode = nodes.find((flowNode) => flowNode.id === edge.source);
        return {
          edgeId: edge.id,
          nodeId: edge.source,
          label: sourceNode?.data?.label || edge.source,
        };
      });
  }, [edges, node, nodes]);

  const outgoingConnections = useMemo(() => {
    if (!node) return [];
    return edges
      .filter((edge) => edge.source === node.id)
      .map((edge) => {
        const targetNode = nodes.find((flowNode) => flowNode.id === edge.target);
        return {
          edgeId: edge.id,
          nodeId: edge.target,
          label: targetNode?.data?.label || edge.target,
        };
      });
  }, [edges, node, nodes]);

  const handleSaveParameters = (params: Record<string, any>) => {
    if (node) {
      updateNodeParameters(node.id, params);
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

                <Group gap="xs" mt="xs" wrap="nowrap">
                  <Badge
                    size="sm"
                    variant="light"
                    styles={{
                      root: {
                        border: `1px solid ${theme.colors.ink}`,
                        background: theme.colors.paper,
                        color: theme.colors.ink,
                        fontFamily: "monospace",
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                    title={node.id}
                  >
                    ID: {node.id}
                  </Badge>

                  <CopyButton value={node.id} timeout={1500}>
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied ? "ID copied" : "Copy ID"}
                        withArrow
                      >
                        <ActionIcon
                          size="sm"
                          variant="light"
                          onClick={copy}
                          style={{
                            border: `1px solid ${theme.colors.ink}`,
                            background: theme.colors.paper,
                            color: theme.colors.ink,
                          }}
                          aria-label="Copy node ID"
                        >
                          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>

                <Checkbox
                  mt="xs"
                  size="xs"
                  checked={showConnectionIds}
                  onChange={(event) => onToggleShowConnectionIds(event.currentTarget.checked)}
                  label="Show connection IDs on canvas"
                />
              </Box>

              <ScrollArea style={{ flex: 1 }} px="md" py="md">
                <Box
                  mb="md"
                  p="sm"
                  style={{
                    border: `1.5px solid ${theme.colors.ink}`,
                    borderRadius: 8,
                    background: "rgba(45, 52, 54, 0.03)",
                  }}
                >
                  <Text size="sm" fw={800} c={theme.colors.ink} mb={4}>
                    Node connections
                  </Text>
                  <Text size="xs" c={theme.colors.ink} mb="xs" style={{ opacity: 0.65 }}>
                    Review source and target links to debug the flow faster.
                  </Text>

                  <Text size="xs" fw={600} c={theme.colors.ink}>
                    Incoming ({incomingConnections.length})
                  </Text>
                  {incomingConnections.length === 0 ? (
                    <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.65 }}>
                      No incoming connections
                    </Text>
                  ) : (
                    incomingConnections.map((item) => (
                      <Box
                        key={item.edgeId}
                        mt={4}
                        px={8}
                        py={6}
                        style={{
                          border: `1px solid ${theme.colors.ink}`,
                          borderRadius: 6,
                          background: theme.colors.paper,
                        }}
                      >
                        <Text size="xs" fw={700} c={theme.colors.ink}>
                          {item.label}
                        </Text>
                        <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.65 }}>
                          ID: {item.nodeId}
                        </Text>
                      </Box>
                    ))
                  )}

                  <Text size="xs" fw={600} c={theme.colors.ink} mt="xs">
                    Outgoing ({outgoingConnections.length})
                  </Text>
                  {outgoingConnections.length === 0 ? (
                    <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.65 }}>
                      No outgoing connections
                    </Text>
                  ) : (
                    outgoingConnections.map((item) => (
                      <Box
                        key={item.edgeId}
                        mt={4}
                        px={8}
                        py={6}
                        style={{
                          border: `1px solid ${theme.colors.ink}`,
                          borderRadius: 6,
                          background: theme.colors.paper,
                        }}
                      >
                        <Text size="xs" fw={700} c={theme.colors.ink}>
                          {item.label}
                        </Text>
                        <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.65 }}>
                          ID: {item.nodeId}
                        </Text>
                      </Box>
                    ))
                  )}
                </Box>

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