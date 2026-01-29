import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

export interface NodeData extends Record<string, unknown> {
  label: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  category?: string;
  description?: string;
  parameters?: any[];
  inputs?: any[];
  outputs?: any[];
  status?: string;
  lastRun?: string | null;
  errorMessage?: string;
  executionTimeMs?: number;
  disabled?: boolean;
  retryOnFail?: boolean;
  retries?: number;
  version?: string;
  nodeTypeId?: string;
  type?: string;
}

export type FlowNode = ReactFlowNode<NodeData>;

interface BackendNode {
  id: string;
  flowId?: string;
  type: string;
  position: string;
  label: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  category?: string;
  description?: string;
  parameters?: string; 
  inputs?: string; 
  outputs?: string; 
  status?: string;
  lastRun?: string | null;
  errorMessage?: string;
  executionTimeMs?: number;
  disabled: boolean;
  retryOnFail: boolean;
  retries: number;
  version?: string;
}

interface BackendEdge {
  id: string;
  flowId?: string;
  source: string;
  target: string;
  type?: string;
  animated: boolean;
  label?: string;
}

export function transformNodeForBackend(node: FlowNode): BackendNode {
  const data = node.data || {};
  const backendNode: BackendNode = {
    id: node.id,
    type: (data.type as string) || node.type || "custom",
    position: JSON.stringify(node.position),
    label: (data.label as string) || "Node",
    subtitle: (data.subtitle as string) || "",
    icon: (data.icon as string) || "IconBolt",
    color: (data.color as string) || "#4c6ef5",
    category: (data.category as string) || "",
    description: (data.description as string) || "",
    parameters: data.parameters ? JSON.stringify(data.parameters) : "[]",
    inputs: data.inputs ? JSON.stringify(data.inputs) : "[]",
    outputs: data.outputs ? JSON.stringify(data.outputs) : "[]",
    status: (data.status as string) || "idle",
    lastRun: (data.lastRun as string | null) || null,
    errorMessage: (data.errorMessage as string) || "",
    executionTimeMs: (data.executionTimeMs as number) || 0,
    disabled: (data.disabled as boolean) || false,
    retryOnFail: (data.retryOnFail as boolean) || false,
    retries: (data.retries as number) || 0,
    version: (data.version as string) || "1.0",
  };
  
  return backendNode;
}

export function transformEdgeForBackend(edge: ReactFlowEdge<any>): BackendEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || "customEdge",
    animated: edge.animated || false,
    label: edge.label?.toString() || "",
  };
}

export function transformNodeFromBackend(backendNode: any): FlowNode {
  // Fix: Si category está vacío pero subtitle es una categoría válida, usar subtitle como category
  let category = backendNode.category || "";
  const validCategories = ["trigger", "ai", "data", "logic", "io", "integration"];
  
  if (!category && backendNode.subtitle && validCategories.includes(backendNode.subtitle.toLowerCase())) {
    category = backendNode.subtitle.toLowerCase();
    console.warn(`Nodo ${backendNode.id}: category vacía, usando subtitle '${backendNode.subtitle}' como category`);
  }
  
  return {
    id: backendNode.id,
    type: backendNode.type || "custom",
    position: typeof backendNode.position === "string" 
      ? JSON.parse(backendNode.position) 
      : backendNode.position,
    data: {
      label: backendNode.label,
      subtitle: backendNode.subtitle,
      icon: backendNode.icon,
      color: backendNode.color,
      category: category,
      description: backendNode.description,
      parameters: backendNode.parameters 
        ? (typeof backendNode.parameters === "string" 
          ? JSON.parse(backendNode.parameters) 
          : backendNode.parameters)
        : [],
      inputs: backendNode.inputs 
        ? (typeof backendNode.inputs === "string" 
          ? JSON.parse(backendNode.inputs) 
          : backendNode.inputs)
        : [],
      outputs: backendNode.outputs 
        ? (typeof backendNode.outputs === "string" 
          ? JSON.parse(backendNode.outputs) 
          : backendNode.outputs)
        : [],
      status: backendNode.status,
      lastRun: backendNode.lastRun,
      errorMessage: backendNode.errorMessage,
      executionTimeMs: backendNode.executionTimeMs,
      disabled: backendNode.disabled,
      retryOnFail: backendNode.retryOnFail,
      retries: backendNode.retries,
      version: backendNode.version,
    },
  };
}

export function transformEdgeFromBackend(backendEdge: any): ReactFlowEdge {
  return {
    id: backendEdge.id,
    source: backendEdge.source,
    target: backendEdge.target,
    type: backendEdge.type || "customEdge",
    animated: backendEdge.animated || false,
    label: backendEdge.label,
  };
}