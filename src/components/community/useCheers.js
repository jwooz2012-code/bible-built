import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useCelebration, CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';
import { triggerHaptic } from '@/components/utils/haptics';
import { ENCOURAGEMENT_BADGES } from '@/components/badges/badgeEngine';
import { cheerKind } from './cheers';

/** Recent cheers received by these people, grouped by the item that was cheered. */
export function useCheersFor(userIds) {
  const ids = useMemo(() => [...new Set(userIds.filter(Boolean))].sort(), [userIds]);
  const query = useQuery({
    queryKey: ['cheers', ids.join(',')],
    queryFn: async () => {
      const res = await base44.functions.invoke('getCheers', { userIds: ids });
      return res.data?.cheers ?? [];
    },
    enabled: ids.length > 0,
    staleTime: 30000,
  });
  const byTarget = useMemo(() => {
    const map = {};
    (query.data ?? []).forEach((c) => { (map[c.targetKey] ||= []).push(c); });
    return map;
  }, [query.data]);
  return { cheers: query.data ?? [], byTarget, isLoading: query.isLoading };
}

// Items with a cheer on its way to the server. A quick second tap on the same item is
// queued and sent once the first finishes, so rapid switching never creates duplicates.
const inFlight = new Set();
const queued = new Map();

const statusOf = (err) => err?.response?.status ?? err?.status;
const serverError = (err) => err?.data?.error ?? err?.response?.data?.error;
const isDailyLimit = (err) => statusOf(err) === 429 && /daily cheer limit/i.test(serverError(err) || '');
// A busy or dropped connection, not a real "no" from the server.
const isTemporary = (err) => {
  const status = statusOf(err);
  return status === undefined || status >= 500 || (status === 429 && !isDailyLimit(err));
};

// A busy server or a dropped connection is retried quietly for about 15 seconds before the
// user is told it didn't go through. Repeats are safe: the server keeps one cheer per item.
const RETRY_DELAYS_MS = [1000, 2000, 4000, 6000];
async function invokeSendCheer(payload) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await base44.functions.invoke('sendCheer', payload);
    } catch (err) {
      if (!isTemporary(err) || attempt >= RETRY_DELAYS_MS.length) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }
  }
}

/** Send (or switch) a reaction, updating every visible feed right away. */
export function useSendCheer() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const { triggerCelebration } = useCelebration();

  const send = useCallback(async (args) => {
    const { toUserId, kind, targetType, targetKey, label, silent } = args;
    if (!user?.id || !toUserId || toUserId === user.id) return null;

    const mine = { id: `pending-${targetKey}`, fromUserId: user.id, fromName: 'You', toUserId, kind, targetKey, createdAt: new Date().toISOString() };
    const showMine = () => queryClient.setQueriesData({ queryKey: ['cheers'] }, (prev) => (prev
      ? [...prev.filter((c) => !(c.fromUserId === user.id && c.targetKey === targetKey)), mine]
      : prev));

    triggerHaptic();
    if (inFlight.has(targetKey)) {
      queued.set(targetKey, args);
      showMine();
      return { queued: true };
    }
    inFlight.add(targetKey);

    const snapshot = queryClient.getQueriesData({ queryKey: ['cheers'] });
    const previous = snapshot.flatMap(([, data]) => (Array.isArray(data) ? data : []))
      .find((c) => c.fromUserId === user.id && c.targetKey === targetKey);
    showMine();
    // Confirmed straight away; it finishes in the background and is undone with a message if it can't.
    if (!silent && previous?.kind !== kind) {
      const k = cheerKind(kind);
      toast(`${k.emoji} ${previous ? 'Reaction updated' : `${k.label} sent!`}`, { duration: 1400 });
    }

    try {
      const res = await invokeSendCheer({ toUserId, kind, targetType, targetKey, label });
      const stats = res.data?.stats;
      if (stats) {
        const before = { cheersSent: user.cheersSent ?? 0, cheerRecipients: user.cheerRecipients ?? 0 };
        const after = { cheersSent: stats.sent, cheerRecipients: stats.recipients };
        updateUser(after);
        ENCOURAGEMENT_BADGES.forEach((b) => {
          if (before[b.metric] < b.target && after[b.metric] >= b.target) {
            triggerCelebration(CELEBRATION_TYPES.BADGE, { badge: { title: b.title, subtitle: b.subtitle }, userName: user.displayName }, { dedupKey: `badge-${b.id}` });
          }
        });
      }
      queryClient.invalidateQueries({ queryKey: ['cheers'] });
      return res.data;
    } catch (err) {
      snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(isDailyLimit(err) ? "You've sent a lot of cheers today. Try again tomorrow!"
        : statusOf(err) === 403 ? 'You can cheer friends and group members'
        : "Your cheer didn't go through. Check your connection and try again.");
      return null;
    } finally {
      inFlight.delete(targetKey);
      const next = queued.get(targetKey);
      queued.delete(targetKey);
      if (next && next.kind !== kind) send({ ...next, silent: true });
    }
  }, [queryClient, user, updateUser, triggerCelebration]);

  return send;
}
