import { useQuery } from "@tanstack/react-query";
import { fetchFlows } from "../api/Flow/flows.api";
import { queryKeys } from "../lib/queryKeys";

export function useFlows() {
  return useQuery({
    queryKey: queryKeys.flows,
    queryFn: ({ signal }: { signal?: AbortSignal }) => fetchFlows({ signal }),
  } as any);
}
