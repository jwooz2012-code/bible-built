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

  const isLoading = userLoading || (!!user && (progressLoading || achievementsLoading));

  return {
    user,
    progressData,
    achievements,
    isLoading,
    userError,
  };
}