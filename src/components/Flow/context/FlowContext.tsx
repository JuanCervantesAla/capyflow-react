












































































      




      























      




      



































































































      




      























      




      







































































































      




      























      




      























import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import type { FlowNode, NodeData } from "../types/NodeTypes";
import { FlowActionsContext } from "./FlowActionsContext";

interface FlowContextType {
  nodes: Node[];
  edges: Edge[];
  addNode: (
    data: Partial<NodeData>,
    type?: string,
    onNodeAdded?: (node: FlowNode) => void
  ) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  centerOnNode: (nodeId: string) => void;
  setCenterOnNode: (fn: (nodeId: string) => void) => void;
}

export const FlowContext = createContext<FlowContextType>({
  nodes: [],
  edges: [],
  addNode: () => {},
  deleteNode: () => {},
  duplicateNode: () => {},
  setNodes: () => {},
  setEdges: () => {},
  onNodesChange: () => {},
  onEdgesChange: () => {},
  centerOnNode: () => {},
  setCenterOnNode: () => {},
});

interface FlowProviderProps {
  children: React.ReactNode;
}

const LS_KEY = "node_map";

export function FlowProvider({ children }: FlowProviderProps) {
  
  const load = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return { nodes: [], edges: [] };
      return JSON.parse(raw);
    } catch {
      return { nodes: [], edges: [] };
    }
  };

  const { nodes: initialNodes = [], edges: initialEdges = [] } = load();

  
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const [centerOnNodeFn, setCenterOnNodeFn] =
    useState<((nodeId: string) => void) | null>(null);

  
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const centerOnNode = useCallback(
    (nodeId: string) => {
      centerOnNodeFn?.(nodeId);
    },
    [centerOnNodeFn]
  );

  const setCenterOnNode = useCallback((fn: (nodeId: string) => void) => {
    setCenterOnNodeFn(() => fn);
  }, []);

  
  const addNode = useCallback(
    (
      data: Partial<NodeData>,
      type = "custom",
      onNodeAdded?: (node: FlowNode) => void
    ) => {
      const newNode: FlowNode = {
        id: `node-${Date.now()}`,
        type,
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
        data: {
          label: data.label ?? "Node",
          subtitle: data.subtitle ?? "",
          icon: data.icon ?? "IconBolt",
          parameters: data.parameters ?? [],
          inputs: data.inputs ?? [],
          outputs: data.outputs ?? [],
          color: data.color ?? "#4c6ef5",
          status: data.status ?? "idle",
          disabled: data.disabled ?? false,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      setTimeout(() => {
        centerOnNode(newNode.id);
      }, 50);

      onNodeAdded?.(newNode);
    },
    [setNodes, centerOnNode]
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges]
  );

  const duplicateNode = useCallback(
    (id: string) => {
      setNodes((nds) => {
        const found = nds.find((n) => n.id === id);
        if (!found) return nds;

        const newNode: FlowNode = {
          ...found,
          id: `node-${Date.now()}`,
          position: {
            x: found.position.x + 40,
            y: found.position.y + 40,
          },
          data: {
            ...found.data,
            label: `${found.data.label} (copy)`,
          },
          selected: false,
        };

        setTimeout(() => {
          centerOnNode(newNode.id);
        }, 50);

        return [...nds, newNode];
      });
    },
    [setNodes, centerOnNode]
  );

  
  const actionsValue = useMemo(
    () => ({ addNode, deleteNode, duplicateNode }),
    [addNode, deleteNode, duplicateNode]
  );

  const contextValue = useMemo(
    () => ({
      nodes,
      edges,
      addNode,
      deleteNode,
      duplicateNode,
      setNodes,
      setEdges,
      onNodesChange,
      onEdgesChange,
      centerOnNode,
      setCenterOnNode,
    }),
    [
      nodes,
      edges,
      addNode,
      deleteNode,
      duplicateNode,
      setNodes,
      setEdges,
      onNodesChange,
      onEdgesChange,
      centerOnNode,
      setCenterOnNode,
    ]
  );

  
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  return (
    <FlowActionsContext.Provider value={actionsValue}>
      <FlowContext.Provider value={contextValue}>
        {children}
      </FlowContext.Provider>
    </FlowActionsContext.Provider>
  );
}
