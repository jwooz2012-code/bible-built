import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getDateKey } from '@/components/bible/utils/dateUtils';

export const MAX_BUDDIES = 3;

/** Your reading buddies, pending invites, and side-by-side stats. */
export function useBuddies(userId) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['buddies', userId],
    queryFn: async () => {
      const res = await base44.functions.invoke('readingBuddies', { action: 'status', todayKey: getDateKey() });
      return res.data?.buddies ?? [];
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: ['buddies'] }), [queryClient]);
  const call = useCallback(async (payload, { refresh: shouldRefresh = true } = {}) => {
    const res = await base44.functions.invoke('readingBuddies', { ...payload, todayKey: getDateKey() });
    if (shouldRefresh) refresh();
    return res.data;
  }, [refresh]);

  return {
    buddies: query.data ?? [],
    isLoading: query.isLoading,
    invite: (friendId, sharePlan) => call({ action: 'invite', friendId, sharePlan }),
    // Pass { refresh: false } to keep the invite on screen while asking about the plan.
    respond: (buddyId, accept, options) => call({ action: 'respond', buddyId, accept }, options),
    refresh,
    end: (buddyId) => call({ action: 'end', buddyId }),
  };
}

/**
 * Make the buddy's shared plan your plan from today on, so you both read the same
 * chapters on the same days. Replaces your current plan (after the reader confirms).
 */
export async function joinBuddyPlan({ buddyId, userId, existingPlan, queryClient }) {
  const res = await base44.functions.invoke('readingBuddies', { action: 'getPlan', buddyId });
  const { plan, days } = res.data ?? {};
  if (!plan) throw new Error('The shared plan is no longer available');

  const today = getDateKey();
  const upcoming = (days ?? []).filter((d) => d.date >= today && d.assignments?.length);
  if (upcoming.length === 0) throw new Error('That plan has already finished');

  const planData = {
    name: plan.name,
    scope: plan.scope || 'CUSTOM',
    startDate: upcoming[0].date,
    endDate: plan.endDate || upcoming[upcoming.length - 1].date,
    chaptersPerDay: plan.chaptersPerDay,
  };

  let planId;
  if (existingPlan?.id) {
    await base44.entities.ReadingPlan.update(existingPlan.id, planData);
    planId = existingPlan.id;
    const oldDays = await base44.entities.PlanDay.filter({ planId });
    await Promise.all(oldDays.map((d) => base44.entities.PlanDay.delete(d.id)));
  } else {
    const created = await base44.entities.ReadingPlan.create({ userId, ...planData });
    planId = created.id;
  }

  await base44.entities.PlanDay.bulkCreate(upcoming.map((d) => ({ planId, userId, date: d.date, assignments: d.assignments })));
  ['readingPlan', 'planDays', 'planDay', 'plan-days', 'buddies'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  return planData;
}
