import { BaseEdge, getSmoothStepPath } from "@xyflow/react";
import { useTheme } from "../../theme/ThemeContext";
import { memo } from "react";

export const CustomEdge = memo(function CustomEdge({ id, sourceX, sourceY, targetX, targetY, selected }) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 16,
  });

  const { theme } = useTheme();

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: selected ? theme.colors.selection.border : theme.colors.accent.primary,
        strokeWidth: selected ? 2.8 : 2.4,
        transition: "all 0.2s ease",
      }}
    />
  );
});