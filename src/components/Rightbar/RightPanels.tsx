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
      <ActionIcon
        size="sm"
        variant="subtle"
        onClick={onToggle}
        style={{
          position: "absolute",
          bottom: 12,
          left: collapsed ? 12 : 8,
          zIndex: 10,
          color: theme.colors.ink,
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
              <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.5 }}>
                Selecciona un flujo para ver la ejecución
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
