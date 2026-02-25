import { BaseEdge, getSmoothStepPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import { useMemo } from "react";
import { getThemeColors } from "../../theme/themeCache";

export function CustomEdge({ id, sourceX, sourceY, targetX, targetY, selected }: EdgeProps) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 16,
  });

  const colors = useMemo(() => getThemeColors(), []);
  const stroke = selected ? colors.edgeSelectedColor : colors.borderNode;

  return (
    <BaseEdge 
      id={id} 
      path={path} 
      style={{
        stroke,
        strokeWidth: 2.5,
        vectorEffect: 'non-scaling-stroke',
        shapeRendering: 'geometricPrecision',
      }} 
      interactionWidth={20}
    />
  );
}