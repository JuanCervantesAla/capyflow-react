import { api } from '../client';
import type { Execution, ExecutionListItem, ExecutionDetail } from '../../components/Flow/types/Execution';

export const fetchExecutions = async ({ signal }: { signal?: AbortSignal } = {}) => {
  return api.get<ExecutionListItem[]>('/executions', signal);
};

export const fetchFlowExecutions = async (
  flowId: string,
  { signal }: { signal?: AbortSignal } = {}
) => {
  return api.get<Execution[]>(`/flows/${flowId}/executions`, signal);
};

export const fetchExecution = async (
  executionId: string,
  { signal }: { signal?: AbortSignal } = {}
) => {
  const execution = await api.get<Execution>(`/executions/${executionId}`, signal);
  
  const detail: ExecutionDetail = {
    ...execution,
    parsedResults: execution.results ? JSON.parse(execution.results) : undefined,
    parsedExecutedNodes: execution.executedNodes ? JSON.parse(execution.executedNodes) : undefined,
  };
  
  return detail;
};