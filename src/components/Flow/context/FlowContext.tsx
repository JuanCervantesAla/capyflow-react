import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
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
  updateNodeExecutionStatus: (
    nodeId: string,
    status: "idle" | "running" | "success" | "error",
    data?: {
      error?: string;
      duration?: number;
      output?: any;
    },
  ) => void;
  updateNodeParameters: (
    nodeId: string,
    parameters: Record<string, any>,
  ) => void;
  resetExecutionStates: () => void;
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
  const [nodes, setNodesInternal, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdgesInternal, onEdgesChange] = useEdgesState([]);

  const setNodes =
    setNodesInternal as React.Dispatch<
      React.SetStateAction<FlowNode[]>
    >;
  const setEdges =
    setEdgesInternal as React.Dispatch<React.SetStateAction<Edge[]>>;

  const nodesRef = useRef<FlowNode[]>(nodes as FlowNode[]);
  const edgesRef = useRef<Edge[]>(edges as Edge[]);
  
  // Throttle position updates during drag to improve performance
  const pendingChangesRef = useRef<NodeChange[]>([]);
  const throttleTimeoutRef = useRef<number | null>(null);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Check if all changes are position updates (dragging)
    const allPositionChanges = changes.every(
      (change) => change.type === 'position' && (change as any).dragging
    );

    if (allPositionChanges) {
      // Batch position changes during drag
      pendingChangesRef.current.push(...changes);
      
      if (throttleTimeoutRef.current === null) {
        throttleTimeoutRef.current = window.requestAnimationFrame(() => {
          onNodesChangeInternal(pendingChangesRef.current);
          pendingChangesRef.current = [];
          throttleTimeoutRef.current = null;
        });
      }
    } else {
      // Apply non-position changes immediately
      if (throttleTimeoutRef.current !== null) {
        cancelAnimationFrame(throttleTimeoutRef.current);
        if (pendingChangesRef.current.length > 0) {
          onNodesChangeInternal(pendingChangesRef.current);
          pendingChangesRef.current = [];
        }
        throttleTimeoutRef.current = null;
      }
      onNodesChangeInternal(changes);
    }
  }, [onNodesChangeInternal]);

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
          executionStatus: "idle",
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
      setEdges((e) =>
        e.filter((x) => x.source !== id && x.target !== id),
      );
    },
    [setNodes, setEdges],
  );

  const duplicateNode = useCallback(
    (id: string) => {
      const found = nodesRef.current.find((n) => n.id === id);
      if (!found) return;

      const node: FlowNode = {
        ...found,
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: {
          x: (found.position?.x ?? 0) + 40,
          y: (found.position?.y ?? 0) + 40,
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
    (n: FlowNode[], e: Edge[]) => {
      setNodes(n ?? []);
      setEdges(e ?? []);
    },
    [setNodes, setEdges],
  );

  const updateNodeExecutionStatus = useCallback(
    (
      nodeId: string,
      status: "idle" | "running" | "success" | "error",
      data?: {
        error?: string;
        duration?: number;
        output?: any;
      },
    ) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  executionStatus: status,
                  executionError: data?.error,
                  executionDuration: data?.duration,
                  executionOutput: data?.output,
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const updateNodeParameters = useCallback(
    (nodeId: string, parameters: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  parameters,
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const resetExecutionStates = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          executionStatus: "idle",
          executionError: undefined,
          executionDuration: undefined,
          executionOutput: undefined,
        },
      })),
    );
  }, [setNodes]);

  const value = useMemo(
    () => ({
      nodes,
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
      updateNodeExecutionStatus,
      updateNodeParameters,
      resetExecutionStates,
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
      registerCenterHandler,
      saveFlow,
      loadFlowData,
      updateNodeExecutionStatus,
      updateNodeParameters,
      resetExecutionStates,
    ],
  );

  const actions = useMemo(
    () => ({ addNode, deleteNode, duplicateNode }),
    [addNode, deleteNode, duplicateNode],
  );

  return (
    <FlowActionsContext.Provider value={actions}>
      <FlowContext.Provider value={value}>
        {children}
      </FlowContext.Provider>
    </FlowActionsContext.Provider>
  );
}
