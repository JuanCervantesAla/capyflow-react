import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketExecutionUpdate } from '../components/Flow/types/Execution';

interface UseWebSocketOptions {
  onUpdate?: (update: WebSocketExecutionUpdate) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

async function getWSTicket(): Promise<string | null> {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  try {
    const response = await fetch(`${baseUrl}/ws/ticket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to get WebSocket ticket:', response.status);
      return null;
    }

    const data = await response.json();
    return data.ticket;
  } catch (error) {
    console.error('Error getting WebSocket ticket:', error);
    return null;
  }
}

export function useWebSocket(options?: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<WebSocketExecutionUpdate | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  const optionsRef = useRef(options);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connecting or connected');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, skipping WebSocket connection');
      return;
    }

    const ticket = await getWSTicket();
    if (!ticket) {
      return;
    }

    const baseWsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/ws';
    const wsUrl = `${baseWsUrl}?ticket=${encodeURIComponent(ticket)}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        optionsRef.current?.onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const update: WebSocketExecutionUpdate = JSON.parse(event.data);
          setLastUpdate(update);
          optionsRef.current?.onUpdate?.(update);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        optionsRef.current?.onError?.(error);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        optionsRef.current?.onDisconnect?.();
        wsRef.current = null;

        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.warn('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || 
          wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'User disconnected');
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  useEffect(() => {
    // Solo conectar si no hay una conexión existente
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      connect();
    }

    return () => {
      // Limpiar la conexión cuando el componente se desmonte
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío: solo ejecutar en mount/unmount

  return {
    isConnected,
    lastUpdate,
    disconnect,
    reconnect: connect,
  };
}