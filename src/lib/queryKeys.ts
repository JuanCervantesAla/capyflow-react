export const queryKeys = {
  user: ['user'] as const,
  flows: ['flows'] as const,
  flow: (id: string) => ['flow', id] as const,
};