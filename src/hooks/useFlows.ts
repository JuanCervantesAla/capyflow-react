import { useQuery } from "@tanstack/react-query";
import { fetchFlows } from "../api/Flow/flows.api";
import { queryKeys } from "../lib/queryKeys";
import { toastError } from "../lib/toast";
import { ApiError } from "../api/ApiClient";

export function useFlows() {
  return useQuery({
    queryKey: queryKeys.flows,
    queryFn: ({ signal }) => fetchFlows({ signal }),

    onError: (error) => {
      if (error instanceof ApiError) {
        toastError(error.data?.error || "Failed to load flows");
      } else {
        toastError("Unexpected error loading flows");
      }
    },
  });
}
