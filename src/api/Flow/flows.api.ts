import type { Flow } from "../../components/Flow/types/Flow";
import type { Edge as ReactFlowEdge } from "@xyflow/react";
import type { FlowNode } from "../../components/Flow/types/NodeTypes";
import { api } from "../client";
import { transformEdgeForBackend, transformEdgeFromBackend, transformNodeForBackend, transformNodeFromBackend } from "../../components/Flow/types/NodeTypes";

export const fetchFlows = async ({ signal }: { signal?: AbortSignal } = {}) => {
  const flows = await api.get<Flow[]>('/flows', signal);

  return flows.map(flow => ({
    ...flow,
    nodes: flow.nodes?.map(transformNodeFromBackend) || [],
    edges: flow.edges?.map(transformEdgeFromBackend) || [],
  }));
};

export const fetchFlow = async (id: string, signal?: AbortSignal) => {
  const flow = await api.get<Flow>(`/flows/${id}`, signal);
  
  return {
    ...flow,
    nodes: flow.nodes?.map(transformNodeFromBackend) || [],
    edges: flow.edges?.map(transformEdgeFromBackend) || [],
  };
};

export const createFlowRequest = (data: {
  name: string;
  description: string;
}) =>
  api.post<Flow>('/flows', data);

export interface FlowExportResponse {
  version: string;
  exportedAt: string;
  flow: Flow;
}

export interface FlowVersion {
  id: string;
  flowId: string;
  userId: string;
  versionNumber: number;
  note?: string;
  createdAt: string;
}

export interface FlowShareResponse {
  shareId: string;
  shareUrl: string;
  isActive: boolean;
  expiresAt?: string;
  lastAccessAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlowShareUpdateRequest {
  isActive?: boolean;
  expiresAt?: string;
}

export interface PublicSharedFlowResponse {
  shareId: string;
  flow: Flow;
}

export const cloneFlowRequest = (id: string, name?: string) =>
  api.post<Flow>(`/flows/${id}/clone`, name ? { name } : undefined);

export const exportFlowRequest = (id: string) =>
  api.get<FlowExportResponse>(`/flows/${id}/export`);

export const importFlowRequest = (payload: unknown) =>
  api.post<Flow>('/flows/import', payload);

export const fetchFlowVersionsRequest = (id: string) =>
  api.get<FlowVersion[]>(`/flows/${id}/versions`);

export const rollbackFlowRequest = (id: string, versionId: string) =>
  api.post<Flow>(`/flows/${id}/rollback`, { versionId });

export const createFlowShareRequest = (id: string) =>
  api.post<FlowShareResponse>(`/flows/${id}/share`);

export const updateFlowShareRequest = (id: string, payload: FlowShareUpdateRequest) =>
  api.put<FlowShareResponse>(`/flows/${id}/share`, payload);

export const regenerateFlowShareRequest = (id: string) =>
  api.post<FlowShareResponse>(`/flows/${id}/share/regenerate`);

export const fetchPublicSharedFlowRequest = async (shareId: string) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${baseUrl}/api/public/flows/${shareId}`);

  if (!response.ok) {
    let errorMessage = 'Failed to load shared flow';
    try {
      const errorJson = await response.json();
      errorMessage = errorJson?.error || errorMessage;
    } catch {
      // ignore json parsing error
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as PublicSharedFlowResponse;

  return {
    ...data,
    flow: {
      ...data.flow,
      nodes: data.flow.nodes?.map(transformNodeFromBackend) || [],
      edges: data.flow.edges?.map(transformEdgeFromBackend) || [],
    },
  };
};

export const updateFlowRequest = (id: string, data: Partial<Flow>) =>
  api.put<Flow>(`/flows/${id}`, data);

export const saveFlowDataRequest = (
  flowId: string,
  nodes: FlowNode[],
  edges: ReactFlowEdge[]
) => {
  const backendNodes = nodes.map(transformNodeForBackend);
  const backendEdges = edges.map(transformEdgeForBackend);
  
  return api.post(`/flows/${flowId}/save`, { 
    nodes: backendNodes, 
    edges: backendEdges 
  });
};