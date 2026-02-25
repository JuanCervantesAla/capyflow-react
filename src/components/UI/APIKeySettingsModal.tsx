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
      withCloseButton={false}
      centered
      size="lg"
      padding={0}
      radius={0}
      styles={{
        content: {
          background: '#FFF8F0',
          border: '3px solid #2d3436',
          boxShadow: '6px 6px 0px #2d3436',
        },
        body: {
          padding: 0,
        },
      }}
    >
      {/* Header con fondo negro */}
      <div className="bg-[#0a0a08] px-6 py-4 border-b-[3px] border-[#2d3436]">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconKey size={28} className="text-[#e8a020]" />
            <Stack gap={2}>
              <Text className="!text-white font-black text-lg tracking-tight uppercase">
                API Key Settings
              </Text>
              <Text className="!text-white/70 text-xs font-medium">
                ~/settings/apikey
              </Text>
            </Stack>
          </Group>
        </Group>
      </div>

      {/* Body con padding */}
      <div className="px-6 py-6 bg-[#FFF8F0]">
      <Stack gap="md">
        {/* Información */}
        <div className="bg-[#e8f4ff] border-[2.5px] border-[#2d3436] p-4">
          <Group gap="sm" mb="xs">
            <IconInfoCircle size={18} className="text-[#2d3436]" />
            <Text className="text-[#2d3436] font-black text-sm uppercase tracking-wide">
              ¿Por qué configurar tu API key?
            </Text>
          </Group>
          <Text size="sm" className="text-[#2d3436] font-medium">
            Al guardar tu API key de Google Gemini, no necesitarás ingresarla cada vez
            que generes o repares un flujo. Tu API key se guarda encriptada y solo tú
            puedes verla.
          </Text>
        </div>

        {hasKey && (
          <div className="bg-[#e8ffe8] border-[2.5px] border-[#2d3436] p-4">
            <Group gap="sm" mb="xs">
              <IconCheck size={18} className="text-[#2d3436]" />
              <Text className="text-[#2d3436] font-black text-sm uppercase tracking-wide">
                API Key configurada
              </Text>
            </Group>
            <Text size="sm" className="text-[#2d3436] font-medium">
              Ya tienes una API key guardada. Puedes actualizarla o eliminarla.
            </Text>
          </div>
        )}

        {loading && !hasKey ? (
          <div className="flex justify-center items-center p-12">
            <Loader size="md" color="#e8a020" />
          </div>
        ) : (
          <>
            {/* Campo de API Key */}
            <PasswordInput
              label={
                <Text className="text-[#e8a020] text-xs font-bold uppercase tracking-[2px] mb-2">
                  Google Gemini API Key
                </Text>
              }
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.currentTarget.value)}
              leftSection={<IconKey size={16} />}
              visible={showKey}
              onVisibilityChange={setShowKey}
              radius={0}
              styles={{
                input: {
                  background: '#faf8f4',
                  border: '2.5px solid #2d3436',
                  color: '#2d3436',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '10px 12px',
                  minHeight: '44px',
                },
                section: {
                  color: '#2d3436',
                },
              }}
              className="
                focus-within:shadow-[4px_4px_0_#e8a020]
                focus-within:-translate-x-[2px]
                focus-within:-translate-y-[2px]
                transition-all
              "
            />

            {/* Instrucciones */}
            <div className="bg-[#fff8e1] border-[2.5px] border-[#2d3436] p-4">
              <Group gap="sm" mb="sm">
                <IconAlertCircle size={18} className="text-[#2d3436]" />
                <Text className="text-[#2d3436] font-black text-xs uppercase tracking-wide">
                  ¿Cómo obtener una API key GRATIS?
                </Text>
              </Group>
              <Stack gap={6}>
                <Text size="xs" className="text-[#2d3436] font-medium">
                  1. Ve a{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e8a020] font-bold underline hover:text-[#2d3436]"
                  >
                    Google AI Studio
                  </a>
                </Text>
                <Text size="xs" className="text-[#2d3436] font-medium">2. Inicia sesión con tu cuenta de Google</Text>
                <Text size="xs" className="text-[#2d3436] font-medium">3. Haz clic en "Create API Key"</Text>
                <Text size="xs" className="text-[#2d3436] font-medium">4. Copia la key y pégala aquí</Text>
              </Stack>
            </div>

            {/* Botones de acción */}
            <Group justify="space-between" mt="md">
              <Group>
                {hasKey && (
                  <Button
                    leftSection={<IconTrash size={16} />}
                    onClick={handleDelete}
                    disabled={loading}
                    className="
                      !bg-[#ff6b6b] !text-[#FFF8F0] !border-[2.5px] !border-[#2d3436]
                      !font-bold !text-sm uppercase tracking-wide
                      transition-all duration-200 ease-out
                      !shadow-[2px_2px_0px_#2d3436]
                      hover:!-translate-x-[1px] hover:!-translate-y-[1px]
                      hover:!shadow-[3px_3px_0px_#2d3436]
                      disabled:!opacity-40
                      !rounded-none
                      !h-[40px]
                    "
                  >
                    Eliminar
                  </Button>
                )}
              </Group>
              <Group>
                <Button 
                  onClick={handleClose} 
                  disabled={loading}
                  className="
                    !bg-[#FFF8F0] !text-[#2d3436] !border-[2.5px] !border-[#2d3436]
                    !font-bold !text-sm uppercase tracking-wide
                    transition-all duration-200 ease-out
                    !shadow-[2px_2px_0px_#2d3436]
                    hover:!-translate-x-[1px] hover:!-translate-y-[1px]
                    hover:!shadow-[3px_3px_0px_#2d3436]
                    !rounded-none
                    !h-[40px]
                  "
                >
                  Cancelar
                </Button>
                <Button
                  leftSection={
                    loading ? <Loader size={16} /> : <IconKey size={16} />
                  }
                  onClick={handleSave}
                  disabled={!apiKey.trim() || loading}
                  className="
                    !bg-[#e8a020] !text-[#0a0a08] !border-[3px] !border-[#2d3436]
                    !font-black !text-sm uppercase tracking-wide
                    transition-all duration-200 ease-out
                    !shadow-[3px_3px_0px_#2d3436]
                    hover:!-translate-x-[2px] hover:!-translate-y-[2px]
                    hover:!shadow-[5px_5px_0px_#2d3436]
                    disabled:!opacity-40
                    disabled:!hover:translate-x-0 disabled:!hover:translate-y-0
                    !rounded-none
                    !h-[44px]
                  "
                >
                  {hasKey ? 'Actualizar' : 'Guardar'} API Key
                </Button>
              </Group>
            </Group>
          </>
        )}
      </Stack>
      </div>
    </Modal>
  );
}
