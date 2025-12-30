import { ReactFlowProvider } from "@xyflow/react";
import {
  AppShell,
  Modal,
  Button,
  TextInput,
  Select,
  Stack,
  Divider,
  Text
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { Sidebar } from "../components/SideBar/SideBar";
import { FlowCanvas } from "../components/Flow/Canvas/FlowCanvas";
import { FlowProvider } from "../components/Flow/context/FlowContext";
import { FlowContext } from "../components/Flow/context/FlowContext";
import { useFlows } from "../hooks/useFlows";
import { useEffect, useState, useContext } from "react";

export function HomePage() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [modalOpen, setModalOpen] = useState(true);
  const [inputFlowName, setInputFlowName] = useState("");
  const [flowName, setFlowName] = useState("");
  const [flowId, setFlowId] = useState<string | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const { createFlow, fetchFlowsList, flows, saveFlowData } = useFlows();
  const { nodes, edges } = useContext(FlowContext);

  useEffect(() => {
    fetchFlowsList();
  }, []);

  useEffect(() => {
    const storedFlow = localStorage.getItem("currentFlow");
    if (storedFlow) {
      const flow = JSON.parse(storedFlow);
      setFlowName(flow.name || "");
    }
  }, [flowId]);

  const handleSelectFlow = () => {
    const flow = flows.find(f => f.id === selectedFlowId);
    if (!flow) return;

    localStorage.setItem("currentFlow", JSON.stringify(flow));
    setFlowId(flow.id);
    setFlowName(flow.name);
    setModalOpen(false);
  };

  const handleCreateFlow = async () => {
    if (!inputFlowName.trim()) return;

    const flow = await createFlow(inputFlowName, "");
    setFlowId(flow.id);
    setFlowName(flow.name);
    localStorage.setItem("currentFlow", JSON.stringify(flow));
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!flowId) return;
    await saveFlowData(flowId, nodes, edges);
  };

  return (
    <ReactFlowProvider>
      <FlowProvider>

                <Modal
          opened={modalOpen}
          onClose={() => {}}
          centered
          withCloseButton={false}
          radius="lg"
          size="sm"
          title="Gestión de flujos"
        >
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} mb={4}>Seleccionar flujo existente</Text>
              <Select
                data={flows.map(f => ({ value: f.id, label: f.name }))}
                value={selectedFlowId}
                onChange={setSelectedFlowId}
                placeholder="Selecciona un flujo"
              />
              <Button
                fullWidth
                mt="sm"
                variant="light"
                onClick={handleSelectFlow}
                disabled={!selectedFlowId}
              >
                Abrir flujo
              </Button>
            </div>

            <Divider label="o" labelPosition="center" />

            <div>
              <Text size="sm" fw={500} mb={4}>Crear nuevo flujo</Text>
              <TextInput
                value={inputFlowName}
                onChange={(e) => setInputFlowName(e.target.value)}
                placeholder="Ej. Flujo de ventas"
              />
              <Button
                fullWidth
                mt="sm"
                onClick={handleCreateFlow}
                disabled={!inputFlowName.trim()}
              >
                Crear flujo
              </Button>
            </div>
          </Stack>
        </Modal>

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
              mobileOpened={mobileOpened}
              desktopOpened={desktopOpened}
              toggleMobile={toggleMobile}
              toggleDesktop={toggleDesktop}
              workflowName={flowName}
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

      </FlowProvider>
    </ReactFlowProvider>
  );
}
