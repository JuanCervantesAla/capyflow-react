import { useCallback, useContext, useState, useEffect } from "react";
import { ReactFlow, Background, MiniMap, Panel, addEdge, useReactFlow } from "@xyflow/react";
import { FlowContext } from "../../Flow/context/FlowContext";
import { CustomEdge } from "../../Edges/CustomEdge";
import { CustomNode } from "../../Nodes/CustomNode";
import { CustomControls } from "../../Control/CustomControls";
import { useTheme } from "../../../theme/ThemeContext";
import { Rightbar } from "../../Rightbar/Rightbar";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};


function FlowInternals() {
  const reactFlowInstance = useReactFlow();
  const { setCenterOnNode } = useContext(FlowContext);

  useEffect(() => {
    const centerOnNode = (nodeId: string) => {
      reactFlowInstance.fitView({
        nodes: [{ id: nodeId }],
        duration: 800,
        padding: 0.5,
        maxZoom: 1.2,
      });
    };
    
    setCenterOnNode(centerOnNode);
  }, [reactFlowInstance, setCenterOnNode]);

  return null;
}

export function FlowCanvas() {
  const { setNodes, nodes, edges, setEdges, onNodesChange, onEdgesChange } = useContext(FlowContext);
  const [isLocked, setIsLocked] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const { theme } = useTheme();

  const [isDragging, setIsDragging] = useState(false);

  const onMoveStart = useCallback(() => setIsDragging(true), []);
  const onMoveEnd = useCallback(() => setIsDragging(false), []);

  const handleSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNode(selectedNodes.length > 0 ? selectedNodes[0] : null);
  }, []);

  const handleZoomIn = useCallback(() => {
    
  }, []);
  const handleZoomOut = useCallback(() => {
    
  }, []);
  const handleZoomChange = useCallback(() => {
    
  }, []);
  const handleFitView = useCallback(() => {
    
  }, []);
  const handleResetZoom = useCallback(() => {
    
  }, []);
  const handleToggleLock = useCallback(() => setIsLocked((prev) => !prev), []);
  const handleToggleGrid = useCallback(() => setShowGrid((prev) => !prev), []);
  const handleScreenshot = useCallback(() => console.log("Screenshot"), []);

  const defaultEdgeOptions = useMemo(() => ({
  type: "customEdge",
  animated: !isDragging,
  style: {
    stroke: theme.colors.accent.primary,
    strokeWidth: 2,
    opacity: 0.6,
  },
  markerEnd: {
    type: "arrowclosed",
    color: theme.colors.accent.primary,
  },
}), [theme.colors.accent.primary, isDragging]);

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const handleCloseRightbar = useCallback(() => {
    setSelectedNode((prev) => {
      if (prev) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === prev.id ? { ...n, selected: false } : n
          )
        );
      }
      return null;
    });
  }, [setNodes]);

  return (
    <div
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
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={handleSelectionChange}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        onConnect={onConnect}
        style={{ background: theme.colors.background.primary }}
        minZoom={0.5}
        maxZoom={2}
        deleteKeyCode={["Backspace", "Delete"]}
        selectionKeyCode={["Shift"]}
        multiSelectionKeyCode={["Control", "Meta"]}
        panOnScroll
        zoomOnDoubleClick={false}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
      >
                <FlowInternals />
        
        <Background
          color={theme.colors.border.primary}
          gap={20}
          size={1}
          style={{
            background: theme.colors.background.primary,
          }}
        />

        <Panel position="top-left">
          <CustomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomChange={handleZoomChange}
            onFitView={handleFitView}
            onResetZoom={handleResetZoom}
            onToggleLock={handleToggleLock}
            onToggleGrid={handleToggleGrid}
            onScreenshot={handleScreenshot}
            isLocked={isLocked}
            showGrid={showGrid}
          />
        </Panel>

          {!isDragging && (
            <MiniMap
              nodeColor={(node) =>
                node.selected
                  ? theme.colors.accent.primary
                  : theme.colors.background.tertiary
              }
              maskColor="rgba(243,244,246,0.8)"
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: 8,
                boxShadow: theme.effects.shadowMd,
              }}
              position="bottom-right"
            />
          )}


      </ReactFlow>
      {selectedNode && (
        <Rightbar
          node={selectedNode}
          onClose={handleCloseRightbar}
        />
      )}
    </div>
  );
}