import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useProgressMutations() {
  const queryClient = useQueryClient();

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.BookProgress.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BookProgress.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
    },
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: (data) => {
      if (isGuest) return guestAPI.achievement.create(data);
      return base44.entities.Achievement.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['achievements'] }),
  });

  const createBibleProgressMutation = useMutation({
    mutationFn: (data) => {
      if (isGuest) return guestAPI.bibleProgress.create(data);
      return base44.entities.BibleProgress.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibleProgress'] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
    },
  });

  const updateBibleProgressMutation = useMutation({
    mutationFn: ({ id, data }) => {
      if (isGuest) return guestAPI.bibleProgress.update(id, data);
      return base44.entities.BibleProgress.update(id, data);
    },
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