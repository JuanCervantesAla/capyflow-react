import { useState, useEffect } from 'react';
import { ApiClient } from '../api/ApiClient';
import type { Flow } from '../components/Flow/types/Flow';

const api = new ApiClient(
  import.meta.env.VITE_API_URL,
  () => localStorage.getItem('token')
);

export function useFlows() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlows = async () => {
    setLoading(true);
    try {
      const data = await api.get<Flow[]>('/flows');
      setFlows(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createFlow = async (name: string, description: string): Promise<Flow> => {
    return await api.post<Flow>('/flows', {
      name,
      description,
    });
  };

  const saveFlowData = async (flowId: string, nodes: any[], edges: any[]) => {
    return await api.post(`/flows/${flowId}/save`, {
      nodes,
      edges,
    });
  };

  const fetchFlowsList = async () => {
  setLoading(true);
  try {
    const data = await api.get<Flow[]>('/flows');
    setFlows(data);
    setError(null);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const updateFlow = async (id: string, data: Partial<Flow>) => {
    return await api.put<Flow>(`/flows/${id}`, data);
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  return {
    flows,
    loading,
    error,
    fetchFlows,
    fetchFlowsList,
    createFlow,
    saveFlowData,
    updateFlow,
  };
}