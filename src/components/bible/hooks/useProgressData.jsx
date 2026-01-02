import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from './useUser';
import { useGuestMode } from '@/components/GuestModeProvider';

export function useProgressData() {
  const { user } = useUser();
  const { isGuest, guestAPI, guestUser } = useGuestMode();
  
  const activeUser = isGuest ? guestUser : user;
  const api = isGuest ? guestAPI : base44.entities;

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['bookProgress', activeUser?.id],
    queryFn: async () => api.BookProgress.filter({ user_id: activeUser?.id }),
    enabled: !!activeUser,
    initialData: [],
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', activeUser?.id],
    queryFn: async () => api.Achievement.filter({ user_id: activeUser?.id }),
    enabled: !!activeUser,
    initialData: [],
  });

  const { data: bibleProgress } = useQuery({
    queryKey: ['bibleProgress', activeUser?.id],
    queryFn: async () => {
      const results = await api.BibleProgress.filter({ user_id: activeUser?.id });
      return results[0] || null;
    },
    enabled: !!activeUser,
    initialData: null,
  });

  return {
    user: activeUser,
    progressData,
    achievements,
    bibleProgress,
    isLoading,
  };
}