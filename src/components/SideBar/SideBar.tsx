import { Stack, Title, ScrollArea, Loader, Text } from "@mantine/core"; 
import { useMemo } from "react";
import { useFlowActions } from "../Flow/context/FlowActionsContext";
import { useReactFlow } from "@xyflow/react";
import { useTheme } from "../../theme/ThemeContext";
import { ActionButton } from "../UI/ActionButton";
import { DropdownSection } from "../UI/DropdownSection";
import { useNodeTypes } from "../../hooks/useNodeTypes";
import { getIconComponent } from "../../utils/iconLoader";

export function Sidebar() {
  const { addNode } = useFlowActions();
  const { theme } = useTheme(); 
  const reactFlow = useReactFlow();
  const { data: nodeTypes, isLoading, error } = useNodeTypes();

  // Agrupar tipos de nodos por categoría
  const groupedNodeTypes = useMemo(() => {
    if (!nodeTypes) return {};
    return nodeTypes.reduce((acc, nodeType) => {
      const category = nodeType.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(nodeType);
      return acc;
    }, {} as Record<string, typeof nodeTypes>);
  }, [nodeTypes]);

  const addAndCenter = (nodeData) =>
    addNode(nodeData, "custom", (node) => {
      reactFlow.setCenter(node.position.x, node.position.y, { zoom: 1 });
    });

  if (isLoading) {
    return (
      <ScrollArea
        style={{
          height: "100%",
          background: theme.colors.background.primary,
          borderRight: `1px solid ${theme.colors.border.primary}`,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.md,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader size="md" />
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <ScrollArea
        style={{
          height: "100%",
          background: theme.colors.background.primary,
          borderRight: `1px solid ${theme.colors.border.primary}`,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.md,
          padding: "1rem",
        }}
      >
        <Text c="red" size="sm">Error loading node types</Text>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea
      style={{
        height: "100%",
        background: theme.colors.background.primary,
        borderRight: `1px solid ${theme.colors.border.primary}`,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.md,
      }}
    >
      <div style={{ padding: "0 1rem" }}>
        <Stack spacing="lg">
          <div
            style={{
              paddingBottom: theme.spacing.md,
              borderBottom: `1px solid ${theme.colors.border.primary}`,
            }}
          >
            <Title
              order={5}
              style={{
                color: theme.colors.text.accent,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              Nodes
            </Title>
          </div>

          {Object.entries(groupedNodeTypes).map(([category, types]) => {
            // Mapear categorías a colores
            const categoryColor = {
              trigger: theme.colors.accent.primary,
              ai: theme.colors.accent.cyan,
              data: theme.colors.accent.green,
              logic: theme.colors.accent.primary,
              io: theme.colors.accent.yellow,
              integration: theme.colors.accent.purple,
            }[category.toLowerCase()] || theme.colors.text.accent;

            return (
              <DropdownSection
                key={category}
                title={category.charAt(0).toUpperCase() + category.slice(1)}
                icon={
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: categoryColor,
                    }}
                  >
                    {(() => {
                      const IconComponent = getIconComponent(types[0]?.icon || "IconBolt");
                      return <IconComponent size={18} />;
                    })()}
                  </div>
                }
                defaultOpen={category.toLowerCase() === "trigger"}
                style={{
                  background: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.md,
                  padding: "0.5rem",
                  boxShadow: theme.effects.glowPurple,
                }}
              >
                {types.map((nodeType) => {
                  const IconComponent = getIconComponent(nodeType.icon || "IconBolt");
                  return (
                    <ActionButton
                      key={nodeType.id}
                      icon={<IconComponent size={16} />}
                      onClick={() =>
                        addAndCenter({
                          label: nodeType.name,
                          subtitle: nodeType.category,
                          icon: nodeType.icon || "IconBolt",
                          color: nodeType.color || "#4c6ef5",
                          description: nodeType.description,
                          nodeTypeId: nodeType.id,
                          type: nodeType.type,
                        })
                      }
                      title={nodeType.description}
                    >
                      {nodeType.name}
                    </ActionButton>
                  );
                })}
              </DropdownSection>
            );
          })}
        </Stack>
      </div>
    </ScrollArea>
  );
}
