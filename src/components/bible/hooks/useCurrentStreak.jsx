import { useMemo } from 'react';
import { groupByDateKey, computeStreakWithGrace } from '@/components/trackers/deriveStats';
import { getDateKey } from '@/components/bible/utils/dateUtils';

/**
 * Grace-aware hook for calculating the current reading streak.
 * Uses the same canonical method as Home, Profile, Stats, and GroupDetail.
 *
 * @param {Array} logs - All reading logs for the user
 * @returns {number} currentStreak - Consecutive days (ending today) with at least one chapter read
 */
export function useCurrentStreak(logs) {
  const currentStreak = useMemo(() => {
    if (!logs || logs.length === 0) return 0;

    const today = getDateKey();
    const uniqueDays = Array.from(new Set(logs.map(l => l.dateKey)));
    const graceMap = {};
    for (const d of uniqueDays) { graceMap[d.substring(0, 7)] = 2; }
    graceMap[today.substring(0, 7)] = 2;
    const sortedDesc = [...uniqueDays].sort().reverse();
    const dateCountMap = groupByDateKey(logs);
    const sortedDates = Array.from(dateCountMap.keys()).sort().reverse();
    const { currentStreak } = computeStreakWithGrace(sortedDates, today, graceMap);
    return currentStreak;
  }, [logs]);

  return currentStreak;
}
