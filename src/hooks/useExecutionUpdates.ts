import { useContext, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { FlowContext } from '../components/Flow/context/FlowContext';
import type { WebSocketExecutionUpdate } from '../components/Flow/types/Execution';
import { showToast } from '../lib/toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';

interface ExecutionData {
  executionId?: string;
  status: 'idle' | 'running' | 'success' | 'error';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  executedNodes: string[];
  results: Record<string, any>;
  errorMessage?: string;
}

export function useExecutionUpdates(flowId?: string) {
  const { updateNodeExecutionStatus, resetExecutionStates } = useContext(FlowContext);
  const queryClient = useQueryClient();
  const [executionData, setExecutionData] = useState<ExecutionData>({
    status: 'idle',
    executedNodes: [],
    results: {},
  });

  const handleUpdate = useCallback((update: WebSocketExecutionUpdate) => {
    if (flowId && update.flowId !== flowId) return;

    switch (update.type) {
      case 'start':
        resetExecutionStates();
        setExecutionData({
          executionId: update.executionId,
          status: 'running',
          startedAt: new Date().toISOString(),
          executedNodes: [],
          results: {},
        });
        break;

      case 'node':
        if (update.nodeId) {
          const nodeId = update.nodeId;
          const status = update.status === 'running' ? 'running' :
                        update.status === 'success' ? 'success' :
                        update.status === 'error' ? 'error' : 'idle';
          
          updateNodeExecutionStatus(nodeId, status, {
            error: status === 'error' ? update.message : undefined,
            output: update.data,
          });

          setExecutionData(prev => {
            const newExecutedNodes = [...prev.executedNodes];
            if (!newExecutedNodes.includes(nodeId)) {
              newExecutedNodes.push(nodeId);
            }
            
            return {
              ...prev,
              executedNodes: newExecutedNodes,
              results: {
                ...prev.results,
                [nodeId]: {
                  nodeId: nodeId,
                  status: status,
                  output: update.data,
                  error: status === 'error' ? update.message : undefined,
                  startedAt: new Date().toISOString(),
                  durationMs: 0,
                },
              },
            };
          });

          console.log(`Node ${nodeId}: ${status}`);
        }
        break;

      case 'complete':
        // Invalidate queries when execution completes
        if (update.flowId) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.executions.byFlow(update.flowId),
          });
        }
        
        setExecutionData(prev => {
          const durationMs = prev.startedAt 
            ? new Date().getTime() - new Date(prev.startedAt).getTime()
            : 0;
          
          // Use unique ID based on flowId and executionId to prevent duplicates
          const toastId = `execution-complete-${update.flowId || 'unknown'}-${update.executionId || Date.now()}`;
          showToast(
            'Execution completed', 
            `Flow executed successfully in ${durationMs}ms`,
            'success',
            toastId
          );
          
          return {
            ...prev,
            status: 'success',
            completedAt: new Date().toISOString(),
            durationMs,
          };
        });
        break;

      case 'error':
        setExecutionData(prev => ({
          ...prev,
          status: 'error',
          completedAt: new Date().toISOString(),
          errorMessage: update.message,
          durationMs: prev.startedAt 
            ? new Date().getTime() - new Date(prev.startedAt).getTime()
            : 0,
        }));
        console.error('Execution error:', update.message);
        const errorToastId = `execution-error-${update.flowId || 'unknown'}-${update.executionId || Date.now()}`;
        showToast('Execution error', update.message || 'Unknown error', 'error', errorToastId);
        break;

      case 'execution-error' as any:
        setExecutionData(prev => ({
          ...prev,
          status: 'error',
          completedAt: new Date().toISOString(),
          errorMessage: update.message,
        }));
        console.error('Flow validation error:', update.message);
        const details = (update.data as any)?.details;
        const validationErrorToastId = `execution-validation-error-${update.flowId || 'unknown'}-${Date.now()}`;
        showToast(
          'Flow validation error', 
          `${update.message}\n\n${details || ''}`,
          'error',
          validationErrorToastId
        );
        break;
    }
  }, [flowId, resetExecutionStates, updateNodeExecutionStatus]);

  const { isConnected } = useWebSocket({
    onUpdate: handleUpdate,
    onConnect: () => {
      console.log('WebSocket connected for updates');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
  });

  return { isConnected, executionData };
}