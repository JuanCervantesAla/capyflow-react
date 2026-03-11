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
import { CreationTimer } from "./CreationTimer";
import { useTheme } from "../../../theme/ThemeContext";
import { FlowInternals } from "./FlowInternals";
import { useCreationSession } from "../../../hooks/useCreationSession";
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
  "loop": CustomNode,
  log: CustomNode,
} as any;

const edgeTypes = { customEdge: CustomEdge };
const proOptions = { hideAttribution: true };

const MemoBackground = memo(Background);
const MemoMiniMap = memo(MiniMap);
const MemoPanel = memo(Panel);

const GRID_SIZE = 20;

function FlowCanvasComponent({
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

  // Creation session tracking
  const { formatTime, trackActivity, trackSave, isActive } = useCreationSession({
    flowId: flowId || '',
    creationMethod: 'manual', // TODO: Detect from flow creation
    enabled: !!flowId,
  });

  // Track node/edge changes for analytics
  useEffect(() => {
    trackActivity(nodes.length, edges.length);
  }, [nodes.length, edges.length, trackActivity]);

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
    ({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
      const node = nodes[0] ?? null;
      if (node && onNodeSelected) {
        onNodeSelected(node);
      }
      // Si hay un edge seleccionado y no hay nodos, dejar de mostrar el panel de nodo
      if (edges.length > 0 && nodes.length === 0 && onNodeSelected) {
        onNodeSelected(null);
      }
    },
    [onNodeSelected],
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: any) => {
      // Deseleccionar todos los nodos cuando se selecciona un edge
      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
      // Seleccionar el edge clickeado
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: e.id === edge.id,
        }))
      );
      // Deseleccionar el panel de configuración de nodos
      if (onNodeSelected) {
        onNodeSelected(null);
      }
    },
    [setNodes, setEdges, onNodeSelected],
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onPaneClick = useCallback(() => {
    // Deseleccionar todos los edges cuando se hace clic en el canvas vacío
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        selected: false,
      }))
    );
  }, [setEdges]);

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
      interactionWidth: 20,
    }),
    [],
  );

  const minimapStyle = useMemo(
    () => ({
      background: theme.colors.paper,
      border: `2px solid ${theme.colors.ink}`,
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(45, 52, 54, 0.1)",
    }),
    [
      theme.colors.paper,
      theme.colors.ink,
    ],
  );

  const nodeColor = useCallback(
    (node: any) =>
      node.data?.status === "success"
        ? "#10b981"
        : node.data?.status === "error"
        ? "#f43f5e"
        : node.data?.color || theme.colors.ink,
    [theme.colors.ink],
  );

  const maskColor = useMemo(
    () => theme.colors.paper + "CC",
    [theme.colors.paper],
  );

  const onNodeDragStop = useCallback(
    () => {
      // Snap is now handled by ReactFlow's snapToGrid prop
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: theme.colors.background.canvas,
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
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        snapToGrid
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        fitView
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={4}
        deleteKeyCode="Delete"
        elevateNodesOnSelect={false}
        elevateEdgesOnSelect={true}
        selectNodesOnDrag={false}
        nodesDraggable
        nodesConnectable={!isDragging}
        elementsSelectable
        edgesFocusable
        edgesReconnectable
        autoPanOnConnect={false}
        autoPanOnNodeDrag={false}
        connectionMode="loose"
        connectionRadius={50}
        translateExtent={[
          [-2000, -2000],
          [2000, 2000],
        ]}
        zoomActivationKeyCode={null}
        preventScrolling
      >
        <FlowInternals />

        <MemoBackground
          variant="lines"
          gap={50}
          size={1}
          color="#2d343608"
          lineWidth={1}
        />
        
        <MemoBackground
          variant="lines"
          gap={250}
          size={1}
          color="#2d343612"
          lineWidth={1.5}
        />

        <MemoPanel position="top-left">
          <CustomControls {...controls} />
        </MemoPanel>

        <MemoPanel position="top-right">
          <CreationTimer 
            formatTime={formatTime}
            isActive={isActive}
            creationMethod="manual"
          />
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

// Memo FlowCanvas with custom comparison to prevent re-renders
// when nodes/edges changes are handled internally by ReactFlow
export const FlowCanvas = memo(
  FlowCanvasComponent,
  (prevProps, nextProps) => {
    // Only re-render if callbacks change (reference equality)
    return (
      prevProps.onNodeSelected === nextProps.onNodeSelected &&
      prevProps.onExecutionUpdate === nextProps.onExecutionUpdate &&
      prevProps.onDeselectAll === nextProps.onDeselectAll
    );
  }
);
