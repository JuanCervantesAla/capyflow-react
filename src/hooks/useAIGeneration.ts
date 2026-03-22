import { useState } from 'react';
import { generateFlowWithAI, validateGeneratedFlow } from '../api/AI/ai.api';
import { DEFAULT_NODE_TYPES } from '../lib/ai-prompts';
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
      // Prepare node types for the prompt
      const nodeTypesInfo =
        nodeTypes?.map((nt) => ({
          type: nt.type,
          name: nt.name,
          category: nt.category,
          description: nt.description,
          parameters: nt.defaultParams ? JSON.parse(nt.defaultParams) : {},
        })) || DEFAULT_NODE_TYPES;

      const nodeTypesContext = `Available node types with defaults: ${JSON.stringify(nodeTypesInfo)}`;

      // Call API using backend-side canonical prompt + runtime contracts.
      const response = await generateFlowWithAI({
        description,
        context: nodeTypesContext,
      });

      if (!response.success || !response.flow) {
        throw new Error(response.error || 'Could not generate flow');
      }

      console.log('🔍 [AI] Backend response:', response.flow);
      console.log('🔍 [AI] Nodes received:', response.flow.nodes);
      
      // Log metadata for each node
      response.flow.nodes.forEach((node: any, index: number) => {
        console.log(`🎨 [AI] Node ${index + 1} "${node.data?.label || node.label}":`, {
          type: node.data?.type || node.type,
          subtitle: node.data?.subtitle,
          icon: node.data?.icon,
          color: node.data?.color,
          category: node.data?.category,
        });
      });

      // Validate the generated flow
      const validation = validateGeneratedFlow(response.flow);
      if (!validation.valid) {
        console.warn('Flow validation warnings:', validation.errors);
        // Show warnings but don't block
        showToast(
          'Warning',
          `Flow generated with warnings: ${validation.errors.join(', ')}`,
          'warning'
        );
      }

      // Transform the flow for React Flow
      const transformedFlow = transformAIFlowToReactFlow(response.flow);
      
      console.log('✅ [AI] Nodes transformed for React Flow:', transformedFlow.nodes);
      transformedFlow.nodes.forEach((node: any, index: number) => {
        console.log(`📦 [AI] Transformed node ${index + 1}:`, {
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

      // Success callback
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
      
      // If rate limit error, show special message
      if (error.isRateLimit && error.retryAfter) {
        const seconds = Math.ceil(error.retryAfter);
        const message = `API rate limit exceeded. Wait ${seconds} seconds and try again.`;
        toastError(message);
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
 * Transforms the AI-generated flow to React Flow format
 */
function transformAIFlowToReactFlow(aiFlow: any) {
  // Transform nodes
  const nodes = aiFlow.nodes.map((node: any) => {
    // If the node already has complete React Flow structure (data.label, data.subtitle, etc.), use it directly
    if (node.data && node.data.label && node.data.subtitle && node.data.icon) {
      console.log(`✅ [Transform] Using backend metadata for "${node.data.label}"`);
      return {
        id: node.id,
        type: 'custom',
        position: node.position,
        data: node.data, // Use backend data that already has complete metadata
      };
    }
    
    console.warn(`⚠️ [Transform] Generating metadata from frontend for "${node.data?.label || node.id}" - backend did not send complete metadata`);
    
    // If no complete metadata, generate from frontend (fallback)
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

  // Transform edges
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
 * Gets the category for a node type
 */
function getCategoryForType(type: string): string {
  const categoryMap: Record<string, string> = {
    'manual-trigger': 'Trigger',
    'webhook-trigger': 'Trigger',
    'telegram-trigger': 'Trigger',
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
 * Gets the icon for a node type
 */
function getIconForType(type: string): string {
  const iconMap: Record<string, string> = {
    'manual-trigger': 'IconPlayerPlay',
    'webhook-trigger': 'IconWebhook',
    'telegram-trigger': 'IconBrandTelegram',
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
 * Gets the color for a node type
 */
function getColorForType(type: string): string {
  const colorMap: Record<string, string> = {
    'manual-trigger': '#3B82F6',
    'webhook-trigger': '#06B6D4',
    'telegram-trigger': '#0088CC',
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
