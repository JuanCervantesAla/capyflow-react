import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Textarea,
  Button,
  Text,
  Group,
  Alert,
  TextInput,
  Collapse,
  Checkbox,
  Loader,
} from '@mantine/core';
import {
  IconSparkles,
  IconAlertCircle,
  IconKey,
  IconSettings,
  IconCheck,
} from '@tabler/icons-react';
import { useTheme } from '../../theme/ThemeContext';
import { getGeminiAPIKey } from '../../api/User/users.api';

interface AIGenerateModalProps {
  opened: boolean;
  onClose: () => void;
  onGenerate: (description: string, apiKey?: string) => Promise<void>;
  onOpenSettings?: () => void;
  loading?: boolean;
}

export function AIGenerateModal({
  opened,
  onClose,
  onGenerate,
  onOpenSettings,
  loading = false,
}: AIGenerateModalProps) {
  const { theme } = useTheme();
  const [description, setDescription] = useState('');
  const [useCustomKey, setUseCustomKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(false);

  useEffect(() => {
    if (opened) {
      checkForStoredKey();
    }
  }, [opened]);

  const checkForStoredKey = async () => {
    setCheckingKey(true);
    try {
      const response = await getGeminiAPIKey();
      setHasStoredKey(response.hasKey);
    } catch (error) {
      console.error('Error checking for API key:', error);
    } finally {
      setCheckingKey(false);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;

    await onGenerate(description, useCustomKey ? apiKey : undefined);
    handleClose();
  };

  const handleClose = () => {
    setDescription('');
    setApiKey('');
    setUseCustomKey(false);
    setShowAdvanced(false);
    onClose();
  };

  const examples = [
    'Crear un flujo que reciba datos por webhook y los registre',
    'Flujo que llame a una API del clima y muestre la temperatura',
    'Workflow que valide si un número es mayor a 100 y registre el resultado',
    'Proceso que itere sobre una lista de usuarios y envíe un mensaje de bienvenida',
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconSparkles size={24} style={{ color: theme.colors.accent.primary }} />
          <Text size="lg" fw={600}>
            Generar Flujo con IA
          </Text>
        </Group>
      }
      size="lg"
      styles={{
        content: {
          background: theme.colors.background.primary,
        },
        header: {
          background: theme.colors.background.primary,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        },
        body: {
          padding: theme.spacing.lg,
        },
      }}
    >
      <Stack gap="md">
        {checkingKey ? (
          <Alert icon={<Loader size={16} />} color="blue" variant="light">
            <Text size="sm">Verificando configuración...</Text>
          </Alert>
        ) : hasStoredKey ? (
          <Alert
            icon={<IconCheck size={16} />}
            title="API Key configurada"
            color="green"
            variant="light"
          >
            <Group justify="space-between">
              <Text size="sm">
                Usarás tu API key guardada. No necesitas ingresar una nueva.
              </Text>
              {onOpenSettings && (
                <Button
                  size="xs"
                  variant="subtle"
                  onClick={() => {
                    onOpenSettings();
                    handleClose();
                  }}
                >
                  Cambiar
                </Button>
              )}
            </Group>
          </Alert>
        ) : (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Configura tu API key"
            color="yellow"
            variant="light"
          >
            <Stack gap="xs">
              <Text size="sm">
                Para generar flujos con IA, necesitas una API key de Google Gemini
                (100% gratis).
              </Text>
              {onOpenSettings && (
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconKey size={14} />}
                  onClick={() => {
                    onOpenSettings();
                    handleClose();
                  }}
                >
                  Configurar API Key permanentemente
                </Button>
              )}
              <Text size="xs" c="dimmed">
                O usa una key temporal en las opciones avanzadas ↓
              </Text>
            </Stack>
          </Alert>
        )}

        <Alert
          icon={<IconSparkles size={16} />}
          title="Describe tu flujo en lenguaje natural"
          color="blue"
          variant="light"
        >
          <Text size="sm">
            Describe qué tarea o proceso quieres automatizar y la IA generará un flujo
            completo con los nodos necesarios configurados.
          </Text>
        </Alert>

        <Textarea
          label="¿Qué flujo quieres crear?"
          placeholder="Ejemplo: Quiero un flujo que reciba datos por webhook, valide si el status es 'success' y registre el resultado..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={5}
          maxRows={10}
          required
          styles={{
            input: {
              background: theme.colors.background.tertiary,
              borderColor: theme.colors.border.primary,
              color: theme.colors.text.primary,
            },
          }}
        />

        <Stack gap="xs">
          <Text size="sm" fw={500} c="dimmed">
            Ejemplos de descripciones:
          </Text>
          {examples.map((example, index) => (
            <Button
              key={index}
              variant="subtle"
              size="xs"
              onClick={() => setDescription(example)}
              styles={{
                root: {
                  justifyContent: 'flex-start',
                  color: theme.colors.text.secondary,
                },
              }}
            >
              • {example}
            </Button>
          ))}
        </Stack>

        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconSettings size={14} />}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} opciones avanzadas
        </Button>

        <Collapse in={showAdvanced}>
          <Stack gap="md">
            <Checkbox
              label="Usar mi propia API key de Google Gemini (100% GRATIS)"
              checked={useCustomKey}
              onChange={(e) => setUseCustomKey(e.currentTarget.checked)}
            />

            {useCustomKey && (
              <>
                <TextInput
                  label="Google Gemini API Key"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.currentTarget.value)}
                  type="password"
                  leftSection={<IconKey size={16} />}
                  required={useCustomKey}
                  styles={{
                    input: {
                      background: theme.colors.background.tertiary,
                      borderColor: theme.colors.border.primary,
                      color: theme.colors.text.primary,
                    },
                  }}
                />
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="yellow"
                  variant="light"

                                >
                  <Text size="xs">
                    Tu API key no se almacena y solo se usa para esta generación. Obtén
                    una GRATIS (sin tarjeta de crédito) en{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: theme.colors.accent.primary }}
                    >
                      Google AI Studio
                    </a>
                  </Text>
                </Alert>
              </>
            )}

            {!useCustomKey && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="gray"
                variant="light"

              >
                <Text size="xs">
                  Se usará la API key configurada en el servidor. Si no hay una
                  configurada, deberás usar tu propia key.
                </Text>
              </Alert>
            )}
          </Stack>
        </Collapse>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            leftSection={
              loading ? <Loader size={16} /> : <IconSparkles size={16} />
            }
            onClick={handleGenerate}
            disabled={
              !description.trim() || 
              (!hasStoredKey && !useCustomKey) ||
              (useCustomKey && !apiKey.trim()) || 
              loading
            }
            style={{
              background: theme.colors.accent.primary,
            }}
          >
            {loading ? 'Generando...' : 'Generar Flujo'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
