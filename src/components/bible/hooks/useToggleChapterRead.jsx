import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

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
      console.log('[markRead] Created log:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('[markRead] SUCCESS - Created log:', data);
      console.log('[markRead] DateKey written:', data.dateKey, 'DateKey expected:', variables.dateKey);
      
      // Directly update dayLogs cache
      queryClient.setQueryData(['dayLogs', variables.userId, variables.dateKey], (old = []) => {
        console.log('[markRead] Updating dayLogs cache. Old count:', old.length);
        const updated = [...old, data];
        console.log('[markRead] New dayLogs count:', updated.length);
        return updated;
      });
      
      // Update readingLogs cache for any matching range queries
      queryClient.setQueriesData(
        { 
          predicate: (query) => {
            return query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId;
          }
        },
        (old = []) => {
          console.log('[markRead] Updating readingLogs cache. Old count:', old.length);
          const updated = [...old, data];
          console.log('[markRead] New readingLogs count:', updated.length);
          return updated;
        }
      );
      
      toast.success('Chapter marked as read');
    },
    onError: (error) => {
      console.error('[markRead] Error:', error);
      toast.error(error?.message || 'Failed to mark chapter');
    },
  });

  const undoRead = useMutation({
    mutationFn: async ({ userId, dateKey, chapterId }) => {
      if (!userId) {
        throw new Error('User ID is required. Please log in again.');
      }
      const logs = await base44.entities.ReadingLog.filter({ userId, dateKey, chapterId });
      if (logs.length === 0) throw new Error('No matching log found');
      const latestLog = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      const result = await base44.entities.ReadingLog.delete(latestLog.id);
      console.log('[undoRead] Deleted log:', latestLog.id);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('[undoRead] SUCCESS - Deleted chapterId:', variables.chapterId);
      
      // Directly update dayLogs cache
      queryClient.setQueryData(['dayLogs', variables.userId, variables.dateKey], (old = []) => {
        console.log('[undoRead] Updating dayLogs cache. Old count:', old.length);
        const updated = old.filter(log => log.chapterId !== variables.chapterId);
        console.log('[undoRead] New dayLogs count:', updated.length);
        return updated;
      });
      
      // Update readingLogs cache
      queryClient.setQueriesData(
        { 
          predicate: (query) => {
            return query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId;
          }
        },
        (old = []) => {
          console.log('[undoRead] Updating readingLogs cache. Old count:', old.length);
          const updated = old.filter(log => log.chapterId !== variables.chapterId || log.dateKey !== variables.dateKey);
          console.log('[undoRead] New readingLogs count:', updated.length);
          return updated;
        }
      );
      
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