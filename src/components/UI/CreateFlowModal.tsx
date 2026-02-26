import { Modal, TextInput, Button, Stack, Text, Group } from "@mantine/core";
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
        <Stack gap={4}>
          <Text className="!text-white font-black text-lg tracking-tight uppercase">
            New Flow
          </Text>
          <Text className="!text-white/70 text-xs font-medium">
            ~/create
          </Text>
        </Stack>
      </div>

      {/* Body con padding */}
      <div className="px-6 py-6 bg-[#FFF8F0]">
        <Stack gap="lg">
          {/* Description */}
          <Text className="text-[#2d3436] text-sm font-medium">
            Give it a clear name to identify this flow later
          </Text>

          {/* Input */}
          <TextInput
            label={
              <Text className="text-[#e8a020] text-xs font-bold uppercase tracking-[2px] mb-2">
                Flow Name
              </Text>
            }
            placeholder="e.g. Automation Flow"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoFocus
            radius={0}
            styles={{
              input: {
                background: '#faf8f4',
                border: '2.5px solid #2d3436',
                color: '#2d3436',
                fontWeight: 600,
                fontSize: '14px',
                padding: '10px 12px',
                minHeight: '44px',
              },
            }}
            className="
              focus-within:shadow-[4px_4px_0_#e8a020]
              focus-within:-translate-x-[2px]
              focus-within:-translate-y-[2px]
              transition-all
            "
          />

          {/* Actions */}
          <Group justify="flex-end" mt="xs" gap="sm">
            <Button
              onClick={onClose}
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
              Cancel
            </Button>

            <Button
              loading={loading}
              disabled={!name.trim()}
              onClick={handleSubmit}
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
              Create Flow
            </Button>
          </Group>
        </Stack>
      </div>
    </Modal>
  );
}
