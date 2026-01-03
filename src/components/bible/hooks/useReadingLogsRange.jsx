import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useReadingLogsRange(userId, startDate, endDate) {
  return useQuery({
    queryKey: ['readingLogs', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      if (!startDate || !endDate) return [];
      const logs = await base44.entities.ReadingLog.filter({ userId });
      return logs.filter(log => log.dateKey >= startDate && log.dateKey <= endDate);
    },
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 0,
  });
}