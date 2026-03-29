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

  // Always give the algorithm the full monthly allowance.
  // The DB is only used for notification/persistence, never to cap the computation.
  // This prevents a feedback loop where stored graceDaysUsed reduces availability on re-runs.
  const graceAvailableByMonth = useMemo(() => {
    return { [currentMonthKey]: GRACE_DAYS_PER_MONTH };
  }, [currentMonthKey]);

  const { currentStreak, graceDaysConsumed, graceCoveredDates } = useMemo(() => {
    if (!logs || !logs.length) return { currentStreak: 0, graceDaysConsumed: {}, graceCoveredDates: [] };
    const dateCountMap = groupByDateKey(logs);
    const sortedDates = Array.from(dateCountMap.keys()).sort().reverse();
    return computeStreakWithGrace(sortedDates, today, graceAvailableByMonth);
  }, [logs, today, graceAvailableByMonth]);

  // Sync consumed grace days to DB — always reconcile bidirectionally
  const syncedRef = useRef({});
  useEffect(() => {
    if (!userId) return;
    // Also handle months that had grace days stored but now compute to 0
    const allMonthsToSync = new Set([
      ...Object.keys(graceDaysConsumed),
      ...graceDayRecords.map(r => r.monthKey),
    ]);
    if (!allMonthsToSync.size) return;

    const syncGrace = async () => {
      for (const monthKey of allMonthsToSync) {
        const consumed = graceDaysConsumed[monthKey] || 0;
        const existing = graceDayRecords.find(r => r.monthKey === monthKey);
        const alreadyStored = existing?.graceDaysUsed || 0;

        if (consumed === alreadyStored) continue; // already in sync
        const syncKey = `${monthKey}:${consumed}`;
        if (syncedRef.current[monthKey] === syncKey) continue; // already synced this render
        syncedRef.current[monthKey] = syncKey;

        // Update or create grace day record
        if (existing) {
          await base44.entities.GraceDay.update(existing.id, { graceDaysUsed: consumed });
        } else if (consumed > 0) {
          await base44.entities.GraceDay.create({ userId, monthKey, graceDaysUsed: consumed });
        }

        // Set localStorage alert only when usage increases
        if (consumed > alreadyStored) {
          const alertKey = `bb_grace_alert_${monthKey}`;
          const existingAlert = parseInt(localStorage.getItem(alertKey) || '0', 10);
          if (consumed > existingAlert) {
            localStorage.setItem(alertKey, String(consumed));
            localStorage.setItem('bb_grace_alert_pending', '1');
          }
        }

        queryClient.invalidateQueries({ queryKey: ['graceDays', userId] });
      }
    };

    syncGrace();
  }, [graceDaysConsumed, userId, graceDayRecords, queryClient]);

  // Current month stats — use freshly computed value as source of truth
  const graceDaysUsed = graceDaysConsumed[currentMonthKey] || 0;
  const graceDaysAvailable = Math.max(0, GRACE_DAYS_PER_MONTH - graceDaysUsed);

  return { currentStreak, graceDaysUsed, graceDaysAvailable, graceCoveredDates };
}