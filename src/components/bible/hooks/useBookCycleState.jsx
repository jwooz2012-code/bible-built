import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useBookCycleState(userId, bookIndex) {
  const queryClient = useQueryClient();

  const { data: cycleState, isLoading } = useQuery({
    queryKey: ['bookCycleState', userId, bookIndex],
    queryFn: async () => {
      if (!userId || bookIndex === null || bookIndex === undefined) return null;
      const states = await base44.entities.BookCycleState.filter({ userId, bookIndex });
      return states[0] || null;
    },
    enabled: !!userId && bookIndex !== null && bookIndex !== undefined,
  });

  const currentCycle = cycleState?.currentCycle || 1;

  const restartMutation = useMutation({
    mutationFn: async () => {
      if (cycleState) {
        return await base44.entities.BookCycleState.update(cycleState.id, {
          currentCycle: cycleState.currentCycle + 1
        });
      } else {
        return await base44.entities.BookCycleState.create({
          userId,
          bookIndex,
          currentCycle: 2
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookCycleState', userId, bookIndex] });
    },
  });

  return {
    currentCycle,
    isLoading,
    restartBook: restartMutation.mutate,
    isRestarting: restartMutation.isPending,
  };
}