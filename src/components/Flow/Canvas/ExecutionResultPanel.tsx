import {
  Card,
  Badge,
  Group,
  Stack,
  Text,
  Code,
  CopyButton,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Loader,
} from "@mantine/core";
import { IconCheck, IconX, IconClock, IconCopy } from "@tabler/icons-react";
import { useTheme } from "../../../theme/ThemeContext";

interface ExecutionResultPanelProps {
  result: any | null;
  isLoading?: boolean;
}

export function ExecutionResultPanel({
  result,
  isLoading = false,
}: ExecutionResultPanelProps) {
  const { theme } = useTheme();

  if (!result && !isLoading) {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center", height: "100%" }}>
        <Text c="dimmed" size="sm">
          Ejecuta un flujo para ver resultados
        </Text>
      </div>
    );
  }

  return (
    <ScrollArea style={{ height: "100%" }} type="auto">
      <Stack gap="md" style={{ padding: "1rem" }}>
        {isLoading && (
          <Card p="sm" withBorder>
            <Group gap="sm">
              <Loader size="sm" />
              <Text size="xs">Ejecutando flujo…</Text>
            </Group>
          </Card>
        )}

        {result && (
          <Card
            p="sm"
            radius="md"
            withBorder
            style={{
              background:
                result.status === "success"
                  ? "rgba(16,185,129,0.08)"
                  : result.status === "error"
                    ? "rgba(244,63,94,0.08)"
                    : "rgba(59,130,246,0.08)",
              borderColor:
                result.status === "success"
                  ? "#10b981"
                  : result.status === "error"
                    ? "#f43f5e"
                    : "#3b82f6",
            }}
          >
            <Group justify="space-between">
              <Group gap="xs">
                {result.status === "success" ? (
                  <IconCheck size={16} color="#10b981" />
                ) : result.status === "error" ? (
                  <IconX size={16} color="#f43f5e" />
                ) : (
                  <IconClock size={16} color="#3b82f6" />
                )}
                <Text size="xs" fw={600}>
                  {result.status === "success"
                    ? "Ejecución Exitosa"
                    : result.status === "error"
                      ? "Error en Ejecución"
                      : "Ejecución en Progreso"}
                </Text>
              </Group>
              <Badge size="sm" variant="light">
                {result.durationMs}ms
              </Badge>
            </Group>
            {result.errorMessage && (
              <Text size="xs" c="red" mt="xs">
                {result.errorMessage}
              </Text>
            )}
          </Card>
        )}

        {result?.executedNodes && result.executedNodes.length > 0 && (
          <div>
            <Text fw={600} size="sm" mb="xs">
              Nodos Ejecutados ({result.executedNodes.length})
            </Text>
            <Stack gap="xs">
              {result.executedNodes.map((nodeId: string) => {
                const nodeResult = result.results?.[nodeId];
                if (!nodeResult) return null;

                return (
                  <Card
                    key={nodeId}
                    p="sm"
                    radius="md"
                    withBorder
                    style={{
                      background: theme.colors.background.secondary,
                      borderColor:
                        nodeResult.status === "success"
                          ? "#10b981"
                          : nodeResult.status === "error"
                            ? "#f43f5e"
                            : "#94a3b8",
                    }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Group gap={6} align="center" wrap="nowrap">
                          <div
                            style={{
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {nodeResult.status === "success" ? (
                              <IconCheck size={14} color="#10b981" />
                            ) : nodeResult.status === "error" ? (
                              <IconX size={14} color="#f43f5e" />
                            ) : (
                              <IconClock size={14} color="#94a3b8" />
                            )}
                          </div>

                          <Text
                            size="xs"
                            fw={500}
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={nodeId}
                          >
                            {nodeId}
                          </Text>
                        </Group>

                        <Badge size="xs" variant="dot">
                          {nodeResult.durationMs}ms
                        </Badge>
                      </Group>

                      {nodeResult.error && (
                        <Text size="xs" c="red">
                          Error: {nodeResult.error}
                        </Text>
                      )}

                      {nodeResult.output &&
                        Object.keys(nodeResult.output).length > 0 && (
                          <div>
                            <Text size="xs" c="dimmed" mb="4px">
                              Output:
                            </Text>
                            <Code
                              block
                              style={{
                                background: theme.colors.background.primary,
                                maxHeight: 120,
                                overflow: "auto",
                                fontSize: "10px",
                              }}
                            >
                              {JSON.stringify(nodeResult.output, null, 2)}
                            </Code>
                          </div>
                        )}
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </div>
        )}

        {result && (
          <Card p="sm" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="sm">
                JSON Completo
              </Text>
              <CopyButton value={JSON.stringify(result, null, 2)}>
                {({ copied }) => (
                  <Tooltip label={copied ? "Copiado" : "Copiar"} withArrow>
                    <ActionIcon
                      color={copied ? "green" : "gray"}
                      variant="light"
                      size="xs"
                    >
                      <IconCopy size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Code
              block
              style={{
                background: theme.colors.background.primary,
                maxHeight: 150,
                overflow: "auto",
                fontSize: "10px",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </Code>
          </Card>
        )}
      </Stack>
    </ScrollArea>
  );
}
