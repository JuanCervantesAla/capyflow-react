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
    mutationFn: ({ flowId, nodes, edges }: SaveFlowPayload) => {
      console.log("💾 Sending flow to backend:", {
        flowId,
        nodesCount: nodes.length,
        nodes: nodes.map(n => ({
          id: n.id,
          label: n.data?.label,
          category: n.data?.category,
          subtitle: n.data?.subtitle,
        })),
        edgesCount: edges.length,
      });
      return saveFlowDataRequest(flowId, nodes, edges);
    },

    onSuccess: (data, { flowId }) => {
      const message = (data as any)?.message || "Flow saved successfully";
      toastSuccess(message);

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
