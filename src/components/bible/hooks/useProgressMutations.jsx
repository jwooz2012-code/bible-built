import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useProgressMutations() {
  const queryClient = useQueryClient();

  const createProgressMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.BookProgress.create({ ...data, user_id: user.id });
    },
    onSuccess: async (data) => {
      const userId = data.user_id;
      await queryClient.invalidateQueries({ queryKey: ['bookProgress', userId] });
      await queryClient.invalidateQueries({ queryKey: ['readingLogs', userId] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BookProgress.update(id, data),
    onSuccess: async (data) => {
      const userId = data.user_id;
      await queryClient.invalidateQueries({ queryKey: ['bookProgress', userId] });
      await queryClient.invalidateQueries({ queryKey: ['readingLogs', userId] });
    },
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Achievement.create({ ...data, user_id: user.id });
    },
    onSuccess: (data) => {
      const userId = data.user_id;
      queryClient.invalidateQueries({ queryKey: ['achievements', userId] });
    },
  });

  const createBibleProgressMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.BibleProgress.create({ ...data, user_id: user.id });
    },
    onSuccess: (data) => {
      const userId = data.user_id;
      queryClient.invalidateQueries({ queryKey: ['bibleProgress', userId] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress', userId] });
    },
  });

  const updateBibleProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BibleProgress.update(id, data),
    onSuccess: (data) => {
      const userId = data.user_id;
      queryClient.invalidateQueries({ queryKey: ['bibleProgress', userId] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress', userId] });
    },
  });

  return {
    createProgressMutation,
    updateProgressMutation,
    unlockAchievementMutation,
    createBibleProgressMutation,
    updateBibleProgressMutation,
  };
}