import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import { useMemo } from "react";
import { getThemeColors } from "../../theme/themeCache";
import { ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useReactFlow } from "@xyflow/react";

export function CustomEdge({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  source,
  target,
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 16,
  });

  const { deleteElements } = useReactFlow();
  const colors = useMemo(() => getThemeColors(), []);
  const showConnectionIds = Boolean((data as any)?.showConnectionIds);
  const sourceNodeId = (data as any)?.sourceNodeId || source;
  const targetNodeId = (data as any)?.targetNodeId || target;
  
  // Colors for the edge
  const stroke = selected ? colors.accent : colors.borderNode;
  const strokeWidth = selected ? 3 : 2.5;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      {/* Edge with outline animation when selected */}
      {selected && (
        <>
          {/* Glow exterior */}
          <path
            d={path}
            fill="none"
            stroke={colors.accent}
            strokeWidth={strokeWidth + 12}
            opacity={0.15}
            style={{
              vectorEffect: 'non-scaling-stroke',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          {/* Glow medio */}
          <path
            d={path}
            fill="none"
            stroke={colors.accent}
            strokeWidth={strokeWidth + 6}
            opacity={0.3}
            style={{
              vectorEffect: 'non-scaling-stroke',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.1s',
            }}
          />
        </>
      )}
      
      <BaseEdge 
        id={id} 
        path={path} 
        markerEnd={markerEnd}
        style={{
          stroke,
          strokeWidth,
          vectorEffect: 'non-scaling-stroke',
          shapeRendering: 'geometricPrecision',
          cursor: 'pointer',
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
        }} 
        interactionWidth={20}
      />

      {showConnectionIds && sourceNodeId && targetNodeId && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 18}px)`,
              pointerEvents: 'none',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2px',
              color: colors.textInk,
              background: 'rgba(255, 248, 240, 0.95)',
              border: `1px solid ${colors.borderNode}`,
              borderRadius: 6,
              padding: '2px 6px',
              whiteSpace: 'nowrap',
              maxWidth: 220,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={`${sourceNodeId} -> ${targetNodeId}`}
          >
            {sourceNodeId} -&gt; {targetNodeId}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Delete button when selected */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <ActionIcon
              onClick={handleDelete}
              size="sm"
              radius="xl"
              color="red"
              variant="filled"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <IconX size={12} stroke={3} />
            </ActionIcon>
          </div>
        </EdgeLabelRenderer>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.35;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.7);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}