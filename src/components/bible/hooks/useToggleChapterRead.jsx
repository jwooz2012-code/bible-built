import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { triggerCelebration } from '@/lib/celebrationBus';
import { checkCelebrations } from '@/lib/checkCelebrations';

export function useToggleChapterRead() {
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: async ({ userId, dateKey, timestamp, book, bookIndex, chapter, chapterId, testament }) => {
      if (!userId) {
        throw new Error('User ID is required. Please log in again.');
      }
      
      const result = await base44.entities.ReadingLog.create({
        userId,
        timestamp,
        dateKey,
        book,
        bookIndex,
        chapter,
        chapterId,
        testament,
      });
      
      if (!result || !result.id) {
        throw new Error('Failed to save reading log - no ID returned');
      }
      
      return result;
    },
    onSuccess: async (createdLog, variables) => {
      // Snapshot prev logs before update for celebration diff
      const prevAllLogs = queryClient.getQueryData(
        ['readingLogs', variables.userId]
      ) || queryClient.getQueriesData({ predicate: (q) => q.queryKey[0] === 'readingLogs' && q.queryKey[1] === variables.userId })?.[0]?.[1] || [];

      queryClient.setQueryData(['dayLogs', variables.userId, variables.dateKey], (old = []) => {
        const prev = Array.isArray(old) ? old : [];
        if (prev.some(x => x.id === createdLog.id)) return prev;
        return [createdLog, ...prev];
      });

      queryClient.setQueriesData(
        { 
          predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
        },
        (old = []) => {
          const prev = Array.isArray(old) ? old : [];
          if (prev.some(x => x.id === createdLog.id)) return prev;
          return [createdLog, ...prev];
        }
      );

      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, variables.dateKey] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
      });

      // Celebration checks
      try {
        const user = await base44.auth.me();
        const nextLogs = Array.isArray(prevAllLogs) ? [createdLog, ...prevAllLogs] : [createdLog];
        const celebrations = checkCelebrations({
          prevLogs: Array.isArray(prevAllLogs) ? prevAllLogs : [],
          nextLogs,
          newEntry: createdLog,
          user,
        });
        // Fire in priority order with small delay between
        celebrations.forEach((cel, i) => {
          setTimeout(() => triggerCelebration(cel.type, cel.data, cel.options), i * 600);
        });
      } catch (e) {
        // celebrations are non-critical, swallow errors
      }

      base44.analytics.track({
        eventName: 'chapter_read_completed',
        properties: {
          book: variables.book,
          chapter: variables.chapter,
          testament: variables.testament,
          bookIndex: variables.bookIndex,
          chapterId: variables.chapterId,
        }
      });
      toast.success('Chapter marked as read');
    },
    onError: (error) => {
      console.error('[markRead] Error:', error);
      toast.error(error?.message || 'Failed to mark chapter');
    },
  });

  const undoRead = useMutation({
    mutationFn: async ({ userId, chapterId }) => {
      if (!userId) {
        throw new Error('User ID is required. Please log in again.');
      }
      const logs = await base44.entities.ReadingLog.filter({ userId, chapterId });
      if (logs.length === 0) throw new Error('No matching log found');
      const latestLog = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      await base44.entities.ReadingLog.delete(latestLog.id);
      return { deletedId: latestLog.id, chapterId };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['dayLogs', variables.userId, getDateKey()], (old = []) => {
        const prev = Array.isArray(old) ? old : [];
        return prev.filter(log => log.id !== data.deletedId);
      });
      
      queryClient.setQueriesData(
        { 
          predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
        },
        (old = []) => {
          const prev = Array.isArray(old) ? old : [];
          return prev.filter(log => log.id !== data.deletedId);
        }
      );
      
      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, getDateKey()] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
      });
      
      toast.success('Chapter unmarked');
    },
    onError: (error) => {
      console.error('[undoRead] Error:', error);
      toast.error(error?.message || 'Failed to undo');
    },
  });

  return { 
    markRead: markRead.mutateAsync,
    undoRead: undoRead.mutateAsync,
    isMarkingRead: markRead.isPending,
    isUndoingRead: undoRead.isPending,
  };
}