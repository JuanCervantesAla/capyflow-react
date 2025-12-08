import { useContext } from "react";
import { Stack, Title, ScrollArea } from "@mantine/core";
import {
  IconPlayerPlay,
  IconClock,
  IconWebhook,
  IconUpload,
  IconBrain,
  IconGitBranch,
  IconRobot,
  IconBraces,
  IconGenderNeutrois,
  IconFileUpload,
} from "@tabler/icons-react";
import { FlowContext } from "../Flow/context/FlowContext";
import { useTheme } from "../../theme/themeContext";
import { ActionButton } from "../UI/ActionButton";
import { DropdownSection } from "../UI/DropdownSection";

export function Sidebar() {
  const { addNode } = useContext(FlowContext);
  const { theme } = useTheme();

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

          {/* TITLE */}
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

          {/* TRIGGER */}
          <DropdownSection
            title="Trigger"
            icon={<IconGenderNeutrois size={18} color={theme.colors.text.accent} />}
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
                  addNode(
                    {
                      label: "Manual Trigger",
                      subtitle: "Trigger",
                      icon: IconPlayerPlay,
                    },
                    "custom"
                  )
                }
              >
                Manual
            </ActionButton>
            <ActionButton
                icon={<IconClock size={16} />}
                onClick={() =>
                  addNode(
                    {
                      label: "Schedule",
                      subtitle: "Trigger",
                      icon: IconClock,
                    },
                    "custom"
                  )
                }
              >
                Schedule
            </ActionButton>
            <ActionButton
                icon={<IconWebhook size={16} />}
                onClick={() =>
                  addNode(
                    {
                      label: "WebHook",
                      subtitle: "Trigger",
                      icon: IconWebhook,
                    },
                    "custom"
                  )
                }
              >
                WebHook
            </ActionButton>
            <ActionButton
                icon={<IconFileUpload size={16} />}
                onClick={() =>
                  addNode(
                    {
                      label: "File Uploader",
                      subtitle: "Trigger",
                      icon: IconFileUpload,
                    },
                    "custom"
                  )
                }
              >
                File Uploader
            </ActionButton>
          </DropdownSection>

          {/* AI */}
          <DropdownSection
            title="AI"
            icon={<IconRobot size={18} color={theme.colors.accent.cyan} />}
            style={{
              background: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.md,
              padding: "0.5rem",
            }}
          >
            <ActionButton icon={<IconBrain size={16} />} onClick={addNode}>
              GPT Node
            </ActionButton>
          </DropdownSection>

          {/* CONDITIONAL */}
          <DropdownSection
            title="Conditional"
            icon={<IconBraces size={18} color={theme.colors.accent.primary} />}
            style={{
              background: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.md,
              padding: "0.5rem",
            }}
          >
            <ActionButton icon={<IconGitBranch size={16} />} onClick={addNode}>
              IF
            </ActionButton>
          </DropdownSection>
        </Stack>
      </div>
    </ScrollArea>
  );
}
