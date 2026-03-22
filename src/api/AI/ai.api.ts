import { api } from '../client';

export interface AIGenerateFlowRequest {
  description: string;
  context?: string;
  apiKey?: string;
}

export interface AIRepairFlowRequest {
  flow: any;
  issues?: string;
  apiKey?: string;
}

export interface AIRepairFlowResponse {
  success: boolean;
  flow?: AIGeneratedFlow;
  fixes?: string[];
  error?: string;
  rawResponse?: string;
  cleaned?: string;
  hint?: string;
  truncated?: boolean;
}

export interface AIGeneratedFlow {
  flowName: string;
  flowDescription: string;
  nodes: any[];
  edges: any[];
}

export interface AIGenerateFlowResponse {
  success: boolean;
  flow?: AIGeneratedFlow;
  error?: string;
  rawResponse?: string;
}

export async function generateFlowWithAI(
  request: AIGenerateFlowRequest
): Promise<AIGenerateFlowResponse> {
  try {
    const response = await api.post<AIGenerateFlowResponse>(
      '/ai/generate-flow',
      request
    );
    return response;
  } catch (error: any) {
    console.error('Error generating flow with AI:', error);
    return {
      success: false,
      error: error.message || error.data?.error || 'Failed to generate flow with AI',
    };
  }
}

export async function generateFlowWithOpenAI(
  description: string,
  systemPrompt: string
): Promise<AIGenerateFlowResponse> {
  try {
    const response = await api.post<AIGenerateFlowResponse>(
      '/ai/generate-flow',
      {
        description,
        systemPrompt,
      }
    );
    return response;
  } catch (error: any) {
    console.error('❌ Error generating flow with AI:', error);
    
    // Extract detailed error information
    const errorData = error.data || error.response?.data;
    const errorMessage = errorData?.error || error.message || 'Failed to generate flow with AI';
    
    // If it's a rate limit error (429), preserve that information
    if (error.status === 429 || errorData?.retryAfter) {
      const err = new Error(errorMessage) as any;
      err.retryAfter = errorData.retryAfter || 60;
      err.isRateLimit = true;
      throw err;
    }
    
    throw new Error(errorMessage);
  }
}

export function validateGeneratedFlow(flow: AIGeneratedFlow): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!flow.nodes || flow.nodes.length === 0) {
    errors.push('Flow has no nodes');
  }

  if (flow.nodes && flow.nodes.length > 0) {
    const firstNode = flow.nodes[0];
    const triggerTypes = ['manual-trigger', 'webhook-trigger'];
    if (!triggerTypes.includes(firstNode.data?.type)) {
      errors.push('First node must be a trigger');
    }
  }

  if (flow.nodes) {
    const nodeIds = flow.nodes.map((n) => n.id);
    const uniqueIds = new Set(nodeIds);
    if (nodeIds.length !== uniqueIds.size) {
      errors.push('There are nodes with duplicate IDs');
    }
  }

  if (flow.edges) {
    const nodeIds = new Set(flow.nodes?.map((n) => n.id) || []);
    for (const edge of flow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function repairFlowWithAI(
  request: AIRepairFlowRequest
): Promise<AIRepairFlowResponse> {
  try {
    const response = await api.post<AIRepairFlowResponse>(
      '/ai/repair-flow',
      request
    );
    return response;
  } catch (error: any) {
    console.error('❌ Error repairing flow with AI:', error);
    
    // Extract detailed error information
    const errorData = error.data || error.response?.data;
    const errorMessage = errorData?.error || error.message || 'Failed to repair flow with AI';
    const rawResponse = errorData?.rawResponse;
    const cleaned = errorData?.cleaned;
    const hint = errorData?.hint;
    const truncated = errorData?.truncated;
    
    // Detailed log for debugging
    if (rawResponse) {
      console.log('📄 Raw AI Response:', rawResponse);
    }
    if (cleaned) {
      console.log('🧹 Cleaned Response:', cleaned);
    }
    if (hint) {
      console.log('💡 Hint:', hint);
    }
    if (truncated) {
      console.warn('⚠️ Response was truncated!');
    }
    
    return {
      success: false,
      error: errorMessage,
      rawResponse,
      cleaned,
      hint,
      truncated,
    };
  }
}

