import { api } from '../client';

export interface AIGenerateFlowRequest {
  description: string;
  context?: string;
  apiKey?: string;
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

/**
 * Genera un flujo usando IA (OpenAI/ChatGPT)
 * Esta puede ser una llamada directa o a través de tu backend
 */
export async function generateFlowWithAI(
  request: AIGenerateFlowRequest
): Promise<AIGenerateFlowResponse> {
  try {
    // Opción 1: Llamar a tu backend que actúa como proxy
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

/**
 * Genera un flujo usando Google Gemini API desde el frontend
 * Gemini ofrece tier gratuito generoso (15 requests/min) sin tarjeta de crédito
 */
export async function generateFlowWithOpenAI(
  description: string,
  systemPrompt: string,
  apiKey: string
): Promise<AIGenerateFlowResponse> {
  try {
    // Combinar system prompt con descripción para Gemini
    const fullPrompt = `${systemPrompt}\n\nDescripción del usuario:\n${description}\n\nResponde SOLO con JSON válido, sin texto adicional.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content in Gemini response');
    }

    // Intentar parsear el JSON
    let flow: AIGeneratedFlow;
    try {
      // Limpiar el contenido si viene con markdown
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      flow = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI-generated flow');
    }

    // Validar estructura básica
    if (!flow.nodes || !Array.isArray(flow.nodes)) {
      throw new Error('Invalid flow structure: missing nodes array');
    }

    if (!flow.edges || !Array.isArray(flow.edges)) {
      throw new Error('Invalid flow structure: missing edges array');
    }

    return {
      success: true,
      flow,
      rawResponse: content,
    };
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return {
      success: false,
      error: error.message || 'Failed to call Gemini API',
    };
  }
}

/**
 * Valida que el flujo generado sea válido para CapyFlow
 */
export function validateGeneratedFlow(flow: AIGeneratedFlow): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar que hay nodos
  if (!flow.nodes || flow.nodes.length === 0) {
    errors.push('El flujo no tiene nodos');
  }

  // Validar que el primer nodo es un trigger
  if (flow.nodes && flow.nodes.length > 0) {
    const firstNode = flow.nodes[0];
    const triggerTypes = ['manual-trigger', 'webhook-trigger'];
    if (!triggerTypes.includes(firstNode.data?.type)) {
      errors.push('El primer nodo debe ser un trigger');
    }
  }

  // Validar IDs únicos de nodos
  if (flow.nodes) {
    const nodeIds = flow.nodes.map((n) => n.id);
    const uniqueIds = new Set(nodeIds);
    if (nodeIds.length !== uniqueIds.size) {
      errors.push('Hay nodos con IDs duplicados');
    }
  }

  // Validar edges
  if (flow.edges) {
    const nodeIds = new Set(flow.nodes?.map((n) => n.id) || []);
    for (const edge of flow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge ${edge.id} referencia nodo fuente inexistente: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge ${edge.id} referencia nodo destino inexistente: ${edge.target}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
