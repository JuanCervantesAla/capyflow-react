import { ReactFlowProvider } from "@xyflow/react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { Sidebar } from "../components/SideBar/SideBar";
import { FlowCanvas } from "../components/Flow/Canvas/FlowCanvas";
import { FlowProvider } from "../components/Flow/context/FlowContext";
import { FlowSelectorModal } from "../components/UI/FlowSelectorModal";
import { useFlows } from "../hooks/useFlows";
import { useEffect, useState } from "react";

export function HomePage() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { flows } = useFlows();

  useEffect(() => {
    const stored = localStorage.getItem("currentFlow");
    if (stored) {
      try {
        const flow = JSON.parse(stored);
        setFlowId(flow.id);
        setFlowName(flow.name);
      } catch {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  }, []);

  const handleSelectFlow = (id: string) => {
    const flow = flows.find(f => f.id === id);
    if (!flow) return;

    localStorage.setItem("currentFlow", JSON.stringify(flow));
    setFlowId(flow.id);
    setFlowName(flow.name);
    setModalOpen(false);
  };

  const handleCreateFlow = () => {
    setModalOpen(false);
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
                onOpenFlowSelector={() => setModalOpen(true)}
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
    </>
  );
}
