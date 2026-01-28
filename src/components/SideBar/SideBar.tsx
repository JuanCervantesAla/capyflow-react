import {
  Stack,
  Title,
  ScrollArea,
  Loader,
  Text,
  ActionIcon,
  Group,
  Box,
} from "@mantine/core";
import { useMemo } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useFlowActions } from "../Flow/context/FlowActionsContext";
import { useReactFlow } from "@xyflow/react";
import { useTheme } from "../../theme/ThemeContext";
import { ActionButton } from "../UI/ActionButton";
import { DropdownSection } from "../UI/DropdownSection";
import { useNodeTypes } from "../../hooks/useNodeTypes";
import { getIconComponent } from "../../utils/iconLoader";

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 48;

export function Sidebar({ onToggleCollapse, isCollapsed ,}: { onToggleCollapse: () => void; isCollapsed: boolean }) {
  const { addNode } = useFlowActions();
  const { theme } = useTheme();
  const reactFlow = useReactFlow();
  const { data: nodeTypes, isLoading, error } = useNodeTypes();

  /* ------------------ Agrupar nodos ------------------ */
  const groupedNodeTypes = useMemo(() => {
    if (!nodeTypes) return {};
    return nodeTypes.reduce((acc, nodeType) => {
      const category = nodeType.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(nodeType);
      return acc;
    }, {} as Record<string, typeof nodeTypes>);
  }, [nodeTypes]);

  const addAndCenter = (nodeData: any) =>
    addNode(nodeData, "custom", (node) => {
      reactFlow.setCenter(node.position.x, node.position.y, { zoom: 1 });
    });

  /* ------------------ CONTENIDO ------------------ */
  const content = () => {
    if (isLoading) {
      return (
        <Box h="100%" display="flex" style={{ alignItems: "center", justifyContent: "center" }}>
          <Loader size="sm" />
        </Box>
      );
    }

    if (error) {
      return (
        <Box p="md">
          <Text c="red" size="sm">Error loading node types</Text>
        </Box>
      );
    }

    return (
      <ScrollArea h="100%">
        <Box px="md" pb="md">
          <Stack gap="lg">
            <Group justify="space-between">
              <Title
                order={5}
                style={{
                  color: theme.colors.text.accent,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Nodes
              </Title>
            </Group>

            {Object.entries(groupedNodeTypes).map(([category, types]) => {
              const categoryColor =
                {
                  trigger: theme.colors.accent.primary,
                  ai: theme.colors.accent.cyan,
                  data: theme.colors.accent.tertiary,
                  logic: theme.colors.accent.primary,
                  io: theme.colors.accent.tertiary,
                  integration: theme.colors.accent.tertiary,
                }[category.toLowerCase()] || theme.colors.text.accent;

              const IconComponent = getIconComponent(types[0]?.icon || "IconBolt");

              return (
                <DropdownSection
                  key={category}
                  title={category}
                  icon={<IconComponent size={18} color={categoryColor} />}
                  defaultOpen={category.toLowerCase() === "trigger"}
                >
                  {types.map((nodeType) => {
                    const Icon = getIconComponent(nodeType.icon || "IconBolt");
                    return (
                      <ActionButton
                        key={nodeType.id}
                        icon={<Icon size={16} />}
                        onClick={() =>
                          addAndCenter({
                            label: nodeType.name,
                            subtitle: nodeType.category,
                            icon: nodeType.icon,
                            color: nodeType.color,
                            category: nodeType.category,
                            description: nodeType.description,
                            nodeTypeId: nodeType.id,
                            type: nodeType.type,
                          })
                        }
                        aria-label={nodeType.description}
                      >
                        {nodeType.name}
                      </ActionButton>
                    );
                  })}
                </DropdownSection>
              );
            })}
          </Stack>
        </Box>
      </ScrollArea>
    );
  };

  /* ------------------ SIDEBAR ------------------ */
  return (
    <Box
      style={{
        width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        transition: "width 0.25s ease",
        background: theme.colors.background.primary,
        borderRight: `1px solid ${theme.colors.border.primary}`,
        position: "relative",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Botón colapsar */}
      <ActionIcon
        variant="subtle"
        size="sm"
        onClick={onToggleCollapse}
        style={{
          position: "absolute",
          top: 12,
          right: isCollapsed ? 8 : 12,
          zIndex: 10,
        }}
      >
        {isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
      </ActionIcon>

      {/* Contenido */}
      {!isCollapsed && content()}
    </Box>
  );
}
