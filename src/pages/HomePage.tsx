import { ReactFlowProvider } from "@xyflow/react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { Sidebar } from "../components/SideBar/SideBar";
import { FlowCanvas } from "../components/Flow/Canvas/FlowCanvas";
import { FlowProvider, FlowContext } from "../components/Flow/context/FlowContext";
import { FlowSelectorModal } from "../components/UI/FlowSelectorModal";
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
  const { mutate: saveFlow, isPending } = useSaveFlow();
  
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

    saveFlow(
      { flowId, nodes, edges },
      {
        onSuccess: () => {
          showNotification({
            title: "Guardado exitoso",
            message: "El flujo se ha guardado correctamente",
            color: "green",
          });
        },
        onError: (error) => {
          showNotification({
            title: "❌ Error",
            message: error.message || "No se pudo guardar el flujo",
            color: "red",
          });
        },
      }
    );
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
  const [modalOpen, setModalOpen] = useState(false);

  const { data: flows = [] } = useFlows();
  const { mutateAsync: createFlow } = useCreateFlow();

  const flowContext = useContext(FlowContext);

  useEffect(() => {
    const stored = localStorage.getItem("currentFlow");
    if (!stored) {
      setModalOpen(true);
      return;
    }

    try {
      const flow = JSON.parse(stored);
      setFlowId(flow.id);
      setFlowName(flow.name);
    } catch {
      setModalOpen(true);
    }
  }, []);

  const handleSelectFlow = (id: string) => {
    const flow = flows.find((f) => f.id === id);
    if (!flow) return;

    localStorage.setItem("currentFlow", JSON.stringify({ id: flow.id, name: flow.name }));
    setFlowId(flow.id);
    setFlowName(flow.name);
    setModalOpen(false);
  };

  const handleCreateFlow = async () => {
    const name = prompt("Nombre del nuevo flujo:");
    if (!name) return;

    const newFlow = await createFlow({ name, description: "" });

    localStorage.setItem("currentFlow", JSON.stringify({ id: newFlow.id, name: newFlow.name }));
    setFlowId(newFlow.id);
    setFlowName(newFlow.name);
    setModalOpen(false);

    flowContext?.loadFlowData?.([], []);
  };

  return (
    <>
      <FlowSelectorModal
        opened={modalOpen}
        onSelectFlow={handleSelectFlow}
        onCreateFlow={handleCreateFlow}
      />

      <ReactFlowProvider>
        <FlowProvider>
          <HomePageContent
            flowId={flowId}
            flowName={flowName}
            onOpenFlowSelector={() => setModalOpen(true)}
          />
        </FlowProvider>
      </ReactFlowProvider>
    </>
  );
}