import { useState } from "react";
import { Collapse, Stack, UnstyledButton, Text, Group } from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import { useTheme } from "../../theme/ThemeContext";

interface DropdownSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string;
}

export function DropdownSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  color,
}: DropdownSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { theme } = useTheme();
  const categoryColor = color || theme.colors.text.secondary;

  return (
    <div style={{ marginBottom: 8 }}>
      <UnstyledButton
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "10px 0",
          background: "transparent",
          transition: "all 0.15s ease",
          borderBottom: `1px solid #D4D4D4`,
          marginBottom: 4,
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap={8}>
            <span style={{ 
              display: "flex", 
              alignItems: "center",
              color: categoryColor,
              fontSize: 10,
            }}>
              {icon}
            </span>
            <Text 
              size="13px"
              fw={700}
              c={categoryColor}
              style={{
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                fontFamily: 'monospace',
              }}
            >
              {title}
            </Text>
          </Group>
          {isOpen ? (
            <IconMinus size={12} color={theme.colors.text.tertiary} />
          ) : (
            <IconPlus size={12} color={theme.colors.text.tertiary} />
          )}
        </Group>
      </UnstyledButton>

      <Collapse in={isOpen}>
        <Stack gap={2} style={{ marginTop: 8, paddingLeft: 0, marginBottom: 8 }}>
          {children}
        </Stack>
      </Collapse>
    </div>
  );
}