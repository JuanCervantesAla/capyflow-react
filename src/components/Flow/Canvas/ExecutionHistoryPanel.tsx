import { useState } from 'react';
import { Box, Text, Stack, Card, Badge, Group, Loader, ScrollArea, Indicator } from '@mantine/core';
import { useFlowExecutions } from '../../../hooks/useFlowExecutions';
import { useExecution } from '../../../hooks/useExecution';
import { useTheme } from '../../../theme/ThemeContext';
import type { ExecutionListItem } from '../types/Execution';

interface ExecutionHistoryPanelProps {
  flowId: string;
}

export function ExecutionHistoryPanel({ flowId }: ExecutionHistoryPanelProps) {
  const { data: executions, isLoading } = useFlowExecutions(flowId);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>();
  const { data: executionDetail } = useExecution(selectedExecutionId);
  const selectedIndex = executions?.findIndex((execution) => execution.id === selectedExecutionId) ?? -1;
  const baselineExecution = selectedIndex >= 0 ? executions?.[selectedIndex + 1] : undefined;
  const { data: baselineDetail } = useExecution(baselineExecution?.id);
  const { theme } = useTheme();

  const selectedResults = executionDetail?.parsedResults || {};
  const baselineResults = baselineDetail?.parsedResults || {};
  const comparedNodeIds = Array.from(
    new Set([...Object.keys(selectedResults), ...Object.keys(baselineResults)])
  );

  const nodeDiffs = comparedNodeIds
    .map((nodeId) => {
      const current = selectedResults[nodeId];
      const previous = baselineResults[nodeId];
      const hasCurrent = !!current;
      const hasPrevious = !!previous;
      const currentStatus = current?.status;
      const previousStatus = previous?.status;
      const currentDuration = current?.durationMs;
      const previousDuration = previous?.durationMs;
      const statusChanged = hasCurrent && hasPrevious && currentStatus !== previousStatus;
      const durationDelta =
        typeof currentDuration === 'number' && typeof previousDuration === 'number'
          ? currentDuration - previousDuration
          : undefined;
      const outputChanged =
        hasCurrent && hasPrevious && serializeValue(current?.output) !== serializeValue(previous?.output);
      const errorChanged =
        hasCurrent && hasPrevious && (current?.error || '') !== (previous?.error || '');
      const changed = !hasCurrent || !hasPrevious || statusChanged || outputChanged || errorChanged || (durationDelta ?? 0) !== 0;

      return {
        nodeId,
        current,
        previous,
        changed,
        statusChanged,
        durationDelta,
        outputChanged,
        errorChanged,
      };
    })
    .filter((entry) => entry.changed)
    .slice(0, 12);

  if (isLoading) {
    return (
      <Box p="xl" style={{ textAlign: "center", margin: "12px", border: `1px dashed ${theme.colors.ink}`, borderRadius: 10 }}>
        <Loader size="sm" color={theme.colors.ink} />
        <Text size="sm" c={theme.colors.ink} mt="md" fw={700}>Loading history...</Text>
        <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
          Looking up previous executions for this flow.
        </Text>
      </Box>
    );
  }

  if (!executions || executions.length === 0) {
    return (
      <Box p="xl" style={{ textAlign: "center", margin: "12px", border: `1px dashed ${theme.colors.ink}`, borderRadius: 10 }}>
        <Text size="sm" fw={700} c={theme.colors.ink}>No previous executions</Text>
        <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
          Once you run the flow, history and comparisons will appear here.
        </Text>
      </Box>
    );
  }

  return (
    <Box style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ScrollArea style={{ flex: 1 }} type="auto">
        <Stack gap="xs" p="md">
          <Card
            p="sm"
            withBorder
            style={{
              borderColor: theme.colors.ink,
              borderWidth: 1.5,
              background: "rgba(45, 52, 54, 0.03)",
            }}
          >
            <Text size="sm" fw={800} c={theme.colors.ink}>
              Execution timeline
            </Text>
            <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.65 }}>
              Select an execution to view details and compare it with the previous run.
            </Text>
          </Card>

          {executions.map((execution) => (
            <Card
              key={execution.id}
              p="sm"
              radius="md"
              withBorder
              style={{
                cursor: "pointer",
                background: theme.colors.paper,
                borderWidth: 2,
                borderColor: selectedExecutionId === execution.id
                  ? theme.colors.ink
                  : "rgba(45, 52, 54, 0.2)",
                transition: "all 0.15s ease",
                transform: selectedExecutionId === execution.id ? "translateY(-1px)" : "translateY(0)",
                boxShadow: selectedExecutionId === execution.id ? "0 3px 8px rgba(45, 52, 54, 0.15)" : "0 1px 3px rgba(45, 52, 54, 0.1)",
              }}
              onClick={() => setSelectedExecutionId(execution.id)}
            >
              <Group justify="space-between" mb={4}>
                <Group gap="xs">
                  <StatusIndicator status={execution.status} />
                  <Text size="xs" fw={600} c={theme.colors.ink}>
                    {execution.triggerType}
                  </Text>
                </Group>
                <Badge size="xs" variant="light" color="gray" style={{
                  borderColor: theme.colors.ink,
                  borderWidth: 1,
                  background: theme.colors.paper,
                  color: theme.colors.ink,
                }}>
                  {execution.durationMs}ms
                </Badge>
              </Group>
              <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.5 }}>
                {new Date(execution.startedAt).toLocaleString()}
              </Text>
            </Card>
          ))}
        </Stack>
      </ScrollArea>

      {executionDetail && (
        <Box
          p="md"
          style={{
            borderTop: `2px solid ${theme.colors.ink}`,
            background: theme.colors.paper,
          }}
        >
          <Text size="sm" fw={800} mb="sm" c={theme.colors.ink}>Execution details</Text>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>Executed nodes:</Text>
              <Text size="xs" fw={600} c={theme.colors.ink}>
                {executionDetail.parsedExecutedNodes?.length || 0}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>Duracion:</Text>
              <Text size="xs" fw={600} c={theme.colors.ink}>{executionDetail.durationMs}ms</Text>
            </Group>
            {executionDetail.errorMessage && (
              <Text size="xs" c="red" mt="xs">
                Error: {executionDetail.errorMessage}
              </Text>
            )}

            {baselineExecution ? (
              <>
                <Text size="xs" fw={700} mt="xs" c={theme.colors.ink}>
                  Diff vs previous run
                </Text>
                <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
                  Baseline: {new Date(baselineExecution.startedAt).toLocaleString()}
                </Text>

                {nodeDiffs.length === 0 ? (
                  <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
                    No node-level differences detected.
                  </Text>
                ) : (
                  <ScrollArea h={180} type="auto" offsetScrollbars>
                    <Stack gap={6} mt={4}>
                      {nodeDiffs.map((diff) => (
                        <Card
                          key={diff.nodeId}
                          p={6}
                          radius="sm"
                          withBorder
                          style={{
                            borderColor: 'rgba(45, 52, 54, 0.25)',
                            background: '#faf8f4',
                          }}
                        >
                          <Group justify="space-between" gap={6}>
                            <Text size="xs" fw={700} c={theme.colors.ink}>{diff.nodeId}</Text>
                            <Group gap={4}>
                              {diff.statusChanged && <Badge size="xs" variant="light" color="yellow">status</Badge>}
                              {typeof diff.durationDelta === 'number' && diff.durationDelta !== 0 && (
                                <Badge
                                  size="xs"
                                  variant="light"
                                  color={diff.durationDelta > 0 ? 'red' : 'green'}
                                >
                                  {diff.durationDelta > 0 ? '+' : ''}{diff.durationDelta}ms
                                </Badge>
                              )}
                              {diff.outputChanged && <Badge size="xs" variant="light" color="blue">output</Badge>}
                              {diff.errorChanged && <Badge size="xs" variant="light" color="red">error</Badge>}
                              {!diff.current && <Badge size="xs" variant="light" color="gray">removed</Badge>}
                              {!diff.previous && <Badge size="xs" variant="light" color="teal">added</Badge>}
                            </Group>
                          </Group>
                          <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.65, marginTop: 4 }}>
                            {formatNodeChange(diff.current?.status, diff.previous?.status, diff.current?.error, diff.previous?.error)}
                          </Text>
                        </Card>
                      ))}
                    </Stack>
                  </ScrollArea>
                )}
              </>
            ) : (
              <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
                Run the flow at least twice to see node-level diffs.
              </Text>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

function StatusIndicator({ status }: { status: ExecutionListItem['status'] }) {
  const colors = {
    running: 'blue',
    success: 'green',
    partial: 'yellow',
    error: 'red',
    canceled: 'gray',
  };

  return (
    <Indicator color={colors[status]} size={8} processing={status === 'running'} />
  );
}

function serializeValue(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatNodeChange(
  currentStatus?: string,
  previousStatus?: string,
  currentError?: string,
  previousError?: string
) {
  if (!previousStatus && currentStatus) {
    return `New node result (${currentStatus})`;
  }

  if (!currentStatus && previousStatus) {
    return `Node result removed (was ${previousStatus})`;
  }

  if (currentError || previousError) {
    return currentError
      ? `Current error: ${currentError}`
      : `Previous error cleared: ${previousError}`;
  }

  if (currentStatus !== previousStatus) {
    return `Status changed: ${previousStatus || 'unknown'} -> ${currentStatus || 'unknown'}`;
  }

  return 'Data changed between runs';
}