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
      withCloseButton={false}
      centered
      size="lg"
      padding={0}
      radius={0}
      styles={{
        content: {
          background: '#FFF8F0',
          border: '3px solid #2d3436',
          boxShadow: '6px 6px 0px #2d3436',
        },
        body: {
          padding: 0,
        },
      }}
    >
      {/* Header con fondo negro */}
      <div className="bg-[#0a0a08] px-6 py-4 border-b-[3px] border-[#2d3436]">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconWand size={28} className="text-[#e8a020]" />
            <Stack gap={2}>
              <Text className="!text-white font-black text-lg tracking-tight uppercase">
                Reparar con IA
              </Text>
              <Text className="!text-white/70 text-xs font-medium">
                ~/ai/repair
              </Text>
            </Stack>
          </Group>
        </Group>
      </div>

      {/* Body con padding */}
      <div className="px-6 py-6 bg-[#FFF8F0]">
      <Stack gap="md">
        {/* Información */}
        <div className="bg-[#e8f4ff] border-[2.5px] border-[#2d3436] p-4">
          <Group gap="sm" mb="xs">
            <IconInfoCircle size={18} className="text-[#2d3436]" />
            <Text className="text-[#2d3436] font-black text-sm uppercase tracking-wide">
              ¿Qué hace la reparación automática?
            </Text>
          </Group>
          <Text size="sm" mb="xs" className="text-[#2d3436] font-medium">
            La IA analizará tu flujo y corregirá automáticamente:
          </Text>
          <List size="sm" spacing="xs" className="text-[#2d3436]">
            <List.Item className="font-medium">Nodos con IDs duplicados</List.Item>
            <List.Item className="font-medium">Conexiones a nodos que no existen</List.Item>
            <List.Item className="font-medium">Falta de nodo trigger inicial</List.Item>
            <List.Item className="font-medium">Tipos de nodos inválidos</List.Item>
            <List.Item className="font-medium">Posiciones de nodos superpuestas</List.Item>
            <List.Item className="font-medium">Parámetros inválidos o faltantes</List.Item>
            <List.Item className="font-medium">Nodos o conexiones huérfanas</List.Item>
          </List>
        </div>

        <Textarea
          label={
            <Text className="text-[#e8a020] text-xs font-bold uppercase tracking-[2px] mb-2">
              ¿Algún problema específico? (Opcional)
            </Text>
          }
          placeholder="Ej: Los nodos están superpuestos, falta una conexión entre el webhook y el log..."
          value={issues}
          onChange={(e) => setIssues(e.currentTarget.value)}
          minRows={3}
          maxRows={6}
          radius={0}
          styles={{
            input: {
              background: '#faf8f4',
              border: '2.5px solid #2d3436',
              color: '#2d3436',
              fontWeight: 600,
              fontSize: '14px',
              padding: '12px',
              fontFamily: 'inherit',
            },
          }}
          className="
            focus-within:shadow-[4px_4px_0_#e8a020]
            focus-within:-translate-x-[2px]
            focus-within:-translate-y-[2px]
            transition-all
          "
        />

        <div className="bg-[#fff8e1] border-[2.5px] border-[#2d3436] p-4">
          <Group gap="sm" mb="xs">
            <IconAlertCircle size={18} className="text-[#2d3436]" />
          </Group>
          <Text size="xs" className="text-[#2d3436] font-medium">
            <strong>Nota:</strong> La reparación sobrescribirá tu flujo actual. Se
            recomienda revisar los cambios antes de guardar.
          </Text>
        </div>

        <Group justify="flex-end" mt="md">
          <Button 
            onClick={handleClose} 
            disabled={loading}
            className="
              !bg-[#FFF8F0] !text-[#2d3436] !border-[2.5px] !border-[#2d3436]
              !font-bold !text-sm uppercase tracking-wide
              transition-all duration-200 ease-out
              !shadow-[2px_2px_0px_#2d3436]
              hover:!-translate-x-[1px] hover:!-translate-y-[1px]
              hover:!shadow-[3px_3px_0px_#2d3436]
              !rounded-none
              !h-[40px]
            "
          >
            Cancelar
          </Button>
          <Button
            leftSection={
              loading ? <Loader size={16} /> : <IconWand size={16} />
            }
            onClick={handleRepair}
            disabled={loading}
            className="
              !bg-[#e8a020] !text-[#0a0a08] !border-[3px] !border-[#2d3436]
              !font-black !text-sm uppercase tracking-wide
              transition-all duration-200 ease-out
              !shadow-[3px_3px_0px_#2d3436]
              hover:!-translate-x-[2px] hover:!-translate-y-[2px]
              hover:!shadow-[5px_5px_0px_#2d3436]
              disabled:!opacity-40
              disabled:!hover:translate-x-0 disabled:!hover:translate-y-0
              !rounded-none
              !h-[44px]
            "
          >
            {loading ? 'Reparando...' : 'Reparar Flujo'}
          </Button>
        </Group>
      </Stack>
      </div>
    </Modal>
  );
}
