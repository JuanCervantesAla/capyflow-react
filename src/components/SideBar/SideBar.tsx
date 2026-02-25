import {
  Stack,
  ScrollArea,
  Loader,
  Text,
  ActionIcon,
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

  const groupedNodeTypes = useMemo(() => {
    if (!nodeTypes) return {};
    return nodeTypes.reduce((acc, nodeType) => {
      const category = nodeType.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(nodeType);
      return acc;
    }, {} as Record<string, typeof nodeTypes>);
  }, [nodeTypes]);

  const categoryOrder = ["trigger", "data", "io", "logic", "control"];
  const sortedCategories = useMemo(() => {
    return Object.entries(groupedNodeTypes).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a[0].toLowerCase());
      const indexB = categoryOrder.indexOf(b[0].toLowerCase());
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groupedNodeTypes]);

  const addAndCenter = (nodeData: any) =>
    addNode(nodeData, "custom", (node) => {
      reactFlow.setCenter(node.position.x, node.position.y, { zoom: 1 });
    });

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
          <Text c={theme.colors.text.accent} size="sm">Error loading node types</Text>
        </Box>
      );
    }

    return (
      <ScrollArea h="100%" type="scroll">
        <Box px={16} pb="xl">
          <Stack gap={0}>
            <Box 
              py={16} 
              pb={12}
              style={{
                borderBottom: '2px solid #000000',
                marginBottom: 12,
              }}
            >
              <Text
                size="13px"
                fw={700}
                c={theme.colors.text.sidebarTitle}
                style={{
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              >
                NODES
              </Text>
            </Box>

            {sortedCategories.map(([category, types]) => {
              const categoryColor = theme.colors.category[category.toLowerCase() as keyof typeof theme.colors.category] || theme.colors.text.secondary;

              const IconComponent = getIconComponent(types[0]?.icon || "IconBolt");

              return (
                <DropdownSection
                  key={category}
                  title={category}
                  icon={<IconComponent size={14} />}
                  color={categoryColor}
                  defaultOpen={category.toLowerCase() === "trigger"}
                >
                  {types.map((nodeType) => {
                    const Icon = getIconComponent(nodeType.icon || "IconBolt");
                    return (
                      <ActionButton
                        key={nodeType.id}
                        icon={<Icon size={14} />}
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

  return (
    <Box
      style={{
        width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        transition: "width 0.25s ease",
        background: theme.colors.background.sidebar,
        borderRight: `3px solid #000000`,
        position: "relative",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ActionIcon
        variant="subtle"
        size="sm"
        onClick={onToggleCollapse}
        style={{
          position: "absolute",
          top: 12,
          right: isCollapsed ? 8 : 12,
          zIndex: 10,
          color: theme.colors.text.tertiary,
        }}
      >
        {isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
      </ActionIcon>

      {!isCollapsed && content()}
    </Box>
  );
}