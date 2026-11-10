import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { computeStreakWithGrace } from '@/components/trackers/deriveStats';
import { myGroupsKey } from '@/components/group/useGroupData';

// Everything on the Friends page comes from one request (getFriendsPage). It's remembered
// while the app is open, and a small copy is saved on the device so the page shows your
// friends and groups straight away next time, while fresh data loads in the background.

const FRESH_MS = 60 * 1000;
const KEEP_MS = 30 * 60 * 1000;
const GRACE_DAYS_PER_MONTH = 2;
const MAX_SAVED_BYTES = 400 * 1024;

export const friendsPageKey = (userId) => ['friendsPage', userId];
const savedKey = (userId) => `bb.friendsPage.${userId}`;

const statusOf = (err) => err?.status ?? err?.response?.status;
const isTemporary = (err) => { const s = statusOf(err); return s === undefined || s === 429 || s >= 500; };

function readSaved(userId) {
  if (!userId) return undefined;
  try {
    const saved = JSON.parse(localStorage.getItem(savedKey(userId)) || 'null');
    if (!saved?.friends) return undefined;
    // Only today's reading is kept, so "Read today" is right; the activity feed waits for fresh data.
    const today = getDateKey();
    return { ...saved, logs: (saved.logs ?? []).filter((l) => l.dateKey === today), saved: true };
  } catch {
    return undefined;
  }
}

function save(userId, data) {
  try {
    const today = getDateKey();
    const lite = {
      friends: data.friends ?? [],
      pending: data.pending ?? [],
      pendingUsers: data.pendingUsers ?? {},
      groups: data.groups ?? [],
      people: data.people ?? [],
      readDays: data.readDays ?? {},
      logs: (data.logs ?? []).filter((l) => l.dateKey === today),
    };
    let text = JSON.stringify(lite);
    if (text.length > MAX_SAVED_BYTES) text = JSON.stringify({ ...lite, readDays: {} });
    if (text.length <= MAX_SAVED_BYTES) localStorage.setItem(savedKey(userId), text);
  } catch {
    /* storage full or unavailable: the page just loads as usual next time */
  }
}

/** The Friends page data: { friends, pending, pendingUsers, groups, people, logs, readDays }. */
export function useFriendsPage(userId) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: friendsPageKey(userId),
    queryFn: async () => {
      const res = await base44.functions.invoke('getFriendsPage', {});
      return res.data ?? {};
    },
    enabled: !!userId,
    staleTime: FRESH_MS,
    gcTime: KEEP_MS,
    // A busy moment or a dropped connection is retried quietly; anything else shows straight away.
    retry: (count, err) => count < 2 && isTemporary(err),
    retryDelay: (attempt) => 600 * 2 ** attempt,
    placeholderData: () => readSaved(userId),
  });

  // Keep the saved copy and the group pages' header info up to date.
  useEffect(() => {
    if (!userId || !query.data || query.isPlaceholderData) return;
    save(userId, query.data);
    queryClient.setQueryData(myGroupsKey(userId), query.data.groups ?? []);
  }, [userId, query.data, query.isPlaceholderData, queryClient]);

  return query;
}

/** A friend's current streak from the days they read: same rule as everywhere else (2 grace days a month). */
export function streakFromDays(days, today = getDateKey()) {
  if (!days?.length) return 0;
  const sorted = [...new Set(days)].sort().reverse();
  const grace = { [today.substring(0, 7)]: GRACE_DAYS_PER_MONTH };
  sorted.forEach((d) => { grace[d.substring(0, 7)] = GRACE_DAYS_PER_MONTH; });
  return computeStreakWithGrace(sorted, today, grace).currentStreak;
}
