import {
  Group,
  Text,
  UnstyledButton,
  Avatar,
  Menu,
  Tooltip,
  Modal,
  Button,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconDeviceFloppy,
  IconDownload,
  IconSettings,
  IconUser,
  IconChevronDown,
  IconPalette,
  IconLogout,
  IconMoon,
  IconSun,
  IconPencil,
  IconFolderOpen,
} from "@tabler/icons-react";
import { ActionButton } from "../UI/ActionButton";
import { IconButton } from "../UI/IconButton";
import { useTheme } from "../../theme/ThemeContext";
import { useUsers } from "../../hooks/useUsers";
import { useMediaQuery } from "@mantine/hooks";
import miLogo from '../../assets/logo.png';
import { useState, useEffect } from "react";

interface HeaderBarProps {
  workflowName?: string;
  onRun?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  onOpenFlowSelector?: () => void;
}

export function HeaderBar({
  workflowName = "Untitled Workflow",
  onRun = () => {},
  onSave = () => {},
  onExport = () => {},
  onSettings = () => {},
  onOpenFlowSelector,
}: HeaderBarProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { logout } = useUsers();
  const [opened, setOpened] = useState(false);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(workflowName);

  useEffect(() => {
    setTitle(workflowName);
  }, [workflowName]);


  const isMobile = useMediaQuery("(max-width: 900px)");

  const handleLogout = () => {
    setOpened(false);
    logout();
  };
  const renderActionButton = (
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
    variant?: "primary" | "secondary"
  ) => {
    if (isMobile) {
      return (
        <UnstyledButton
          onClick={onClick}
          style={{
            width: 36,
            height: 36,
            borderRadius: theme.borderRadius.sm,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              variant === "primary"
                ? theme.colors.accent.primary
                : theme.colors.background.secondary,
            border: `1px solid ${
              variant === "primary"
                ? theme.colors.accent.primary
                : theme.colors.border.primary
            }`,
            color:
              variant === "primary"
                ? "#fff"
                : theme.colors.text.secondary,
          }}
        >
          {icon}
        </UnstyledButton>
      );
    }

    return (
      <ActionButton icon={icon} variant={variant} onClick={onClick}>
        {label}
      </ActionButton>
    );
  };

  return (
    <div
      style={{
        height: 64,
        background: theme.colors.background.primary,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        display: "flex",
        alignItems: "center",
        padding: isMobile ? "0 10px" : "0 28px",
      }}
    >
      <Group justify="space-between" align="center" w="100%" wrap="nowrap">
        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: theme.colors.background.secondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${theme.colors.border.primary}`,
              flexShrink: 0,
            }}
          >
            <img src={miLogo} style={{ width: 36, height: 36 }} alt="Logo" />
          </div>
          {!editing ? (
            <Text
              fw={600}
              size="md"
              c={theme.colors.text.primary}
              style={{
                maxWidth: isMobile ? 120 : 260,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "default",
              }}
              onDoubleClick={() => setEditing(true)}
            >
              {title}
            </Text>
          ) : (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              style={{
                height: 26,
                fontWeight: 600,
                borderRadius: 6,
                border: `1px solid ${theme.colors.border.primary}`,
                background: theme.colors.background.secondary,
                padding: "0 6px",
                color: theme.colors.text.primary,
              }}
            />
          )}
          <UnstyledButton
            onClick={() => setEditing(true)}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.colors.text.secondary,
            }}
          >
            <IconPencil size={18} />
          </UnstyledButton>
        </Group>
        <Group gap={8} wrap="nowrap">
          {onOpenFlowSelector && (
            <Tooltip label="Cambiar flujo" withArrow>
              {renderActionButton(
                <IconFolderOpen size={16} />,
                "Flujos",
                onOpenFlowSelector
              )}
            </Tooltip>
          )}

          {renderActionButton(
            <IconPlayerPlay size={16} />,
            "Run",
            onRun,
            "primary"
          )}

          {renderActionButton(
            <IconDeviceFloppy size={16} />,
            "Save",
            onSave
          )}

          {renderActionButton(
            <IconDownload size={16} />,
            "Export",
            onExport
          )}
        </Group>
        <Group gap={8} wrap="nowrap">
          <Tooltip label={isDark ? "Tema claro" : "Tema oscuro"} withArrow>
            <UnstyledButton
              onClick={toggleTheme}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: theme.borderRadius.sm,
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
              }}
            >
              {isDark ? (
                <IconSun size={18} color={theme.colors.accent.primary} />
              ) : (
                <IconMoon size={18} color={theme.colors.accent.primary} />
              )}
            </UnstyledButton>
          </Tooltip>

          <IconButton icon={<IconSettings size={18} />} onClick={onSettings} />

          <Menu shadow="lg" width={180} position="bottom-end" offset={8}>
            <Menu.Target>
              <UnstyledButton
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 6px",
                  borderRadius: theme.borderRadius.sm,
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                }}
              >
                <Avatar
                  size={24}
                  radius="xl"
                  style={{ background: theme.colors.accent.primary }}
                >
                  <IconUser size={14} color="#fff" />
                </Avatar>
                <IconChevronDown
                  size={12}
                  color={theme.colors.text.secondary}
                />
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius.sm,
              }}
            >
              <Menu.Item leftSection={<IconUser size={14} />}>
                Profile
              </Menu.Item>
              <Menu.Item leftSection={<IconPalette size={14} />}>
                Theme
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={() => setOpened(true)}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="¿Seguro que quieres salir?"
          centered
        >
          <p>Todo proceso sin guardar se perderá.</p>
          <Button color="red" onClick={handleLogout} mr={8}>
            Sí, salir
          </Button>
          <Button variant="outline" onClick={() => setOpened(false)}>
            Cancelar
          </Button>
        </Modal>
      </Group>
    </div>
  );
}