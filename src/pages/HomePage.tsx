import { ReactFlowProvider } from "@xyflow/react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { Sidebar } from "../components/SideBar/SideBar";
import { FlowCanvas } from "../components/Flow/Canvas/FlowCanvas";
import { FlowProvider, FlowContext } from "../components/Flow/context/FlowContext";
import { FlowSelectorModal } from "../components/UI/FlowSelectorModal";
import { CreateFlowModal } from "../components/UI/CreateFlowModal";
import { useFlows } from "../hooks/useFlows";
import { useFlow } from "../hooks/useFlow";
import { useCreateFlow } from "../hooks/mutations/Flow/useCreateFlow";
import { useSaveFlow } from "../hooks/mutations/Flow/useSaveFlow";
import { useEffect, useState, useContext } from "react";
import { showNotification } from "@mantine/notifications";

function HomePageContent({ flowId, flowName, onOpenFlowSelector }: any) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { nodes, edges, loadFlowData } = useContext(FlowContext);
  const { mutate: saveFlow } = useSaveFlow();
  const { data: flowData, isLoading } = useFlow(flowId);

  useEffect(() => {
    if (flowData?.nodes && flowData?.edges) {
      loadFlowData(flowData.nodes, flowData.edges);
    }
  }, [flowData, loadFlowData]);

  const handleSave = () => {
    if (!flowId) {
      showNotification({
        title: "Error",
        message: "No hay un flujo seleccionado",
        color: "red",
      });
      return;
    }

    saveFlow({ flowId, nodes, edges });
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding={0}
    >
      <AppShell.Header>
        <HeaderBar
          workflowName={flowName}
          onOpenFlowSelector={onOpenFlowSelector}
          onSave={handleSave}
        />
      </AppShell.Header>

      <AppShell.Navbar p={0}>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main style={{ height: "calc(100vh - 60px)", overflow: "hidden" }}>
        {!isLoading && flowId && <FlowCanvas />}
      </AppShell.Main>
    </AppShell>
  );
}

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
    const flow = flows.find((f) => f.id === id);
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
