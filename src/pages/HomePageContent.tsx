import { useContext, useEffect, useState, useRef } from "react";
import { Button, Checkbox, Group, Modal, Stack, Text, TextInput, Select, Badge, Divider } from "@mantine/core";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { Sidebar } from "../components/SideBar/SideBar";
import { FlowCanvas } from "../components/Flow/Canvas/FlowCanvas";
import { Rightbar } from "../components/Rightbar/Rightbar";
import { RightPanels } from "../components/Rightbar/RightPanels";
import { AIGenerateModal } from "../components/UI/AIGenerateModal";
import { AIRepairModal } from "../components/UI/AIRepairModal";
import { FlowContext } from "../components/Flow/context/FlowContext";
import { useExecuteFlow } from "../hooks/mutations/Flow/useExecuteFlow";
import { useSaveFlow } from "../hooks/mutations/Flow/useSaveFlow";
import { useFlow } from "../hooks/useFlow";
import { useAIGeneration } from "../hooks/useAIGeneration";
import { fixFlowWithAI } from "../api/AI/ai.api";
import {
  createFlowShareRequest,
  exportFlowRequest,
  regenerateFlowShareRequest,
  updateFlowRequest,
  updateFlowShareRequest,
  type FlowShareResponse,
} from "../api/Flow/flows.api";
import { toastSuccess, toastError } from "../lib/toast";
import type { ExecutionResult } from "../hooks/mutations/Flow/useExecuteFlow";
import { transformNodeFromBackend, transformEdgeFromBackend } from "../components/Flow/types/NodeTypes";
import {
  clearExperimentRecords,
  loadExperimentRecords,
  recordsToCsv,
  saveExperimentRecords,
  type ExperimentGroup,
  type ExperimentRecord,
} from "../lib/experimentAnalytics";

interface HomePageContentProps {
  flowId: string | null;
  flowName: string;
  onOpenFlowSelector: () => void;
  onRenameFlow?: (name: string) => void;
}

