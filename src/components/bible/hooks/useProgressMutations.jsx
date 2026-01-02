import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useGuestMode } from '@/components/GuestModeProvider';

export function useProgressMutations() {
  const queryClient = useQueryClient();
  const { isGuest, guestAPI } = useGuestMode();
  const api = isGuest ? guestAPI : base44.entities;

  const createProgressMutation = useMutation({
    mutationFn: (data) => api.BookProgress.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => api.BookProgress.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
    },
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: (data) => api.Achievement.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['achievements'] }),
  });

  const createBibleProgressMutation = useMutation({
    mutationFn: (data) => api.BibleProgress.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibleProgress'] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
    },
  });

  const updateBibleProgressMutation = useMutation({
    mutationFn: ({ id, data }) => api.BibleProgress.update(id, data),
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