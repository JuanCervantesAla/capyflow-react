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
  IconPlayerPlay,
  IconDeviceFloppy,
  IconDownload,
  IconShare3,
  IconUser,
  IconChevronDown,
  IconLogout,
  IconEdit,
  IconFolderOpen,
  IconWand,
  IconSparkles,
  IconChartBar,
} from "@tabler/icons-react";
import { useTheme } from "../../theme/ThemeContext";
import { useUsers } from "../../hooks/useUsers";
import { useNavigate } from "react-router-dom";
import miLogo from '../../assets/logo_orange.png';
import { useState, useEffect } from "react";

interface HeaderBarProps {
  workflowName?: string;
  onRun?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  onOpenFlowSelector?: () => void;
  onAIGenerate?: () => void;
  onAIRepair?: () => void;
}

export function HeaderBar({
  workflowName = "Untitled Workflow",
  onRun = () => {},
  onSave = () => {},
  onExport = () => {},
  onShare = () => {},
  onOpenFlowSelector,
  onAIRepair,
  onAIGenerate,
}: HeaderBarProps) {
  const { theme } = useTheme();
  const { logout, user } = useUsers();
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(workflowName);

  useEffect(() => {
    setTitle(workflowName);
  }, [workflowName]);

  const handleLogout = () => {
    setOpened(false);
    logout();
  };

  return (
    <div
      style={{
        height: 56,
        background: "#000000",
        borderBottom: "3px solid #000000",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
      }}
    >
      <Group justify="space-between" align="center" w="100%" wrap="nowrap">
        <Group gap={0} wrap="nowrap" style={{ minWidth: 0 }}>
          {/* <Group gap={10} wrap="nowrap" px={16}>
            <img src={miLogo} style={{ width: 28, height: 28 }} alt="Logo" />
          </Group> */}

          {/* <div style={{ 
            width: 2, 
            height: 40, 
            background: "#222222" 
          }} /> */}

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

          {!editing ? (
            <Group gap={8} wrap="nowrap" px={16}>
              <Text
                fw={400}
                size="13px"
                c="#999999"
                style={{
                  maxWidth: 200,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {title}
              </Text>
              <UnstyledButton
                onClick={() => setEditing(true)}
                style={{
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666666",
                  opacity: 0.9,
                }}
              >
                <IconEdit size={13} />
              </UnstyledButton>
            </Group>
          ) : (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              style={{
                height: 32,
                fontWeight: 500,
                fontSize: 14,
                borderRadius: 4,
                border: "1px solid #333333",
                background: "#1a1a1a",
                padding: "0 8px",
                color: "#FFFFFF",
                minWidth: 200,
              }}
            />
          )}
          <div style={{ 
            width: 2, 
            height: 40, 
            background: "#333333" 
          }} />
        </Group>

        <Group gap={0} wrap="nowrap">
          {onAIRepair && (
            <UnstyledButton
              onClick={onAIRepair}
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
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#AAAAAA";
              }}
            >
              <IconWand size={16} />
              Fix
            </UnstyledButton>
          )}

          {onAIGenerate && (
            <UnstyledButton
              onClick={onAIGenerate}
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
              <IconSparkles size={16} />
              AI
            </UnstyledButton>
          )}

          {onOpenFlowSelector && (
            <UnstyledButton
              onClick={onOpenFlowSelector}
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
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#AAAAAA";
              }}
            >
              <IconFolderOpen size={16} />
              Flows
            </UnstyledButton>
          )}

          <UnstyledButton
            onClick={onSave}
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
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#AAAAAA";
            }}
          >
            <IconDeviceFloppy size={16} />
            Save
          </UnstyledButton>

          <UnstyledButton
            onClick={onExport}
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
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#AAAAAA";
            }}
          >
            <IconDownload size={16} />
            Export
          </UnstyledButton>

          <UnstyledButton
            onClick={onShare}
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
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#AAAAAA";
            }}
          >
            <IconShare3 size={16} />
            Share
          </UnstyledButton>

          <div style={{ 
            width: 2, 
            height: 40, 
            background: "#333333",
            marginLeft: 8,
            marginRight: 8,
          }} />

          <UnstyledButton
            onClick={onRun}
            style={{
              height: 36,
              padding: "0 18px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 4,
              background: '#E8950C',
              border: 'none',
              color: '#000000',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D68508';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#E8950C';
            }}
          >
            <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
              <IconPlayerPlay size={12} fill="#000" stroke="#000" strokeWidth={0} />
              <IconPlayerPlay size={12} fill="#000" stroke="#000" strokeWidth={0} />
            </div>
            Run
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
                style={{ color: "#FFFFFF" }}
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
      >
        <p>All unsaved progress will be lost.</p>
        <Group mt="md">
          <Button color="red" onClick={handleLogout}>
            Yes, exit
          </Button>
          <Button variant="outline" onClick={() => setOpened(false)}>
            Cancel
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
