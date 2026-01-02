import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useProgressMutations() {
  const queryClient = useQueryClient();

  const createProgressMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.BookProgress.create({ ...data, user_id: user.id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookProgress'], refetchType: 'active' });
      await queryClient.invalidateQueries({ queryKey: ['readingLogs'], refetchType: 'active' });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BookProgress.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookProgress'], refetchType: 'active' });
      await queryClient.invalidateQueries({ queryKey: ['readingLogs'], refetchType: 'active' });
    },
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Achievement.create({ ...data, user_id: user.id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['achievements'] }),
  });

  const createBibleProgressMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.BibleProgress.create({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibleProgress'] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
    },
  });

  const updateBibleProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BibleProgress.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibleProgress'] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
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