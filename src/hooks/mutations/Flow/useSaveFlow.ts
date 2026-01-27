import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveFlowDataRequest } from "../../../api/Flow/flows.api";
import { queryKeys } from "../../../lib/queryKeys";
import { toastSuccess, toastError } from "../../../lib/toast";
import { ApiError } from "../../../api/ApiClient";

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

    onSuccess: (data, { flowId }) => {
      toastSuccess(data.message || "Flow saved successfully");

      // Refetch flows list to ensure fresh data
      queryClient.refetchQueries({
        queryKey: queryKeys.flows,
      });

      // Refetch specific flow query immediately
      queryClient.refetchQueries({
        queryKey: queryKeys.flow(flowId),
      });
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toastError(error.data?.error || error.message);
      } else {
        toastError("Failed to save flow");
      }
    },
  });
}
