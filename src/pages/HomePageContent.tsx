import { useContext, useEffect, useState, useRef } from "react";
import { Button, Checkbox, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
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

export function HomePageContent({ flowId, flowName, onOpenFlowSelector }: any) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelsCollapsed, setRightPanelsCollapsed] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [rightbarOpened, setRightbarOpened] = useState(false);
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

  const [ignoreNextSelection, setIgnoreNextSelection] = useState(false);
  const deselectAllRef = useRef<(() => void) | null>(null);

  const flowContext = useContext(FlowContext);
  const { data: flowData } = useFlow(flowId);
  const { generateFlow, isGenerating } = useAIGeneration();

  const { mutateAsync: executeFlow, isPending: isExecuting } =
    useExecuteFlow({});

  const { mutateAsync: saveFlow } = useSaveFlow();

  const handleCloseRightbar = () => {
    setIgnoreNextSelection(true);
    
    if (deselectAllRef.current) {
      deselectAllRef.current();
    }
    
    setSelectedNode(null);
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

    setSelectedNode(node);
    setRightbarOpened(true);
  };

  const handleExecutionUpdate = (data: any) => {
    setExecutionResult(data);

    if (data.status !== "idle" && rightPanelsCollapsed && !rightbarOpened) {
      setRightPanelsCollapsed(false);
    }
  };

  const handleAIGenerate = async (description: string) => {
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
        onRun={handleExecute}
        isFlowActive={isFlowActive}
        flowStatusLoading={isFlowStatusSaving}
        onToggleFlowActive={handleToggleFlowActive}
        onAIGenerate={() => setAiModalOpened(true)}
        onAIRepair={() => setAiRepairModalOpened(true)}
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
            />
          )}
        </div>

        <Rightbar
          node={selectedNode}
          open={rightbarOpened}
          onClose={handleCloseRightbar}
          flowId={flowId}
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
