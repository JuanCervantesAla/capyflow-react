import { Box, Text, ActionIcon } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTheme } from "../../theme/ThemeContext";
import { ExecutionResultPanel } from "../Flow/Canvas/ExecutionResultPanel";

const WIDTH = 320;
const COLLAPSED = 48;

interface RightPanelsProps {
  collapsed: boolean;
  onToggle: () => void;
  flowId: string | null;
  executionResult: any;
  isExecuting: boolean;
}

export function RightPanels({
  collapsed,
  onToggle,
  flowId,
  executionResult,
  isExecuting,
}: RightPanelsProps) {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        width: collapsed ? COLLAPSED : WIDTH,
        transition: "width 0.25s ease",
        background: theme.colors.paper,
        borderLeft: `2px solid ${theme.colors.ink}`,
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {!collapsed && (
        <Box
          px="md"
          py="sm"
          style={{
            borderBottom: `2px solid ${theme.colors.ink}`,
            background: "rgba(45, 52, 54, 0.03)",
          }}
        >
          <Text size="sm" fw={800} c={theme.colors.ink}>
            Execution Insights
          </Text>
          <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.65 }}>
            Current state, history, and execution differences.
          </Text>
        </Box>
      )}

      <ActionIcon
        size="md"
        radius="xl"
        variant="light"
        onClick={onToggle}
        style={{
          position: "absolute",
          bottom: 12,
          left: collapsed ? 12 : 8,
          zIndex: 10,
          color: theme.colors.ink,
          border: `1.5px solid ${theme.colors.ink}`,
          background: theme.colors.paper,
        }}
      >
        {collapsed ? (
          <IconChevronLeft size={16} />
        ) : (
          <IconChevronRight size={16} />
        )}
      </ActionIcon>

      {!collapsed && (
        <Box style={{ height: "100%" }}>
          {flowId ? (
            <ExecutionResultPanel
              flowId={flowId}
              result={executionResult}
              isLoading={isExecuting}
            />
          ) : (
            <Box p={32} style={{ textAlign: "center" }}>
              <Text size="xs" fw={700} c={theme.colors.ink}>
                No flow selected
              </Text>
              <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
                Select a flow to see execution results and metrics.
              </Text>
            </Box>
          )}
        </Box>
      )}

      {collapsed && (
        <Box
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            size="xs"
            fw={700}
            c={theme.colors.ink}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "1px", opacity: 0.65 }}
          >
            EXEC
          </Text>
        </Box>
      )}
    </Box>
  );
}
