import { useState } from 'react';
import {
  Modal,
  Stack,
  Textarea,
  Button,
  Text,
  Group,
  Loader,
} from '@mantine/core';
import {
  IconSparkles,
} from '@tabler/icons-react';

interface AIGenerateModalProps {
  opened: boolean;
  onClose: () => void;
  onGenerate: (description: string) => Promise<void>;
  loading?: boolean;
}

export function AIGenerateModal({
  opened,
  onClose,
  onGenerate,
  loading = false,
}: AIGenerateModalProps) {
  const [description, setDescription] = useState('');

  const handleGenerate = async () => {
    if (!description.trim()) return;
    await onGenerate(description);
    handleClose();
  };

  const handleClose = () => {
    setDescription('');
    onClose();
  };

  const examples = [
    'Create a flow that receives data via webhook and logs it',
    'Flow that calls a weather API and displays the temperature',
    'Workflow that validates if a number is greater than 100 and logs the result',
    'Process that iterates over a list of users and sends a welcome message',
  ];

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
            <IconSparkles size={28} className="text-[#e8a020]" />
            <Stack gap={2}>
              <Text className="!text-white font-black text-lg tracking-tight uppercase">
                Generate with AI
              </Text>
              <Text className="!text-white/70 text-xs font-medium">
                ~/ai/generate
              </Text>
            </Stack>
          </Group>
        </Group>
      </div>

      {/* Body con padding */}
      <div className="px-6 py-6 bg-[#FFF8F0]">
      <Stack gap="md">
        <div className="bg-[#e8f4ff] border-[2.5px] border-[#2d3436] p-4">
          <Group gap="sm" mb="xs">
            <IconSparkles size={18} className="text-[#2d3436]" />
            <Text className="text-[#2d3436] font-black text-sm uppercase tracking-wide">
              Describe your flow in natural language
            </Text>
          </Group>
          <Text size="sm" className="text-[#2d3436] font-medium">
            Describe what task or process you want to automate and AI will generate a
            complete flow with the necessary configured nodes.
          </Text>
        </div>

        <Textarea
          label={
            <Text className="text-[#e8a020] text-xs font-bold uppercase tracking-[2px] mb-2">
              What flow do you want to create?
            </Text>
          }
          placeholder="Example: I want a flow that receives data via webhook, validates if the status is 'success' and logs the result..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={5}
          maxRows={10}
          required
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

        <Stack gap="xs">
          <Text className="text-[#2d3436] text-sm font-bold uppercase tracking-wide">
            Example descriptions:
          </Text>
          <div className="space-y-1">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setDescription(example)}
              className="
                w-full text-left px-3 py-2 text-sm
                bg-[#faf8f4] border-[2px] border-[#2d3436]/30
                text-[#2d3436] font-medium
                hover:border-[#e8a020] hover:bg-[#fff8f0]
                hover:-translate-x-[1px] hover:-translate-y-[1px]
                hover:shadow-[2px_2px_0_#e8a020]
                transition-all duration-150
              "
            >
              • {example}
            </button>
          ))}
          </div>
        </Stack>

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
            Cancel
          </Button>
          <Button
            leftSection={
              loading ? <Loader size={16} /> : <IconSparkles size={16} />
            }
            onClick={handleGenerate}
            disabled={!description.trim() || loading}
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
            {loading ? 'Generating...' : 'Generate Flow'}
          </Button>
        </Group>
      </Stack>
      </div>
    </Modal>
  );
}
