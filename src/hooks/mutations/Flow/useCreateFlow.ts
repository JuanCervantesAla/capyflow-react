import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFlowRequest } from '../../../api/Flow/flows.api';
import { queryKeys } from '../../../lib/queryKeys';

export function useCreateFlow() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createFlowRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.flows });
    },
  });
}
