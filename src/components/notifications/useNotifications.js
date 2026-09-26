import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const byNewest = (a, b) => new Date(b.createdAt ?? b.created_date) - new Date(a.createdAt ?? a.created_date);

// Shared by the Friends tab badge, the bell, and the "You got cheered" popup so they
// all agree on what's unread.
export function useNotifications(userId) {
  const queryClient = useQueryClient();
  const queryKey = ['notifications', userId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const list = await base44.entities.Notification.filter({ userId }, '-createdAt', 50);
      return [...list].sort(byNewest);
    },
    enabled: !!userId,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const patch = useCallback((fn) => queryClient.setQueryData(queryKey, (prev = []) => fn(prev)), [queryClient, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = useCallback(async (ids) => {
    const list = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
    if (!list.length) return;
    patch((prev) => prev.map((n) => (list.includes(n.id) ? { ...n, isRead: true } : n)));
    await Promise.all(list.map((id) => base44.entities.Notification.update(id, { isRead: true }).catch(() => {})));
  }, [patch]);

  // Update one notification locally (the caller saves it to the server).
  const patchOne = useCallback((id, changes) => patch((prev) => prev.map((n) => (n.id === id ? { ...n, ...changes } : n))), [patch]);

  const remove = useCallback(async (id) => {
    patch((prev) => prev.filter((n) => n.id !== id));
    await base44.entities.Notification.delete(id).catch(() => {});
  }, [patch]);

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    refetch: query.refetch,
    markRead,
    markAllRead: () => markRead(notifications.filter((n) => !n.isRead).map((n) => n.id)),
    remove,
    patch: patchOne,
  };
}
