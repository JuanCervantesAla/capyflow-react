import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Button,
  Text,
  Group,
  Alert,
  Loader,
  PasswordInput,
} from '@mantine/core';
import {
  IconKey,
  IconAlertCircle,
  IconCheck,
  IconTrash,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useTheme } from '../../theme/ThemeContext';
import { getGeminiAPIKey, saveGeminiAPIKey, deleteGeminiAPIKey } from '../../api/User/users.api';
import { toastSuccess, toastError } from '../../lib/toast';

interface APIKeySettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function APIKeySettingsModal({
  opened,
  onClose,
}: APIKeySettingsModalProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (opened) {
      loadAPIKey();
    }
  }, [opened]);

  const loadAPIKey = async () => {
    setLoading(true);
    try {
      const response = await getGeminiAPIKey();
      setHasKey(response.hasKey);
      if (response.apiKey) {
        setApiKey(response.apiKey);
      }
    } catch (error: any) {
      console.error('Error loading API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toastError('Por favor, ingresa una API key válida');
      return;
    }

    setLoading(true);
    try {
      await saveGeminiAPIKey(apiKey);
      toastSuccess('API key guardada exitosamente');
      setHasKey(true);
      onClose();
    } catch (error: any) {
      toastError(error.message || 'Error al guardar la API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu API key?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteGeminiAPIKey();
      toastSuccess('API key eliminada exitosamente');
      setHasKey(false);
      setApiKey('');
    } catch (error: any) {
      toastError(error.message || 'Error al eliminar la API key');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setApiKey('');
    setShowKey(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconKey size={24} style={{ color: theme.colors.accent.primary }} />
          <Text size="lg" fw={600}>
            Configurar Google Gemini API Key
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
        {/* Información */}
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="¿Por qué configurar tu API key?"
          color="blue"
          variant="light"
        >
          <Text size="sm">
            Al guardar tu API key de Google Gemini, no necesitarás ingresarla cada vez
            que generes o repares un flujo. Tu API key se guarda encriptada y solo tú
            puedes verla.
          </Text>
        </Alert>

        {hasKey && (
          <Alert
            icon={<IconCheck size={16} />}
            title="API Key configurada"
            color="green"
            variant="light"
          >
            <Text size="sm">
              Ya tienes una API key guardada. Puedes actualizarla o eliminarla.
            </Text>
          </Alert>
        )}

        {loading && !hasKey ? (
          <Group justify="center" p="xl">
            <Loader size="md" />
          </Group>
        ) : (
          <>
            {/* Campo de API Key */}
            <PasswordInput
              label="Google Gemini API Key"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.currentTarget.value)}
              leftSection={<IconKey size={16} />}
              visible={showKey}
              onVisibilityChange={setShowKey}
              styles={{
                input: {
                  background: theme.colors.background.tertiary,
                  borderColor: theme.colors.border.primary,
                  color: theme.colors.text.primary,
                },
              }}
            />

            {/* Instrucciones */}
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="yellow"
              variant="light"
            >
              <Stack gap="xs">
                <Text size="xs" fw={500}>
                  ¿Cómo obtener una API key GRATIS?
                </Text>
                <Text size="xs">
                  1. Ve a{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.colors.accent.primary }}
                  >
                    Google AI Studio
                  </a>
                </Text>
                <Text size="xs">2. Inicia sesión con tu cuenta de Google</Text>
                <Text size="xs">3. Haz clic en "Create API Key"</Text>
                <Text size="xs">4. Copia la key y pégala aquí</Text>
              </Stack>
            </Alert>

            {/* Botones de acción */}
            <Group justify="space-between" mt="md">
              <Group>
                {hasKey && (
                  <Button
                    variant="subtle"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    Eliminar
                  </Button>
                )}
              </Group>
              <Group>
                <Button variant="subtle" onClick={handleClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button
                  leftSection={
                    loading ? <Loader size={16} /> : <IconKey size={16} />
                  }
                  onClick={handleSave}
                  disabled={!apiKey.trim() || loading}
                  style={{
                    background: theme.colors.accent.primary,
                  }}
                >
                  {hasKey ? 'Actualizar' : 'Guardar'} API Key
                </Button>
              </Group>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
