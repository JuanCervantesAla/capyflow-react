import { useQuery } from '@tanstack/react-query';
import { fetchExecution } from '../api/Execution/executions.api';
import { queryKeys } from '../lib/queryKeys';

export function useExecution(executionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.executions.detail(executionId!),
    queryFn: ({ signal }) => fetchExecution(executionId!, { signal }),
    enabled: !!executionId,
  });
}