import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useProgressMutations() {
  const queryClient = useQueryClient();

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.BookProgress.create(data),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BookProgress.update(id, data),
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: (data) => base44.entities.Achievement.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['achievements'] }),
  });

  return {
    createProgressMutation,
    updateProgressMutation,
    unlockAchievementMutation,
  };
}