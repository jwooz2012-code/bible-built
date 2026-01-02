import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from './useUser';

export function useProgressData() {
  const { user } = useUser();

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['bookProgress'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.BookProgress.filter({ user_id: user.id });
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Achievement.filter({ user_id: user.id });
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: bibleProgress } = useQuery({
    queryKey: ['bibleProgress'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.BibleProgress.filter({ user_id: user.id });
      return results[0] || null;
    },
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