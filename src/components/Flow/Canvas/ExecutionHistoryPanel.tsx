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
        <Loader size="sm" />
        <Text size="sm" c="dimmed" mt="md">Cargando historial...</Text>
      </Box>
    );
  }

  if (!executions || executions.length === 0) {
    return (
      <Box p="xl" style={{ textAlign: "center" }}>
        <Text size="sm" c="dimmed">No hay ejecuciones previas</Text>
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
                background: selectedExecutionId === execution.id
                  ? theme.colors.accent.primary + "15"
                  : theme.colors.background.secondary,
                borderColor: selectedExecutionId === execution.id
                  ? theme.colors.accent.primary
                  : theme.colors.border.primary,
                transition: "all 0.2s ease",
              }}
              onClick={() => setSelectedExecutionId(execution.id)}
            >
              <Group justify="space-between" mb={4}>
                <Group gap="xs">
                  <StatusIndicator status={execution.status} />
                  <Text size="xs" fw={500}>
                    {execution.triggerType}
                  </Text>
                </Group>
                <Badge size="xs" variant="light">
                  {execution.durationMs}ms
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
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
            borderTop: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.secondary,
          }}
        >
          <Text size="sm" fw={600} mb="sm">Detalle de Ejecución</Text>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">Nodos ejecutados:</Text>
              <Text size="xs" fw={500}>
                {executionDetail.parsedExecutedNodes?.length || 0}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">Duración:</Text>
              <Text size="xs" fw={500}>{executionDetail.durationMs}ms</Text>
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