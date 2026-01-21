import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveFlowDataRequest } from "../../../api/Flow/flows.api";
import { queryKeys } from "../../../lib/queryKeys";

interface SaveFlowPayload {
  flowId: string;
  nodes: any[];
  edges: any[];
}

export function useSaveFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flowId, nodes, edges }: SaveFlowPayload) =>
      saveFlowDataRequest(flowId, nodes, edges),

    onSuccess: (_, { flowId }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.flows, flowId],
      });
    },
  });
}
