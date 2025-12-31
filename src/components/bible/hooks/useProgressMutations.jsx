import { useMutation, useQueryClient } from '@tanstack/react-query';
import { localDB } from '../localStorageDB';

export function useProgressMutations() {
  const queryClient = useQueryClient();

  const createProgressMutation = useMutation({
    mutationFn: (data) => Promise.resolve(localDB.BookProgress.create(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookProgress'] }),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => Promise.resolve(localDB.BookProgress.update(id, data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookProgress'] }),
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: (data) => Promise.resolve(localDB.Achievement.create(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['achievements'] }),
  });

  const createBibleProgressMutation = useMutation({
    mutationFn: (data) => Promise.resolve(localDB.BibleProgress.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibleProgress'] });
      queryClient.invalidateQueries({ queryKey: ['bookProgress'] });
    },
  });

  const updateBibleProgressMutation = useMutation({
    mutationFn: ({ id, data }) => Promise.resolve(localDB.BibleProgress.update(id, data)),
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