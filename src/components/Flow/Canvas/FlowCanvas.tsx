import { useCallback, useContext, useState } from "react";
import { ReactFlow, Background, MiniMap, Panel, addEdge } from "@xyflow/react";
import { FlowContext } from "../../Flow/context/FlowContext";
import { CustomEdge } from "../../Edges/CustomEdge";
import { CustomNode } from "../../Nodes/CustomNode";
import { CustomControls } from "../../Control/CustomControls";
import { useTheme } from "../../../theme/ThemeContext";
import { Rightbar } from "../../Rightbar/Rightbar"; // Asegúrate de importar tu Rightbar
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

export function FlowCanvas() {
  const {setNodes, nodes, edges, setEdges, onNodesChange, onEdgesChange } = useContext(FlowContext);
  const [zoom, setZoom] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const { theme } = useTheme();

  // Solo aquí manejas la selección
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Busca el nodo seleccionado después de aplicar los cambios
      const selected = nodes.find((n) => n.selected);
      setSelectedNode(selected || null);
    },
    [nodes, onNodesChange]
  );

  const defaultEdgeOptions = {
    type: "customEdge",
    animated: true,
    style: {
      stroke: theme.colors.accent.primary,
      strokeWidth: 2,
      opacity: 0.6,
    },
    markerEnd: {
      type: "arrowclosed",
      color: theme.colors.accent.primary,
    },
  };

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        style={{ background: theme.colors.background.primary }}
        minZoom={0.5}
        maxZoom={2}
        deleteKeyCode={["Backspace", "Delete"]}
        selectionKeyCode={["Shift"]}
        multiSelectionKeyCode={["Control", "Meta"]}
        panOnScroll
        zoomOnDoubleClick={false}
      >
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
            zoom={zoom}
            onZoomIn={() => setZoom((z) => Math.min(z + 0.1, 2))}
            onZoomOut={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
            onZoomChange={setZoom}
            onFitView={() => console.log("Fit view")}
            onResetZoom={() => setZoom(1)}
            onToggleLock={() => setIsLocked(!isLocked)}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onScreenshot={() => console.log("Screenshot")}
            isLocked={isLocked}
            showGrid={showGrid}
          />
        </Panel>

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
      </ReactFlow>
      {/* Rightbar fuera de ReactFlow pero dentro del canvas */}
      {selectedNode && (
        <Rightbar
          node={selectedNode}
          onClose={() => {
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
          }}
        />
      )}
    </div>
  );
}