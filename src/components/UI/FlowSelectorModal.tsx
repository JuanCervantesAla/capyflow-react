import {
  Modal,
  Select,
  Button,
  Stack,
  Text,
  Divider,
  Group,
  CloseButton,
} from "@mantine/core";
import { useFlows } from "../../hooks/useFlows";
import { useState, useMemo } from "react";

interface FlowSelectorModalProps {
  opened: boolean;
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: () => void;
  onClose: () => void;
}

export function FlowSelectorModal({
  opened,
  onSelectFlow,
  onCreateFlow,
  onClose,
}: FlowSelectorModalProps) {
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const {
    data: flows = [],
    isLoading,
    isError,
  } = useFlows(opened);

  const flowOptions = useMemo(
    () => flows.map((f) => ({ value: f.id, label: f.name })),
    [flows]
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      trapFocus={false}
      lockScroll={false}
      size="sm"
      radius="md"
    >
      <Stack gap="md">
        {/* Header alineado */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={2}>
            <Text fw={600} size="lg">
              Gestión de flujos
            </Text>
            <Text size="sm" c="dimmed">
              Abre un flujo existente o crea uno nuevo
            </Text>
          </Stack>

          <CloseButton
            onClick={onClose}
            aria-label="Cerrar"
            size="sm"
            className="hover:!bg-transparent"
          />
        </Group>

        {/* Selector */}
        <Stack gap={6}>
          <Text size="xs" fw={500} c="dimmed">
            Flujo existente
          </Text>

          <Select
            data={flowOptions}
            value={selectedFlowId}
            onChange={setSelectedFlowId}
            placeholder={
              isLoading ? "Cargando flujos..." : "Selecciona un flujo"
            }
            disabled={isLoading || isError}
            comboboxProps={{ withinPortal: false }}
            radius="sm"
          />
        </Stack>

        {/* Acción principal */}
        <Button
          fullWidth
          disabled={!selectedFlowId}
          onClick={() => selectedFlowId && onSelectFlow(selectedFlowId)}
          className="
            !bg-black !text-white !border-2 !border-black
            font-semibold
            transition-all duration-200 ease-out
            shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]
            hover:!-translate-y-1
            hover:!shadow-[4px_4px_0px_0px_rgba(0,0,0,0.35)]
            disabled:opacity-50
            disabled:hover:translate-y-0
          "
        >
          Abrir flujo
        </Button>

        <Divider label="o" labelPosition="center" />

        {/* Acción secundaria */}
        <Button
          variant="subtle"
          fullWidth
          onClick={onCreateFlow}
          className="font-medium"
        >
          Crear nuevo flujo
        </Button>
      </Stack>
    </Modal>
  );
}
