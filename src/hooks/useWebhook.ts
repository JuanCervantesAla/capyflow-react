import { useQuery, useMutation } from '@tanstack/react-query';
import { webhooksApi } from '../api/Webhooks/webhooks.api';
import { showToast } from '../lib/toast';

export const useWebhookURL = (flowId: string | undefined) => {
  return useQuery({
    queryKey: ['webhook-url', flowId],
    queryFn: () => webhooksApi.getWebhookURL(flowId!),
    enabled: !!flowId,
    staleTime: Infinity, 
  });
};

export const useTriggerWebhook = () => {
  return useMutation({
    mutationFn: ({ flowId, payload }: { flowId: string; payload: Record<string, any> }) =>
      webhooksApi.triggerWebhook(flowId, payload),
    onSuccess: (data) => {
      showToast({
        title: 'Webhook triggered',
        description: `Execution ID: ${data.executionId}`,
        type: 'success',
      });
    },
    onError: (error: any) => {
      showToast({
        title: 'Failed to trigger webhook',
        description: error.message || 'Unknown error',
        type: 'error',
      });
    },
  });
};
