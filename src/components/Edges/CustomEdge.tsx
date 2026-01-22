// import { BaseEdge, getSmoothStepPath } from "@xyflow/react";
// import { memo } from "react";
// import { getThemeColors } from "../../theme/themeCache";

// export const CustomEdge = memo(
//   function CustomEdge({ id, sourceX, sourceY, targetX, targetY, selected }) {
//     const [path] = getSmoothStepPath({
//       sourceX,
//       sourceY,
//       targetX,
//       targetY,
//       borderRadius: 16,
//     });

//     const colors = getThemeColors();
//     const stroke = selected ? colors.edgeSelectedColor : colors.edgeColor;

//     return (
//       <BaseEdge 
//         id={id} 
//         path={path} 
//         style={{
//           stroke,
//           strokeWidth: selected ? 2.8 : 2.4,
//           vectorEffect: 'non-scaling-stroke',
//           shapeRendering: 'geometricPrecision',
//         }} 
//       />
//     );
//   },
//   (prev, next) => {
//     if (prev.selected !== next.selected) return false;
//     const dx = Math.abs(prev.sourceX - next.sourceX) + Math.abs(prev.targetX - next.targetX);
//     const dy = Math.abs(prev.sourceY - next.sourceY) + Math.abs(prev.targetY - next.targetY);
    
//     return (dx + dy) < 0.5;
//   }
// );

import { BaseEdge, getSmoothStepPath } from "@xyflow/react";
import { memo } from "react";
import { getThemeColors } from "../../theme/themeCache";

export const CustomEdge = memo(
  function CustomEdge({ id, sourceX, sourceY, targetX, targetY, selected }) {
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      borderRadius: 16,
    });

    const colors = getThemeColors();
    const stroke = selected ? colors.edgeSelectedColor : colors.edgeColor;

    return (
      <BaseEdge 
        id={id} 
        path={path} 
        style={{
          stroke,
          strokeWidth: selected ? 2.8 : 2.4,
          vectorEffect: 'non-scaling-stroke',
          shapeRendering: 'geometricPrecision',
        }} 
      />
    );
  },
  (prev, next) => {
    // ✅ MEGA OPTIMIZACIÓN: Ignorar cambios durante drag
    // Solo re-render si cambió selección
    if (prev.selected !== next.selected) {
      return false;
    }
    
    // ✅ Durante drag, ignorar cambios menores de posición
    // Threshold de 3px para reducir re-renders al mínimo
    const dx = Math.abs(prev.sourceX - next.sourceX) + Math.abs(prev.targetX - next.targetX);
    const dy = Math.abs(prev.sourceY - next.sourceY) + Math.abs(prev.targetY - next.targetY);
    
    // true = NO re-render
    return (dx + dy) < 3;
  }
);