import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';

/**
 * Hook to mark all of today's assigned chapters as complete
 * Creates ReadingLog entries for each chapter in today's assignment
 */
export function useMarkTodayComplete() {
  const queryClient = useQueryClient();

  const { mutate: markTodayComplete, isPending } = useMutation({
    mutationFn: async ({ userId, todayAssignments }) => {
      if (!todayAssignments || todayAssignments.length === 0) {
        throw new Error('No assignments for today');
      }

      const now = new Date();
      const todayKey = getDateKey(now);
      const timestamp = now.toISOString();
      
      const logsToCreate = [];
      
      todayAssignments.forEach(assignment => {
        const book = BIBLE_BOOKS.find(b => b.name === assignment.bookName);
        if (!book) return;
        
        const chapterId = generateChapterId(book.index, assignment.chapter);
        
        logsToCreate.push({
          userId,
          timestamp,
          dateKey: todayKey,
          book: book.name,
          bookIndex: book.index,
          chapter: assignment.chapter,
          chapterId,
          testament: book.testament,
        });
      });

      // Bulk create all reading logs
      await base44.entities.ReadingLog.bulkCreate(logsToCreate);
      
      return logsToCreate.length;
    },
    onSuccess: (count) => {
      // Invalidate reading logs queries
      queryClient.invalidateQueries({ queryKey: ['readingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dayReadingLogs'] });
      
      toast.success(`Marked ${count} chapter${count !== 1 ? 's' : ''} complete`);
    },
    onError: (error) => {
      console.error('Failed to mark today complete:', error);
      toast.error('Failed to mark today complete');
    },
  });

  return { markTodayComplete, isPending };
}