import { Box, Text } from '@mantine/core';
import { IconCheck, IconX, IconLoader } from '@tabler/icons-react';

interface NodeExecutionStatusProps {
  status: 'idle' | 'running' | 'success' | 'error';
  error?: string;
  durationMs?: number;
}

export function NodeExecutionStatus({ status, error, durationMs }: NodeExecutionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          icon: <IconLoader size={12} style={{ animation: 'spin 1s linear infinite' }} />,
          color: '#3b82f6',
          text: 'Ejecutando...',
        };
      case 'success':
        return {
          icon: <IconCheck size={12} />,
          color: '#10b981',
          text: durationMs !== undefined ? `${durationMs}ms` : 'Éxito',
        };
      case 'error':
        return {
          icon: <IconX size={12} />,
          color: '#ef4444',
          text: error || 'Error',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 6px',
        borderRadius: 4,
        background: `${config.color}20`,
        border: `1px solid ${config.color}`,
      }}
    >
      <div style={{ color: config.color, display: 'flex', alignItems: 'center' }}>
        {config.icon}
      </div>
      <Text size="10px" fw={500} c={config.color}>
        {config.text}
      </Text>
    </Box>
  );
}