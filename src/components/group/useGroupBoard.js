import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const boardKey = (groupId, board) => ['groupBoard', groupId, board];

export const statusOf = (err) => err?.status ?? err?.response?.status;

/** A friendly message for a failed board action. */
export function boardError(err, fallback = "Couldn't save right now. Check your connection and try again.") {
  const status = statusOf(err);
  if (status === 429) return "You've posted a lot today. Try again tomorrow.";
  if (status === 403) return 'Only group members can do that.';
  if (status === 404) return 'That post was removed.';
  if (status === 400) return err?.data?.error || err?.response?.data?.error || fallback;
  return fallback;
}

/** Posts on one board of a group, newest first. */
export function useGroupBoard(groupId, board, enabled = true) {
  return useQuery({
    queryKey: boardKey(groupId, board),
    queryFn: async () => {
      const res = await base44.functions.invoke('groupBoard', { action: 'list', groupId, board });
      return res.data?.posts ?? [];
    },
    enabled: !!groupId && enabled,
    staleTime: 30000,
  });
}

/** Board actions. Each one updates the cached list right away and returns the server's answer. */
export function useBoardActions(groupId, board) {
  const queryClient = useQueryClient();
  const key = boardKey(groupId, board);

  const setPosts = useCallback((fn) => queryClient.setQueryData(key, (prev) => fn(prev ?? [])), [queryClient, groupId, board]);
  const replacePost = useCallback((post) => setPosts((list) => list.map((p) => (p.id === post.id ? post : p))), [setPosts]);

  const call = (payload) => base44.functions.invoke('groupBoard', payload).then((res) => res.data ?? {});

  const create = useCallback(async ({ text, passage, anonymous }) => {
    const { post } = await call({ action: 'create', groupId, board, text, passage, anonymous });
    if (post) setPosts((list) => [post, ...list.filter((p) => p.id !== post.id)]);
    return post;
  }, [groupId, board, setPosts]);

  const edit = useCallback(async (postId, { text, passage }) => {
    const { post } = await call({ action: 'edit', postId, text, passage });
    if (post) replacePost(post);
    return post;
  }, [replacePost]);

  const remove = useCallback(async (postId) => {
    const snapshot = queryClient.getQueryData(key);
    setPosts((list) => list.filter((p) => p.id !== postId));
    try {
      await call({ action: 'delete', postId });
    } catch (err) {
      if (statusOf(err) !== 404) { queryClient.setQueryData(key, snapshot); throw err; }
    }
  }, [queryClient, setPosts, groupId, board]);

  const setAnswered = useCallback(async (post, answered) => {
    replacePost({ ...post, answered, answeredAt: answered ? new Date().toISOString() : null });
    try {
      const res = await call({ action: 'answered', postId: post.id, answered });
      if (res.post) replacePost(res.post);
      return res.post;
    } catch (err) {
      replacePost(post);
      throw err;
    }
  }, [replacePost]);

  // "on" says what the tap meant, so a quick double tap can't undo itself on the server.
  const react = useCallback(async (post) => {
    const on = !post.reacted;
    replacePost({ ...post, reacted: on, count: Math.max(0, post.count + (on ? 1 : -1)) });
    try {
      const res = await call({ action: 'react', postId: post.id, on });
      if (res.post) replacePost(res.post);
      return res;
    } catch (err) {
      replacePost(post);
      throw err;
    }
  }, [replacePost]);

  return { create, edit, remove, setAnswered, react };
}
