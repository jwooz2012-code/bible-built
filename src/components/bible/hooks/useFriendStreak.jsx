import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMemo } from 'react';
import { groupByDateKey, computeStreakWithGrace } from '@/components/trackers/deriveStats';
import { getDateKey } from '@/components/bible/utils/dateUtils';

const GRACE_DAYS_PER_MONTH = 2;

export function useFriendStreak(friendId) {
  const today = getDateKey();
  const currentMonthKey = today.substring(0, 7);

  // Fetch friend's reading logs
  const { data: logs = [] } = useQuery({
    queryKey: ['readingLogs', friendId],
    queryFn: async () => {
      if (!friendId) return [];
      const allLogs = await base44.entities.ReadingLog.filter({ userId: friendId });
      return allLogs;
    },
    enabled: !!friendId,
    staleTime: 30000,
  });

  // Fetch friend's grace day records
  const { data: graceDayRecords = [] } = useQuery({
    queryKey: ['graceDays', friendId],
    queryFn: () => base44.entities.GraceDay.filter({ userId: friendId }),
    enabled: !!friendId,
    staleTime: 30000,
  });

  // Build grace allowance map
  const graceAvailableByMonth = useMemo(() => {
    const map = {};
    if (logs && logs.length) {
      const months = new Set(logs.map(l => l.dateKey.substring(0, 7)));
      months.add(currentMonthKey);
      for (const m of months) {
        map[m] = GRACE_DAYS_PER_MONTH;
      }
    } else {
      map[currentMonthKey] = GRACE_DAYS_PER_MONTH;
    }
    return map;
  }, [logs, currentMonthKey]);

  // Calculate streak
  const currentStreak = useMemo(() => {
    if (!logs || !logs.length) return 0;
    const dateCountMap = groupByDateKey(logs);
    const sortedDates = Array.from(dateCountMap.keys()).sort().reverse();
    const { currentStreak } = computeStreakWithGrace(sortedDates, today, graceAvailableByMonth);
    return currentStreak;
  }, [logs, today, graceAvailableByMonth]);

  return currentStreak;
}