import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Group pages are remembered for a while, so reopening one is instant; anything older
// than a minute refreshes quietly in the background while the remembered copy shows.
const FRESH_MS = 60 * 1000;
const KEEP_MS = 15 * 60 * 1000;

export const groupDataKey = (groupId) => ['groupData', groupId];
export const myGroupsKey = (userId) => ['myGroups', userId];

async function fetchGroupData(groupId) {
  const res = await base44.functions.invoke('getGroupData', { groupId });
  return res.data ?? {};
}

/** Everything the group page shows: { group, members, logs }. */
export function useGroupData(groupId) {
  return useQuery({
    queryKey: groupDataKey(groupId),
    queryFn: () => fetchGroupData(groupId),
    enabled: !!groupId,
    staleTime: FRESH_MS,
    gcTime: KEEP_MS,
  });
}

/** Starts loading a group before it's opened (e.g. as a finger touches it). Skips groups loaded in the last minute. */
export function prefetchGroupData(queryClient, groupId) {
  if (!groupId) return Promise.resolve();
  return queryClient.prefetchQuery({
    queryKey: groupDataKey(groupId),
    queryFn: () => fetchGroupData(groupId),
    staleTime: FRESH_MS,
    gcTime: KEEP_MS,
  }).catch(() => {});
}
