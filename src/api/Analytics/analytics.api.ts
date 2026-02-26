import { api } from '../client';

export interface FlowAnalytics {
  id: string;
  flowId: string;
  creationMethod: 'manual' | 'ai';
  creationTimeSeconds: number;
  aiPromptsUsed: number;
  aiRepairsUsed: number;
  complexityScore: number;
  nodeCount: number;
  edgeCount: number;
  maxDepth: number;
  categoriesUsed: string;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTimeMs: number;
  totalExecutions: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowCreationSession {
  id: string;
  flowId: string;
  userId: string;
  creationMethod: 'manual' | 'ai';
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  nodeAdditions: number;
  nodeDeletions: number;
  edgeAdditions: number;
  edgeDeletions: number;
  saveCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIInteraction {
  id: string;
  flowId: string;
  userId: string;
  sessionId: string;
  interactionType: 'generate' | 'repair';
  prompt: string;
  responseSuccess: boolean;
  nodesGenerated: number;
  edgesGenerated: number;
  tokensUsed: number;
  processingTimeMs: number;
  errorMessage: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalFlows: number;
  aiGeneratedFlows: number;
  manualFlows: number;
  avgCreationTimeAI: number;
  avgCreationTimeManual: number;
  avgComplexityAI: number;
  avgComplexityManual: number;
  totalAIInteractions: number;
  successfulAIInteractions: number;
  timeSavedPercentage: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
}

// Get analytics summary for the authenticated user
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  return api.get<AnalyticsSummary>('/analytics/summary');
};

// Get analytics for a specific flow
export const getFlowAnalytics = async (flowId: string): Promise<FlowAnalytics> => {
  return api.get<FlowAnalytics>(`/analytics/flows/${flowId}`);
};

// Get creation sessions for a flow
export const getFlowSessions = async (flowId: string): Promise<WorkflowCreationSession[]> => {
  return api.get<WorkflowCreationSession[]>(`/analytics/flows/${flowId}/sessions`);
};

// Get AI interactions for a flow
export const getFlowAIInteractions = async (flowId: string): Promise<AIInteraction[]> => {
  return api.get<AIInteraction[]>(`/analytics/flows/${flowId}/ai-interactions`);
};

// Start a creation session
export const startCreationSession = async (
  flowId: string,
  creationMethod: 'manual' | 'ai'
): Promise<WorkflowCreationSession> => {
  return api.post<WorkflowCreationSession>(`/analytics/flows/${flowId}/sessions/start`, {
    creationMethod,
  });
};

// End a creation session
export const endCreationSession = async (sessionId: string): Promise<void> => {
  await api.post(`/analytics/sessions/${sessionId}/end`);
};

// Update session activity (node/edge changes)
export const updateSessionActivity = async (
  sessionId: string,
  activity: {
    nodeAdded?: number;
    nodeDeleted?: number;
    edgeAdded?: number;
    edgeDeleted?: number;
  }
): Promise<void> => {
  await api.post(`/analytics/sessions/${sessionId}/activity`, activity);
};

// Increment save count for a session
export const incrementSessionSave = async (sessionId: string): Promise<void> => {
  await api.post(`/analytics/sessions/${sessionId}/save`);
};

// Log an AI interaction
export const logAIInteraction = async (
  flowId: string,
  interaction: {
    sessionId?: string;
    interactionType: 'generate' | 'repair';
    prompt: string;
    success: boolean;
    nodesGenerated: number;
    edgesGenerated: number;
    processingTimeMs: number;
    errorMessage?: string;
  }
): Promise<void> => {
  await api.post(`/analytics/flows/${flowId}/ai-interaction`, interaction);
};

// Calculate complexity score for a flow
export const calculateComplexity = async (flowId: string): Promise<{ complexityScore: number }> => {
  return api.post<{ complexityScore: number }>(`/analytics/flows/${flowId}/complexity`);
};

// Update execution stats after flow execution
export const updateExecutionStats = async (
  flowId: string,
  stats: { success: boolean; executionTimeMs: number }
): Promise<void> => {
  await api.post(`/analytics/flows/${flowId}/execution`, stats);
};

// Update creation time from sessions
export const updateCreationTime = async (flowId: string): Promise<void> => {
  await api.post(`/analytics/flows/${flowId}/update-time`);
};
