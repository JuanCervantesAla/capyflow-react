import { Modal, TextInput, Button, Stack, Text, Group, Divider } from "@mantine/core";
import { useState, useEffect } from "react";

interface CreateFlowModalProps {
  opened: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  loading?: boolean;
}

export function CreateFlowModal({
  opened,
  onClose,
  onCreate,
  loading,
}: CreateFlowModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!opened) setName("");
  }, [opened]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      size="sm"
      radius="lg"
      padding="lg"
    >
      <Stack gap="lg">
        {/* Header */}
        <Stack gap={6}>
          <Text fw={700} size="xl">
            Nuevo flujo
          </Text>
          <Text size="sm" c="dimmed">
            Dale un nombre claro para identificar este flujo más adelante
          </Text>
        </Stack>

        <Divider />

        {/* Input */}
        <TextInput
            placeholder="Ej. Flujo de automatización"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoFocus
            styles={{
                input: {
                borderColor: '#000',
                transition: 'all 150ms ease',
                '&:hover': {
                    borderColor: '#000',
                },
                '&:focus': {
                    borderColor: '#000',
                    boxShadow: '0 0 0 1px #000',
                },
                },
            }}
            />


        {/* Actions */}
        <Group justify="space-between" mt="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            loading={loading}
            disabled={!name.trim()}
            onClick={handleSubmit}
            className="
              !bg-black !text-white !border-2 !border-black
              h-10
              font-semibold
              transition-all duration-200 ease-out
              shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]
              hover:!-translate-y-1
              hover:!shadow-[4px_4px_0px_0px_rgba(0,0,0,0.35)]
              disabled:opacity-50
              disabled:hover:translate-y-0
            "
          >
            Crear flujo
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
