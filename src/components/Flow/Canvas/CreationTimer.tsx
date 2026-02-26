import { Badge, Group, Text } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

interface CreationTimerProps {
  formatTime: () => string;
  isActive: boolean;
  creationMethod: 'manual' | 'ai';
}

export const CreationTimer = ({ formatTime, isActive, creationMethod }: CreationTimerProps) => {
  if (!isActive) return null;

  return (
    <Group
      gap="xs"
      style={{
        background: 'white',
        border: '2px solid #2d3436',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(45, 52, 54, 0.1)',
      }}
    >
      <IconClock size={18} stroke={2} />
      <Text size="sm" fw={600} style={{ fontFamily: 'monospace' }}>
        {formatTime()}
      </Text>
      <Badge
        color={creationMethod === 'ai' ? 'blue' : 'gray'}
        variant="filled"
        size="sm"
      >
        {creationMethod.toUpperCase()}
      </Badge>
    </Group>
  );
};
