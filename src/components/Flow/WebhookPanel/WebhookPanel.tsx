import { useState } from 'react';
import { Box, Stack, Group, Text, Textarea, Button, ActionIcon, Loader, Code, Alert } from '@mantine/core';
import { useWebhookURL, useTriggerWebhook } from '../../../hooks/useWebhook';
import { IconCopy, IconCheck, IconSend, IconExternalLink, IconAlertCircle } from '@tabler/icons-react';
import { useTheme } from '../../../theme/ThemeContext';
import { toastError } from '../../../lib/toast';

interface WebhookPanelProps {
  flowId: string;
  isVisible: boolean;
}

export const WebhookPanel = ({ flowId, isVisible }: WebhookPanelProps) => {
  const [copied, setCopied] = useState(false);
  const [testPayload, setTestPayload] = useState('{\n  "event": "test",\n  "data": "sample"\n}');
  
  const { data: webhookData, isLoading, error } = useWebhookURL(flowId);
  const triggerWebhook = useTriggerWebhook();
  const { theme } = useTheme();

  if (!isVisible) {
    return null;
  }

  const handleCopy = async () => {
    if (webhookData?.webhookUrl) {
      await navigator.clipboard.writeText(webhookData.webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTest = () => {
    try {
      const payload = JSON.parse(testPayload);
      triggerWebhook.mutate({ flowId, payload });
    } catch {
      toastError('Invalid JSON payload for webhook test');
    }
  };

  return (
    <Box
      mb="md"
      p="md"
      style={{
        background: theme.colors.paper,
        border: `2px solid ${theme.colors.ink}`,
        borderRadius: theme.borderRadius.md,
      }}
    >
      <Group gap="xs" mb="md">
        <IconExternalLink 
          size={20} 
          style={{ color: theme.colors.accent.primary }} 
        />
        <Text size="sm" fw={600} style={{ color: theme.colors.text.primary }}>
          Webhook URL
        </Text>
      </Group>

      <Text size="xs" mb="sm" style={{ color: theme.colors.text.secondary }}>
        Use this URL to trigger your flow from external services or local tests.
      </Text>

      {isLoading && (
        <Group gap="xs" p="xs" style={{ border: `1px dashed ${theme.colors.ink}`, borderRadius: 8 }}>
          <Loader size="xs" />
          <Text size="sm" c="dimmed">
            Loading webhook URL...
          </Text>
        </Group>
      )}

      {error && (
        <Alert
          icon={<IconAlertCircle size={14} />}
          color="red"
          variant="light"
          styles={{
            root: {
              border: `1px solid #f43f5e`,
            },
          }}
        >
          Failed to load webhook URL
        </Alert>
      )}

      {webhookData && (
        <Stack gap="md">
          {/* URL Display */}
          <Box>
            <Text size="xs" fw={700} c={theme.colors.ink} mb={4}>
              Endpoint
            </Text>
            <Group
              gap="xs"
              px="sm"
              py="xs"
              style={{
                background: 'rgba(45, 52, 54, 0.04)',
                border: `1px solid ${theme.colors.ink}`,
                borderRadius: theme.borderRadius.sm,
              }}
            >
              <Code
                style={{
                  flex: 1,
                  fontSize: '11px',
                  background: 'transparent',
                  color: theme.colors.text.secondary,
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                {webhookData.webhookUrl}
              </Code>
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={handleCopy}
                title="Copy URL"
                style={{
                  color: copied ? '#22c55e' : theme.colors.text.secondary,
                }}
              >
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            </Group>
            <Text size="xs" c="dimmed" mt={4}>
              Supported methods: {webhookData.methods.join(', ')}
            </Text>
          </Box>

          {/* Test Section */}
          <Box>
            <Text size="xs" fw={500} c="dimmed" mb="xs">
              Quick test
            </Text>
            <Textarea
              size="xs"
              value={testPayload}
              onChange={(e) => setTestPayload(e.currentTarget.value)}
              placeholder='{\n  "key": "value"\n}'
              minRows={6}
              maxRows={10}
              styles={{
                input: {
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  background: theme.colors.background.tertiary,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary,
                },
              }}
            />
            <Button
              fullWidth
              size="xs"
              mt="xs"
              leftSection={<IconSend size={16} />}
              onClick={handleTest}
              disabled={triggerWebhook.isPending}
              style={{
                background: theme.colors.accent.primary,
                border: `1px solid ${theme.colors.ink}`,
              }}
            >
              {triggerWebhook.isPending ? 'Sending...' : 'Send test request'}
            </Button>
          </Box>

          {/* Usage Example */}
          <Box
            pt="md"
            style={{
              borderTop: `1px solid ${theme.colors.border.primary}`,
            }}
          >
            <Text size="xs" fw={500} c="dimmed" mb="xs">
              Example cURL:
            </Text>
            <Code
              block
              style={{
                fontSize: '11px',
                background: theme.colors.background.tertiary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius.sm,
                padding: theme.spacing.sm,
                color: theme.colors.text.secondary,
                overflowX: 'auto',
              }}
            >
              {`curl -X POST ${webhookData.webhookUrl} \\\n  -H "Content-Type: application/json" \\\n  -d '{"event": "test", "data": "value"}'`}
            </Code>
          </Box>
        </Stack>
      )}
    </Box>
  );
};
