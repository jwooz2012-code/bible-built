import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { computeTodayAssignment } from '@/components/bible/plans/planUtils';

export function useCompleteTodaysAssignment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userId, plan, allTimeLogs, todayKey }) => {
      if (!plan?.startDate || !plan?.endDate) {
        throw new Error('No active plan');
      }

      // Compute today's assignment
      const assignment = computeTodayAssignment({ plan, logs: allTimeLogs, todayKey });
      
      if (!assignment || assignment.today.length === 0) {
        return { added: 0 };
      }

      // Find which chapters are already logged for today
      const todayLogs = allTimeLogs.filter(log => log.dateKey === todayKey);
      const completedIds = new Set(todayLogs.map(log => log.chapterId));

      // Filter to only missing chapters
      const missingChapters = assignment.today.filter(ch => !completedIds.has(ch.chapterId));

      if (missingChapters.length === 0) {
        return { added: 0 };
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

      await Promise.all(createPromises);

      return { added: missingChapters.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dayReadingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['readingLogsRange'] });
      
      if (data.added > 0) {
        toast.success(`Marked ${data.added} chapter${data.added > 1 ? 's' : ''} complete`);
      } else {
        toast.success('Already complete');
      }
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