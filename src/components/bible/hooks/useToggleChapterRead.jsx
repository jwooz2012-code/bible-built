import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function useToggleChapterRead() {
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: async ({ userId, dateKey, timestamp, book, bookIndex, chapter, chapterId, testament }) => {
      return await base44.entities.ReadingLog.create({
        userId,
        timestamp,
        dateKey,
        book,
        bookIndex,
        chapter,
        chapterId,
        testament,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, variables.dateKey] });
      queryClient.invalidateQueries({ queryKey: ['readingLogs', variables.userId] });
      toast.success('Chapter marked as read');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to mark chapter');
    },
  });

  const undoRead = useMutation({
    mutationFn: async ({ userId, dateKey, chapterId }) => {
      const logs = await base44.entities.ReadingLog.filter({ userId, dateKey, chapterId });
      if (logs.length === 0) throw new Error('No matching log found');
      const latestLog = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      return await base44.entities.ReadingLog.delete(latestLog.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, variables.dateKey] });
      queryClient.invalidateQueries({ queryKey: ['readingLogs', variables.userId] });
      toast.success('Chapter unmarked');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to undo');
    },
  });

  return { markRead, undoRead };
}