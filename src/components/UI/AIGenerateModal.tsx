import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Textarea,
  Button,
  Text,
  Group,
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
            <IconSparkles size={28} className="text-[#e8a020]" />
            <Stack gap={2}>
              <Text className="!text-white font-black text-lg tracking-tight uppercase">
                Generar con IA
              </Text>
              <Text className="!text-white/70 text-xs font-medium">
                ~/ai/generate
              </Text>
            </Stack>
          </Group>
        </Group>
      </div>

      {/* Body con padding */}
      <div className="px-6 py-6 bg-[#FFF8F0]">
      <Stack gap="md">
        {checkingKey ? (
          <div className="bg-[#e8f4ff] border-[2.5px] border-[#2d3436] p-4">
            <Group gap="sm">
              <Loader size={16} color="#2d3436" />
              <Text className="text-[#2d3436] text-sm font-semibold">
                Verificando configuración...
              </Text>
            </Group>
          </div>
        ) : hasStoredKey ? (
          <div className="bg-[#e8ffe8] border-[2.5px] border-[#2d3436] p-4">
            <Group gap="sm" mb="xs">
              <IconCheck size={18} className="text-[#2d3436]" />
              <Text className="text-[#2d3436] font-black text-sm uppercase tracking-wide">
                API Key Configurada
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" className="text-[#2d3436] font-medium">
                Usarás tu API key guardada. No necesitas ingresar una nueva.
              </Text>
              {onOpenSettings && (
                <Button
                  size="xs"
                  onClick={() => {
                    onOpenSettings();
                    handleClose();
                  }}
                  className="
                    !bg-[#2d3436] !text-[#FFF8F0] !border-[2px] !border-[#2d3436]
                    !font-bold !text-xs uppercase
                    !shadow-[2px_2px_0px_#2d3436]
                    hover:!-translate-x-[1px] hover:!-translate-y-[1px]
                    hover:!shadow-[3px_3px_0px_#2d3436]
                    !rounded-none
                  "
                >
                  Cambiar
                </Button>
              )}
            </Group>
          </div>
        ) : (
          <div className="bg-[#fff8e1] border-[2.5px] border-[#2d3436] p-4">
            <Group gap="sm" mb="xs">
              <IconAlertCircle size={18} className="text-[#2d3436]" />
              <Text className="text-[#2d3436] font-black text-sm uppercase tracking-wide">
                Configura tu API Key
              </Text>
            </Group>
            <Stack gap="sm">
              <Text size="sm" className="text-[#2d3436] font-medium">
                Para generar flujos con IA, necesitas una API key de Google Gemini
                (100% gratis).
              </Text>
              {onOpenSettings && (
                <Button
                  size="xs"
                  leftSection={<IconKey size={14} />}
                  onClick={() => {
                    onOpenSettings();
                    handleClose();
                  }}
                  className="
                    !bg-[#e8a020] !text-[#0a0a08] !border-[2.5px] !border-[#2d3436]
                    !font-bold !text-xs uppercase
                    !shadow-[2px_2px_0px_#2d3436]
                    hover:!-translate-x-[1px] hover:!-translate-y-[1px]
                    hover:!shadow-[3px_3px_0px_#2d3436]
                    !rounded-none
                    !w-auto
                  "
                >
                  Configurar API Key permanentemente
                </Button>
              )}
              <Text size="xs" className="text-[#2d3436]/70 font-medium">
                O usa una key temporal en las opciones avanzadas ↓
              </Text>
            </Stack>
          </div>
        )}

        <div className="bg-[#e8f4ff] border-[2.5px] border-[#2d3436] p-4">
          <Group gap="sm" mb="xs">
            <IconSparkles size={18} className="text-[#2d3436]" />
            <Text className="text-[#2d3436] font-black text-sm uppercase tracking-wide">
              Describe tu flujo en lenguaje natural
            </Text>
          </Group>
          <Text size="sm" className="text-[#2d3436] font-medium">
            Describe qué tarea o proceso quieres automatizar y la IA generará un flujo
            completo con los nodos necesarios configurados.
          </Text>
        </div>

        <Textarea
          label={
            <Text className="text-[#e8a020] text-xs font-bold uppercase tracking-[2px] mb-2">
              ¿Qué flujo quieres crear?
            </Text>
          }
          placeholder="Ejemplo: Quiero un flujo que reciba datos por webhook, valide si el status es 'success' y registre el resultado..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={5}
          maxRows={10}
          required
          radius={0}
          styles={{
            input: {
              background: '#faf8f4',
              border: '2.5px solid #2d3436',
              color: '#2d3436',
              fontWeight: 600,
              fontSize: '14px',
              padding: '12px',
              fontFamily: 'inherit',
            },
          }}
          className="
            focus-within:shadow-[4px_4px_0_#e8a020]
            focus-within:-translate-x-[2px]
            focus-within:-translate-y-[2px]
            transition-all
          "
        />

        <Stack gap="xs">
          <Text className="text-[#2d3436] text-sm font-bold uppercase tracking-wide">
            Ejemplos de descripciones:
          </Text>
          <div className="space-y-1">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setDescription(example)}
              className="
                w-full text-left px-3 py-2 text-sm
                bg-[#faf8f4] border-[2px] border-[#2d3436]/30
                text-[#2d3436] font-medium
                hover:border-[#e8a020] hover:bg-[#fff8f0]
                hover:-translate-x-[1px] hover:-translate-y-[1px]
                hover:shadow-[2px_2px_0_#e8a020]
                transition-all duration-150
              "
            >
              • {example}
            </button>
          ))}
          </div>
        </Stack>

        <Button
          size="xs"
          leftSection={<IconSettings size={14} />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="
            !bg-[#2d3436] !text-[#FFF8F0] !border-[2px] !border-[#2d3436]
            !font-bold !text-xs uppercase tracking-wide
            !shadow-[2px_2px_0px_#2d3436]
            hover:!-translate-x-[1px] hover:!-translate-y-[1px]
            hover:!shadow-[3px_3px_0px_#2d3436]
            hover:!bg-[#e8a020] hover:!text-[#0a0a08]
            !rounded-none
            !w-auto
          "
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
                  radius={0}
                  styles={{
                    input: {
                      background: '#faf8f4',
                      border: '2.5px solid #2d3436',
                      color: '#2d3436',
                      fontWeight: 600,
                      fontSize: '14px',
                    },
                  }}
                  className="
                    focus-within:shadow-[4px_4px_0_#e8a020]
                    focus-within:-translate-x-[2px]
                    focus-within:-translate-y-[2px]
                    transition-all
                  "
                />
                <div className="bg-[#fff8e1] border-[2.5px] border-[#2d3436] p-4">
                  <Group gap="sm" mb="xs">
                    <IconAlertCircle size={18} className="text-[#2d3436]" />
                  </Group>
                  <Text size="xs" className="text-[#2d3436] font-medium">
                    Tu API key no se almacena y solo se usa para esta generación. Obtén
                    una GRATIS (sin tarjeta de crédito) en{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e8a020] font-bold underline hover:text-[#2d3436]"
                    >
                      Google AI Studio
                    </a>
                  </Text>
                </div>
              </>
            )}

            {!useCustomKey && (
              <div className="bg-[#f0f0f0] border-[2.5px] border-[#2d3436] p-4">
                <Text size="xs" className="text-[#2d3436] font-medium">
                  Se usará la API key configurada en el servidor. Si no hay una
                  configurada, deberás usar tu propia key.
                </Text>
              </div>
            )}
          </Stack>
        </Collapse>

        <Group justify="flex-end" mt="md">
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
              loading ? <Loader size={16} /> : <IconSparkles size={16} />
            }
            onClick={handleGenerate}
            disabled={
              !description.trim() || 
              (!hasStoredKey && !useCustomKey) ||
              (useCustomKey && !apiKey.trim()) || 
              loading
            }
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
            {loading ? 'Generando...' : 'Generar Flujo'}
          </Button>
        </Group>
      </Stack>
      </div>
    </Modal>
  );
}
