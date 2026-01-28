import { Stack, TextInput, NumberInput, Select, Button, Group, Text, Checkbox } from "@mantine/core";
import { useState, useEffect } from "react";
import { useTheme } from "../../../theme/ThemeContext";
import { IconCheck, IconX } from "@tabler/icons-react";

interface NodeParameter {
  id: string;
  name: string;
  type: string;
  value?: any;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

interface NodeParameterEditorProps {
  nodeId: string;
  nodeLabel: string;
  parameters: NodeParameter[];
  onSave?: (params: NodeParameter[]) => void;
  onCancel?: () => void;
}

export function NodeParameterEditor({
  nodeId,
  nodeLabel,
  parameters,
  onSave,
  onCancel,
}: NodeParameterEditorProps) {
  const [editedParams, setEditedParams] = useState<NodeParameter[]>(parameters);
  const { theme } = useTheme();

  useEffect(() => {
    setEditedParams(parameters);
  }, [parameters, nodeId]);

  const handleParameterChange = (paramId: string, newValue: any) => {
    setEditedParams((prev) =>
      prev.map((p) => (p.id === paramId ? { ...p, value: newValue } : p))
    );
  };

  const handleSave = () => {
    onSave?.(editedParams);
  };

  return (
    <Stack gap="md" p="md" style={{ borderRadius: theme.borderRadius.md }}>
      <div>
        <Text fw={600} size="sm">
          Parámetros de: {nodeLabel}
        </Text>
        <Text size="xs" c="dimmed">
          ID: {nodeId}
        </Text>
      </div>

      {editedParams.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center">
          Este nodo no tiene parámetros configurables
        </Text>
      ) : (
        <Stack gap="sm">
          {editedParams.map((param) => (
            <div key={param.id}>
              <Text size="xs" fw={500} mb="4px">
                {param.name} {param.required && <span style={{ color: "red" }}>*</span>}
              </Text>

              {param.description && (
                <Text size="xs" c="dimmed" mb="4px">
                  {param.description}
                </Text>
              )}

              {param.type === "string" && (
                <TextInput
                  size="xs"
                  placeholder={param.placeholder}
                  value={param.value || ""}
                  onChange={(e) => handleParameterChange(param.id, e.currentTarget.value)}
                />
              )}

              {param.type === "number" && (
                <NumberInput
                  size="xs"
                  placeholder={param.placeholder}
                  value={param.value || 0}
                  onChange={(val) => handleParameterChange(param.id, val)}
                />
              )}

              {param.type === "boolean" && (
                <Checkbox
                  label="Activado"
                  checked={param.value || false}
                  onChange={(e) => handleParameterChange(param.id, e.currentTarget.checked)}
                />
              )}

              {param.type === "select" && param.options && (
                <Select
                  size="xs"
                  data={param.options}
                  value={param.value || param.options[0]}
                  onChange={(val) => handleParameterChange(param.id, val)}
                />
              )}
            </div>
          ))}
        </Stack>
      )}

      {editedParams.length > 0 && (
        <Group justify="flex-end" gap="xs">
          <Button variant="default" size="xs" onClick={onCancel} leftSection={<IconX size={14} />}>
            Cancelar
          </Button>
          <Button size="xs" onClick={handleSave} leftSection={<IconCheck size={14} />}>
            Guardar
          </Button>
        </Group>
      )}
    </Stack>
  );
}
