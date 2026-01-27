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
    staleTime: 0, // Always refetch when query becomes stale
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes

    onError: (error) => {
      if (error instanceof ApiError) {
        toastError(error.data?.error || "Failed to load single flow");
      } else {
        toastError("Unexpected error loading single flow");
      }
    },
  });
}
