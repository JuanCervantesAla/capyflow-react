import { Group, Text, UnstyledButton, Avatar, Menu, Tooltip } from "@mantine/core";
import {
  IconPlayerPlay,
  IconDeviceFloppy,
  IconDownload,
  IconSettings,
  IconUser,
  IconChevronDown,
  IconPalette,
  IconLogout,
  IconSparkles,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { ActionButton } from "../UI/ActionButton";
import { IconButton } from "../UI/IconButton";
import { useTheme } from "../../theme/ThemeContext";
import { useState } from 'react';
import { Modal, Button } from '@mantine/core';
import { useUsers } from '../../hooks/useUsers';

interface HeaderBarProps {
  workflowName?: string;
  onRun?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
}

export function HeaderBar({
  workflowName = "Untitled Workflow",
  onRun = () => {},
  onSave = () => {},
  onExport = () => {},
  onSettings = () => {},
}: HeaderBarProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { logout } = useUsers();
  const [opened, setOpened] = useState(false);

  const handleLogout = () => {
    setOpened(false);
    logout();
  };

  return (
    <div
      style={{
        height: 64,
        background: theme.colors.background.primary,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
      }}
    >
      <Group justify="space-between" align="center" style={{ width: "100%" }}>
        <Group gap={16}>
          <div
            style={{
              height: 64,
              background: theme.colors.background.primary,
              borderBottom: `1px solid ${theme.colors.border.primary}`,
              display: "flex",
              alignItems: "center",
              padding: "0 clamp(8px, 2vw, 32px)",
            }}
          >
            <IconSparkles size={18} color="#fff" />
          </div>
          <Text fw={600} size="md" c={theme.colors.text.primary}>
            {workflowName}
          </Text>
        </Group>

        {/* CENTER - Action Buttons */}
        <Group gap={16}>
          <ActionButton
            icon={<IconPlayerPlay size={16} />}
            label="Run"
            variant="primary"
            onClick={onRun}
          />
          <ActionButton
            icon={<IconDeviceFloppy size={16} />}
            label="Save"
            onClick={onSave}
          />
          <ActionButton
            icon={<IconDownload size={16} />}
            label="Export"
            onClick={onExport}
          />
        </Group>

        {/* RIGHT - Theme Toggle + Settings + User Menu */}
        <Group gap={16}>
          <Tooltip label={isDark ? "Tema claro" : "Tema oscuro"} withArrow>
            <UnstyledButton
              aria-label="Alternar tema"
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
                transition: "background 0.2s",
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
                  gap: 8,
                  padding: "4px 10px",
                  borderRadius: theme.borderRadius.sm,
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                }}
              >
                <Avatar
                  size={24}
                  radius="xl"
                  style={{
                    background: theme.colors.accent.primary,
                  }}
                >
                  <IconUser size={14} color="#fff" />
                </Avatar>
                <IconChevronDown size={14} color={theme.colors.text.secondary} />
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius.sm,
              }}
            >
              <Menu.Item leftSection={<IconUser size={14} />}>Profile</Menu.Item>
              <Menu.Item leftSection={<IconPalette size={14} />}>Theme</Menu.Item>
              <Menu.Divider style={{ borderColor: theme.colors.border.primary }} />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={() => setOpened(true)}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="¿Seguro que quieres salir?"
                centered
              >
                <p>Todo proceso sin guardar se perderá.</p>
                <Button color="red" onClick={handleLogout} style={{ marginRight: 8 }}>
                  Sí, salir
                </Button>
                <Button variant="outline" onClick={() => setOpened(false)}>
                  Cancelar
                </Button>
              </Modal>
        </Group>
      </Group>
    </div>
  );
}