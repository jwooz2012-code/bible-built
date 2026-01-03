import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from './useUser';

export function useProgressData() {
  const { user } = useUser();
  const userId = user?.id;

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['bookProgress', userId],
    queryFn: async () => {
      return await base44.entities.BookProgress.filter({ user_id: userId });
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      return await base44.entities.Achievement.filter({ user_id: userId });
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: bibleProgress } = useQuery({
    queryKey: ['bibleProgress', userId],
    queryFn: async () => {
      const results = await base44.entities.BibleProgress.filter({ user_id: userId });
      return results[0] || null;
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  return {
    user,
    progressData,
    achievements,
    bibleProgress,
    isLoading,
  };
}