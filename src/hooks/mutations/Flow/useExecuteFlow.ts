import { useMutation } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/query-core";
import { api } from "../../../api/client";
import { toastError, toastSuccess } from "../../../lib/toast";
import { ApiError } from "../../../api/ApiClient";

export interface ExecutionResult {
  status: "success" | "error" | "partial";
  executedNodes: string[];
  results: {
    [nodeId: string]: {
      nodeId: string;
      status: "idle" | "running" | "success" | "error";
      output?: { [key: string]: any };
      error?: string;
      startedAt: string;
      durationMs: number;
    };
  };
  durationMs: number;
  startedAt: string;
  completedAt: string;
  errorMessage?: string;
}

const executeFlowRequest = (flowId: string) => {
  return api.post<ExecutionResult>(`/flows/${flowId}/execute`, {});
};

interface UseExecuteFlowOptions extends Omit<UseMutationOptions<ExecutionResult, Error, string>, 'mutationFn'> {}

export function useExecuteFlow(options?: UseExecuteFlowOptions) {
  return useMutation({
    mutationFn: (flowId: string) => executeFlowRequest(flowId),

    onSuccess: (data) => {
      options?.onSuccess?.(data, "", undefined);
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toastError(error.data?.error || error.message || "Error al ejecutar flujo");
      } else {
        toastError("Error inesperado al ejecutar flujo");
      }
      options?.onError?.(error, "", undefined);
    },
  });
}
