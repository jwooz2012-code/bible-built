import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useReadingLogsRange(userId, startDate, endDate) {
  return useQuery({
    queryKey: ['readingLogs', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      if (!startDate || !endDate) return [];
      const logs = await base44.entities.ReadingLog.filter({ userId });
      const filtered = logs.filter(log => log.dateKey >= startDate && log.dateKey <= endDate);
      console.log('[useReadingLogsRange] Fetched logs:', { userId, startDate, endDate, count: filtered.length });
      return filtered;
    },
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 60_000,   // treat data as fresh for 60s — avoids redundant refetches between chapter marks
    refetchOnMount: true, // only refetch on mount if data is actually stale (not always)
  });
}
