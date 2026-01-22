import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFlowRequest } from "../../../api/Flow/flows.api";
import { queryKeys } from "../../../lib/queryKeys";
import { toastSuccess, toastError } from "../../../lib/toast";
import { ApiError } from "../../../api/ApiClient";

export function useCreateFlow() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createFlowRequest,

    onSuccess: () => {
      toastSuccess("Flow created");
      qc.invalidateQueries({ queryKey: queryKeys.flows });
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toastError(error.data?.error || "Failed to create new flow");
      } else {
        toastError("Unexpected error creating flow");
      }
    },
  });
}
