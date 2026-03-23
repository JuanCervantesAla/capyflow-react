import {
  Modal,
  Select,
  Button,
  Stack,
  Text,
  Group,
  CloseButton,
  Loader,
  ScrollArea,
  Badge,
} from "@mantine/core";
import { useFlows } from "../../hooks/useFlows";
import { useState, useMemo, useRef, useEffect } from "react";
import type { FlowVersion } from "../../api/Flow/flows.api";
import { toastError } from "../../lib/toast";

interface FlowSelectorModalProps {
  opened: boolean;
  onSelectFlow: (flowId: string) => void;
  onCloneFlow: (flowId: string) => Promise<void>;
  onImportFlow: (payload: unknown) => Promise<void>;
  onLoadFlowVersions: (flowId: string) => Promise<FlowVersion[]>;
  onRollbackFlow: (flowId: string, versionId: string) => Promise<void>;
  onCreateFlow: () => void;
  onClose: () => void;
}

export function FlowSelectorModal({
  opened,
  onSelectFlow,
  onCloneFlow,
  onImportFlow,
  onLoadFlowVersions,
  onRollbackFlow,
  onCreateFlow,
  onClose,
}: FlowSelectorModalProps) {
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [rollingBackVersionId, setRollingBackVersionId] = useState<string | null>(null);
  const [versions, setVersions] = useState<FlowVersion[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: flows = [],
    isLoading,
    isError,
  } = useFlows();

  const flowOptions = useMemo(
    () => (flows as any[]).map((f: any) => ({ value: f.id, label: f.name })),
    [flows]
  );

  useEffect(() => {
    if (!opened || !selectedFlowId) {
      setVersions([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        setIsLoadingVersions(true);
        const data = await onLoadFlowVersions(selectedFlowId);
        if (!cancelled) {
          setVersions(data);
        }
      } catch (error: any) {
        if (!cancelled) {
          setVersions([]);
          toastError(error?.message || 'Could not load flow versions');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVersions(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [opened, selectedFlowId, onLoadFlowVersions]);

  const handleImportFile = async (file: File | null | undefined) => {
    if (!file) return;

    try {
      setIsImporting(true);
      const content = await file.text();
      const parsed = JSON.parse(content);
      await onImportFlow(parsed);
    } finally {
      setIsImporting(false);
    }
  };

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
        {/* Header with black background */}
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

        {/* Body with padding */}
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

            {/* Primary action */}
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

            <Button
              fullWidth
              disabled={!selectedFlowId}
              onClick={() => selectedFlowId && onCloneFlow(selectedFlowId)}
              className="
                !bg-[#FFF8F0] !text-[#2d3436] !border-[2.5px] !border-[#2d3436]
                !font-bold !text-sm uppercase tracking-wide
                transition-all duration-200 ease-out
                !shadow-[2px_2px_0px_#2d3436]
                hover:!-translate-x-[1px] hover:!-translate-y-[1px]
                hover:!shadow-[3px_3px_0px_#2d3436]
                !rounded-none
                !h-[44px]
              "
            >
              Clone Selected Flow
            </Button>

            <Stack gap={8}>
              <Text className="text-[#e8a020] text-xs font-bold uppercase tracking-[2px]">
                Version History
              </Text>
              <div className="border-[2px] border-[#2d3436] bg-[#faf8f4]">
                {isLoadingVersions ? (
                  <Group justify="center" py="sm" gap="xs">
                    <Loader size="xs" color="#2d3436" />
                    <Text size="xs" c="#2d3436">Loading versions...</Text>
                  </Group>
                ) : versions.length === 0 ? (
                  <Text size="xs" c="#2d3436" px="sm" py="sm" style={{ opacity: 0.7 }}>
                    Save this flow to create rollback points.
                  </Text>
                ) : (
                  <ScrollArea h={132} type="auto" offsetScrollbars>
                    <Stack gap={6} p={8}>
                      {versions.map((version) => (
                        <Group
                          key={version.id}
                          justify="space-between"
                          align="center"
                          style={{
                            border: '1.5px solid #2d3436',
                            padding: '6px 8px',
                            background: '#FFF8F0',
                          }}
                        >
                          <Stack gap={2}>
                            <Group gap={6}>
                              <Badge
                                size="xs"
                                radius={0}
                                color="dark"
                                variant="filled"
                                style={{ background: '#2d3436' }}
                              >
                                v{version.versionNumber}
                              </Badge>
                              <Text size="xs" fw={700} c="#2d3436">
                                {version.note || 'snapshot'}
                              </Text>
                            </Group>
                            <Text size="xs" c="#2d3436" style={{ opacity: 0.7 }}>
                              {new Date(version.createdAt).toLocaleString()}
                            </Text>
                          </Stack>
                          <Button
                            size="compact-xs"
                            radius={0}
                            variant="light"
                            color="gray"
                            loading={rollingBackVersionId === version.id}
                            disabled={!selectedFlowId}
                            onClick={async () => {
                              if (!selectedFlowId) return;
                              try {
                                setRollingBackVersionId(version.id);
                                await onRollbackFlow(selectedFlowId, version.id);
                                const refreshed = await onLoadFlowVersions(selectedFlowId);
                                setVersions(refreshed);
                              } catch (error: any) {
                                toastError(error?.message || 'Could not rollback this version');
                              } finally {
                                setRollingBackVersionId(null);
                              }
                            }}
                            style={{
                              border: '1.5px solid #2d3436',
                              color: '#2d3436',
                              fontWeight: 700,
                            }}
                          >
                            Rollback
                          </Button>
                        </Group>
                      ))}
                    </Stack>
                  </ScrollArea>
                )}
              </div>
            </Stack>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                void handleImportFile(file);
                e.currentTarget.value = '';
              }}
            />

            <Button
              fullWidth
              loading={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="
                !bg-[#FFF8F0] !text-[#2d3436] !border-[2.5px] !border-[#2d3436]
                !font-bold !text-sm uppercase tracking-wide
                transition-all duration-200 ease-out
                !shadow-[2px_2px_0px_#2d3436]
                hover:!-translate-x-[1px] hover:!-translate-y-[1px]
                hover:!shadow-[3px_3px_0px_#2d3436]
                !rounded-none
                !h-[44px]
              "
            >
              Import Flow JSON
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

            {/* Secondary action */}
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
