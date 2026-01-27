import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes
      retry: (count, error: any) =>
        error?.status === 401 ? false : count < 2,
      refetchOnWindowFocus: true, // Refetch when user returns to window
      refetchOnReconnect: true,   // Refetch when connection is restored
    },
    mutations: {
      retry: false,
    },
  },
});
