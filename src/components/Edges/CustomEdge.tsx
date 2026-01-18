import { BaseEdge, getSmoothStepPath } from "@xyflow/react";
import { useTheme } from "../../theme/ThemeContext";
import { memo, useMemo } from "react";

export const CustomEdge = memo(
  function CustomEdge({ id, sourceX, sourceY, targetX, targetY, selected }) {
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      borderRadius: 16,
    });

    const { theme } = useTheme();

    const edgeStyle = useMemo(
      () => ({
        stroke: selected ? theme.colors.selection.border : theme.colors.accent.primary,
        strokeWidth: selected ? 2.8 : 2.4,
        // Sin transición para que se mueva en tiempo real
      }),
      [selected, theme.colors.selection.border, theme.colors.accent.primary]
    );

    return <BaseEdge id={id} path={path} style={edgeStyle} />;
  },
  (prevProps, nextProps) => {
    // Retorna true si son IGUALES (no re-render), false si son DIFERENTES (re-render)
    return (
      prevProps.id === nextProps.id &&
      prevProps.sourceX === nextProps.sourceX &&
      prevProps.sourceY === nextProps.sourceY &&
      prevProps.targetX === nextProps.targetX &&
      prevProps.targetY === nextProps.targetY &&
      prevProps.selected === nextProps.selected
    );
  }
);