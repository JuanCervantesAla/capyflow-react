import { useState, useContext } from "react";
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
  Box,
  Tabs,
} from "@mantine/core";
import { IconCheck, IconX, IconClock, IconCopy } from "@tabler/icons-react";
import { useTheme } from "../../../theme/ThemeContext";
import { ExecutionHistoryPanel } from "./ExecutionHistoryPanel";
import { FlowContext } from "../context/FlowContext";

interface ExecutionResultPanelProps {
  flowId: string;
  result: any | null;
  isLoading?: boolean;
}

export function ExecutionResultPanel({
  flowId,
  result,
  isLoading = false,
}: ExecutionResultPanelProps) {
  const { theme } = useTheme();
  const { nodes } = useContext(FlowContext);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");

  return (
    <Box style={{ height: "100%", display: "flex", flexDirection: "column", background: theme.colors.paper }}>
      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as "current" | "history")}
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Tabs.List grow>
          <Tabs.Tab value="current">EXECUTION</Tabs.Tab>
          <Tabs.Tab value="history">HISTORY</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="current" style={{ flex: 1, overflow: "hidden", background: theme.colors.paper }}>
          {!result && !isLoading ? (
            <Box p="xl" style={{ textAlign: "center" }}>
              <Text c={theme.colors.ink} size="sm" style={{ opacity: 0.5 }}>
                Execute a Flow to see the results!
              </Text>
            </Box>
          ) : (
            <CurrentExecutionContent result={result} isLoading={isLoading} theme={theme} nodes={nodes} />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="history" style={{ flex: 1, overflow: "hidden", background: theme.colors.paper }}>
          <ExecutionHistoryPanel flowId={flowId} />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

function CurrentExecutionContent({ result, isLoading, theme, nodes }: any) {
  // Create map of nodeId to label
  const nodeLabels = nodes?.reduce((acc: any, node: any) => {
    acc[node.id] = node.data?.label || node.id;
    return acc;
  }, {}) || {};

  return (
    <ScrollArea style={{ height: "100%" }} type="auto">
        <Stack gap="md" style={{ padding: "1rem" }}>
          {isLoading && (
            <Card p="sm" withBorder style={{
              background: theme.colors.paper,
              borderColor: theme.colors.ink,
              borderWidth: 2,
            }}>
              <Group gap="sm">
                <Loader size="sm" color={theme.colors.ink} />
                <Text size="xs" c={theme.colors.ink} fw={600}>Running flow…</Text>
              </Group>
            </Card>
          )}

          {result && (
            <Card
              p="sm"
              radius="md"
              withBorder
              style={{
                background: theme.colors.paper,
                borderWidth: 2,
                borderColor:
                  result.status === "success"
                    ? "#10b981"
                    : result.status === "error"
                    ? "#f43f5e"
                    : theme.colors.ink,
              }}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  {result.status === "success" ? (
                    <IconCheck size={16} color="#10b981" strokeWidth={2.5} />
                  ) : result.status === "error" ? (
                    <IconX size={16} color="#f43f5e" strokeWidth={2.5} />
                  ) : (
                    <IconClock size={16} color={theme.colors.ink} strokeWidth={2.5} />
                  )}
                  <Text size="xs" fw={700} c={theme.colors.ink}>
                    {result.status === "success"
                      ? "Successful Execution"
                      : result.status === "error"
                      ? "Execution Error"
                      : "Execution in Progress"}
                  </Text>
                </Group>
                <Badge size="sm" variant="light" color="gray" style={{
                  borderColor: theme.colors.ink,
                  borderWidth: 1,
                  background: theme.colors.paper,
                  color: theme.colors.ink,
                }}>
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

          {result?.executedNodes?.length > 0 && (
            <div>
              <Text fw={700} size="sm" mb="xs" c={theme.colors.ink}>
                Executed Nodes ({result.executedNodes.length})
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
                        background: theme.colors.paper,
                        borderWidth: 2,
                        borderColor:
                          nodeResult.status === "success"
                            ? "#10b981"
                            : nodeResult.status === "error"
                            ? "#f43f5e"
                            : theme.colors.ink,
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Group gap={6} align="center" wrap="nowrap">
                            {nodeResult.status === "success" ? (
                              <IconCheck size={14} color="#10b981" strokeWidth={2.5} />
                            ) : nodeResult.status === "error" ? (
                              <IconX size={14} color="#f43f5e" strokeWidth={2.5} />
                            ) : (
                              <IconClock size={14} color={theme.colors.ink} strokeWidth={2.5} />
                            )}
                            <Text size="xs" fw={600} title={nodeId} c={theme.colors.ink}>
                              {nodeLabels[nodeId] || nodeId}
                            </Text>
                          </Group>
                          <Badge size="xs" variant="dot" color="gray" style={{
                            background: theme.colors.paper,
                            color: theme.colors.ink,
                          }}>
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
                            <Code
                              block
                              style={{
                                background: "rgba(45, 52, 54, 0.05)",
                                border: `1px solid ${theme.colors.ink}`,
                                color: theme.colors.ink,
                                maxHeight: 120,
                                overflow: "auto",
                                fontSize: "10px",
                                fontFamily: "monospace",
                              }}
                            >
                              {JSON.stringify(
                                nodeResult.output,
                                null,
                                2
                              )}
                            </Code>
                          )}
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            </div>
          )}

          {result && (
            <Card p="sm" radius="md" withBorder style={{
              background: theme.colors.paper,
              borderColor: theme.colors.ink,
              borderWidth: 2,
            }}>
              <Group justify="space-between" mb="xs">
                <Text fw={700} size="sm" c={theme.colors.ink}>
                  JSON Result:
                </Text>
                <CopyButton value={JSON.stringify(result, null, 2)}>
                  {({ copied }) => (
                    <Tooltip label={copied ? "Copiado" : "Copiar"} withArrow styles={{
                      tooltip: {
                        background: theme.colors.paper,
                        border: `2px solid ${theme.colors.ink}`,
                        color: theme.colors.ink,
                        fontWeight: 600,
                      },
                    }}>
                      <ActionIcon
                        color={copied ? "green" : "gray"}
                        variant="light"
                        size="xs"
                        style={{
                          border: `1px solid ${theme.colors.ink}`,
                          background: theme.colors.paper,
                        }}
                      >
                        <IconCopy size={14} color={theme.colors.ink} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <Code
                block
                style={{
                  background: "rgba(45, 52, 54, 0.05)",
                  border: `1px solid ${theme.colors.ink}`,
                  color: theme.colors.ink,
                  maxHeight: 150,
                  overflow: "auto",
                  fontSize: "10px",
                  fontFamily: "monospace",
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
