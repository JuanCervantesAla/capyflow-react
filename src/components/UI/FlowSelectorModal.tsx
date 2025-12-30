import { Modal, Select, Button, Stack, Text, Divider } from "@mantine/core";
import { useFlows } from "../../hooks/useFlows";
import { useEffect, useState } from "react";

interface FlowSelectorModalProps {
  opened: boolean;
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: () => void;
}

export function FlowSelectorModal({
  opened,
  onSelectFlow,
  onCreateFlow,
}: FlowSelectorModalProps) {
  const { fetchFlowsList, flows } = useFlows();
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      fetchFlowsList();
    }
  }, [opened]);

  console.log("Flows:", flows);

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      centered
      withCloseButton={false}
      title="Gestión de flujos"
      trapFocus={false}
      lockScroll={false}
    >
      <Stack>
        <Text size="sm">Seleccionar flujo existente</Text>

        <Select
          data={flows.map((f) => ({ value: f.id, label: f.name }))}
          value={selectedFlowId}
          onChange={setSelectedFlowId}
          placeholder="Selecciona un flujo"
          comboboxProps={{
            withinPortal: false, // Renderiza dentro del Modal, no en un portal separado
          }}
        />

        <Button
          disabled={!selectedFlowId}
          onClick={() => selectedFlowId && onSelectFlow(selectedFlowId)}
        >
          Abrir flujo
        </Button>

        <Divider label="o" />

        <Button variant="light" onClick={onCreateFlow}>
          Crear nuevo flujo
        </Button>
      </Stack>
    </Modal>
  );
}
