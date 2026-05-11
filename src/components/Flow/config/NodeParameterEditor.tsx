import { Stack, TextInput, NumberInput, Select, Button, Group, Text, Checkbox, Textarea, Alert, ActionIcon, SegmentedControl, Anchor, Badge } from "@mantine/core";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "../../../theme/ThemeContext";
import { IconCheck, IconX, IconAlertCircle, IconPlus, IconTrash, IconInfoCircle } from "@tabler/icons-react";
import { getNodeSchema, validateNodeParameters, getDefaultNodeParameters, getFilteredParameters, hasAdvancedParameters, countAdvancedParameters, syncNodeSchemasFromBackend } from "./nodeSchemas";
import type { NodeParameterSchema } from "./nodeSchemas";
import { fetchConnections } from "../../../api/Connections/connections.api";

type ConnectionOption = {
  value: string;
  label: string;
};

type VariableOption = {
  value: string;
  label: string;
};

type UpstreamOutputPreview = {
  nodeId: string;
  nodeLabel: string;
  output: unknown;
};

type NodeExecutionDebug = {
  status?: string;
  durationMs?: number;
  error?: string;
  output?: unknown;
};

type ConfigCopilotHint = {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionKey?: 'fill-required' | 'show-advanced' | 'apply-resilience' | 'set-http-defaults' | 'harden-timeout';
};

type ParameterGuidance = {
  key: string;
  title: string;
  why: string;
  risk: string;
  example: string;
  actionLabel?: string;
  actionKey?: ConfigCopilotHint['actionKey'];
};

type HttpPresetKey =
  | 'google-sheets'
  | 'notion'
  | 'slack'
  | 'teams'
  | 'twilio'
  | 'ocr-space';

type HttpPreset = {
  key: HttpPresetKey;
  label: string;
  description: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
};

const HTTP_PRESETS: HttpPreset[] = [
  {
    key: 'google-sheets',
    label: 'Google Sheets - Append Row',
    description: 'Appends a row through Google Sheets API v4.',
    method: 'POST',
    url: 'https://sheets.googleapis.com/v4/spreadsheets/{{spreadsheetId}}/values/{{sheetName}}!A1:append?valueInputOption=USER_ENTERED',
    headers: {
      Authorization: 'Bearer {{googleAccessToken}}',
      'Content-Type': 'application/json',
    },
    body: {
      values: [['{{col1}}', '{{col2}}', '{{col3}}']],
    },
  },
  {
    key: 'notion',
    label: 'Notion - Create Page',
    description: 'Creates a page in a Notion database.',
    method: 'POST',
    url: 'https://api.notion.com/v1/pages',
    headers: {
      Authorization: 'Bearer {{notionToken}}',
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: {
      parent: { database_id: '{{databaseId}}' },
      properties: {
        Name: {
          title: [{ text: { content: '{{title}}' } }],
        },
      },
    },
  },
  {
    key: 'slack',
    label: 'Slack - Send Message',
    description: 'Sends a chat message using Slack Web API.',
    method: 'POST',
    url: 'https://slack.com/api/chat.postMessage',
    headers: {
      Authorization: 'Bearer {{slackBotToken}}',
      'Content-Type': 'application/json',
    },
    body: {
      channel: '{{channelId}}',
      text: '{{message}}',
    },
  },
  {
    key: 'teams',
    label: 'Teams - Incoming Webhook',
    description: 'Posts a simple card into Microsoft Teams.',
    method: 'POST',
    url: '{{teamsWebhookUrl}}',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      text: '{{message}}',
    },
  },
  {
    key: 'twilio',
    label: 'Twilio - Send WhatsApp/SMS',
    description: 'Sends outbound message using Twilio Messages API.',
    method: 'POST',
    url: 'https://api.twilio.com/2010-04-01/Accounts/{{twilioAccountSid}}/Messages.json',
    headers: {
      Authorization: 'Basic {{twilioBase64Auth}}',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: {
      To: '{{to}}',
      From: '{{from}}',
      Body: '{{message}}',
    },
  },
  {
    key: 'ocr-space',
    label: 'OCR Space - Parse Image',
    description: 'Extracts text from image URL using OCR.Space.',
    method: 'POST',
    url: 'https://api.ocr.space/parse/image',
    headers: {
      apikey: '{{ocrApiKey}}',
      'Content-Type': 'application/json',
    },
    body: {
      url: '{{imageUrl}}',
      language: 'eng',
      isOverlayRequired: false,
    },
  },
];

// Specialized editor components
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
      setError("Invalid JSON");
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

function KeyValueEditor({ value, onChange, syncKey }: { value: Record<string, any>; onChange: (val: Record<string, any>) => void; syncKey?: string }) {
  const { theme } = useTheme();
  const toPairs = (source: Record<string, any>) =>
    Object.entries(source || {}).map(([k, v]) => ({ key: k, value: String(v) }));

  const pairsToObject = (source: Array<{ key: string; value: string }>) =>
    source.reduce((acc, pair) => {
      if (pair.key.trim()) {
        acc[pair.key] = pair.value;
      }
      return acc;
    }, {} as Record<string, any>);

  const valuesEqual = (left: Record<string, any>, right: Record<string, any>) => {
    const leftKeys = Object.keys(left || {});
    const rightKeys = Object.keys(right || {});

    if (leftKeys.length !== rightKeys.length) return false;

    return leftKeys.every((key) => String(left[key]) === String(right[key]));
  };

  const [pairs, setPairs] = useState<Array<{ key: string; value: string }>>(() => toPairs(value || {}));
  const pairsRef = useRef(pairs);
  const lastSyncKeyRef = useRef(syncKey);
  const lastEmittedRef = useRef('');
  const isSyncingRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  // Mantener sincronizado el estado interno solo cuando cambia el contexto
  // (por ejemplo, al cambiar de nodo), para no borrar filas recién añadidas.
  useEffect(() => {
    pairsRef.current = pairs;
  }, [pairs]);

  useEffect(() => {
    const nextValue = value || {};
    const syncKeyChanged = lastSyncKeyRef.current !== syncKey;

    if (syncKeyChanged) {
      lastSyncKeyRef.current = syncKey;
      lastEmittedRef.current = JSON.stringify(nextValue);
      isSyncingRef.current = true;
      setPairs(toPairs(nextValue));
      return;
    }

    const currentValue = pairsToObject(pairsRef.current);
    if (valuesEqual(nextValue, currentValue)) {
      return;
    }
    lastEmittedRef.current = JSON.stringify(nextValue);
    isSyncingRef.current = true;
    setPairs(toPairs(nextValue));
  }, [syncKey, value]);

  useEffect(() => {
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }

    const obj = pairs.reduce((acc, p) => {
      if (p.key.trim()) {
        acc[p.key] = p.value;
      }
      return acc;
    }, {} as Record<string, any>);
    const serialized = JSON.stringify(obj);
    if (serialized === lastEmittedRef.current) {
      return;
    }

    lastEmittedRef.current = serialized;
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      onChange(obj);
    }, 120);
  }, [pairs, onChange]);

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
        Add
      </Button>
    </Stack>
  );
}

