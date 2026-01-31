export interface Execution {
  id: string;
  flowId: string;
  userId: string;
  status: 'running' | 'success' | 'partial' | 'error' | 'canceled';
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  triggerType: string;
  results: string;
  executedNodes: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionListItem {
  id: string;
  flowId: string;
  flowName?: string;
  status: 'running' | 'success' | 'partial' | 'error' | 'canceled';
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  triggerType: string;
}

export interface ExecutionDetail extends Execution {
  parsedResults?: { [key: string]: any };
  parsedExecutedNodes?: string[];
}

export interface WebSocketExecutionUpdate {
  type: 'start' | 'node' | 'complete' | 'error';
  executionId: string;
  flowId: string;
  nodeId?: string;
  status: string;
  message?: string;
  data?: any;
  timestamp: string;
}