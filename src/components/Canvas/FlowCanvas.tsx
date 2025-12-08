import React, { useCallback, useContext } from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { ReactFlow, Background, MiniMap, addEdge } from "@xyflow/react";
import { FlowContext } from "../Flow/context/FlowContext";
import "@xyflow/react/dist/style.css";
import { CustomNode } from "../Nodes/CustomNode";
import { CustomEdge } from "../Edges/CustomEdge";
import { CustomControls } from "../Control/CustomControls";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

const defaultEdgeOptions = {
  type: "customEdge",
  animated: true,
  style: {
    stroke: "#A78BFA",
    strokeWidth: 2,
    opacity: 0.6,
  },
  markerEnd: {
    type: "arrowclosed",
    color: "#A78BFA",
  },
};

export function FlowCanvas() {
  const { nodes, edges, setEdges, onNodesChange, onEdgesChange } = useContext(FlowContext);

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: "100%"}}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        style={{ width: "100%", height: "100%", background: "#0F0F1A" }}
        minZoom={0.5}
        maxZoom={2}
        deleteKeyCode={["Backspace", "Delete"]}
        selectionKeyCode={["Shift"]}
        multiSelectionKeyCode={["Control", "Meta"]}
        panOnScroll
        zoomOnDoubleClick={false}
      >
        <Background
          color="#2D2D52"
          gap={20}
          size={1}
          style={{
            background:
              "radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.05) 0%, transparent 50%)",
          }}
        />

        <Panel position="top-left" style={{ zIndex: 1000 }}>
          <CustomControls />
        </Panel>

        <MiniMap
          nodeColor={(node) => {
            if (node.selected) return "#7C3AED";
            return "#25254A";
          }}
          maskColor="rgba(15, 15, 26, 0.8)"
          style={{
            background: "#1A1A2E",
            border: "1px solid #2D2D52",
            borderRadius: 8,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
            zIndex: 10,
          }}
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}