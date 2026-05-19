import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FlowProvider, FlowContext } from "../components/Flow/context/FlowContext";
import { FlowSelectorModal } from "../components/UI/FlowSelectorModal";
import { CreateFlowModal } from "../components/UI/CreateFlowModal";
import { useFlows } from "../hooks/useFlows";
import { useCreateFlow } from "../hooks/mutations/Flow/useCreateFlow";
import { HomePageContent } from "./HomePageContent";
import { getTemplateById, type DemoTemplateId } from "../components/Flow/templates/demoTemplates";
import {
  cloneFlowRequest,
  fetchFlowVersionsRequest,
  importFlowRequest,
  rollbackFlowRequest,
  saveFlowDataRequest,
  type FlowVersion,
} from "../api/Flow/flows.api";
import { toastError, toastSuccess } from "../lib/toast";
import { queryKeys } from "../lib/queryKeys";

export function HomePage() {
  const [flowId, setFlowId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: flows = [] } = useFlows();
  const { mutateAsync: createFlow, isPending } = useCreateFlow();
  const flowContext = useContext(FlowContext);

  useEffect(() => {
    const stored = localStorage.getItem("currentFlow");
    if (!stored) {
      setSelectorOpen(true);
      return;
    }

    try {
      const flow = JSON.parse(stored);
      setFlowId(flow.id);
      setFlowName(flow.name);
    } catch {
      setSelectorOpen(true);
    }
  }, []);

  const handleSelectFlow = (id: string) => {
    const flow = (flows as any[]).find((f: any) => f.id === id);
    if (!flow) return;

    localStorage.setItem(
      "currentFlow",
      JSON.stringify({ id: flow.id, name: flow.name })
    );

    setFlowId(flow.id);
    setFlowName(flow.name);
    setSelectorOpen(false);
  };

  const handleConfirmCreateFlow = async (name: string, templateId: DemoTemplateId) => {
    const newFlow = await createFlow({ name, description: "" });

    const template = getTemplateById(templateId);
    if (template && (template.nodes.length > 0 || template.edges.length > 0)) {
      try {
        await saveFlowDataRequest(newFlow.id, template.nodes, template.edges);
        toastSuccess(`Template "${templateId}" applied`);
      } catch {
        toastError("Flow was created, but template could not be applied");
      }
    }

    localStorage.setItem(
      "currentFlow",
      JSON.stringify({ id: newFlow.id, name: newFlow.name })
    );

    setFlowId(newFlow.id);
    setFlowName(newFlow.name);

    setCreateOpen(false);
    setSelectorOpen(false);

    flowContext?.loadFlowData?.([], []);
  };

  const handleCloneFlow = async (sourceFlowId: string) => {
    const cloned = await cloneFlowRequest(sourceFlowId);

    await queryClient.invalidateQueries({ queryKey: queryKeys.flows });

    localStorage.setItem(
      "currentFlow",
      JSON.stringify({ id: cloned.id, name: cloned.name })
    );

    setFlowId(cloned.id);
    setFlowName(cloned.name);
    setSelectorOpen(false);
    flowContext?.loadFlowData?.([], []);
    toastSuccess("Flow cloned successfully");
  };

  const handleImportFlow = async (payload: unknown) => {
    const imported = await importFlowRequest(payload);

    await queryClient.invalidateQueries({ queryKey: queryKeys.flows });

    localStorage.setItem(
      "currentFlow",
      JSON.stringify({ id: imported.id, name: imported.name })
    );

    setFlowId(imported.id);
    setFlowName(imported.name);
    setSelectorOpen(false);
    flowContext?.loadFlowData?.([], []);
    toastSuccess("Flow imported successfully");
  };

  const handleLoadFlowVersions = async (targetFlowId: string): Promise<FlowVersion[]> => {
    return fetchFlowVersionsRequest(targetFlowId);
  };

  const handleRollbackFlow = async (targetFlowId: string, versionId: string) => {
    const rolledBack = await rollbackFlowRequest(targetFlowId, versionId);

    await queryClient.invalidateQueries({ queryKey: queryKeys.flows });
    await queryClient.invalidateQueries({ queryKey: queryKeys.flow(targetFlowId) });

    if (flowId === targetFlowId) {
      setFlowName(rolledBack.name);
    }

    toastSuccess("Flow rolled back successfully");
  };

  const handleRenameFlow = (name: string) => {
    if (!flowId) return;

    setFlowName(name);
    localStorage.setItem(
      "currentFlow",
      JSON.stringify({ id: flowId, name })
    );

    queryClient.invalidateQueries({ queryKey: queryKeys.flows });
    queryClient.invalidateQueries({ queryKey: queryKeys.flow(flowId) });
  };

  return (
    <>
      <FlowSelectorModal
        opened={selectorOpen && !createOpen}
        onSelectFlow={handleSelectFlow}
        onCloneFlow={handleCloneFlow}
        onImportFlow={handleImportFlow}
        onLoadFlowVersions={handleLoadFlowVersions}
        onRollbackFlow={handleRollbackFlow}
        onCreateFlow={() => {
          setSelectorOpen(false);
          setCreateOpen(true);
        }}
        onClose={() => setSelectorOpen(false)}
      />

      <CreateFlowModal
        opened={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setSelectorOpen(true);
        }}
        onCreate={handleConfirmCreateFlow}
        loading={isPending}
      />

      <ReactFlowProvider>
        <FlowProvider>
          <HomePageContent
            flowId={flowId}
            flowName={flowName}
            onOpenFlowSelector={() => setSelectorOpen(true)}
            onRenameFlow={handleRenameFlow}
          />
        </FlowProvider>
      </ReactFlowProvider>
    </>
  );
}
