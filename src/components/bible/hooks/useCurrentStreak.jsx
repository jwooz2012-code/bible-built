import { useMemo } from 'react';
import { groupByDateKey, computeStreaks } from '@/components/trackers/deriveStats';
import { getDateKey } from '@/components/bible/utils/dateUtils';

/**
 * Central hook for calculating the current reading streak.
 * This is the single source of truth for streak calculations across the app.
 * 
 * @param {Array} logs - All reading logs for the user
 * @returns {number} currentStreak - Number of consecutive days (ending today) with at least one chapter read
 */
export function useCurrentStreak(logs) {
  const currentStreak = useMemo(() => {
    if (!logs || logs.length === 0) {
      return 0;
    }

    const today = getDateKey();
    const dateCountMap = groupByDateKey(logs);
    const sortedDates = Array.from(dateCountMap.keys()).sort().reverse();
    const { currentStreak } = computeStreaks(sortedDates, today);

    return currentStreak;
  }, [logs]);

  return currentStreak;
}