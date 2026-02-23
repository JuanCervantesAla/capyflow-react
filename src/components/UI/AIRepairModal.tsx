import { useState } from 'react';
import {
  Modal,
  Stack,
  Button,
  Text,
  Group,
  Alert,
  Textarea,
  Loader,
  List,
} from '@mantine/core';
import {
  IconWand,
  IconAlertCircle,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useTheme } from '../../theme/ThemeContext';

interface AIRepairModalProps {
  opened: boolean;
  onClose: () => void;
  onRepair: (issues?: string) => Promise<void>;
  loading?: boolean;
}

export function AIRepairModal({
  opened,
  onClose,
  onRepair,
  loading = false,
}: AIRepairModalProps) {
  const { theme } = useTheme();
  const [issues, setIssues] = useState('');

  const handleRepair = async () => {
    await onRepair(issues.trim() || undefined);
    handleClose();
  };

  const handleClose = () => {
    setIssues('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconWand size={24} style={{ color: theme.colors.accent.primary }} />
          <Text size="lg" fw={600}>
            Reparar Flujo con IA
          </Text>
        </Group>
      }
      size="lg"
      styles={{
        content: {
          background: theme.colors.background.primary,
        },
        header: {
          background: theme.colors.background.primary,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        },
        body: {
          padding: theme.spacing.lg,
        },
      }}
    >
      <Stack gap="md">
        {/* Información */}
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="¿Qué hace la reparación automática?"
          color="blue"
          variant="light"
        >
          <Text size="sm" mb="xs">
            La IA analizará tu flujo y corregirá automáticamente:
          </Text>
          <List size="sm" spacing="xs">
            <List.Item>Nodos con IDs duplicados</List.Item>
            <List.Item>Conexiones a nodos que no existen</List.Item>
            <List.Item>Falta de nodo trigger inicial</List.Item>
            <List.Item>Tipos de nodos inválidos</List.Item>
            <List.Item>Posiciones de nodos superpuestas</List.Item>
            <List.Item>Parámetros inválidos o faltantes</List.Item>
            <List.Item>Nodos o conexiones huérfanas</List.Item>
          </List>
        </Alert>

        <Textarea
          label="¿Algún problema específico? (Opcional)"
          placeholder="Ej: Los nodos están superpuestos, falta una conexión entre el webhook y el log..."
          value={issues}
          onChange={(e) => setIssues(e.currentTarget.value)}
          minRows={3}
          maxRows={6}
          styles={{
            input: {
              background: theme.colors.background.tertiary,
              borderColor: theme.colors.border.primary,
              color: theme.colors.text.primary,
            },
          }}
        />

        <Alert
          icon={<IconAlertCircle size={16} />}
          color="yellow"
          variant="light"
        >
          <Text size="xs">
            <strong>Nota:</strong> La reparación sobrescribirá tu flujo actual. Se
            recomienda revisar los cambios antes de guardar.
          </Text>
        </Alert>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            leftSection={
              loading ? <Loader size={16} /> : <IconWand size={16} />
            }
            onClick={handleRepair}
            disabled={loading}
            style={{
              background: theme.colors.accent.primary,
            }}
          >
            {loading ? 'Reparando...' : 'Reparar Flujo'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
