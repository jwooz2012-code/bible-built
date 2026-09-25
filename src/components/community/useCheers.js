import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useCelebration, CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';
import { triggerHaptic } from '@/components/utils/haptics';
import { cheerKind } from './cheers';

// Must match the encouragement badges in badgeEngine.
const CHEER_BADGES = [
  { id: 30, title: 'Encourager', subtitle: 'Cheered on others 10 times', metric: 'sent', target: 10 },
  { id: 31, title: 'Son of Encouragement', subtitle: 'Cheered on others 50 times', metric: 'sent', target: 50 },
  { id: 32, title: 'Iron Sharpens Iron', subtitle: 'Cheered on 10 different people', metric: 'recipients', target: 10 },
];

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

/** Send (or switch) a reaction, updating every visible feed right away. */
export function useSendCheer() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const { triggerCelebration } = useCelebration();

  return useCallback(async ({ toUserId, kind, targetType, targetKey, label, silent }) => {
    if (!user?.id || !toUserId || toUserId === user.id) return null;
    triggerHaptic();

    const snapshot = queryClient.getQueriesData({ queryKey: ['cheers'] });
    const mine = { id: `pending-${targetKey}`, fromUserId: user.id, fromName: 'You', toUserId, kind, targetKey, createdAt: new Date().toISOString() };
    queryClient.setQueriesData({ queryKey: ['cheers'] }, (prev) => (prev
      ? [...prev.filter((c) => !(c.fromUserId === user.id && c.targetKey === targetKey)), mine]
      : prev));

    try {
      const res = await base44.functions.invoke('sendCheer', { toUserId, kind, targetType, targetKey, label });
      const stats = res.data?.stats;
      if (stats) {
        const before = { sent: user.cheersSent ?? 0, recipients: user.cheerRecipients ?? 0 };
        updateUser({ cheersSent: stats.sent, cheerRecipients: stats.recipients });
        CHEER_BADGES.forEach((b) => {
          if (before[b.metric] < b.target && stats[b.metric] >= b.target) {
            triggerCelebration(CELEBRATION_TYPES.BADGE, { badge: { title: b.title, subtitle: b.subtitle }, userName: user.displayName }, { dedupKey: `badge-${b.id}` });
          }
        });
      }
      if (!silent && !res.data?.duplicate) {
        const k = cheerKind(kind);
        toast(`${k.emoji} ${res.data?.changed ? 'Reaction updated' : `${k.label} sent!`}`, { duration: 1400 });
      }
      queryClient.invalidateQueries({ queryKey: ['cheers'] });
      return res.data;
    } catch (err) {
      snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      const status = err?.response?.status ?? err?.status;
      toast.error(status === 429 ? "You've sent a lot of cheers today. Try again tomorrow!" : 'Could not send. Try again.');
      return null;
    }
  }, [queryClient, user, updateUser, triggerCelebration]);
}
