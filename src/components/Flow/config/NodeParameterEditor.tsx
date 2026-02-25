import { Stack, TextInput, NumberInput, Select, Button, Group, Text, Checkbox, Textarea, Alert, ActionIcon } from "@mantine/core";
import { useState, useEffect } from "react";
import { useTheme } from "../../../theme/ThemeContext";
import { IconCheck, IconX, IconAlertCircle, IconPlus, IconTrash } from "@tabler/icons-react";
import { getNodeSchema, validateNodeParameters, getDefaultNodeParameters } from "./nodeSchemas";

// Componentes de editores especializados
function JsonEditor({ value, onChange, placeholder }: { value: string; onChange: (val: any) => void; placeholder?: string }) {
  const { theme } = useTheme();
  const [jsonValue, setJsonValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setJsonValue(newValue);
    try {
      const parsed = JSON.parse(newValue);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError("JSON inválido");
    }
  };

  return (
    <Stack gap="xs">
      <Textarea
        size="xs"
        value={jsonValue}
        onChange={(e) => handleChange(e.currentTarget.value)}
        placeholder={placeholder || '{"key": "value"}'}
        minRows={4}
        maxRows={10}
        styles={{
          input: {
            fontFamily: 'monospace',
            fontSize: '12px',
            border: `2px solid ${theme.colors.ink}`,
            background: theme.colors.paper,
            color: theme.colors.ink,
            '&:focus': {
              borderColor: theme.colors.ink,
            },
          },
        }}
      />
      {error && <Text size="xs" c="#f43f5e" fw={600}>{error}</Text>}
    </Stack>
  );
}

function KeyValueEditor({ value, onChange }: { value: Record<string, any>; onChange: (val: Record<string, any>) => void }) {
  const { theme } = useTheme();
  const [pairs, setPairs] = useState<Array<{ key: string; value: string }>>(() => {
    return Object.entries(value || {}).map(([k, v]) => ({ key: k, value: String(v) }));
  });

  useEffect(() => {
    const obj = pairs.reduce((acc, p) => {
      if (p.key.trim()) {
        acc[p.key] = p.value;
      }
      return acc;
    }, {} as Record<string, any>);
    onChange(obj);
  }, [pairs]);

  const addPair = () => {
    setPairs([...pairs, { key: '', value: '' }]);
  };

  const removePair = (index: number) => {
    setPairs(pairs.filter((_, i) => i !== index));
  };

  const updatePair = (index: number, field: 'key' | 'value', newValue: string) => {
    const newPairs = [...pairs];
    newPairs[index][field] = newValue;
    setPairs(newPairs);
  };

  return (
    <Stack gap="xs">
      {pairs.map((pair, index) => (
        <Group key={index} gap="xs" wrap="nowrap">
          <TextInput
            size="xs"
            placeholder="clave"
            value={pair.key}
            onChange={(e) => updatePair(index, 'key', e.currentTarget.value)}
            style={{ flex: 1 }}
            styles={{
              input: {
                border: `2px solid ${theme.colors.ink}`,
                background: theme.colors.paper,
                color: theme.colors.ink,
                '&:focus': {
                  borderColor: theme.colors.ink,
                },
              },
            }}
          />
          <TextInput
            size="xs"
            placeholder="valor"
            value={pair.value}
            onChange={(e) => updatePair(index, 'value', e.currentTarget.value)}
            style={{ flex: 1 }}
            styles={{
              input: {
                border: `2px solid ${theme.colors.ink}`,
                background: theme.colors.paper,
                color: theme.colors.ink,
                '&:focus': {
                  borderColor: theme.colors.ink,
                },
              },
            }}
          />
          <ActionIcon 
            size="sm" 
            color="red" 
            onClick={() => removePair(index)}
            styles={{
              root: {
                color: '#f43f5e',
                '&:hover': {
                  background: 'rgba(244, 63, 94, 0.1)',
                },
              },
            }}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      ))}
      <Button 
        size="xs" 
        variant="light" 
        leftSection={<IconPlus size={14} />} 
        onClick={addPair}
        styles={{
          root: {
            border: `2px solid ${theme.colors.ink}`,
            background: theme.colors.paper,
            color: theme.colors.ink,
            fontWeight: 600,
            '&:hover': {
              background: 'rgba(45, 52, 54, 0.05)',
            },
          },
        }}
      >
        Agregar
      </Button>
    </Stack>
  );
}

function HttpHeadersEditor({ value, onChange }: { value: Record<string, string>; onChange: (val: Record<string, string>) => void }) {
  return <KeyValueEditor value={value} onChange={onChange} />;
}

interface NodeParameterEditorProps {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  currentParameters?: Record<string, any>;
  onSave?: (params: Record<string, any>) => void;
  onCancel?: () => void;
}

