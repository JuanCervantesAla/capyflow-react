import { useState } from "react";
import { Card, Stack, Collapse, UnstyledButton, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { getIconComponent } from "../../utils/iconLoader";

interface DropdownProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
}

export function Dropdown({ title, children, defaultOpen = false, icon }: DropdownProps) {
  const [opened, setOpened] = useState(defaultOpen);
  const IconComponent = icon ? (getIconComponent(icon) as React.ComponentType<{ size?: number; color?: string }>) : null;

  return (
    <Card
      withBorder
      shadow="sm"
      p={0}
      radius="md"
      style={{
        background: "#1A1A2E",
        border: "1px solid #2D2D52",
        overflow: "hidden",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#7C3AED66";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(124, 58, 237, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2D2D52";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        style={{
          width: "100%",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: opened 
            ? "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)"
            : "transparent",
          transition: "all 0.2s ease",
          borderBottom: opened ? "1px solid #2D2D52" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {IconComponent && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: opened ? "#7C3AED" : "#25254A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              <IconComponent size={18} color={opened ? "#fff" : "#A78BFA"} />
            </div>
          )}
          <Text
            fw={600}
            size="sm"
            style={{
              color: opened ? "#A78BFA" : "#9CA3AF",
              transition: "color 0.2s ease",
            }}
          >
            {title}
          </Text>
        </div>

        <IconChevronDown
          size={18}
          style={{
            color: opened ? "#7C3AED" : "#6B7280",
            transform: opened ? "rotate(180deg)" : "rotate(0deg)",
            transition: "all 0.25s ease",
          }}
        />
      </UnstyledButton>

      <Collapse in={opened} transitionDuration={250}>
        <Stack gap="xs" p="sm" style={{ background: "#0F0F1A" }}>
          {children}
        </Stack>
      </Collapse>
    </Card>
  );
}