import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useDayReadingLogs(userId, dateKey) {
  return useQuery({
    queryKey: ['dayLogs', userId, dateKey],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      if (!dateKey) return [];
      return await base44.entities.ReadingLog.filter({ userId, dateKey });
    },
    enabled: !!userId && !!dateKey,
    staleTime: 0,
  });
}