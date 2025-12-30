import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useProgressData() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['bookProgress'],
    queryFn: () => base44.entities.BookProgress.list(),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list(),
  });

  const { data: bibleProgress } = useQuery({
    queryKey: ['bibleProgress'],
    queryFn: async () => {
      const results = await base44.entities.BibleProgress.list();
      return results[0] || null;
    },
  });

  return {
    user,
    progressData,
    achievements,
    bibleProgress,
    isLoading,
  };
}