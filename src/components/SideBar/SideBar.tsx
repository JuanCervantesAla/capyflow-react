import { Stack, Title, ScrollArea } from "@mantine/core";
import {
  IconPlayerPlay,
  IconClock,
  IconWebhook,
  IconBrain,
  IconGitBranch,
  IconRobot,
  IconBraces,
  IconGenderNeutrois,
  IconFileUpload,
} from "@tabler/icons-react";
import { useFlowActions } from "../Flow/context/FlowActionsContext";
import { useReactFlow } from "@xyflow/react";
import { useTheme } from "../../theme/ThemeContext";
import { ActionButton } from "../UI/ActionButton";
import { DropdownSection } from "../UI/DropdownSection";

export function Sidebar() {
  const { addNode } = useFlowActions();
  const { theme } = useTheme(); 
  const reactFlow = useReactFlow();

  const addAndCenter = (nodeData) =>
    addNode(nodeData, "custom", (node) => {
      reactFlow.setCenter(node.position.x, node.position.y, { zoom: 1 });
    });

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

          <DropdownSection
            title="Trigger"
            icon={
              <IconGenderNeutrois
                size={18}
                color={theme.colors.text.accent}
              />
            }
            defaultOpen
            style={{
              background: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.md,
              padding: "0.5rem",
              boxShadow: theme.effects.glowPurple,
            }}
          >
            <ActionButton
              icon={<IconPlayerPlay size={16} />}
              onClick={() =>
                addAndCenter(
                  {
                    label: "Manual Trigger",
                    subtitle: "Trigger",
                    icon: "IconPlayerPlay",
                  }
                )
              }
            >
              Manual
            </ActionButton>

            <ActionButton
              icon={<IconClock size={16} />}
              onClick={() =>
                addAndCenter(
                  {
                    label: "Schedule",
                    subtitle: "Trigger",
                    icon: "IconClock",
                  }
                )
              }
            >
              Schedule
            </ActionButton>

            <ActionButton
              icon={<IconWebhook size={16} />}
              onClick={() =>
                addAndCenter(
                  {
                    label: "WebHook",
                    subtitle: "Trigger",
                    icon: "IconWebhook",
                  }
                )
              }
            >
              WebHook
            </ActionButton>

            <ActionButton
              icon={<IconFileUpload size={16} />}
              onClick={() =>
                addAndCenter(
                  {
                    label: "File Uploader",
                    subtitle: "Trigger",
                    icon: "IconFileUpload",
                  }
                )
              }
            >
              File Uploader
            </ActionButton>
          </DropdownSection>

          <DropdownSection
            title="AI"
            icon={
              <IconRobot
                size={18}
                color={theme.colors.accent.cyan}
              />
            }
            style={{
              background: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.md,
              padding: "0.5rem",
            }}
          >
            <ActionButton
              icon={<IconBrain size={16} />}
              onClick={() =>
                addAndCenter(
                  {
                    label: "GPT Node",
                    subtitle: "AI",
                    icon: "IconBrain",
                  }
                )
              }
            >
              GPT Node
            </ActionButton>
          </DropdownSection>

          <DropdownSection
            title="Conditional"
            icon={
              <IconBraces
                size={18}
                color={theme.colors.accent.primary}
              />
            }
            style={{
              background: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.md,
              padding: "0.5rem",
            }}
          >
            <ActionButton
              icon={<IconGitBranch size={16} />}
              onClick={() =>
                addAndCenter(
                  {
                    label: "IF",
                    subtitle: "Conditional",
                    icon: "IconGitBranch",
                  }
                )
              }
            >
              IF
            </ActionButton>
          </DropdownSection>
        </Stack>
      </div>
    </ScrollArea>
  );
}
