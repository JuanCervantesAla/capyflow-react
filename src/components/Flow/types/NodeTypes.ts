import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

export interface NodeData extends Record<string, unknown> {
  label: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  category?: string;
  description?: string;
  parameters?: Record<string, any>;
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
  
  executionStatus?: 'idle' | 'running' | 'success' | 'error';
  executionError?: string;
  executionDuration?: number;
  executionOutput?: any;
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
    parameters: data.parameters ? JSON.stringify(data.parameters) : "{}",
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
  let position = { x: 0, y: 0 };
  try {
    position = JSON.parse(backendNode.position || '{"x":0,"y":0}');
  } catch (e) {
    console.error("Error parsing position:", e);
  }

  let parameters = {};
  try {
    parameters = JSON.parse(backendNode.parameters || '{}');
  } catch (e) {
    console.error("Error parsing parameters:", e);
  }

  let inputs = [];
  try {
    inputs = JSON.parse(backendNode.inputs || '[]');
  } catch (e) {
    console.error("Error parsing inputs:", e);
  }

  let outputs = [];
  try {
    outputs = JSON.parse(backendNode.outputs || '[]');
  } catch (e) {
    console.error("Error parsing outputs:", e);
  }

  return {
    id: backendNode.id,
    type: "custom",
    position,
    data: {
      label: backendNode.label || "Node",
      subtitle: backendNode.subtitle || "",
      icon: backendNode.icon || "IconBolt",
      color: backendNode.color || "#4c6ef5",
      category: backendNode.category || "",
      description: backendNode.description || "",
      type: backendNode.type || "custom",
      parameters,
      inputs,
      outputs,
      status: backendNode.status || "idle",
      lastRun: backendNode.lastRun || null,
      errorMessage: backendNode.errorMessage || "",
      executionTimeMs: backendNode.executionTimeMs || 0,
      disabled: backendNode.disabled || false,
      retryOnFail: backendNode.retryOnFail || false,
      retries: backendNode.retries || 0,
      version: backendNode.version || "1.0",
      nodeTypeId: backendNode.nodeTypeId,
    },
  };
}

export function transformEdgeFromBackend(backendEdge: any): ReactFlowEdge<any> {
  return {
    id: backendEdge.id,
    source: backendEdge.source,
    target: backendEdge.target,
    type: backendEdge.type || "customEdge",
    animated: backendEdge.animated || false,
    label: backendEdge.label || "",
  };
}