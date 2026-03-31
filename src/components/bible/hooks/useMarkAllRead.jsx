import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { generateChapterId } from '@/components/bible/bibleData';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { useCelebration } from '@/components/celebration/CelebrationContext';
import { detectNewCelebrations } from '@/components/celebration/useCelebrationTrigger';

export function useMarkAllRead({ user, allLogs } = {}) {
  const queryClient = useQueryClient();
  const { triggerCelebration } = useCelebration();

  const markAllReadMutation = useMutation({
    mutationFn: async ({ userId, book }) => {
      const now = new Date();
      const dateKey = getDateKey(now);
      const timestamp = now.toISOString();

      const logs = Array.from({ length: book.chapters }, (_, i) => {
        const chapter = i + 1;
        const chapterId = generateChapterId(book.index, chapter);
        return {
          userId,
          dateKey,
          timestamp,
          book: book.name,
          bookIndex: book.index,
          chapter,
          chapterId,
          testament: book.testament,
        };
      });

      return await base44.entities.ReadingLog.bulkCreate(logs);
    },
    onSuccess: (createdLogs, variables) => {
      const today = getDateKey(new Date());
      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, today] });
      queryClient.invalidateQueries({ queryKey: ['readingLogs', variables.userId, '2000-01-01', '2099-12-31'] });
      toast.success(`All chapters of ${variables.book.name} marked as read!`);

      // Celebration check — compare before/after
      if (allLogs && createdLogs && user) {
        const newLogEntries = Array.isArray(createdLogs) ? createdLogs : [];
        if (newLogEntries.length > 0) {
          const prevLogs = allLogs;
          const newLogs = [...prevLogs, ...newLogEntries];
          // Use the last chapter as representative newLog for book completion detection
          const lastLog = newLogEntries[newLogEntries.length - 1];
          const celebrations = detectNewCelebrations({ prevLogs, newLogs, newLog: lastLog, user });
          for (const c of celebrations) {
            triggerCelebration(c.type, c.data, { dedupKey: c.dedupKey });
          }
        }
      }
    },
    onError: (error) => {
      console.error('Mark all read error:', error);
      toast.error(error?.message || 'Failed to mark all chapters as read');
    },
  });

  return {
    markAllRead: markAllReadMutation.mutateAsync,
    isMarkingAll: markAllReadMutation.isPending,
  };
}