import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUser() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      return userData;
    },
    staleTime: 0, // Always fetch fresh user data
    cacheTime: 0, // Don't cache user data
    retry: 1,
  });

  return { user, isLoading, error };
}