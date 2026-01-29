import { createContext, useCallback, useEffect, useMemo, useRef } from "react";
import {
  useNodesState,
  useEdgesState,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import type { FlowNode, NodeData } from "../types/NodeTypes";
import { FlowActionsContext } from "./FlowActionsContext";

interface FlowContextType {
  nodes: FlowNode[];
  edges: Edge[];
  addNode: (
    data: Partial<NodeData>,
    type?: string,
    onNodeAdded?: (node: FlowNode) => void,
  ) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  centerOnNode: (nodeId: string) => void;
  registerCenterHandler: (fn: (nodeId: string) => void) => void;
  saveFlow: () => Promise<void>;
  loadFlowData: (nodes: FlowNode[], edges: Edge[]) => void;
}

export const FlowContext = createContext<FlowContextType>(
  {} as FlowContextType,
);

export function FlowProvider({
  children,
  onSave,
}: {
  children: React.ReactNode;
  onSave?: (nodes: FlowNode[], edges: Edge[]) => Promise<void>;
}) {
  const [nodes, setNodesInternal, onNodesChange] = useNodesState([]);
  const [edges, setEdgesInternal, onEdgesChange] = useEdgesState([]);

  // Create type-safe wrappers
  const setNodes = setNodesInternal as React.Dispatch<React.SetStateAction<FlowNode[]>>;
  const setEdges = setEdgesInternal as React.Dispatch<React.SetStateAction<Edge[]>>;

  const nodesRef = useRef<FlowNode[]>(nodes as FlowNode[]);
  const edgesRef = useRef<Edge[]>(edges as Edge[]);

  useEffect(() => {
    nodesRef.current = nodes as FlowNode[];
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges as Edge[];
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
          category: data.category ?? "",
          type: data.type ?? "custom",
          parameters: data.parameters ?? [],
          inputs: data.inputs ?? [],
          outputs: data.outputs ?? [],
          color: data.color ?? "#4c6ef5",
          status: data.status ?? "idle",
          disabled: data.disabled ?? false,
        },
      };

      setNodes((n: FlowNode[]) => [...n, node] as FlowNode[]);

      queueMicrotask(() => {
        centerOnNode(node.id);
        onNodeAdded?.(node);
      });
    },
    [setNodes, centerOnNode],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((n: FlowNode[]) => n.filter((x) => x.id !== id));
      setEdges((e: Edge[]) => e.filter((x) => x.source !== id && x.target !== id));
    },
    [setNodes, setEdges],
  );

  const duplicateNode = useCallback(
    (id: string) => {
      const found = (nodesRef.current as FlowNode[]).find((n) => n.id === id);
      if (!found) return;

      const node = {
        ...found,
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: {
          x: (found.position?.x as number) + 40 || 0,
          y: (found.position?.y as number) + 40 || 0,
        },
        selected: false,
      } as FlowNode;

      setNodes((nds: FlowNode[]) => [...nds, node]);
      queueMicrotask(() => centerOnNode(node.id));
    },
    [setNodes, centerOnNode],
  );

  const saveFlow = useCallback(async () => {
    if (onSave) {
      await onSave(nodesRef.current as FlowNode[], edgesRef.current);
    }
  }, [onSave]);

  const loadFlowData = useCallback(
    (n: FlowNode[], e: Edge[]) => {
      setNodes((n ?? []) as FlowNode[]);
      setEdges((e ?? []) as Edge[]);
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
      nodes: nodes as FlowNode[],
      edges,
      addNode,
      deleteNode,
      duplicateNode,
      setNodes,
      setEdges,
      onNodesChange: onNodesChange as (changes: NodeChange[]) => void,
      onEdgesChange: onEdgesChange as (changes: EdgeChange[]) => void,
      centerOnNode,
      registerCenterHandler,
      saveFlow,
      loadFlowData,
    }),
    [nodes, edges, addNode, deleteNode, duplicateNode, setNodes, setEdges, onNodesChange, onEdgesChange, centerOnNode, registerCenterHandler, saveFlow, loadFlowData],
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
