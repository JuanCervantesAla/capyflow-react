// HomePage.tsx
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { Sidebar } from "../components/SideBar/SideBar"
import { FlowCanvas } from "../components/Flow/Canvas/FlowCanvas";
import { FlowProvider } from "../components/Flow/context/FlowContext";

export function HomePage() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <FlowProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 250,
          breakpoint: 'sm',
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
          />
        </AppShell.Header>

        <AppShell.Navbar p={0}>
          <Sidebar />
        </AppShell.Navbar>

        <AppShell.Main
          style={{
            height: "calc(100vh - 60px)",
            overflow: "hidden",
          }}
        >
          <FlowCanvas />
        </AppShell.Main>
      </AppShell>
    </FlowProvider>
  );
}