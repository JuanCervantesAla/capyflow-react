import { useContext, useEffect, useState, useRef } from "react";
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

  // 👉 NUEVO FLAG
  const [ignoreNextSelection, setIgnoreNextSelection] = useState(false);
  const deselectAllRef = useRef<(() => void) | null>(null);

  const flowContext = useContext(FlowContext);
  const { data: flowData } = useFlow(flowId);

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
