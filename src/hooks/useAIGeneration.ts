import { useState } from 'react';
import { generateFlowWithOpenAI, validateGeneratedFlow } from '../api/AI/ai.api';
import { generateSystemPrompt, DEFAULT_NODE_TYPES } from '../lib/ai-prompts';
import { useNodeTypes } from './useNodeTypes';
import { showToast, toastError, toastSuccess } from '../lib/toast';

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: nodeTypes } = useNodeTypes();

  const generateFlow = async (
    description: string,
    apiKey?: string,
    onSuccess?: (flow: any) => void
  ) => {
    if (!description.trim()) {
      toastError('Please describe the flow you want to create');
      return;
    }

    if (!apiKey) {
      toastError(
        'Please provide your Google Gemini API key (100% free) in advanced options'
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Preparar tipos de nodos para el prompt
      const nodeTypesInfo =
        nodeTypes?.map((nt) => ({
          type: nt.type,
          name: nt.name,
          category: nt.category,
          description: nt.description,
          parameters: nt.defaultParams ? JSON.parse(nt.defaultParams) : {},
        })) || DEFAULT_NODE_TYPES;

      // Generar el prompt del sistema
      const systemPrompt = generateSystemPrompt(nodeTypesInfo);

      // Llamar a la API de Google Gemini
      const response = await generateFlowWithOpenAI(
        description,
        systemPrompt,
        apiKey
      );

      if (!response.success || !response.flow) {
        throw new Error(response.error || 'Could not generate flow');
      }

      // Validar el flujo generado
      const validation = validateGeneratedFlow(response.flow);
      if (!validation.valid) {
        console.warn('Flow validation warnings:', validation.errors);
        // Mostrar advertencias pero no bloquear
        showToast(
          'Advertencia',
          `Flujo generado con advertencias: ${validation.errors.join(', ')}`,
          'warning'
        );
      }

      // Transformar el flujo para React Flow
      const transformedFlow = transformAIFlowToReactFlow(response.flow);

      toastSuccess('Flow generated successfully!');

      // Callback de éxito
      if (onSuccess) {
        onSuccess({
          name: response.flow.flowName,
          description: response.flow.flowDescription,
          ...transformedFlow,
        });
      }

      return transformedFlow;
    } catch (error: any) {
      console.error('Error generating flow with AI:', error);
      toastError(error.message || 'Error generating flow with AI');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateFlow,
    isGenerating,
  };
}

/**
 * Transforma el flujo generado por la IA al formato de React Flow
 */
function transformAIFlowToReactFlow(aiFlow: any) {
  // Transformar nodos
  const nodes = aiFlow.nodes.map((node: any) => ({
    id: node.id,
    type: 'custom', // Todos usan el CustomNode component
    position: node.position,
    data: {
      label: node.data.label,
      type: node.data.type,
      subtitle: getCategoryForType(node.data.type),
      icon: getIconForType(node.data.type),
      color: getColorForType(node.data.type),
      category: getCategoryForType(node.data.type),
      description: node.data.description || '',
      parameters: node.data.parameters || {},
      nodeTypeId: node.data.type,
    },
  }));

  // Transformar edges
  const edges = aiFlow.edges.map((edge: any) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'customEdge',
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));

  return { nodes, edges };
}

/**
 * Obtiene la categoría para un tipo de nodo
 */
function getCategoryForType(type: string): string {
  const categoryMap: Record<string, string> = {
    'manual-trigger': 'Trigger',
    'webhook-trigger': 'Trigger',
    'if-condition': 'Logic',
    'if-condition-v2': 'Logic',
    loop: 'Logic',
    'set-data': 'Data',
    'transform-data': 'Data',
    'json-parser': 'Data',
    'http-request': 'I/O',
    log: 'I/O',
    delay: 'Timing',
  };
  return categoryMap[type] || 'Other';
}

/**
 * Obtiene el icono para un tipo de nodo
 */
function getIconForType(type: string): string {
  const iconMap: Record<string, string> = {
    'manual-trigger': 'IconPlayerPlay',
    'webhook-trigger': 'IconWebhook',
    'if-condition': 'IconGitBranch',
    'if-condition-v2': 'IconGitBranch',
    loop: 'IconRepeat',
    'set-data': 'IconVariable',
    'transform-data': 'IconTransform',
    'json-parser': 'IconBraces',
    'http-request': 'IconWorld',
    log: 'IconFileText',
    delay: 'IconClock',
  };
  return iconMap[type] || 'IconBolt';
}

/**
 * Obtiene el color para un tipo de nodo
 */
function getColorForType(type: string): string {
  const colorMap: Record<string, string> = {
    'manual-trigger': '#3B82F6',
    'webhook-trigger': '#06B6D4',
    'if-condition': '#8B5CF6',
    'if-condition-v2': '#8B5CF6',
    loop: '#A855F7',
    'set-data': '#10B981',
    'transform-data': '#14B8A6',
    'json-parser': '#06B6D4',
    'http-request': '#F59E0B',
    log: '#6B7280',
    delay: '#EC4899',
  };
  return colorMap[type] || '#6B7280';
}
