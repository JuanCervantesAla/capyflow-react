import { useQuery } from "@tanstack/react-query";
import { fetchFlow } from "../api/Flow/flows.api";
import { queryKeys } from "../lib/queryKeys";
import { toastError } from "../lib/toast";
import { ApiError } from "../api/ApiClient";

export function useFlow(flowId: string | null) {
  return useQuery({
    queryKey: flowId ? queryKeys.flow(flowId) : ["flow", "null"],
    queryFn: ({ signal }) => fetchFlow(flowId!, signal),
    enabled: !!flowId,

    onError: (error) => {
      if (error instanceof ApiError) {
        toastError(error.data?.error || "Failed to load single flow");
      } else {
        toastError("Unexpected error loading single flow");
      }
    },
  });
}
