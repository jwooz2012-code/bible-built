import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getAssignmentForDate } from '@/components/bible/plans/planUtils';

export function useCompleteTodaysAssignment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userId, plan, allTimeLogs, todayKey }) => {
      if (!plan?.startDate || !plan?.endDate) {
        throw new Error('No active plan');
      }

      // Get today's assigned chapters
      const assignedToday = getAssignmentForDate({ plan, dateKey: todayKey });
      
      if (!assignedToday.length) {
        return { added: 0, createdLogs: [] };
      }

      // Find which chapters are already logged (from any date)
      const completedIds = new Set(allTimeLogs.map(log => log.chapterId));

      // Filter to only missing chapters
      const missingChapters = assignedToday.filter(ch => !completedIds.has(ch.chapterId));

      if (missingChapters.length === 0) {
        return { added: 0, createdLogs: [] };
      }

      // Create logs for missing chapters
      const now = new Date();
      const createPromises = missingChapters.map(ch =>
        base44.entities.ReadingLog.create({
          userId,
          timestamp: now.toISOString(),
          dateKey: todayKey,
          book: ch.book,
          bookIndex: ch.bookIndex,
          chapter: ch.chapter,
          chapterId: ch.chapterId,
          testament: ch.testament
        })
      );

      const createdLogs = await Promise.all(createPromises);

      return { added: missingChapters.length, createdLogs, userId, todayKey };
    },
    onSuccess: (data) => {
      if (data.added === 0 || !data.createdLogs?.length) {
        toast.success('Already complete');
        return;
      }

      const { createdLogs, userId, todayKey } = data;

      // A) Update today's cache
      queryClient.setQueryData(['dayLogs', userId, todayKey], (old = []) => {
        const combined = [...createdLogs, ...old];
        const seen = new Set();
        return combined.filter(log => {
          if (seen.has(log.chapterId)) return false;
          seen.add(log.chapterId);
          return true;
        });
      });

      // B) Update all cached range logs
      queryClient.setQueriesData(
        { predicate: q => q.queryKey?.[0] === 'readingLogs' && q.queryKey?.[1] === userId },
        (old = []) => {
          const combined = [...createdLogs, ...old];
          const seen = new Set();
          return combined.filter(log => {
            if (seen.has(log.chapterId)) return false;
            seen.add(log.chapterId);
            return true;
          });
        }
      );

      // Invalidate as backup
      queryClient.invalidateQueries({ queryKey: ['dayLogs', userId, todayKey] });
      queryClient.invalidateQueries({ predicate: q => q.queryKey?.[0] === 'readingLogs' && q.queryKey?.[1] === userId });
      queryClient.invalidateQueries({ predicate: q => q.queryKey?.some(k => typeof k === 'string' && k.includes('Logs') && q.queryKey?.includes(userId)) });

      toast.success(`Marked ${data.added} chapter${data.added > 1 ? 's' : ''} complete`);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to complete assignment');
    }
  });

  return {
    completeToday: mutation.mutate,
    isCompleting: mutation.isPending
  };
}