export function NodeParameterEditor({
  nodeId,
  nodeLabel: _nodeLabel,
  nodeType,
  currentParameters = {},
  onSave,
  onCancel,
}: NodeParameterEditorProps) {
  const { theme } = useTheme();
  const schema = getNodeSchema(nodeType);
  
  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    const defaults = getDefaultNodeParameters(nodeType);
    return { ...defaults, ...currentParameters };
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const defaults = getDefaultNodeParameters(nodeType);
    setParameters({ ...defaults, ...currentParameters });
    setValidationError(null);
  }, [nodeId, nodeType, currentParameters]);

  const handleParameterChange = (key: string, value: any) => {
    setParameters((prev) => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  const handleSave = () => {
    const error = validateNodeParameters(nodeType, parameters);
    if (error) {
      setValidationError(error);
      return;
    }

    onSave?.(parameters);
  };

  if (!schema) {
    return (
      <Stack gap="md" p="md" style={{ background: theme.colors.paper }}>
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          color="red"
          styles={{
            root: {
              border: `2px solid #f43f5e`,
              background: theme.colors.paper,
            },
            message: {
              color: '#f43f5e',
              fontWeight: 600,
            },
          }}
        >
          Tipo de nodo desconocido: {nodeType}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md" style={{ borderRadius: theme.borderRadius.md, background: theme.colors.paper }}>
      <div>
        <Text fw={700} size="sm" c={theme.colors.ink}>
          {schema.displayName}
        </Text>
        <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
          {schema.description}
        </Text>
      </div>

      {validationError && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          color="red" 
          variant="light"
          styles={{
            root: {
              border: `2px solid #f43f5e`,
              background: theme.colors.paper,
            },
            message: {
              color: '#f43f5e',
              fontWeight: 600,
            },
          }}
        >
          {validationError}
        </Alert>
      )}

      {schema.parameters.length === 0 ? (
        <Text size="sm" c={theme.colors.ink} ta="center" style={{ opacity: 0.5 }}>
          Este nodo no tiene parámetros configurables
        </Text>
      ) : (
        <Stack gap="sm">
          {schema.parameters.map((param) => {
            const value = parameters[param.key];

            return (
              <div key={param.key}>
                <Text size="xs" fw={600} mb="4px" c={theme.colors.ink}>
                  {param.name} {param.required && <span style={{ color: "#f43f5e" }}>*</span>}
                </Text>

                {param.description && (
                  <Text size="xs" c={theme.colors.ink} mb="4px" style={{ opacity: 0.6 }}>
                    {param.description}
                  </Text>
                )}

                {param.type === "string" && (
                  <TextInput
                    size="xs"
                    placeholder={param.placeholder}
                    value={value || ""}
                    onChange={(e) => handleParameterChange(param.key, e.currentTarget.value)}
                    styles={{
                      input: {
                        border: `2px solid ${theme.colors.ink}`,
                        background: theme.colors.paper,
                        color: theme.colors.ink,
                        '&:focus': {
                          borderColor: theme.colors.ink,
                        },
                      },
                    }}
                  />
                )}

                {param.type === "number" && (
                  <NumberInput
                    size="xs"
                    placeholder={param.placeholder}
                    value={value || param.defaultValue || 0}
                    onChange={(val) => handleParameterChange(param.key, val)}
                    styles={{
                      input: {
                        border: `2px solid ${theme.colors.ink}`,
                        background: theme.colors.paper,
                        color: theme.colors.ink,
                        '&:focus': {
                          borderColor: theme.colors.ink,
                        },
                      },
                    }}
                  />
                )}

                {param.type === "boolean" && (
                  <Checkbox
                    label="Activado"
                    checked={value || false}
                    onChange={(e) => handleParameterChange(param.key, e.currentTarget.checked)}
                  />
                )}

                {(param.type === "select" || param.type === "http-method") && param.options && (
                  <Select
                    size="xs"
                    data={param.options}
                    value={value || param.defaultValue || param.options[0]}
                    onChange={(val) => handleParameterChange(param.key, val)}
                    styles={{
                      input: {
                        border: `2px solid ${theme.colors.ink}`,
                        background: theme.colors.paper,
                        color: theme.colors.ink,
                        '&:focus': {
                          borderColor: theme.colors.ink,
                        },
                      },
                    }}
                  />
                )}

                {param.type === "textarea" && (
                  <Textarea
                    size="xs"
                    placeholder={param.placeholder}
                    value={value || ""}
                    onChange={(e) => handleParameterChange(param.key, e.currentTarget.value)}
                    minRows={3}
                    maxRows={6}
                    styles={{
                      input: {
                        border: `2px solid ${theme.colors.ink}`,
                        background: theme.colors.paper,
                        color: theme.colors.ink,
                        fontFamily: 'monospace',
                        '&:focus': {
                          borderColor: theme.colors.ink,
                        },
                      },
                    }}
                  />
                )}

                {param.type === "json" && (
                  <JsonEditor
                    value={typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2)}
                    onChange={(val) => handleParameterChange(param.key, val)}
                    placeholder={param.placeholder}
                  />
                )}

                {param.type === "key-value" && (
                  <KeyValueEditor
                    value={value || {}}
                    onChange={(val) => handleParameterChange(param.key, val)}
                  />
                )}

                {param.type === "http-headers" && (
                  <HttpHeadersEditor
                    value={value || {}}
                    onChange={(val) => handleParameterChange(param.key, val)}
                  />
                )}
              </div>
            );
          })}
        </Stack>
      )}

      <Group justify="flex-end" gap="xs">
        <Button 
          variant="default" 
          size="xs" 
          onClick={onCancel} 
          leftSection={<IconX size={14} />}
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
              color: theme.colors.ink,
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(45, 52, 54, 0.05)',
              },
            },
          }}
        >
          Cancelar
        </Button>
        <Button 
          size="xs" 
          onClick={handleSave} 
          leftSection={<IconCheck size={14} />}
          styles={{
            root: {
              background: theme.colors.ink,
              color: theme.colors.paper,
              fontWeight: 600,
              '&:hover': {
                background: '#000000',
              },
            },
          }}
        >
          Guardar
        </Button>
      </Group>
    </Stack>
  );
}