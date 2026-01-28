import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState, useContext } from "react";
import { FlowProvider, FlowContext } from "../components/Flow/context/FlowContext";
import { FlowSelectorModal } from "../components/UI/FlowSelectorModal";
import { CreateFlowModal } from "../components/UI/CreateFlowModal";
import { useFlows } from "../hooks/useFlows";
import { useCreateFlow } from "../hooks/mutations/Flow/useCreateFlow";
import { HomePageContent } from "./HomePageContent";

export function HomePage() {
  const [flowId, setFlowId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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

  const handleConfirmCreateFlow = async (name: string) => {
    const newFlow = await createFlow({ name, description: "" });

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

  return (
    <>
      <FlowSelectorModal
        opened={selectorOpen && !createOpen}
        onSelectFlow={handleSelectFlow}
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
          />
        </FlowProvider>
      </ReactFlowProvider>
    </>
  );
}
