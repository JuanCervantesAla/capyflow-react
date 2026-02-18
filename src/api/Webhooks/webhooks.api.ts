import { api } from '../client';

export interface WebhookURLResponse {
  flowId: string;
  webhookUrl: string;
  methods: string[];
}

export interface TriggerWebhookResponse {
  message: string;
  executionId: string;
  flowId: string;
}

export const webhooksApi = {
  getWebhookURL: async (flowId: string): Promise<WebhookURLResponse> => {
    const response = await api.get<WebhookURLResponse>(`/webhooks/${flowId}/url`);
    return response;
  },
  
  triggerWebhook: async (
    flowId: string,
    payload: Record<string, any>
  ): Promise<TriggerWebhookResponse> => {
    const response = await api.post<TriggerWebhookResponse>(`/webhooks/${flowId}`, payload);
    return response;
  },
};
