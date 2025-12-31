import { useQuery } from '@tanstack/react-query';
import { localDB } from '../localStorageDB';

export function useProgressData() {
  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['bookProgress'],
    queryFn: () => Promise.resolve(localDB.BookProgress.list()),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => Promise.resolve(localDB.Achievement.list()),
  });

  const { data: bibleProgress } = useQuery({
    queryKey: ['bibleProgress'],
    queryFn: () => {
      const results = localDB.BibleProgress.list();
      return Promise.resolve(results[0] || null);
    },
  });

  return {
    user: null,
    progressData,
    achievements,
    bibleProgress,
    isLoading,
  };
}