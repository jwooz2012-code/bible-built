import { useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { groupByDateKey, computeStreakWithGrace } from '@/components/trackers/deriveStats';
import { getDateKey } from '@/components/bible/utils/dateUtils';

const GRACE_DAYS_PER_MONTH = 2;

export function useStreakWithGrace(logs, userId) {
  const queryClient = useQueryClient();
  const today = getDateKey();
  const currentMonthKey = today.substring(0, 7);

  // Fetch all grace day records for this user
  const { data: graceDayRecords = [] } = useQuery({
    queryKey: ['graceDays', userId],
    queryFn: () => base44.entities.GraceDay.filter({ userId }),
    enabled: !!userId,
    staleTime: 30000,
  });

  // Build { 'YYYY-MM': remainingGraceDays }
  const graceAvailableByMonth = useMemo(() => {
    const result = {};
    for (const record of graceDayRecords) {
      result[record.monthKey] = Math.max(0, GRACE_DAYS_PER_MONTH - (record.graceDaysUsed || 0));
    }
    // Ensure current month always has default if no record
    if (result[currentMonthKey] === undefined) {
      result[currentMonthKey] = GRACE_DAYS_PER_MONTH;
    }
    return result;
  }, [graceDayRecords, currentMonthKey]);

  const { currentStreak, graceDaysConsumed, graceCoveredDates } = useMemo(() => {
    if (!logs || !logs.length) return { currentStreak: 0, graceDaysConsumed: {}, graceCoveredDates: [] };
    const dateCountMap = groupByDateKey(logs);
    const sortedDates = Array.from(dateCountMap.keys()).sort().reverse();
    return computeStreakWithGrace(sortedDates, today, graceAvailableByMonth);
  }, [logs, today, graceAvailableByMonth]);

  // Sync consumed grace days to DB and flag alerts
  const syncedRef = useRef({});
  useEffect(() => {
    if (!userId || !Object.keys(graceDaysConsumed).length) return;

    const syncGrace = async () => {
      for (const [monthKey, consumed] of Object.entries(graceDaysConsumed)) {
        const existing = graceDayRecords.find(r => r.monthKey === monthKey);
        const alreadyStored = existing?.graceDaysUsed || 0;

        if (consumed <= alreadyStored) continue; // already synced
        if (syncedRef.current[monthKey] === consumed) continue; // already synced this session
        syncedRef.current[monthKey] = consumed;

        // Update or create grace day record
        if (existing) {
          await base44.entities.GraceDay.update(existing.id, { graceDaysUsed: consumed });
        } else {
          await base44.entities.GraceDay.create({ userId, monthKey, graceDaysUsed: consumed });
        }

        // Set localStorage alert for next app open
        const alertKey = `bb_grace_alert_${monthKey}`;
        const existingAlert = parseInt(localStorage.getItem(alertKey) || '0', 10);
        if (consumed > existingAlert) {
          localStorage.setItem(alertKey, String(consumed));
          localStorage.setItem('bb_grace_alert_pending', '1');
        }

        queryClient.invalidateQueries({ queryKey: ['graceDays', userId] });
      }
    };

    syncGrace();
  }, [graceDaysConsumed, userId, graceDayRecords, queryClient]);

  // Current month stats
  const currentMonthRecord = graceDayRecords.find(r => r.monthKey === currentMonthKey);
  const graceDaysUsed = currentMonthRecord?.graceDaysUsed || 0;
  const graceDaysAvailable = Math.max(0, GRACE_DAYS_PER_MONTH - graceDaysUsed);

  return { currentStreak, graceDaysUsed, graceDaysAvailable, graceCoveredDates };
}