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
    mutationFn: async ({ userId, todayAssignments, allTimeLogs = [] }) => {
      if (!todayAssignments || todayAssignments.length === 0) {
        throw new Error('No assignments for today');
      }

      const now = new Date();
      const todayKey = getDateKey(now);
      const timestamp = now.toISOString();
      
      // Only skip chapters already logged TODAY (not all-time — same chapter can be read in multiple plans)
      const todayLogs = allTimeLogs.filter(l => l.dateKey === todayKey);
      const completedIds = new Set(todayLogs.map(l => l.chapterId));
      const logsToCreate = [];
      
      todayAssignments.forEach(assignment => {
        const book = BIBLE_BOOKS.find(b => b.name === assignment.bookName);
        if (!book) return;
        
        const chapterId = generateChapterId(book.index, assignment.chapter);
        if (completedIds.has(chapterId)) return; // already read
        
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

      if (logsToCreate.length === 0) {
        toast.success('Already complete for today');
        return { count: 0, userId, todayKey, logsToCreate: [] };
      }

      // Route through trusted server function for duplicate protection
      const res = await base44.functions.invoke('logChapterRead', { chapters: logsToCreate });
      const { created = [], skipped = [] } = res.data ?? {};
      const actualCreated = Array.isArray(created) ? created : logsToCreate;
      
      return { count: actualCreated.length, userId, todayKey, logsToCreate: actualCreated };
    },
    onSuccess: (data) => {
      if (!data || data.count === 0) return;
      const { userId, todayKey, logsToCreate, count } = data;

      // Optimistically update all-time logs cache
      queryClient.setQueriesData(
        { predicate: q => q.queryKey?.[0] === 'readingLogs' && q.queryKey?.[1] === userId },
        (old = []) => [...logsToCreate, ...old]
      );

      // Optimistically update today's logs cache
      queryClient.setQueryData(['dayLogs', userId, todayKey], (old = []) => [...logsToCreate, ...old]);

      // Delay refetch to avoid race with server write propagation
      setTimeout(() => {
        queryClient.invalidateQueries({ predicate: q => q.queryKey?.[0] === 'readingLogs' && q.queryKey?.[1] === userId });
        queryClient.invalidateQueries({ queryKey: ['dayLogs', userId, todayKey] });
      }, 800);

      toast.success(`Marked ${count} chapter${count !== 1 ? 's' : ''} complete`);
    },
    onError: (error) => {
      console.error('Failed to mark today complete:', error);
      toast.error('Failed to mark today complete');
    },
  });

  return { markTodayComplete, isPending };
}