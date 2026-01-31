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
        background: theme.colors.background.primary,
        borderLeft: `1px solid ${theme.colors.border.primary}`,
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
          top: 12,
          left: collapsed ? 12 : 8,
          zIndex: 10,
        }}
      >
        {collapsed ? (
          <IconChevronLeft size={16} />
        ) : (
          <IconChevronRight size={16} />
        )}
      </ActionIcon>

      {!collapsed && flowId && (
        <ExecutionResultPanel
          flowId={flowId}
          result={result}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
}
