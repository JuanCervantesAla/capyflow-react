import { api } from "../client";

export interface NodeType {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  version: string;
  defaultInputs: string;
  defaultOutputs: string;
  defaultParams: string;
  isActive: boolean;
  isBeta: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendParameterSchema {
  type: string;
  required: boolean;
  default?: unknown;
  enum?: unknown[];
  min?: number;
  max?: number;
  pattern?: string;
  description?: string;
  example?: string;
  advanced?: boolean;
}

export interface BackendNodeSchema {
  type: string;
  required: string[];
  parameters: Record<string, BackendParameterSchema>;
}

export const fetchAllNodeTypes = async (signal?: AbortSignal) => {
  return api.get<NodeType[]>('/node-types', signal);
};

export const fetchNodeTypesByCategory = async (category: string, signal?: AbortSignal) => {
  return api.get<NodeType[]>(`/node-types/category?category=${category}`, signal);
};

export const fetchNodeSchemas = async (
  mode: 'basic' | 'advanced' = 'advanced',
  signal?: AbortSignal
) => {
  return api.get<Record<string, BackendNodeSchema>>(`/node-schemas?mode=${mode}`, signal);
};
