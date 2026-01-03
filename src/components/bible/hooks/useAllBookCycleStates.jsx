import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useAllBookCycleStates(userId) {
  return useQuery({
    queryKey: ['allBookCycleStates', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await base44.entities.BookCycleState.filter({ userId });
    },
    enabled: !!userId,
    staleTime: 0,
  });
}