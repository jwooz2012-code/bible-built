import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUser() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => await base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  });

  return { user, isLoading, error };
}