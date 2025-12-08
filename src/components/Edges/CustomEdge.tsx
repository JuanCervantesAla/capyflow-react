import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from "@xyflow/react";
// import { theme } from "../../theme/Constants";
import { useTheme } from "../../theme/themeContext";

export function CustomEdge({ id, sourceX, sourceY, targetX, targetY, selected }) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 16,
  });

  const markerId = `arrow-${id}`;
  const { theme } = useTheme();

  return (
    <>
      <svg width="0" height="0">
        <defs>
        </defs>
      </svg>

      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: selected ? theme.colors.selection.border : theme.colors.accent.primary,
          strokeWidth: selected ? 2.8 : 2.4,
          transition: "all 0.2s ease",
        }}
        markerEnd={`url(#${markerId})`}
      />
    </>
  );
}