import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook to fetch PlanDay records for a specific plan and date
 */
export function usePlanDays({ planId, date, enabled = true }) {
  return useQuery({
    queryKey: ['planDays', planId, date],
    queryFn: async () => {
      if (!planId) return [];
      
      const query = date 
        ? { planId, date }
        : { planId };
      
      return await base44.entities.PlanDay.filter(query);
    },
    enabled: !!planId && enabled,
    staleTime: 60000,
  });
}

/**
 * Hook to fetch today's PlanDay for a given plan
 */
export function useTodayPlanDay({ planId, todayKey, enabled = true }) {
  return useQuery({
    queryKey: ['planDay', planId, todayKey],
    queryFn: async () => {
      if (!planId || !todayKey) return null;
      
      const planDays = await base44.entities.PlanDay.filter({ planId, date: todayKey });
      return planDays.length > 0 ? planDays[0] : null;
    },
    enabled: !!planId && !!todayKey && enabled,
    staleTime: 60000,
  });
}