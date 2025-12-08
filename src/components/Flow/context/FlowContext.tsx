import { createContext, useCallback, useEffect } from "react";
import { 
  useNodesState, 
  useEdgesState,
  type Edge,
  type Node,
  applyNodeChanges,
  applyEdgeChanges
} from "@xyflow/react";
import type { FlowNode, NodeData } from "../types/NodeTypes";

interface FlowContextType {
  nodes: Node[];
  edges: Edge[];
  addNode: (data: Partial<NodeData>, type?: string) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
}

export const FlowContext = createContext<FlowContextType>({
  nodes: [],
  edges: [],
  deleteNode: () => {},
  duplicateNode: () => {},
  setNodes: () => {},
  addNode: () => {},
  setEdges: () => {},
  onNodesChange: () => {},
  onEdgesChange: () => {},
});

interface FlowProviderProps {
  children: React.ReactNode;
}

const LS_KEY = "node_map";

export function FlowProvider({ children }: FlowProviderProps) {

  /** -------------------------
   *  1) CARGAR LOCAL STORAGE EXACTAMENTE UNA VEZ
   * --------------------------*/
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

  /** -------------------------
   *  2) INICIALIZAR ReactFlow YA CON LOS DATOS DEL LS
   * --------------------------*/
  const [nodes, setNodes, onNodesChangeBase] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState(initialEdges);

  /** -------------------------
   *  3) GUARDAR AUTOMÁTICAMENTE EN LOCALSTORAGE
   * --------------------------*/
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  /** -------------------------
   *  4) WRAPPERS
   * --------------------------*/
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  /** -------------------------
   *  5) ACCIONES
   * --------------------------*/
  const addNode = useCallback(
    (data: Partial<NodeData>, type = "custom") => {
      const newNode: FlowNode = {
        id: `node-${Date.now()}`,
        type,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
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
    },
    []
  );

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const duplicateNode = useCallback((id: string) => {
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
          label: `${found.data.label} (copy)`
        },
        selected: false,
      };
      return [...nds, newNode];
    });
  }, []);

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        addNode,
        deleteNode,
        duplicateNode,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}
