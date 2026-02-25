import { Box, Text, Group, Stack } from "@mantine/core";
import { IconBolt, IconDatabase, IconApi, IconGitBranch, IconPlayerPlay } from "@tabler/icons-react";
import { useTheme } from "../../theme/ThemeContext";

interface CategoryItem {
  name: string;
  color: string;
  icon: React.ReactNode;
}

export function TypesLegend() {
  const { theme } = useTheme();

  const categories: CategoryItem[] = [
    {
      name: "Trigger",
      color: theme.colors.accent.primary,
      icon: <IconBolt size={14} />,
    },
    {
      name: "Data",
      color: theme.colors.accent.tertiary,
      icon: <IconDatabase size={14} />,
    },
    {
      name: "I/O",
      color: theme.colors.accent.tertiary,
      icon: <IconApi size={14} />,
    },
    {
      name: "Logic",
      color: theme.colors.accent.primary,
      icon: <IconGitBranch size={14} />,
    },
    {
      name: "Control",
      color: theme.colors.accent.primary,
      icon: <IconPlayerPlay size={14} />,
    },
  ];

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <Text
        size="xs"
        fw={700}
        c={theme.colors.text.secondary}
        mb={12}
        style={{
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        Tipos
      </Text>

      <Stack gap={10}>
        {categories.map((category) => (
          <Group key={category.name} gap={10}>
            <Box
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: category.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              {category.icon}
            </Box>
            <Text size="xs" fw={500} c={theme.colors.text.primary}>
              {category.name}
            </Text>
          </Group>
        ))}
      </Stack>
    </Box>
  );
}
