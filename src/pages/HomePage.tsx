import { ReactFlowProvider } from "@xyflow/react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { Sidebar } from "../components/SideBar/SideBar";
import { FlowCanvas } from "../components/Flow/Canvas/FlowCanvas";
import { FlowProvider, FlowContext } from "../components/Flow/context/FlowContext";
import { FlowSelectorModal } from "../components/UI/FlowSelectorModal";
import { useFlows } from "../hooks/useFlows";
import { useEffect, useState, useContext } from "react";
import { showNotification } from "@mantine/notifications";

function HomePageContent({ flowId, flowName, onOpenFlowSelector }: any) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { saveFlow } = useContext(FlowContext);

  const handleSave = async () => {
    try {
      await saveFlow();
      showNotification({
        title: "Guardado exitoso",
        message: "El flujo se ha guardado correctamente",
        color: "green",
      });
    } catch (error) {
      console.error("Error saving flow:", error);
      showNotification({
        title: "Error",
        message: "No se pudo guardar el flujo",
        color: "red",
      });
    }
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
        {flowId && <FlowCanvas flowId={flowId} />}
      </AppShell.Main>
    </AppShell>
  );
}

export function HomePage() {
  const [flowId, setFlowId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { flows, createFlow, saveFlowData, loadFlow } = useFlows();
  const [flowContext, setFlowContext] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentFlow");
    if (stored) {
      try {
        const flow = JSON.parse(stored);
        setFlowId(flow.id);
        setFlowName(flow.name);
        loadFlowFromBackend(flow.id);
      } catch {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  }, []);

  const loadFlowFromBackend = async (id: string) => {
    try {
      const flowData = await loadFlow(id);
      if (flowContext?.loadFlowData) {
        flowContext.loadFlowData(flowData.nodes || [], flowData.edges || []);
      }
    } catch (error) {
      console.error("Error loading flow:", error);
    }
  };

  const handleSelectFlow = async (id: string) => {
    const flow = flows.find(f => f.id === id);
    if (!flow) return;

    localStorage.setItem("currentFlow", JSON.stringify(flow));
    setFlowId(flow.id);
    setFlowName(flow.name);
    setModalOpen(false);
    await loadFlowFromBackend(flow.id);
  };

  const handleCreateFlow = async () => {
    const flowName = prompt("Nombre del nuevo flujo:");
    if (!flowName) return;

    try {
      const newFlow = await createFlow(flowName, "");
      
      localStorage.setItem("currentFlow", JSON.stringify(newFlow));
      setFlowId(newFlow.id);
      setFlowName(newFlow.name);
      setModalOpen(false);
      if (flowContext?.loadFlowData) {
        flowContext.loadFlowData([], []);
      }
    } catch (error) {
      console.error("Error creating flow:", error);
      alert("Error al crear el flujo");
    }
  };

  const handleSaveFlow = async (nodes: any[], edges: any[]) => {
    if (!flowId) return;
    
    try {
      await saveFlowData(flowId, nodes, edges);
    } catch (error) {
      console.error("Error saving flow data:", error);
      throw error;
    }
  };

  return (
    <>
      <FlowSelectorModal
        opened={modalOpen}
        onSelectFlow={handleSelectFlow}
        onCreateFlow={handleCreateFlow}
      />

      <ReactFlowProvider>
        <FlowProvider flowId={flowId} onSave={handleSaveFlow}>
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