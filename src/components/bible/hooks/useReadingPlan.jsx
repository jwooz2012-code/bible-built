import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook to fetch the user's active reading plan
 */
export function useReadingPlan(userId) {
  return useQuery({
    queryKey: ['readingPlan', userId],
    queryFn: async () => {
      if (!userId) return null;
      const plans = await base44.entities.ReadingPlan.filter({ userId });
      return plans.length > 0 ? plans[0] : null;
    },
    enabled: !!userId,
    staleTime: 60000,
  });
}

/**
 * Hook to upsert (create or update) a reading plan
 */
export function useUpsertReadingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ existingPlan, planData }) => {
      if (existingPlan?.id) {
        // Update existing plan
        return await base44.entities.ReadingPlan.update(existingPlan.id, planData);
      } else {
        // Create new plan
        return await base44.entities.ReadingPlan.create(planData);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate the reading plan query for this user
      queryClient.invalidateQueries({ queryKey: ['readingPlan', variables.planData.userId] });
    },
  });
}