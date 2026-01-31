import {
  useCallback,
  useContext,
  useMemo,
  useState,
  memo,
  useRef,
  useEffect,
  type MutableRefObject,
} from "react";
import { useParams } from "react-router-dom";
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  addEdge,
  useReactFlow,
} from "@xyflow/react";
import type { Connection } from "@xyflow/react";
import { useQueryClient } from "@tanstack/react-query";
import { FlowContext } from "../context/FlowContext";
import { CustomNode } from "../../Nodes/CustomNode";
import { CustomEdge } from "../../Edges/CustomEdge";
import { CustomControls } from "../../Control/CustomControls";
import { useTheme } from "../../../theme/ThemeContext";
import { FlowInternals } from "./FlowInternals";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { queryKeys } from "../../../lib/queryKeys";
import "@xyflow/react/dist/style.css";
import { useExecutionUpdates } from '../../../hooks/useExecutionUpdates';

const nodeTypes = {
  custom: CustomNode,
  "manual-trigger": CustomNode,
  "set-data": CustomNode,
  "transform-data": CustomNode,
  "json-parser": CustomNode,
  "if-condition": CustomNode,
  "http-request": CustomNode,
  "webhook-trigger": CustomNode,
  log: CustomNode,
} as any;

const edgeTypes = { customEdge: CustomEdge };
const proOptions = { hideAttribution: true };

const MemoBackground = memo(Background);
const MemoMiniMap = memo(MiniMap);
const MemoPanel = memo(Panel);

const GRID_SIZE = 20;

const snapPosition = (value: number) =>
  Math.round(value / GRID_SIZE) * GRID_SIZE;


export function FlowCanvas({
  onNodeSelected,
  onExecutionUpdate,
  onDeselectAll,
}: {
  onNodeSelected?: (node: any) => void;
  onExecutionUpdate?: (data: any) => void;
  onDeselectAll?: MutableRefObject<(() => void) | null>;
}) {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange } =
    useContext(FlowContext);

  const reactFlow = useReactFlow();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const { id: flowId } = useParams<{ id: string }>();

  const { executionData } = useExecutionUpdates(flowId);

  useEffect(() => {
    if (onExecutionUpdate && executionData.status !== 'idle') {
      onExecutionUpdate(executionData);
    }
  }, [executionData, onExecutionUpdate]);

  useEffect(() => {
    if (onDeselectAll) {
      const deselectAll = () => {
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
      };
      onDeselectAll.current = deselectAll;
    }
  }, [onDeselectAll, setNodes]);

  useWebSocket({
    onUpdate: (update) => {
      if (update.type === "complete" && update.flowId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.executions.byFlow(update.flowId),
        });
      }
    },
  });

  const onMoveStart = useCallback(() => {
    setIsDragging(true);
    const rf = containerRef.current?.querySelector(".react-flow");
    rf?.classList.add("dragging");
  }, []);

  const onMoveEnd = useCallback(() => {
    setIsDragging(false);
    const rf = containerRef.current?.querySelector(".react-flow");
    rf?.classList.remove("dragging");
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: any[] }) => {
      const node = nodes[0] ?? null;
      if (node && onNodeSelected) {
        onNodeSelected(node);
      }
    },
    [onNodeSelected],
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const controls = useMemo(
    () => ({
      zoomIn: () => reactFlow.zoomIn(),
      zoomOut: () => reactFlow.zoomOut(),
      fitView: () => reactFlow.fitView(),
      reset: () => reactFlow.setCenter(0, 0, { zoom: 0.5 }),
    }),
    [reactFlow],
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "customEdge",
      animated: false,
      deletable: true,
      focusable: true,
      selectable: true,
    }),
    [],
  );

  const minimapStyle = useMemo(
    () => ({
      background: theme.colors.background.secondary,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: 8,
      opacity: isDragging ? 0.3 : 1,
      transition: "opacity 150ms ease",
    }),
    [
      theme.colors.background.secondary,
      theme.colors.border.primary,
      isDragging,
    ],
  );

  const nodeColor = useCallback(
    (node: any) =>
      node.data?.status === "success"
        ? "#10b981"
        : node.data?.status === "error"
        ? "#f43f5e"
        : node.data?.color || theme.colors.accent.primary,
    [theme.colors.accent.primary],
  );

  const maskColor = useMemo(
    () => theme.colors.background.primary + "80",
    [theme.colors.background.primary],
  );

  const onNodeDragStop = useCallback(
    (_: any, node: any) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                position: {
                  x: snapPosition(node.position.x),
                  y: snapPosition(node.position.y),
                },
              }
            : n,
        ),
      );
    },
    [setNodes],
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: theme.colors.background.primary,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onConnect={onConnect}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        fitView
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={4}
        deleteKeyCode="Delete"
        elevateNodesOnSelect={false}
        selectNodesOnDrag={false}
        nodesDraggable
        nodesConnectable={!isDragging}
        elementsSelectable
        edgesFocusable
        edgesReconnectable
        autoPanOnConnect={false}
        autoPanOnNodeDrag={false}
        translateExtent={[
          [-2000, -2000],
          [2000, 2000],
        ]}
        zoomActivationKeyCode={null}
        preventScrolling
      >
        <FlowInternals />

        <MemoBackground
          gap={20}
          size={1}
          color={theme.colors.border.primary}
        />

        <MemoPanel position="top-left">
          <CustomControls {...controls} />
        </MemoPanel>

        <MemoMiniMap
          position="bottom-right"
          nodeColor={nodeColor}
          maskColor={maskColor}
          style={minimapStyle}
          pannable
          zoomable
          nodeStrokeWidth={3}
        />
      </ReactFlow>
    </div>
  );
}
