import { useQuery } from '@tanstack/react-query';
import { fetchFlowExecutions } from '../api/Execution/executions.api';
import { queryKeys } from '../lib/queryKeys';

export function useFlowExecutions(flowId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.executions.byFlow(flowId!),
    queryFn: ({ signal }) => fetchFlowExecutions(flowId!, { signal }),
    enabled: !!flowId,
    staleTime: 10000,
  });
}