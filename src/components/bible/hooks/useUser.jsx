import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUser() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (err) {
        console.error('Failed to fetch user:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return { user, isLoading, error };
}