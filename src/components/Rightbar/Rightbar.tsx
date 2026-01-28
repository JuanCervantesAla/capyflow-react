import { Drawer, Text, Stack } from "@mantine/core";
import { useTheme } from "../../theme/ThemeContext";
import { NodeParameterEditor } from "../Flow/Canvas/NodeParameterEditor";

interface RightbarProps {
  node: any;
  onClose: () => void;
  opened: boolean;
}

export function Rightbar({ node, onClose, opened }: RightbarProps) {
  const { theme } = useTheme();

  const nodeParameters = node?.data?.parameters || [];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Información del Nodo"
      position="right"
      size="sm"
      overlayProps={{ backgroundOpacity: 0.1 }}
      styles={{
        content: {
          background: theme.colors.background.secondary,
        },
      }}
    >
      <Stack gap="md">
        <div>
          <Text fw={600} size="sm">
            {node?.data?.label || "Sin etiqueta"}
          </Text>
          <Text size="xs" c="dimmed">
            ID: {node?.id}
          </Text>
          {node?.data?.type && (
            <Text size="xs" c="dimmed">
              Tipo: {node?.data?.type}
            </Text>
          )}
        </div>

        {nodeParameters.length > 0 && (
          <NodeParameterEditor
            nodeId={node.id}
            nodeLabel={node.data?.label}
            parameters={nodeParameters}
          />
        )}
      </Stack>
    </Drawer>
  );
}
