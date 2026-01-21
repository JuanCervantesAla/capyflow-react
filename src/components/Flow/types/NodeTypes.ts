import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

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

export function transformNodeForBackend(node: ReactFlowNode): BackendNode {
  return {
    id: node.id,
    type: node.type || "custom",
    position: JSON.stringify(node.position),
    label: node.data.label || "Node",
    subtitle: node.data.subtitle || "",
    icon: node.data.icon || "IconBolt",
    color: node.data.color || "#4c6ef5",
    category: node.data.category || "",
    description: node.data.description || "",
    parameters: node.data.parameters ? JSON.stringify(node.data.parameters) : "[]",
    inputs: node.data.inputs ? JSON.stringify(node.data.inputs) : "[]",
    outputs: node.data.outputs ? JSON.stringify(node.data.outputs) : "[]",
    status: node.data.status || "idle",
    lastRun: node.data.lastRun || null,
    errorMessage: node.data.errorMessage || "",
    executionTimeMs: node.data.executionTimeMs || 0,
    disabled: node.data.disabled || false,
    retryOnFail: node.data.retryOnFail || false,
    retries: node.data.retries || 0,
    version: node.data.version || "1.0",
  };
}

export function transformEdgeForBackend(edge: ReactFlowEdge): BackendEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || "customEdge",
    animated: edge.animated || false,
    label: edge.label?.toString() || "",
  };
}

export function transformNodeFromBackend(backendNode: any): ReactFlowNode {
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
      category: backendNode.category,
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