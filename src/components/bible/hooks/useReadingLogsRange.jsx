import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useReadingLogsRange(userId, startDate, endDate) {
  return useQuery({
    queryKey: ['readingLogs', userId, startDate, endDate],
    queryFn: async () => {
      const logs = await base44.entities.ReadingLog.filter({ user_id: userId });
      return logs.filter(log => log.date >= startDate && log.date <= endDate);
    },
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 0,
  });
}