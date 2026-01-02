import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from './useUser';
import { useGuestMode } from '@/components/GuestModeProvider';

export function useProgressData() {
  const { user } = useUser();
  const { isGuest, guestAPI, guestUser } = useGuestMode();

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['bookProgress', isGuest ? 'guest' : user?.id],
    queryFn: async () => {
      if (isGuest) {
        return await guestAPI.bookProgress.list();
      }
      return base44.entities.BookProgress.filter({ user_id: user?.id });
    },
    enabled: isGuest || !!user,
    initialData: [],
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', isGuest ? 'guest' : user?.id],
    queryFn: async () => {
      if (isGuest) {
        return await guestAPI.achievement.list();
      }
      return base44.entities.Achievement.filter({ user_id: user?.id });
    },
    enabled: isGuest || !!user,
    initialData: [],
  });

  const { data: bibleProgress } = useQuery({
    queryKey: ['bibleProgress', isGuest ? 'guest' : user?.id],
    queryFn: async () => {
      if (isGuest) {
        const results = await guestAPI.bibleProgress.list();
        return results[0] || null;
      }
      const results = await base44.entities.BibleProgress.filter({ user_id: user?.id });
      return results[0] || null;
    },
    enabled: isGuest || !!user,
    initialData: null,
  });

  return {
    user: isGuest ? guestUser : user,
    progressData,
    achievements,
    bibleProgress,
    isLoading: isGuest ? false : isLoading,
  };
}