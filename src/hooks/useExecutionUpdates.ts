import { useContext, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { FlowContext } from '../components/Flow/context/FlowContext';
import type { WebSocketExecutionUpdate } from '../components/Flow/types/Execution';

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

          console.log(`Nodo ${nodeId}: ${status}`);
        }
        break;

      case 'complete':
        setExecutionData(prev => ({
          ...prev,
          status: 'success',
          completedAt: new Date().toISOString(),
          durationMs: prev.startedAt 
            ? new Date().getTime() - new Date(prev.startedAt).getTime()
            : 0,
        }));
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
        console.error('Error en ejecución:', update.message);
        break;
    }
  }, [flowId, resetExecutionStates, updateNodeExecutionStatus]);

  const { isConnected } = useWebSocket({
    onUpdate: handleUpdate,
    onConnect: () => {
      console.log('WebSocket conectado para actualizaciones');
    },
    onDisconnect: () => {
      console.log('WebSocket desconectado');
    },
  });

  return { isConnected, executionData };
}