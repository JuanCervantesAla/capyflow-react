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
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <Box p="xl" style={{ textAlign: "center" }}>
        <Loader size="sm" color={theme.colors.ink} />
        <Text size="sm" c={theme.colors.ink} mt="md" style={{ opacity: 0.5 }}>Loading history...</Text>
      </Box>
    );
  }

  if (!executions || executions.length === 0) {
    return (
      <Box p="xl" style={{ textAlign: "center" }}>
        <Text size="sm" c={theme.colors.ink} style={{ opacity: 0.5 }}>No previous executions</Text>
      </Box>
    );
  }

  return (
    <Box style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ScrollArea style={{ flex: 1 }} type="auto">
        <Stack gap="xs" p="md">
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
          <Text size="sm" fw={700} mb="sm" c={theme.colors.ink}>Execution Detail</Text>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>Executed Nodes:</Text>
              <Text size="xs" fw={600} c={theme.colors.ink}>
                {executionDetail.parsedExecutedNodes?.length || 0}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>Duration:</Text>
              <Text size="xs" fw={600} c={theme.colors.ink}>{executionDetail.durationMs}ms</Text>
            </Group>
            {executionDetail.errorMessage && (
              <Text size="xs" c="red" mt="xs">
                Error: {executionDetail.errorMessage}
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