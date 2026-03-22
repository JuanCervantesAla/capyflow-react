import { useQuery } from '@tanstack/react-query';
import { fetchAllNodeTypes } from '../api/NodeTypes/nodeTypes.api';

export const useNodeTypes = () => {
  return useQuery({
    queryKey: ['nodeTypes'],
    queryFn: ({ signal }) => fetchAllNodeTypes(signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
