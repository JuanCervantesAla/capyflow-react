import { useQuery } from "@tanstack/react-query";
import { fetchFlow } from "../api/Flow/flows.api";
import { queryKeys } from "../lib/queryKeys";

export function useFlow(flowId: string | null) {
  return useQuery({
    queryKey: flowId ? queryKeys.flow(flowId) : ["flow", "null"],
    queryFn: ({ signal }: { signal?: AbortSignal }) => fetchFlow(flowId!, signal),
    enabled: !!flowId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  } as any);
}

