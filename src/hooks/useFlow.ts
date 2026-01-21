import { useQuery } from '@tanstack/react-query';
import { fetchFlow } from '../api/Flow/flows.api';
import { queryKeys } from '../lib/queryKeys';

export function useFlow(flowId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.flows, flowId],
    queryFn: ({ signal }) => fetchFlow(flowId!, signal),
    enabled: !!flowId,
  });
}