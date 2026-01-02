import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from './useUser';

export function useProgressData() {
  const { user, isLoading: userLoading, error: userError } = useUser();

  const { data: progressData = [], isLoading: progressLoading } = useQuery({
    queryKey: ['bookProgress', user?.id],
    queryFn: async () => {
      const data = await base44.entities.BookProgress.list();
      return data;
    },
    enabled: !!user?.id && !userError,
    staleTime: 0,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      const data = await base44.entities.Achievement.list();
      return data;
    },
    enabled: !!user?.id && !userError,
    staleTime: 0,
  });

  const { data: bibleProgressList = [], isLoading: bibleProgressLoading } = useQuery({
    queryKey: ['bibleProgress', user?.id],
    queryFn: async () => {
      const data = await base44.entities.BibleProgress.list();
      return data;
    },
    enabled: !!user?.id && !userError,
    staleTime: 0,
  });

  const bibleProgress = bibleProgressList?.[0] || null;

  const isLoading = userLoading || (!!user && (progressLoading || achievementsLoading || bibleProgressLoading));

  return {
    user,
    progressData,
    achievements,
    bibleProgress,
    isLoading,
    userError,
  };
}