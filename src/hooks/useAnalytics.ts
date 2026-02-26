import { useQuery } from '@tanstack/react-query';
import {
  getAnalyticsSummary,
  getFlowAnalytics,
  getFlowSessions,
  getFlowAIInteractions,
  type AnalyticsSummary,
  type FlowAnalytics,
  type WorkflowCreationSession,
  type AIInteraction,
} from '../api/Analytics/analytics.api';

// Hook to get analytics summary
export const useAnalyticsSummary = () => {
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: getAnalyticsSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get flow analytics
export const useFlowAnalytics = (flowId: string | undefined) => {
  return useQuery<FlowAnalytics>({
    queryKey: ['analytics', 'flow', flowId],
    queryFn: () => getFlowAnalytics(flowId!),
    enabled: !!flowId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get flow creation sessions
export const useFlowSessions = (flowId: string | undefined) => {
  return useQuery<WorkflowCreationSession[]>({
    queryKey: ['analytics', 'sessions', flowId],
    queryFn: () => getFlowSessions(flowId!),
    enabled: !!flowId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to get flow AI interactions
export const useFlowAIInteractions = (flowId: string | undefined) => {
  return useQuery<AIInteraction[]>({
    queryKey: ['analytics', 'ai-interactions', flowId],
    queryFn: () => getFlowAIInteractions(flowId!),
    enabled: !!flowId,
    staleTime: 2 * 60 * 1000,
  });
};
