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