import { Box, ActionIcon } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useTheme } from "../../../theme/ThemeContext";
import { ExecutionResultPanel } from "./ExecutionResultPanel";

const WIDTH = 360;
const COLLAPSED = 48;

export function ExecutionPanelWrapper({
  flowId,
  collapsed,
  onToggle,
  result,
  isLoading,
}: {
  flowId?: string;
  collapsed: boolean;
  onToggle: () => void;
  result: any;
  isLoading: boolean;
}) {
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

      {!collapsed && flowId && (
        <Box style={{ height: "100%" }}>
          <ExecutionResultPanel
            flowId={flowId}
            result={result}
            isLoading={isLoading}
          />
        </Box>
      )}
    </Box>
  );
}
