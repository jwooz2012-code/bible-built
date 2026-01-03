import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { generateChapterId } from '@/components/bible/bibleData';
import { getDateKey } from '@/components/bible/utils/dateUtils';

export function useMarkAllRead() {
  const queryClient = useQueryClient();

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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dayLogs'] });
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      toast.success(`All chapters of ${variables.book.name} marked as read!`);
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