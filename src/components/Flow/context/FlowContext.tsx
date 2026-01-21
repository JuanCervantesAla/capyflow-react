import { createContext, useCallback, useEffect, useMemo, useRef } from "react";
import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import type { FlowNode, NodeData } from "../types/NodeTypes";
import { FlowActionsContext } from "./FlowActionsContext";

interface FlowContextType {
  nodes: Node[];
  edges: Edge[];
  addNode: (
    data: Partial<NodeData>,
    type?: string,
    onNodeAdded?: (node: FlowNode) => void,
  ) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  centerOnNode: (nodeId: string) => void;
  registerCenterHandler: (fn: (nodeId: string) => void) => void;
  saveFlow: () => Promise<void>;
  loadFlowData: (nodes: Node[], edges: Edge[]) => void;
}

export const FlowContext = createContext<FlowContextType>(
  {} as FlowContextType,
);

export function FlowProvider({
  children,
  onSave,
}: {
  children: React.ReactNode;
  onSave?: (nodes: Node[], edges: Edge[]) => Promise<void>;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const centerOnNodeRef = useRef<(nodeId: string) => void>(() => {});

  const registerCenterHandler = useCallback((fn: (nodeId: string) => void) => {
    centerOnNodeRef.current = fn;
  }, []);

  const centerOnNode = useCallback((id: string) => {
    centerOnNodeRef.current(id);
  }, []);

  const addNode = useCallback(
    (
      data: Partial<NodeData>,
      type = "custom",
      onNodeAdded?: (node: FlowNode) => void,
    ) => {
      const node: FlowNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

      setNodes((n) => [...n, node]);

      queueMicrotask(() => {
        centerOnNode(node.id);
        onNodeAdded?.(node);
      });
    },
    [setNodes, centerOnNode],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((n) => n.filter((x) => x.id !== id));
      setEdges((e) => e.filter((x) => x.source !== id && x.target !== id));
    },
    [setNodes, setEdges],
  );

  const duplicateNode = useCallback(
    (id: string) => {
      const found = nodesRef.current.find((n) => n.id === id);
      if (!found) return;

      const node = {
        ...found,
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: {
          x: found.position.x + 40,
          y: found.position.y + 40,
        },
        selected: false,
      };

      setNodes((nds) => [...nds, node]);
      queueMicrotask(() => centerOnNode(node.id));
    },
    [setNodes, centerOnNode],
  );

  const saveFlow = useCallback(async () => {
    if (onSave) {
      await onSave(nodesRef.current, edgesRef.current);
    }
  }, [onSave]);

  const loadFlowData = useCallback(
    (n: Node[], e: Edge[]) => {
      setNodes(n ?? []);
      setEdges(e ?? []);
    },
    [setNodes, setEdges],
  );

  const functionsRef = useRef({
    addNode,
    deleteNode,
    duplicateNode,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    centerOnNode,
    registerCenterHandler,
    saveFlow,
    loadFlowData,
  });

  useEffect(() => {
    functionsRef.current = {
      addNode,
      deleteNode,
      duplicateNode,
      setNodes,
      setEdges,
      onNodesChange,
      onEdgesChange,
      centerOnNode,
      registerCenterHandler,
      saveFlow,
      loadFlowData,
    };
  }, [
    addNode,
    deleteNode,
    duplicateNode,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    centerOnNode,
    registerCenterHandler,
    saveFlow,
    loadFlowData,
  ]);

  const value = useMemo(
    () => ({
      nodes,
      edges,
      ...functionsRef.current,
    }),
    [nodes, edges],
  );

  const actions = useMemo(
    () => ({ addNode, deleteNode, duplicateNode }),
    [addNode, deleteNode, duplicateNode],
  );

  return (
    <FlowActionsContext.Provider value={actions}>
      <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
    </FlowActionsContext.Provider>
  );
}
