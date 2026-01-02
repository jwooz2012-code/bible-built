import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useGuestMode } from '@/components/GuestModeProvider';

export function useUser() {
  const { isGuest, guestUser } = useGuestMode();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', isGuest ? 'guest' : 'auth'],
    queryFn: async () => {
      if (isGuest) {
        return guestUser;
      }
      return await base44.auth.me();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: isGuest ? 0 : 1,
    enabled: true,
  });

  return { user: isGuest ? guestUser : user, isLoading: isGuest ? false : isLoading, error };
}