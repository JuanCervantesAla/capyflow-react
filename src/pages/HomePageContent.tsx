import { useContext, useEffect, useState, useRef } from "react";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { Sidebar } from "../components/SideBar/SideBar";
import { FlowCanvas } from "../components/Flow/Canvas/FlowCanvas";
import { ExecutionPanelWrapper } from "../components/Flow/Canvas/ExecutionPanelWrapper";
import { Rightbar } from "../components/Rightbar/Rightbar";
import { AIGenerateModal } from "../components/UI/AIGenerateModal";
import { AIRepairModal } from "../components/UI/AIRepairModal";
import { APIKeySettingsModal } from "../components/UI/APIKeySettingsModal";
import { FlowContext } from "../components/Flow/context/FlowContext";
import { useExecuteFlow } from "../hooks/mutations/Flow/useExecuteFlow";
import { useSaveFlow } from "../hooks/mutations/Flow/useSaveFlow";
import { useFlow } from "../hooks/useFlow";
import { useAIGeneration } from "../hooks/useAIGeneration";
import { repairFlowWithAI } from "../api/AI/ai.api";
import { toastSuccess, toastError } from "../lib/toast";
import type { ExecutionResult } from "../hooks/mutations/Flow/useExecuteFlow";

export function HomePageContent({ flowId, flowName, onOpenFlowSelector }: any) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [executionCollapsed, setExecutionCollapsed] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [rightbarOpened, setRightbarOpened] = useState(false);
  const [aiModalOpened, setAiModalOpened] = useState(false);
  const [aiRepairModalOpened, setAiRepairModalOpened] = useState(false);
  const [apiKeyModalOpened, setApiKeyModalOpened] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

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
    const handler = () => {
      const small = window.innerWidth < 1024;
      setSidebarCollapsed(small);
      setExecutionCollapsed(small);

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

  const handleNodeSelected = (node: any) => {
    if (ignoreNextSelection) return;

    setSelectedNode(node);
    setRightbarOpened(true);
  };

  const handleExecutionUpdate = (data: any) => {
    setExecutionResult(data);

    if (data.status !== "idle" && executionCollapsed && !rightbarOpened) {
      setExecutionCollapsed(false);
    }
  };

  const handleAIGenerate = async (description: string, apiKey?: string) => {
    try {
      await generateFlow(description, apiKey, (generatedFlow) => {
        if (flowContext?.loadFlowData) {
          flowContext.loadFlowData(
            generatedFlow.nodes || [],
            generatedFlow.edges || []
          );
          toastSuccess(
            `Flujo "${generatedFlow.name}" generado. No olvides guardarlo.`
          );
        }
      });
    } catch (error) {
      console.error('Error generando flujo:', error);
    }
  };

  const handleAIRepair = async (issues?: string) => {
    if (!flowContext) return;

    setIsRepairing(true);
    try {
      const currentFlow = {
        flowName: flowName || "Untitled Workflow",
        flowDescription: "",
        nodes: flowContext.nodes,
        edges: flowContext.edges,
      };

      const response = await repairFlowWithAI({
        flow: currentFlow,
        issues,
      });

      if (response.success && response.flow) {
        flowContext.loadFlowData(
          response.flow.nodes || [],
          response.flow.edges || []
        );
        if (response.fixes && response.fixes.length > 0) {
          toastSuccess(
            `Flujo reparado. Cambios: ${response.fixes.join(", ")}`
          );
        } else {
          toastSuccess("Flujo reparado exitosamente");
        }
      } else {
        toastError(response.error || "No se pudo reparar el flujo");
      }
    } catch (error: any) {
      console.error("Error reparando flujo:", error);
      toastError(error.message || "Error al reparar el flujo");
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
        onOpenSettings={() => setApiKeyModalOpened(true)}
        loading={isGenerating}
      />

      <AIRepairModal
        opened={aiRepairModalOpened}
        onClose={() => setAiRepairModalOpened(false)}
        onRepair={handleAIRepair}
        loading={isRepairing}
      />

      <APIKeySettingsModal
        opened={apiKeyModalOpened}
        onClose={() => setApiKeyModalOpened(false)}
      />
      
      <HeaderBar
        workflowName={flowName}
        onOpenFlowSelector={onOpenFlowSelector}
        onSave={handleSave}
        onRun={handleExecute}
        onAIGenerate={() => setAiModalOpened(true)}
        onAIRepair={() => setAiRepairModalOpened(true)}
        onOpenAPIKeySettings={() => setApiKeyModalOpened(true)}
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

        <ExecutionPanelWrapper
          flowId={flowId}
          collapsed={executionCollapsed}
          onToggle={() => setExecutionCollapsed((v) => !v)}
          result={executionResult}
          isLoading={isExecuting}
        />
      </div>
    </div>
  );
}
