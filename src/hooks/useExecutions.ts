import { useQuery } from '@tanstack/react-query';
import { fetchExecutions } from '../api/Execution/executions.api';
import { queryKeys } from '../lib/queryKeys';

export function useExecutions() {
  return useQuery({
    queryKey: queryKeys.executions.all(),
    queryFn: ({ signal }) => fetchExecutions({ signal }),
    staleTime: 30000,
  });
}