export function HomePageContent({
  flowId,
  flowName,
  onOpenFlowSelector,
  onRenameFlow,
}: HomePageContentProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelsCollapsed, setRightPanelsCollapsed] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [rightbarOpened, setRightbarOpened] = useState(false);
  const [showConnectionIds, setShowConnectionIds] = useState(false);
  const [aiModalOpened, setAiModalOpened] = useState(false);
  const [aiRepairModalOpened, setAiRepairModalOpened] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [shareData, setShareData] = useState<FlowShareResponse | null>(null);
  const [shareActive, setShareActive] = useState(true);
  const [shareExpiryInput, setShareExpiryInput] = useState("");
  const [isShareSaving, setIsShareSaving] = useState(false);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [isFlowStatusSaving, setIsFlowStatusSaving] = useState(false);
  const [experimentModalOpened, setExperimentModalOpened] = useState(false);
  const [participantId, setParticipantId] = useState("");
  const [caseId, setCaseId] = useState("case-1");
  const [experimentGroup, setExperimentGroup] = useState<ExperimentGroup>("manual");
  const [isExperimentRunning, setIsExperimentRunning] = useState(false);
  const [experimentStartedAt, setExperimentStartedAt] = useState<string | null>(null);
  const [experimentElapsedSeconds, setExperimentElapsedSeconds] = useState(0);
  const [experimentRecords, setExperimentRecords] = useState<ExperimentRecord[]>([]);
  const [aiGenerateCount, setAiGenerateCount] = useState(0);
  const [aiRepairCount, setAiRepairCount] = useState(0);

  const [ignoreNextSelection, setIgnoreNextSelection] = useState(false);
  const deselectAllRef = useRef<(() => void) | null>(null);

  const flowContext = useContext(FlowContext);
  const selectedNode =
    flowContext?.nodes?.find((node) => node.id === selectedNodeId) ?? null;
  const { data: flowData } = useFlow(flowId);
  const { generateFlow, isGenerating } = useAIGeneration();

  const { mutateAsync: executeFlow, isPending: isExecuting } =
    useExecuteFlow({});

  const { mutateAsync: saveFlow } = useSaveFlow();

  useEffect(() => {
    setExperimentRecords(loadExperimentRecords());
  }, []);

  useEffect(() => {
    if (!isExperimentRunning || !experimentStartedAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const started = new Date(experimentStartedAt).getTime();
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - started) / 1000));
      setExperimentElapsedSeconds(elapsed);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isExperimentRunning, experimentStartedAt]);

  const handleCloseRightbar = () => {
    setIgnoreNextSelection(true);
    
    if (deselectAllRef.current) {
      deselectAllRef.current();
    }
    
    setSelectedNodeId(null);
    setRightbarOpened(false);

    setTimeout(() => {
      setIgnoreNextSelection(false);
    }, 50);
  };

  useEffect(() => {
    if (!flowContext?.loadFlowData) return;

    if (!flowId) {
      flowContext.loadFlowData([], []);
      handleCloseRightbar();
      return;
    }

    if (
      (flowData as any)?.nodes !== undefined ||
      (flowData as any)?.edges !== undefined
    ) {
      flowContext.loadFlowData(
        (flowData as any)?.nodes || [],
        (flowData as any)?.edges || []
      );
      handleCloseRightbar();
    }
  }, [flowId, flowData]);

  useEffect(() => {
    const status = (flowData as any)?.status;
    setIsFlowActive(status === "active");
  }, [flowData]);

  useEffect(() => {
    const handler = () => {
      const small = window.innerWidth < 1024;
      setSidebarCollapsed(small);
      setRightPanelsCollapsed(small);

      if (small) {
        handleCloseRightbar();
      }
    };

    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleSave = async () => {
    if (!flowId || !flowContext) return;

    await saveFlow({
      flowId,
      nodes: flowContext.nodes,
      edges: flowContext.edges,
    });
  };

  const handleRenameFlow = async (nextName: string) => {
    if (!flowId) return;

    const trimmed = nextName.trim();
    if (!trimmed || trimmed === flowName) return;

    try {
      const updated = await updateFlowRequest(flowId, { name: trimmed } as any);
      const savedName = (updated as any)?.name || trimmed;
      onRenameFlow?.(savedName);
      toastSuccess("Flow renamed");
    } catch (error: any) {
      toastError(error?.message || "Failed to rename flow");
    }
  };

  const handleExecute = async () => {
    if (!flowId) return;
    await executeFlow(flowId);
  };

  const handleToggleFlowActive = async () => {
    if (!flowId) return;

    const nextStatus = isFlowActive ? "draft" : "active";
    try {
      setIsFlowStatusSaving(true);
      const updated = await updateFlowRequest(flowId, { status: nextStatus } as any);
      const savedStatus = (updated as any)?.status || nextStatus;
      setIsFlowActive(savedStatus === "active");
      toastSuccess(savedStatus === "active" ? "Flow activated (cron enabled)" : "Flow set to draft (cron disabled)");
    } catch (error: any) {
      toastError(error?.message || "Failed to update flow status");
    } finally {
      setIsFlowStatusSaving(false);
    }
  };

  const handleExport = async () => {
    if (!flowId) return;

    try {
      const exported = await exportFlowRequest(flowId);
      const fileName = `${(exported.flow.name || 'flow').replace(/\s+/g, '-').toLowerCase()}.json`;
      const content = JSON.stringify(exported, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toastSuccess('Flow exported successfully');
    } catch (error: any) {
      toastError(error?.message || 'Failed to export flow');
    }
  };

  const handleShare = async () => {
    if (!flowId) return;

    try {
      const share = await createFlowShareRequest(flowId);
      setShareData(share);
      setShareActive(share.isActive);
      setShareExpiryInput(toDatetimeLocalValue(share.expiresAt));
      setShareModalOpened(true);
    } catch (error: any) {
      toastError(error?.message || 'Failed to create share link');
    }
  };

  const copySharedUrl = async () => {
    if (!shareData) return;
    const link = `${window.location.origin}/shared/${shareData.shareId}`;

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
      toastSuccess('Shared view link copied');
      return;
    }

    const input = document.createElement('textarea');
    input.value = link;
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.focus();
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    toastSuccess('Shared view link copied');
  };

  const handleSaveShareSettings = async () => {
    if (!flowId || !shareData) return;

    try {
      setIsShareSaving(true);
      const expiresAt = fromDatetimeLocalValue(shareExpiryInput);
      const updated = await updateFlowShareRequest(flowId, {
        isActive: shareActive,
        expiresAt,
      });
      setShareData(updated);
      toastSuccess('Share settings updated');
    } catch (error: any) {
      toastError(error?.message || 'Failed to update share settings');
    } finally {
      setIsShareSaving(false);
    }
  };

  const handleRegenerateShareLink = async () => {
    if (!flowId) return;

    try {
      setIsShareSaving(true);
      const regenerated = await regenerateFlowShareRequest(flowId);
      setShareData(regenerated);
      setShareActive(regenerated.isActive);
      setShareExpiryInput(toDatetimeLocalValue(regenerated.expiresAt));
      toastSuccess('Share link regenerated');
    } catch (error: any) {
      toastError(error?.message || 'Failed to regenerate share link');
    } finally {
      setIsShareSaving(false);
    }
  };

  const handleNodeSelected = (node: any) => {
    if (ignoreNextSelection) return;

    if (!node) {
      setSelectedNodeId(null);
      setRightbarOpened(false);
      return;
    }

    setSelectedNodeId(node.id);
    setRightbarOpened(true);
  };

  const handleExecutionUpdate = (data: any) => {
    setExecutionResult(data);

    if (data.status !== "idle" && rightPanelsCollapsed && !rightbarOpened) {
      setRightPanelsCollapsed(false);
    }
  };

  const handleStartExperiment = () => {
    if (!flowId || !flowContext) {
      toastError("Select a flow before starting an experiment run.");
      return;
    }

    if (!participantId.trim()) {
      toastError("Participant ID is required.");
      return;
    }

    const startedAt = new Date().toISOString();
    setExperimentStartedAt(startedAt);
    setIsExperimentRunning(true);
    setExperimentElapsedSeconds(0);
    setAiGenerateCount(0);
    setAiRepairCount(0);
    toastSuccess("Experiment run started.");
  };

  const handleStopExperiment = () => {
    if (!flowContext || !flowId || !experimentStartedAt) {
      return;
    }

    const endedAt = new Date().toISOString();
    const metrics = computeStructuralMetrics(flowContext.nodes, flowContext.edges);
    const record: ExperimentRecord = {
      id: `exp-${Date.now()}`,
      flowId,
      flowName: flowName || "Untitled Workflow",
      participantId: participantId.trim(),
      caseId,
      group: experimentGroup,
      startedAt: experimentStartedAt,
      endedAt,
      durationSeconds: experimentElapsedSeconds,
      nodeCount: flowContext.nodes.length,
      edgeCount: flowContext.edges.length,
      validNodeRatio: metrics.validNodeRatio,
      validEdgeRatio: metrics.validEdgeRatio,
      structuralPrecision: metrics.structuralPrecision,
      executionStatus: executionResult?.status || "not-executed",
      aiGenerateCount,
      aiRepairCount,
    };

    const updated = [record, ...experimentRecords].slice(0, 100);
    setExperimentRecords(updated);
    saveExperimentRecords(updated);
    setIsExperimentRunning(false);
    setExperimentStartedAt(null);
    setExperimentElapsedSeconds(0);
    toastSuccess("Experiment run saved.");
  };

  const handleExportExperimentCsv = () => {
    if (experimentRecords.length === 0) {
      toastError("No experiment records to export yet.");
      return;
    }

    const csv = recordsToCsv(experimentRecords);
    const fileName = `experiment-results-${new Date().toISOString().slice(0, 10)}.csv`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toastSuccess("Experiment CSV exported.");
  };

  const handleClearExperimentRecords = () => {
    setExperimentRecords([]);
    clearExperimentRecords();
    toastSuccess("Experiment records cleared.");
  };

  const handleAIGenerate = async (description: string) => {
    setAiGenerateCount((count) => count + 1);
    try {
      await generateFlow(description, undefined, (generatedFlow) => {
        if (flowContext?.loadFlowData) {
          flowContext.loadFlowData(
            generatedFlow.nodes || [],
            generatedFlow.edges || []
          );
          toastSuccess(
            `Flow "${generatedFlow.name}" generated. Don't forget to save it.`
          );
        }
      });
    } catch (error) {
      console.error('Error generating flow:', error);
}
  };

  const handleAIRepair = async (issues?: string, goal?: string) => {
    if (!flowContext) return;

    setAiRepairCount((count) => count + 1);

    setIsRepairing(true);
    try {
      // Send nodes in React Flow format directly
      // The backend can handle both flat format and React Flow (with nested data)
      const currentFlow = {
        flowName: flowName || "Untitled Workflow",
        flowDescription: "",
        nodes: flowContext.nodes,
        edges: flowContext.edges,
      };

      const response = await fixFlowWithAI({
        flow: currentFlow,
        goal,
        issues,
        adjustParametersOnly: true,
        strictMode: true,
        maxAttempts: 3,
      });

      if (response.success && response.flow) {
        // Check if nodes are already in React Flow format (have data.label)
        // or in backend format (have label at root level)
        const nodes = response.flow.nodes || [];
        const edges = response.flow.edges || [];
        
        const isAlreadyTransformed = nodes.length > 0 && nodes[0]?.data?.label;
        
        const transformedNodes = isAlreadyTransformed 
          ? nodes 
          : nodes.map(transformNodeFromBackend);
          
        const transformedEdges = isAlreadyTransformed 
          ? edges 
          : edges.map(transformEdgeFromBackend);
        
        flowContext.loadFlowData(
          transformedNodes,
          transformedEdges
        );
        if (response.fixes && response.fixes.length > 0) {
          toastSuccess(
            `Flow repaired. Changes: ${response.fixes.join(", ")}`
          );
        } else {
          toastSuccess("Flow repaired successfully");
        }
      } else {
        // Show error with more context if available
        const errorMessage = response.hint 
          ? `${response.error}\n\n💡 ${response.hint}`
          : response.error || "Could not repair flow";
        
        toastError(errorMessage);
        
        // Additional log for the developer
        if (response.rawResponse) {
          console.error("🔍 Error details:", {
            error: response.error,
            hint: response.hint,
            rawResponse: response.rawResponse,
            cleaned: response.cleaned,
            truncated: response.truncated,
          });
        }
      }
    } catch (error: any) {
      console.error("❌ Error repairing flow:", error);
      toastError(error.message || "Error repairing flow");
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AIGenerateModal
        opened={aiModalOpened}
        onClose={() => setAiModalOpened(false)}
        onGenerate={handleAIGenerate}
        loading={isGenerating}
      />

      <AIRepairModal
        opened={aiRepairModalOpened}
        onClose={() => setAiRepairModalOpened(false)}
        onRepair={handleAIRepair}
        loading={isRepairing}
      />

      <Modal
        opened={experimentModalOpened}
        onClose={() => setExperimentModalOpened(false)}
        title="Experiment Toolkit"
        centered
        size="lg"
      >
        <Stack gap="sm">
          <Text size="sm" c="#2d3436">
            Use this panel to record control vs AI runs and export the evidence as CSV.
          </Text>

          <Group grow>
            <TextInput
              label="Participant ID"
              placeholder="e.g. student-07"
              value={participantId}
              onChange={(e) => setParticipantId(e.currentTarget.value)}
              disabled={isExperimentRunning}
            />
            <Select
              label="Group"
              data={[
                { value: "manual", label: "Manual (Control)" },
                { value: "ai", label: "AI-assisted (Experimental)" },
              ]}
              value={experimentGroup}
              onChange={(value) => setExperimentGroup((value as ExperimentGroup) || "manual")}
              disabled={isExperimentRunning}
            />
            <Select
              label="Case"
              data={[
                { value: "case-1", label: "Case 1" },
                { value: "case-2", label: "Case 2" },
                { value: "case-3", label: "Case 3" },
                { value: "case-4", label: "Case 4" },
              ]}
              value={caseId}
              onChange={(value) => setCaseId(value || "case-1")}
              disabled={isExperimentRunning}
            />
          </Group>

          <Group justify="space-between" align="center">
            <Group>
              <Badge color={isExperimentRunning ? "green" : "gray"}>
                {isExperimentRunning ? "Running" : "Idle"}
              </Badge>
              <Text size="sm" fw={700}>
                Elapsed: {formatDuration(experimentElapsedSeconds)}
              </Text>
            </Group>

            <Group>
              <Button
                color="dark"
                variant="light"
                onClick={handleStartExperiment}
                disabled={isExperimentRunning}
              >
                Start Run
              </Button>
              <Button
                color="dark"
                onClick={handleStopExperiment}
                disabled={!isExperimentRunning}
              >
                Stop & Save
              </Button>
            </Group>
          </Group>

          <Text size="xs" c="#2d3436" style={{ opacity: 0.75 }}>
            Current run counters: AI Generate {aiGenerateCount} | AI Repair {aiRepairCount} | Last execution status {executionResult?.status || "not-executed"}
          </Text>

          <Divider label="Recorded Runs" labelPosition="center" />

          <Stack gap={6} style={{ maxHeight: 240, overflow: "auto" }}>
            {experimentRecords.length === 0 ? (
              <Text size="sm" c="#2d3436" style={{ opacity: 0.65 }}>
                No experiment runs recorded yet.
              </Text>
            ) : (
              experimentRecords.map((record) => (
                <Group
                  key={record.id}
                  justify="space-between"
                  style={{
                    border: "1px solid #d0d0d0",
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}
                >
                  <Text size="xs">
                    {record.participantId} | {record.caseId} | {record.group.toUpperCase()} | {record.durationSeconds}s
                  </Text>
                  <Text size="xs" fw={600}>
                    Precision {(record.structuralPrecision * 100).toFixed(0)}%
                  </Text>
                </Group>
              ))
            )}
          </Stack>

          <Group justify="flex-end" mt="xs">
            <Button variant="light" color="red" onClick={handleClearExperimentRecords}>
              Clear Records
            </Button>
            <Button variant="light" color="dark" onClick={handleExportExperimentCsv}>
              Export CSV
            </Button>
            <Button color="dark" onClick={() => setExperimentModalOpened(false)}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
        title="Share flow"
        centered
      >
        <Stack gap="sm">
          <Text size="sm" c="#2d3436">
            Public view URL
          </Text>
          <Group gap="xs" align="end">
            <TextInput
              value={shareData ? `${window.location.origin}/shared/${shareData.shareId}` : ''}
              readOnly
              style={{ flex: 1 }}
            />
            <Button variant="light" color="dark" onClick={copySharedUrl}>
              Copy
            </Button>
          </Group>

          {shareData && (
            <Stack gap={2}>
              <Text size="xs" c="#2d3436" style={{ opacity: 0.75 }}>
                Created: {formatDateTime(shareData.createdAt)}
              </Text>
              <Text size="xs" c="#2d3436" style={{ opacity: 0.75 }}>
                Last access: {shareData.lastAccessAt ? formatDateTime(shareData.lastAccessAt) : 'Never'}
              </Text>
            </Stack>
          )}

          <Checkbox
            label="Share link active"
            checked={shareActive}
            onChange={(e) => setShareActive(e.currentTarget.checked)}
          />

          <TextInput
            label="Expires at (optional)"
            type="datetime-local"
            value={shareExpiryInput}
            onChange={(e) => setShareExpiryInput(e.currentTarget.value)}
            description="Leave empty for no expiration"
          />

          <Group justify="flex-end" mt="xs">
            <Button
              variant="light"
              color="red"
              loading={isShareSaving}
              onClick={handleRegenerateShareLink}
            >
              Regenerate link
            </Button>
            <Button variant="default" onClick={() => setShareModalOpened(false)}>
              Close
            </Button>
            <Button loading={isShareSaving} onClick={handleSaveShareSettings} color="dark">
              Save settings
            </Button>
          </Group>
        </Stack>
      </Modal>
      
      <HeaderBar
        workflowName={flowName}
        onOpenFlowSelector={onOpenFlowSelector}
        onSave={handleSave}
        onExport={handleExport}
        onShare={handleShare}
        onExperiment={() => setExperimentModalOpened(true)}
        onRun={handleExecute}
        isFlowActive={isFlowActive}
        flowStatusLoading={isFlowStatusSaving}
        onToggleFlowActive={handleToggleFlowActive}
        onAIGenerate={() => setAiModalOpened(true)}
        onAIRepair={() => setAiRepairModalOpened(true)}
        onRenameWorkflow={handleRenameFlow}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        <div style={{ flex: 1, position: "relative" }}>
          {flowId && (
            <FlowCanvas
              onNodeSelected={handleNodeSelected}
              onExecutionUpdate={handleExecutionUpdate}
              onDeselectAll={deselectAllRef as any}
              showConnectionIds={showConnectionIds}
            />
          )}
        </div>

        <Rightbar
          node={selectedNode}
          open={rightbarOpened}
          onClose={handleCloseRightbar}
          flowId={flowId}
          showConnectionIds={showConnectionIds}
          onToggleShowConnectionIds={setShowConnectionIds}
        />

        <RightPanels
          collapsed={rightPanelsCollapsed}
          onToggle={() => setRightPanelsCollapsed((v) => !v)}
          flowId={flowId}
          executionResult={executionResult}
          isExecuting={isExecuting}
        />
      </div>
    </div>
  );
}

function toDatetimeLocalValue(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function fromDatetimeLocalValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function computeStructuralMetrics(nodes: any[] = [], edges: any[] = []) {
  const nodeIds = new Set(nodes.map((node) => node.id));

  const validNodes = nodes.filter((node) => Boolean(node.id) && Boolean(node.data?.type));
  const validEdges = edges.filter(
    (edge) =>
      Boolean(edge.source) &&
      Boolean(edge.target) &&
      nodeIds.has(edge.source) &&
      nodeIds.has(edge.target),
  );

  const validNodeRatio = nodes.length === 0 ? 0 : validNodes.length / nodes.length;
  const validEdgeRatio = edges.length === 0 ? 0 : validEdges.length / edges.length;
  const structuralPrecision =
    nodes.length === 0 && edges.length === 0
      ? 0
      : Number(((validNodeRatio + validEdgeRatio) / 2).toFixed(4));

  return {
    validNodeRatio,
    validEdgeRatio,
    structuralPrecision,
  };
}

