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
    _apiKey?: string,
    onSuccess?: (flow: any) => void
  ) => {
    if (!description.trim()) {
      toastError('Please describe the flow you want to create');
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

      // Llamar a la API (ahora usa Groq con API key del backend)
      const response = await generateFlowWithOpenAI(
        description,
        systemPrompt
      );

      if (!response.success || !response.flow) {
        throw new Error(response.error || 'Could not generate flow');
      }

      console.log('🔍 [AI] Respuesta del backend:', response.flow);
      console.log('🔍 [AI] Nodos recibidos:', response.flow.nodes);
      
      // Log de metadata de cada nodo
      response.flow.nodes.forEach((node: any, index: number) => {
        console.log(`🎨 [AI] Nodo ${index + 1} "${node.data?.label || node.label}":`, {
          type: node.data?.type || node.type,
          subtitle: node.data?.subtitle,
          icon: node.data?.icon,
          color: node.data?.color,
          category: node.data?.category,
        });
      });

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
      
      console.log('✅ [AI] Nodos transformados para React Flow:', transformedFlow.nodes);
      transformedFlow.nodes.forEach((node: any, index: number) => {
        console.log(`📦 [AI] Nodo transformado ${index + 1}:`, {
          id: node.id,
          type: node.type,
          label: node.data?.label,
          nodeType: node.data?.type,
          subtitle: node.data?.subtitle,
          icon: node.data?.icon,
          color: node.data?.color,
          category: node.data?.category,
        });
      });

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
      
      // Si es error de rate limit, mostrar mensaje especial
      if (error.isRateLimit && error.retryAfter) {
        const seconds = Math.ceil(error.retryAfter);
        toastError(`Límite de API excedido. Espera ${seconds} segundos e intenta de nuevo.`, 'warning', 10000);
      } else {
        toastError(error.message || 'Error generating flow with AI');
      }
      
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
  const nodes = aiFlow.nodes.map((node: any) => {
    // Si el nodo ya tiene estructura React Flow completa (data.label, data.subtitle, etc.), usarlo directamente
    if (node.data && node.data.label && node.data.subtitle && node.data.icon) {
      console.log(`✅ [Transform] Usando metadata del backend para "${node.data.label}"`);
      return {
        id: node.id,
        type: 'custom',
        position: node.position,
        data: node.data, // Usar data del backend que ya tiene metadata completa
      };
    }
    
    console.warn(`⚠️ [Transform] Generando metadata desde frontend para "${node.data?.label || node.id}" - backend no envió metadata completa`);
    
    // Si no tiene metadata completa, generarla desde el frontend (fallback)
    return {
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        label: node.data?.label || 'Node',
        type: node.data?.type || 'custom',
        subtitle: node.data?.subtitle || getCategoryForType(node.data?.type),
        icon: node.data?.icon || getIconForType(node.data?.type),
        color: node.data?.color || getColorForType(node.data?.type),
        category: node.data?.category || getCategoryForType(node.data?.type),
        description: node.data?.description || '',
        parameters: node.data?.parameters || {},
        nodeTypeId: node.data?.type,
      },
    };
  });

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
