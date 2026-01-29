import { useContext, useEffect, useState } from "react";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { Sidebar } from "../components/SideBar/SideBar";
import { FlowCanvas } from "../components/Flow/Canvas/FlowCanvas";
import { ExecutionPanelWrapper } from "../components/Flow/Canvas/ExecutionPanelWrapper";
import { Rightbar } from "../components/Rightbar/Rightbar";
import { FlowContext } from "../components/Flow/context/FlowContext";
import { useExecuteFlow } from "../hooks/mutations/Flow/useExecuteFlow";
import { useSaveFlow } from "../hooks/mutations/Flow/useSaveFlow";
import { useFlow } from "../hooks/useFlow";
import type { ExecutionResult } from "../hooks/mutations/Flow/useExecuteFlow";

export function HomePageContent({ flowId, flowName, onOpenFlowSelector }: any) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [executionCollapsed, setExecutionCollapsed] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [rightbarOpened, setRightbarOpened] = useState(false);

  const clearNode = () => {
    setSelectedNode(null);
    setRightbarOpened(false);
  };

  const flowContext = useContext(FlowContext);
  const { data: flowData } = useFlow(flowId);
  const { mutateAsync: executeFlow, isPending: isExecuting } = useExecuteFlow({
    onSuccess: (data: ExecutionResult) => {
      setExecutionResult(data);
      setExecutionCollapsed(false);
    },
  });

  const { mutateAsync: saveFlow } = useSaveFlow();

  // Cargar flujo cuando flowId cambia
  useEffect(() => {
  if (!flowContext?.loadFlowData) return;

  console.log("useEffect: flowId =", flowId, "flowData =", flowData);

  if (!flowId) {
    // Nuevo flujo - limpiar canvas inmediatamente
    console.log("Limpiando canvas para nuevo flujo");
    flowContext.loadFlowData([], []);
    clearNode();
    return;
  }

  // Si flowData está disponible, cargar nodos y edges
  if (flowData?.nodes !== undefined || flowData?.edges !== undefined) {
    console.log("Cargando flujo:", flowData);
    flowContext.loadFlowData(flowData?.nodes || [], flowData?.edges || []);
    clearNode();
  } else {
    console.log("Esperando a que flowData cargue...");
  }
}, [flowId, flowData]);

  useEffect(() => {
    const handler = () => {
      const small = window.innerWidth < 1024;
      setSidebarCollapsed(small);
      setExecutionCollapsed(small);
    };

    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleSave = async () => {
    if (!flowId || !flowContext) return;
    try {
      await saveFlow({
        flowId,
        nodes: flowContext.nodes,
        edges: flowContext.edges,
      });
    } catch (error) {
      console.error("Failed to save flow:", error);
    }
  };

  const handleExecute = async () => {
    if (!flowId) return;
    try {
      await executeFlow(flowId);
    } catch (error) {
      console.error("Failed to execute flow:", error);
    }
  };

  const handleNodeSelected = (node: any) => {
    setSelectedNode(node);
    setRightbarOpened(true);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderBar
        workflowName={flowName}
        onOpenFlowSelector={onOpenFlowSelector}
        onSave={handleSave}
        onRun={handleExecute}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        <div style={{ flex: 1, position: "relative" }}>
          {flowId && <FlowCanvas onNodeSelected={handleNodeSelected} />}
        </div>

        <ExecutionPanelWrapper
          collapsed={executionCollapsed}
          onToggle={() => setExecutionCollapsed((v) => !v)}
          result={executionResult}
          isLoading={isExecuting}
        />
      </div>

      <Rightbar 
        node={selectedNode} 
        onClose={clearNode} 
        opened={rightbarOpened}
      />
    </div>
  );
}