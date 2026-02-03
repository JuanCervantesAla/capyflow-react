export const queryKeys = {
  user: ['user'] as const,
  flows: ['flows'] as const,
  flow: (id: string) => ['flow', id] as const,
  executions: {
    all: () => ['executions'] as const,
    byFlow: (flowId: string) => ['executions', 'flow', flowId] as const,
    detail: (executionId: string) => ['executions', 'detail', executionId] as const,
  },
};