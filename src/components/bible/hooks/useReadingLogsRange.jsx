import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// One download of the user's reading history, shared by every screen and date
// range (Home, Stats, Calendar, Profile, Challenges); each range is picked out
// of it locally instead of fetching the whole history again.
export const readingHistoryKey = (userId) => ['readingLogs', userId, 'all'];

export function useReadingLogsRange(userId, startDate, endDate) {
  const pickRange = useCallback(
    (logs) => (!startDate || !endDate ? [] : logs.filter((log) => log.dateKey >= startDate && log.dateKey <= endDate)),
    [startDate, endDate],
  );
  return useQuery({
    queryKey: readingHistoryKey(userId),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return base44.entities.ReadingLog.filter({ userId });
    },
    select: pickRange,
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 60 * 1000, // 1 minute — prevents redundant refetches on navigation
    refetchOnMount: true,
  });
}