function HttpHeadersEditor({ value, onChange, syncKey }: { value: Record<string, string>; onChange: (val: Record<string, string>) => void; syncKey?: string }) {
  return <KeyValueEditor value={value} onChange={onChange} syncKey={syncKey} />;
}

interface NodeParameterEditorProps {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  variableOptions?: VariableOption[];
  upstreamOutputPreviews?: UpstreamOutputPreview[];
  executionDebug?: NodeExecutionDebug;
  currentParameters?: Record<string, any>;
  onSave?: (params: Record<string, any>) => void;
  // Se dispara en cada cambio de parámetro para auto-guardar en el flujo
  onChangeLive?: (params: Record<string, any>) => void;
  onCancel?: () => void;
}

export function NodeParameterEditor({
  nodeId,
  nodeLabel: _nodeLabel,
  nodeType,
  variableOptions = [],
  upstreamOutputPreviews = [],
  executionDebug,
  currentParameters = {},
  onSave,
  onChangeLive,
  onCancel,
}: NodeParameterEditorProps) {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [, setSchemaVersion] = useState(0);
  const schema = getNodeSchema(nodeType);
  const schemaParamKeys = new Set((schema?.parameters || []).map((param) => param.key));
  
  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    const defaults = getDefaultNodeParameters(nodeType);
    return { ...defaults, ...currentParameters };
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const [configMode, setConfigMode] = useState<'basic' | 'advanced'>('basic');
  const [connectionOptions, setConnectionOptions] = useState<ConnectionOption[]>([]);
  const [selectedHttpPreset, setSelectedHttpPreset] = useState<HttpPresetKey | ''>('');

  const canApplyResiliencePreset =
    schemaParamKeys.has('maxRetries') ||
    schemaParamKeys.has('retryDelay') ||
    schemaParamKeys.has('fallbackMode');

  const isEmptyValue = (value: unknown): boolean => {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length === 0;
    return false;
  };

  const requiredMissing = (schema?.parameters || []).filter(
    (param) => param.required && isEmptyValue(parameters[param.key]),
  );

  const shouldShowVariablePicker = (paramType: string, paramKey: string): boolean => {
    if (paramKey === 'connectionId') return false;
    return (paramType === 'string' || paramType === 'textarea') && variableOptions.length > 0;
  };

  const insertVariableToken = (paramKey: string, token: string) => {
    const currentValue = parameters[paramKey];
    const base = typeof currentValue === 'string'
      ? currentValue
      : currentValue == null
        ? ''
        : String(currentValue);
    const separator = base.length > 0 && !base.endsWith(' ') && !base.endsWith('\n') ? ' ' : '';
    handleParameterChange(paramKey, `${base}${separator}${token}`);
  };

  // Check if this node has advanced parameters
  const hasAdvanced = hasAdvancedParameters(nodeType);
  const advancedCount = countAdvancedParameters(nodeType);
  const visibleParameters = getFilteredParameters(nodeType, configMode);

  useEffect(() => {
    const defaults = getDefaultNodeParameters(nodeType);
    setParameters({ ...defaults, ...currentParameters });
    setValidationError(null);
    setSelectedHttpPreset('');
  }, [nodeId, nodeType, currentParameters]);

  useEffect(() => {
    let mounted = true;

    syncNodeSchemasFromBackend('advanced').then((updated) => {
      if (!mounted || !updated) return;
      setSchemaVersion((v) => v + 1);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (nodeType !== 'email' && nodeType !== 'telegram') {
      setConnectionOptions([]);
      return;
    }

    const provider = nodeType === 'email' ? 'sendgrid' : 'telegram';
    const fallbackLabel = nodeType === 'email'
      ? 'No reusable connection (use manual SendGrid/SMTP fields)'
      : 'No reusable connection (use manual chatId/default bot config)';

    let mounted = true;

    fetchConnections(provider)
      .then((connections) => {
        if (!mounted) return;

        const activeConnections = connections.filter((connection) => connection.isActive);
        const options: ConnectionOption[] = [
          { value: '', label: fallbackLabel },
          ...activeConnections.map((connection) => ({
            value: connection.id,
            label: connection.name,
          })),
        ];

        setConnectionOptions(options);
      })
      .catch(() => {
        if (!mounted) return;
        setConnectionOptions([{ value: '', label: fallbackLabel }]);
      });

    return () => {
      mounted = false;
    };
  }, [nodeType]);

  const handleParameterChange = (key: string, value: any) => {
    setParameters((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-guardar hacia arriba si se proporcionó callback
      onChangeLive?.(updated);
      return updated;
    });
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

  const applyResiliencePreset = () => {
    const updated = { ...parameters };

    if (schemaParamKeys.has('maxRetries')) {
      updated.maxRetries = 2;
    }
    if (schemaParamKeys.has('retryDelay')) {
      updated.retryDelay = 1000;
    }
    if (schemaParamKeys.has('backoffMultiplier')) {
      updated.backoffMultiplier = 2;
    }
    if (schemaParamKeys.has('fallbackMode')) {
      updated.fallbackMode = 'default';
    }
    if (schemaParamKeys.has('defaultValue')) {
      updated.defaultValue = {
        handled: true,
        reason: 'fallback-applied',
      };
    }

    setParameters(updated);
    onChangeLive?.(updated);
    setValidationError(null);
  };

  const applyHttpPreset = () => {
    if (nodeType !== 'http-request' || !selectedHttpPreset) return;

    const preset = HTTP_PRESETS.find((item) => item.key === selectedHttpPreset);
    if (!preset) return;

    const updated: Record<string, unknown> = {
      ...parameters,
      method: preset.method,
      url: preset.url,
    };

    if (preset.headers) {
      updated.headers = preset.headers;
    }

    if (preset.body) {
      updated.body = preset.body;
    }

    setParameters(updated);
    onChangeLive?.(updated);
    setValidationError(null);
  };

  const suggestValue = (paramKey: string, paramType: string, placeholder?: string): unknown => {
    if (placeholder && placeholder.trim().length > 0) {
      return placeholder;
    }

    switch (paramKey) {
      case 'url':
        return 'https://api.example.com/resource';
      case 'method':
        return 'GET';
      case 'to':
        return 'user@example.com';
      case 'subject':
        return 'CapyFlow demo notification';
      case 'body':
        return 'Automated message from CapyFlow';
      case 'message':
        return 'Hello from CapyFlow';
      case 'prompt':
        return 'Summarize the input data in 3 bullet points';
      case 'query':
        return 'SELECT 1';
      default:
        break;
    }

    if (paramType === 'number') return 0;
    if (paramType === 'boolean') return false;
    if (paramType === 'json') return {};
    if (paramType === 'key-value' || paramType === 'http-headers') return {};
    return `sample-${paramKey}`;
  };

  const applyCopilotAutofill = () => {
    const updated = { ...parameters };

    for (const param of requiredMissing) {
      if (!isEmptyValue(updated[param.key])) continue;

      if (param.defaultValue !== undefined) {
        updated[param.key] = param.defaultValue;
      } else {
        updated[param.key] = suggestValue(param.key, param.type, param.placeholder);
      }
    }

    setParameters(updated);
    onChangeLive?.(updated);
    setValidationError(null);
  };

  const applyHintAction = (actionKey: ConfigCopilotHint['actionKey']) => {
    if (!actionKey) return;

    if (actionKey === 'fill-required') {
      applyCopilotAutofill();
      return;
    }

    if (actionKey === 'show-advanced') {
      setConfigMode('advanced');
      return;
    }

    if (actionKey === 'apply-resilience') {
      applyResiliencePreset();
      return;
    }

    if (actionKey === 'set-http-defaults') {
      const updated = {
        ...parameters,
        method: isEmptyValue(parameters.method) ? 'GET' : parameters.method,
        url: isEmptyValue(parameters.url) ? 'https://api.example.com/resource' : parameters.url,
      };
      setParameters(updated);
      onChangeLive?.(updated);
      setValidationError(null);
      return;
    }

    if (actionKey === 'harden-timeout') {
      const updated = { ...parameters };

      if (schemaParamKeys.has('timeout')) {
        const currentTimeout = Number(updated.timeout || 0);
        updated.timeout = currentTimeout >= 30000 ? currentTimeout : 30000;
      }

      if (schemaParamKeys.has('maxRetries')) {
        const currentRetries = Number(updated.maxRetries || 0);
        updated.maxRetries = currentRetries >= 2 ? currentRetries : 2;
      }

      if (schemaParamKeys.has('retryDelay')) {
        const currentRetryDelay = Number(updated.retryDelay || 0);
        updated.retryDelay = currentRetryDelay >= 1000 ? currentRetryDelay : 1000;
      }

      setParameters(updated);
      onChangeLive?.(updated);
      setValidationError(null);
    }
  };

  const configCopilotHints = useMemo<ConfigCopilotHint[]>(() => {
    const hints: ConfigCopilotHint[] = [];

    if (requiredMissing.length > 0) {
      hints.push({
        id: 'required-fields',
        title: 'Complete required fields',
        description: `Missing: ${requiredMissing.map((param) => param.name).join(', ')}.`,
        actionLabel: 'Autofill now',
        actionKey: 'fill-required',
      });
    }

    if (nodeType === 'http-request' && (isEmptyValue(parameters.method) || isEmptyValue(parameters.url))) {
      hints.push({
        id: 'http-defaults',
        title: 'Prepare request skeleton',
        description: 'Set a safe default method/URL before mapping headers and body.',
        actionLabel: 'Use defaults',
        actionKey: 'set-http-defaults',
      });
    }

    if ((nodeType === 'email' || nodeType === 'telegram') && isEmptyValue(parameters.connectionId)) {
      hints.push({
        id: 'reusable-connection',
        title: 'Use reusable credentials',
        description: 'Selecting connectionId avoids exposing provider tokens in every node.',
        actionLabel: 'Open advanced',
        actionKey: 'show-advanced',
      });
    }

    if (canApplyResiliencePreset && isEmptyValue(parameters.maxRetries) && isEmptyValue(parameters.retryDelay)) {
      hints.push({
        id: 'resilience-profile',
        title: 'Increase execution resilience',
        description: 'Apply retry/fallback profile to reduce transient failures.',
        actionLabel: 'Apply resilience',
        actionKey: 'apply-resilience',
      });
    }

    if (hasAdvanced && configMode === 'basic' && hints.length > 0) {
      hints.push({
        id: 'review-advanced',
        title: 'Review advanced options',
        description: `${advancedCount} advanced parameter${advancedCount > 1 ? 's are' : ' is'} available for fine tuning.`,
        actionLabel: 'Show advanced',
        actionKey: 'show-advanced',
      });
    }

    return hints.slice(0, 4);
  }, [
    requiredMissing,
    nodeType,
    parameters,
    canApplyResiliencePreset,
    hasAdvanced,
    configMode,
    advancedCount,
  ]);

  const executionAwareHints = useMemo<ConfigCopilotHint[]>(() => {
    if (!executionDebug) return [];

    const hints: ConfigCopilotHint[] = [];
    const errorText = String(executionDebug.error || '').toLowerCase();
    const hasError = !!executionDebug.error;
    const isSlow = typeof executionDebug.durationMs === 'number' && executionDebug.durationMs > 5000;

    if (hasError && (errorText.includes('timeout') || errorText.includes('timed out') || errorText.includes('deadline'))) {
      hints.push({
        id: 'exec-timeout',
        title: 'Timeout detected in last run',
        description: 'Increase timeout/retries to absorb slow upstream responses.',
        actionLabel: 'Harden timeout',
        actionKey: 'harden-timeout',
      });
    }

    if (hasError && (errorText.includes('401') || errorText.includes('403') || errorText.includes('unauthorized') || errorText.includes('forbidden'))) {
      hints.push({
        id: 'exec-auth',
        title: 'Authentication issue detected',
        description: 'Review connectionId and auth headers/tokens before next run.',
        actionLabel: 'Open advanced',
        actionKey: 'show-advanced',
      });
    }

    if (hasError && (errorText.includes('429') || errorText.includes('rate limit') || errorText.includes('too many requests'))) {
      hints.push({
        id: 'exec-rate-limit',
        title: 'Rate limit detected',
        description: 'Retry strategy helps with burst traffic and provider throttling.',
        actionLabel: 'Apply resilience',
        actionKey: 'apply-resilience',
      });
    }

    if (!hasError && isSlow) {
      hints.push({
        id: 'exec-slow',
        title: 'Slow execution in last run',
        description: 'Consider tuning timeout and payload size to improve responsiveness.',
        actionLabel: schemaParamKeys.has('timeout') ? 'Harden timeout' : undefined,
        actionKey: schemaParamKeys.has('timeout') ? 'harden-timeout' : undefined,
      });
    }

    return hints.slice(0, 2);
  }, [executionDebug, schemaParamKeys]);

  const buildParameterGuidance = (param: NodeParameterSchema): ParameterGuidance | null => {
    const missing = param.required && isEmptyValue(parameters[param.key]);

    if (missing) {
      return {
        key: param.key,
        title: `${param.name} is required`,
        why: 'This field is mandatory for the node execution contract.',
        risk: 'If it stays empty, this node can fail before or during execution.',
        example: param.placeholder || String(param.defaultValue ?? suggestValue(param.key, param.type, param.placeholder)),
        actionLabel: 'Autofill',
        actionKey: 'fill-required',
      };
    }

    if (param.key === 'connectionId' && (nodeType === 'email' || nodeType === 'telegram') && isEmptyValue(parameters.connectionId)) {
      return {
        key: param.key,
        title: 'Use reusable credentials',
        why: 'connectionId centralizes secrets and avoids repeating API keys in each node.',
        risk: 'Manual credentials are harder to rotate and more likely to drift between flows.',
        example: 'Pick a saved connection from the dropdown.',
        actionLabel: 'Show advanced',
        actionKey: 'show-advanced',
      };
    }

    if (nodeType === 'http-request' && (param.key === 'url' || param.key === 'method') && isEmptyValue(parameters[param.key])) {
      return {
        key: param.key,
        title: 'Prepare HTTP request base',
        why: 'URL and method define the request target and behavior.',
        risk: 'Without them, the request cannot be composed correctly.',
        example: param.key === 'method' ? 'GET' : 'https://api.example.com/resource',
        actionLabel: 'Use defaults',
        actionKey: 'set-http-defaults',
      };
    }

    if ((param.key === 'maxRetries' || param.key === 'retryDelay') && canApplyResiliencePreset) {
      return {
        key: param.key,
        title: 'Tune failure recovery',
        why: 'Retries absorb transient API/network errors.',
        risk: 'With zero retries, temporary failures can stop the full flow.',
        example: 'maxRetries: 2, retryDelay: 1000',
        actionLabel: 'Apply resilience',
        actionKey: 'apply-resilience',
      };
    }

    if (param.type === 'json' && !isEmptyValue(parameters[param.key])) {
      return {
        key: param.key,
        title: `Validate ${param.name}`,
        why: 'Structured JSON keeps downstream mapping predictable.',
        risk: 'Unexpected shape can break data mapping in next nodes.',
        example: param.placeholder || '{"key":"value"}',
      };
    }

    return null;
  };

  const parameterGuidance = useMemo<ParameterGuidance[]>(() => {
    return visibleParameters
      .map((param) => buildParameterGuidance(param as NodeParameterSchema))
      .filter((item): item is ParameterGuidance => item != null)
      .slice(0, 3);
  }, [visibleParameters, parameters, nodeType, canApplyResiliencePreset]);

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
          Unknown node type: {nodeType}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md" style={{ borderRadius: theme.borderRadius.md, background: theme.colors.paper }}>
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Text fw={700} size="sm" c={theme.colors.ink}>
            {schema.displayName}
          </Text>
          <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
            {schema.description}
          </Text>
        </div>

        {/* Basic/Advanced toggle - Only show if there are advanced parameters */}
        {hasAdvanced && (
          <SegmentedControl
            size="xs"
            value={configMode}
            onChange={(value) => setConfigMode(value as 'basic' | 'advanced')}
            data={[
              { label: '🟢 Basic', value: 'basic' },
              { label: '🔵 Advanced', value: 'advanced' }
            ]}
            styles={{
              root: {
                border: `2px solid ${theme.colors.ink}`,
                background: theme.colors.paper,
              },
              label: {
                color: theme.colors.ink,
                fontWeight: 600,
                fontSize: '11px',
              },
              indicator: {
                background: theme.colors.ink,
              },
            }}
          />
        )}
      </Group>

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

      {canApplyResiliencePreset && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="yellow"
          variant="light"
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
            },
            message: {
              color: theme.colors.ink,
            },
          }}
        >
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text size="xs" c={theme.colors.ink}>
              Apply standard retry/fallback settings for resilient execution.
            </Text>
            <Button
              size="xs"
              variant="light"
              onClick={applyResiliencePreset}
              styles={{
                root: {
                  border: `2px solid ${theme.colors.ink}`,
                  background: theme.colors.paper,
                  color: theme.colors.ink,
                  fontWeight: 700,
                },
              }}
            >
              Apply preset
            </Button>
          </Group>
        </Alert>
      )}

      {nodeType === 'http-request' && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="grape"
          variant="light"
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
            },
            message: {
              color: theme.colors.ink,
            },
          }}
        >
          <Stack gap="xs">
            <Text size="xs" fw={700} c={theme.colors.ink}>
              Connector presets (HTTP semi-native)
            </Text>
            <Select
              size="xs"
              placeholder="Choose connector preset"
              value={selectedHttpPreset}
              onChange={(value) => setSelectedHttpPreset((value as HttpPresetKey) || '')}
              data={HTTP_PRESETS.map((preset) => ({
                value: preset.key,
                label: `${preset.label} - ${preset.description}`,
              }))}
              searchable
              nothingFoundMessage="No preset found"
              styles={{
                input: {
                  border: `2px solid ${theme.colors.ink}`,
                  background: theme.colors.paper,
                  color: theme.colors.ink,
                },
              }}
            />
            <Group justify="flex-end">
              <Button
                size="xs"
                variant="light"
                disabled={!selectedHttpPreset}
                onClick={applyHttpPreset}
                styles={{
                  root: {
                    border: `2px solid ${theme.colors.ink}`,
                    background: theme.colors.paper,
                    color: theme.colors.ink,
                    fontWeight: 700,
                  },
                }}
              >
                Apply connector
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}

      {requiredMissing.length > 0 && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="teal"
          variant="light"
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
            },
            message: {
              color: theme.colors.ink,
            },
          }}
        >
          <Stack gap="xs">
            <Text size="xs" fw={700} c={theme.colors.ink}>
              Config copilot
            </Text>
            <Text size="xs" c={theme.colors.ink}>
              Missing required fields: {requiredMissing.map((param) => param.name).join(', ')}
            </Text>
            <Group justify="flex-end">
              <Button
                size="xs"
                variant="light"
                onClick={applyCopilotAutofill}
                styles={{
                  root: {
                    border: `2px solid ${theme.colors.ink}`,
                    background: theme.colors.paper,
                    color: theme.colors.ink,
                    fontWeight: 700,
                  },
                }}
              >
                Autofill suggestions
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}

      {configCopilotHints.length > 0 && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="indigo"
          variant="light"
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
            },
            message: {
              color: theme.colors.ink,
            },
          }}
        >
          <Stack gap="xs">
            <Text size="xs" fw={700} c={theme.colors.ink}>
              Smart recommendations
            </Text>

            {configCopilotHints.map((hint) => (
              <Group key={hint.id} justify="space-between" align="flex-start" wrap="nowrap">
                <div>
                  <Text size="xs" fw={600} c={theme.colors.ink}>
                    {hint.title}
                  </Text>
                  <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.7 }}>
                    {hint.description}
                  </Text>
                </div>
                {hint.actionKey && hint.actionLabel && (
                  <Button
                    size="compact-xs"
                    variant="light"
                    onClick={() => applyHintAction(hint.actionKey)}
                    styles={{
                      root: {
                        border: `1.5px solid ${theme.colors.ink}`,
                        background: theme.colors.paper,
                        color: theme.colors.ink,
                        fontWeight: 700,
                      },
                    }}
                  >
                    {hint.actionLabel}
                  </Button>
                )}
              </Group>
            ))}
          </Stack>
        </Alert>
      )}

      {executionAwareHints.length > 0 && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="orange"
          variant="light"
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
            },
            message: {
              color: theme.colors.ink,
            },
          }}
        >
          <Stack gap="xs">
            <Text size="xs" fw={700} c={theme.colors.ink}>
              Runtime recommendations
            </Text>

            {executionAwareHints.map((hint) => (
              <Group key={hint.id} justify="space-between" align="flex-start" wrap="nowrap">
                <div>
                  <Text size="xs" fw={600} c={theme.colors.ink}>
                    {hint.title}
                  </Text>
                  <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.7 }}>
                    {hint.description}
                  </Text>
                </div>
                {hint.actionKey && hint.actionLabel && (
                  <Button
                    size="compact-xs"
                    variant="light"
                    onClick={() => applyHintAction(hint.actionKey)}
                    styles={{
                      root: {
                        border: `1.5px solid ${theme.colors.ink}`,
                        background: theme.colors.paper,
                        color: theme.colors.ink,
                        fontWeight: 700,
                      },
                    }}
                  >
                    {hint.actionLabel}
                  </Button>
                )}
              </Group>
            ))}
          </Stack>
        </Alert>
      )}

      {parameterGuidance.length > 0 && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="cyan"
          variant="light"
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
            },
            message: {
              color: theme.colors.ink,
            },
          }}
        >
          <Stack gap="xs">
            <Text size="xs" fw={700} c={theme.colors.ink}>
              Parameter guidance
            </Text>

            {parameterGuidance.map((guide) => (
              <Stack key={guide.key} gap={2}>
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Text size="xs" fw={700} c={theme.colors.ink}>{guide.title}</Text>
                  {guide.actionKey && guide.actionLabel && (
                    <Button
                      size="compact-xs"
                      variant="light"
                      onClick={() => applyHintAction(guide.actionKey)}
                      styles={{
                        root: {
                          border: `1.5px solid ${theme.colors.ink}`,
                          background: theme.colors.paper,
                          color: theme.colors.ink,
                          fontWeight: 700,
                        },
                      }}
                    >
                      {guide.actionLabel}
                    </Button>
                  )}
                </Group>
                <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.75 }}>
                  Why: {guide.why}
                </Text>
                <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.75 }}>
                  Risk: {guide.risk}
                </Text>
                <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.75 }}>
                  Example: {guide.example}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Alert>
      )}

      {upstreamOutputPreviews.length > 0 && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
            },
            message: {
              color: theme.colors.ink,
            },
          }}
        >
          <Stack gap="xs">
            <Text size="xs" fw={700} c={theme.colors.ink}>
              Upstream output preview
            </Text>
            {upstreamOutputPreviews.slice(0, 2).map((preview) => (
              <Stack key={preview.nodeId} gap={4}>
                <Text size="xs" fw={600} c={theme.colors.ink}>
                  {preview.nodeLabel}
                </Text>
                <Textarea
                  size="xs"
                  readOnly
                  minRows={2}
                  maxRows={4}
                  value={JSON.stringify(preview.output, null, 2)}
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
              </Stack>
            ))}
          </Stack>
        </Alert>
      )}

      {(executionDebug?.status || executionDebug?.error || executionDebug?.output !== undefined) && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
            },
            message: {
              color: theme.colors.ink,
            },
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Text size="xs" fw={700} c={theme.colors.ink}>
                Node debugger
              </Text>
              {executionDebug?.status && (
                <Badge variant="outline" color={executionDebug.status === 'error' ? 'red' : executionDebug.status === 'success' ? 'green' : 'blue'}>
                  {executionDebug.status}
                </Badge>
              )}
            </Group>

            {typeof executionDebug?.durationMs === 'number' && (
              <Text size="xs" c={theme.colors.ink}>
                Latency: {executionDebug.durationMs} ms
              </Text>
            )}

            {executionDebug?.error && (
              <Textarea
                size="xs"
                readOnly
                minRows={2}
                maxRows={4}
                value={executionDebug.error}
                styles={{
                  input: {
                    border: `2px solid #f43f5e`,
                    background: theme.colors.paper,
                    color: '#f43f5e',
                    fontFamily: 'monospace',
                  },
                }}
              />
            )}

            {executionDebug?.output !== undefined && (
              <Textarea
                size="xs"
                readOnly
                minRows={2}
                maxRows={6}
                value={JSON.stringify(executionDebug.output, null, 2)}
                styles={{
                  input: {
                    border: `2px solid ${theme.colors.ink}`,
                    background: theme.colors.paper,
                    color: theme.colors.ink,
                    fontFamily: 'monospace',
                  },
                }}
              />
            )}
          </Stack>
        </Alert>
      )}

      {visibleParameters.length === 0 ? (
        <Text size="sm" c={theme.colors.ink} ta="center" style={{ opacity: 0.5 }}>
          {hasAdvanced && configMode === 'basic'
            ? 'This node has only optional advanced parameters'
            : 'This node has no configurable parameters'}
        </Text>
      ) : (
        <Stack gap="sm">
          {/* Use filtered parameters based on mode */}
          {visibleParameters.map((param) => {
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

                {shouldShowVariablePicker(param.type, param.key) && (
                  <Select
                    size="xs"
                    data={variableOptions}
                    value={null}
                    placeholder="Insert variable..."
                    onChange={(val) => {
                      if (!val) return;
                      insertVariableToken(param.key, val);
                    }}
                    searchable
                    clearable
                    nothingFoundMessage="No variables available"
                    mb="6px"
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

                {param.type === "string" && !(param.key === "connectionId" && (nodeType === "email" || nodeType === "telegram")) && (
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
                    label="Enabled"
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

                {param.key === "connectionId" && (nodeType === "email" || nodeType === "telegram") && (
                  <Select
                    size="xs"
                    data={connectionOptions}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(val) => handleParameterChange(param.key, val || '')}
                    searchable
                    nothingFoundMessage="No reusable connections found"
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
                  nodeType === "manual-trigger" && param.key === "csvContent" ? (
                    <Stack gap="xs">
                      <Group justify="space-between" align="center">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => fileInputRef.current?.click()}
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
                          Upload CSV / Excel file
                        </Button>
                        <Text size="xs" c={theme.colors.ink} style={{ opacity: 0.6 }}>
                          We will read the file as text (CSV) or convert Excel to CSV and store its contents.
                        </Text>
                      </Group>
                      <input
                        type="file"
                        accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const extension = file.name.toLowerCase();
                          const reader = new FileReader();
                          if (extension.endsWith(".xls") || extension.endsWith(".xlsx")) {
                            reader.onload = async (event) => {
                              const data = new Uint8Array(event.target?.result as ArrayBuffer);
                              const XLSX = await import("xlsx");
                              const workbook = XLSX.read(data, { type: "array" });
                              const firstSheetName = workbook.SheetNames[0];
                              const worksheet = workbook.Sheets[firstSheetName];
                              const csv = XLSX.utils.sheet_to_csv(worksheet || {});
                              handleParameterChange(param.key, csv || "");
                            };
                            reader.readAsArrayBuffer(file);
                          } else {
                            reader.onload = (event) => {
                              const text = (event.target?.result as string) || "";
                              handleParameterChange(param.key, text);
                            };
                            reader.readAsText(file);
                          }
                          // Allow selecting the same file again
                          e.target.value = "";
                        }}
                      />
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
                    </Stack>
                  ) : (
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
                  )
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
                    syncKey={`${nodeId}:${param.key}`}
                  />
                )}

                {param.type === "http-headers" && (
                  <HttpHeadersEditor
                    value={value || {}}
                    onChange={(val) => handleParameterChange(param.key, val)}
                    syncKey={`${nodeId}:${param.key}`}
                  />
                )}
              </div>
            );
          })}
        </Stack>
      )}

      {/* Show indicator for hidden parameters in basic mode */}
      {configMode === 'basic' && hasAdvanced && (
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          color="blue"
          variant="light"
          styles={{
            root: {
              border: `2px solid ${theme.colors.ink}`,
              background: theme.colors.paper,
              opacity: 0.8,
            },
            message: {
              color: theme.colors.ink,
              fontWeight: 500,
              fontSize: '12px',
            },
          }}
        >
          <Text size="xs" c={theme.colors.ink}>
            {advancedCount} advanced parameter{advancedCount > 1 ? 's are' : ' is'} hidden (using smart defaults).{' '}
            <Anchor 
              size="xs" 
              fw={700}
              onClick={() => setConfigMode('advanced')}
              style={{ cursor: 'pointer', color: theme.colors.ink, textDecoration: 'underline' }}
            >
              Show all options
            </Anchor>
          </Text>
        </Alert>
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
          Cancel
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
          Save
        </Button>
      </Group>
    </Stack>
  );
}