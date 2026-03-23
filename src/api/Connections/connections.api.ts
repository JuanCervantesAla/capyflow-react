import { api } from '../client';

export interface ConnectionResponse {
  id: string;
  userId: string;
  name: string;
  provider: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  hasSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchConnections(
  provider?: string,
  signal?: AbortSignal
): Promise<ConnectionResponse[]> {
  const connections = await api.get<ConnectionResponse[]>('/connections', signal);

  if (!provider) {
    return connections;
  }

  const normalized = provider.trim().toLowerCase();
  return connections.filter((connection) =>
    (connection.provider || '').trim().toLowerCase() === normalized
  );
}
