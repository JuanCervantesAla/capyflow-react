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
      <Stack gap={0}>
        {/* Header con fondo negro */}
        <div className="bg-[#0a0a08] px-6 py-4 border-b-[3px] border-[#2d3436]">
          <Group justify="space-between" align="center">
            <Stack gap={4}>
              <Text className="!text-white font-black text-lg tracking-tight uppercase">
                Flow Management
              </Text>
              <Text className="!text-white/70 text-xs font-medium">
                ~/flows
              </Text>
            </Stack>

            <CloseButton
              onClick={onClose}
              aria-label="Close"
              size="md"
              className="text-[#FFF8F0] hover:bg-[#FFF8F0]/10 hover:text-[#e8a020] transition-colors"
            />
          </Group>
        </div>

        {/* Body con padding */}
        <div className="px-6 py-6 bg-[#FFF8F0]">
          <Stack gap="lg">
            {/* Selector */}
            <Stack gap={8}>
              <Text className="text-[#e8a020] text-xs font-bold uppercase tracking-[2px]">
                Existing Flow
              </Text>

              <Select
                data={flowOptions}
                value={selectedFlowId}
                onChange={setSelectedFlowId}
                placeholder={
                  isLoading ? "Loading flows..." : "Select a flow"
                }
                disabled={isLoading || isError}
                comboboxProps={{ withinPortal: false }}
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
                    transition: 'all 0.2s ease',
                  },
                  section: {
                    color: '#2d3436',
                  },
                }}
                className="
                  focus-within:shadow-[4px_4px_0_#e8a020]
                  focus-within:-translate-x-[2px]
                  focus-within:-translate-y-[2px]
                  transition-all
                "
              />
            </Stack>

            {/* Acción principal */}
            <Button
              fullWidth
              disabled={!selectedFlowId}
              onClick={() => selectedFlowId && onSelectFlow(selectedFlowId)}
              className="
                !bg-[#e8a020] !text-[#0a0a08] !border-[3px] !border-[#2d3436]
                !font-black !text-base uppercase tracking-wide
                transition-all duration-200 ease-out
                !shadow-[3px_3px_0px_#2d3436]
                hover:!-translate-x-[2px] hover:!-translate-y-[2px]
                hover:!shadow-[5px_5px_0px_#2d3436]
                disabled:!opacity-40
                disabled:!hover:translate-x-0 disabled:!hover:translate-y-0
                disabled:!hover:shadow-[3px_3px_0px_#2d3436]
                !rounded-none
                !h-[48px]
              "
            >
              Open Flow
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#2d3436]/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#FFF8F0] px-3 text-[#2d3436]/60 font-bold uppercase tracking-wider">
                  or
                </span>
              </div>
            </div>

            {/* Acción secundaria */}
            <Button
              fullWidth
              onClick={onCreateFlow}
              className="
                !bg-[#FFF8F0] !text-[#2d3436] !border-[2.5px] !border-[#2d3436]
                !font-bold !text-sm uppercase tracking-wide
                transition-all duration-200 ease-out
                !shadow-[2px_2px_0px_#2d3436]
                hover:!-translate-x-[1px] hover:!-translate-y-[1px]
                hover:!shadow-[3px_3px_0px_#2d3436]
                hover:!bg-[#2d3436] hover:!text-[#FFF8F0]
                !rounded-none
                !h-[44px]
              "
            >
              + Create New Flow
            </Button>
          </Stack>
        </div>
      </Stack>
    </Modal>
  );
}
