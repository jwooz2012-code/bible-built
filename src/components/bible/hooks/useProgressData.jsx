import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from './useUser';

export function useProgressData() {
  const { user } = useUser();

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['bookProgress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.BookProgress.list();
    },
    enabled: !!user,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Achievement.list();
    },
    enabled: !!user,
  });

  const { data: bibleProgress } = useQuery({
    queryKey: ['bibleProgress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const results = await base44.entities.BibleProgress.list();
      return results[0] || null;
    },
    enabled: !!user,
  });

  return {
    user,
    progressData,
    achievements,
    bibleProgress,
    isLoading,
  };
}