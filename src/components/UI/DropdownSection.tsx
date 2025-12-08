// import { useState } from "react";
// import { Collapse, Group, Stack } from "@mantine/core";
// import { IconChevronDown } from "@tabler/icons-react";
// import { theme } from "../../theme/Constants";

// interface DropdownSectionProps {
//   title: string;
//   icon: React.ReactNode;
//   children: React.ReactNode;
//   defaultOpen?: boolean;
// }

// export function DropdownSection({ 
//   title, 
//   icon, 
//   children, 
//   defaultOpen = false 
// }: DropdownSectionProps) {
//   const [isOpen, setIsOpen] = useState(defaultOpen);

//   return (
//     <div>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         style={{
//           width: "100%",
//           padding: "10px 12px",
//           background: isOpen 
//             ? `linear-gradient(135deg, ${theme.colors.background.tertiary} 0%, ${theme.colors.background.secondary} 100%)`
//             : "transparent",
//           border: `1px solid ${theme.colors.border.primary}`,
//           borderRadius: theme.borderRadius.sm,
//           color: theme.colors.text.primary,
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           fontSize: 14,
//           fontWeight: 600,
//           transition: "all 0.2s ease",
//         }}
//       >
//         <Group spacing="xs">
//           <span style={{ 
//             display: "flex", 
//             alignItems: "center",
//             color: theme.colors.accent.primary,
//           }}>
//             {icon}
//           </span>
//           <span>{title}</span>
//         </Group>
//         <span style={{ 
//           display: "flex", 
//           alignItems: "center",
//           transition: "transform 0.2s ease",
//           transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
//         }}>
//           <IconChevronDown size={16} />
//         </span>
//       </button>

//       <Collapse in={isOpen}>
//         <Stack spacing="xs" style={{ marginTop: theme.spacing.sm }}>
//           {children}
//         </Stack>
//       </Collapse>
//     </div>
//   );
// }

import { useState } from "react";
import { Collapse, Stack, UnstyledButton, Text, Group } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useTheme } from "../../theme/themeContext";

interface DropdownSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function DropdownSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false 
}: DropdownSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { theme } = useTheme();

  return (
    <div>
      <UnstyledButton
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: isOpen ? theme.colors.background.tertiary : "transparent",
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius.sm,
          transition: "all 0.2s ease",
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap={8}>
            <span style={{ 
              display: "flex", 
              alignItems: "center",
              color: theme.colors.accent.primary,
            }}>
              {icon}
            </span>
            <Text size="sm" fw={600} c={theme.colors.text.primary}>
              {title}
            </Text>
          </Group>
          <IconChevronDown 
            size={16} 
            style={{
              transition: "transform 0.2s ease",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              color: theme.colors.text.secondary,
            }}
          />
        </Group>
      </UnstyledButton>

      <Collapse in={isOpen}>
        <Stack gap={8} style={{ marginTop: 8, paddingLeft: 4 }}>
          {children}
        </Stack>
      </Collapse>
    </div>
  );
}