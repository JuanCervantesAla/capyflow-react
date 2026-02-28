import {
  Group,
  Text,
  UnstyledButton,
  Avatar,
  Menu,
  Modal,
  Button,
} from "@mantine/core";
import {
  IconUser,
  IconChevronDown,
  IconLogout,
  IconKey,
  IconArrowLeft,
  IconChartBar,
} from "@tabler/icons-react";
import { useTheme } from "../../theme/ThemeContext";
import { useUsers } from "../../hooks/useUsers";
import { useNavigate } from "react-router-dom";
import miLogo from '../../assets/logo_orange.png';
import { useState } from "react";

export function ProfileHeader() {
  const { theme } = useTheme();
  const { logout, user } = useUsers();
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);

  const handleLogout = () => {
    setOpened(false);
    logout();
  };

  return (
    <div
      style={{
        height: 56,
        background: "#000000",
        borderBottom: "3px solid #222222",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
      }}
    >
      <Group justify="space-between" align="center" w="100%" wrap="nowrap">
        <Group gap={0} wrap="nowrap" style={{ minWidth: 0 }}>
          <Group gap={5} wrap="nowrap" px={8}>
            <img src={miLogo} style={{ width: 33, height: 33 }} alt="Logo" />
            <Text
              fw={900}
              size="20px"
              c="#E8950C"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.5px',
              }}
            >
              CapyFlow
            </Text>
          </Group>

          <div style={{ 
            width: 2, 
            height: 40, 
            background: "#222222" 
          }} />

          <Group gap={8} wrap="nowrap" px={16}>
            <IconUser size={16} color="#999999" />
            <Text
              fw={400}
              size="13px"
              c="#999999"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              Profile
            </Text>
          </Group>

          <div style={{ 
            width: 2, 
            height: 40, 
            background: "#333333" 
          }} />
        </Group>

        <Group gap={0} wrap="nowrap">
          <UnstyledButton
            onClick={() => navigate('/')}
            style={{
              height: 56,
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 0,
              background: "transparent",
              border: "none",
              color: "#AAAAAA",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(232, 149, 12, 0.1)";
              e.currentTarget.style.color = "#E8950C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#AAAAAA";
            }}
          >
            <IconArrowLeft size={16} />
            Back to Editor
          </UnstyledButton>

          <div style={{ 
            width: 2, 
            height: 40, 
            background: "#333333",
            marginLeft: 16,
            marginRight: 8,
          }} />

          <Menu shadow="md" width={200} position="bottom-end" offset={8}>
            <Menu.Target>
              <UnstyledButton
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 6px 4px 4px",
                  borderRadius: 4,
                  background: "transparent",
                  border: "1px solid #333333",
                  marginLeft: 8,
                }}
              >
                <Avatar
                  size={28}
                  radius="xl"
                  style={{ background: theme.colors.accent.primary }}
                >
                  {user?.name?.[0]?.toUpperCase() ?? <IconUser size={14} color="#fff" />}
                </Avatar>
                <IconChevronDown size={12} color="#666666" />
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                background: "#1a1a1a",
                border: "1px solid #333333",
                borderRadius: 8,
              }}
            >
              <Menu.Item 
                leftSection={<IconUser size={16} />}
                style={{ color: "#FFFFFF" }}
              >
                Profile
              </Menu.Item>
              <Menu.Item 
                leftSection={<IconChartBar size={16} />}
                onClick={() => navigate('/analytics')}
                style={{ color: "#E8950C" }}
              >
                Analytics
              </Menu.Item>
              <Menu.Divider style={{ borderColor: "#333333" }} />
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                color="red"
                onClick={() => setOpened(true)}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Are you sure you want to exit?"
        centered
        styles={{
          content: {
            background: "#1a1a1a",
            border: "1px solid #333333",
          },
          header: {
            background: "#1a1a1a",
            borderBottom: "1px solid #333333",
          },
          title: {
            color: "#FFFFFF",
          },
          body: {
            color: "#AAAAAA",
          },
        }}
      >
        <p>All unsaved progress will be lost.</p>
        <Group mt="md">
          <Button 
            color="red" 
            onClick={handleLogout}
            style={{
              background: "#e03131",
              border: "none",
            }}
          >
            Yes, exit
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setOpened(false)}
            style={{
              borderColor: "#333333",
              color: "#AAAAAA",
            }}
          >
            Cancel
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
