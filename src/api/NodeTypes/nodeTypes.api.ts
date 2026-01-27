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

export const fetchAllNodeTypes = async (signal?: AbortSignal) => {
  return api.get<NodeType[]>('/node-types', signal);
};

export const fetchNodeTypesByCategory = async (category: string, signal?: AbortSignal) => {
  return api.get<NodeType[]>(`/node-types/category?category=${category}`, signal);
};
