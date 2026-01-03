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
    onSuccess: (createdLog, variables) => {
      console.log('[markRead] SUCCESS - Created log:', createdLog);
      console.log('[markRead] DateKey written:', createdLog.dateKey, 'Expected:', variables.dateKey, 'Match:', createdLog.dateKey === variables.dateKey);
      
      // Directly update dayLogs cache (dedupe by id)
      queryClient.setQueryData(['dayLogs', variables.userId, variables.dateKey], (old = []) => {
        const prev = Array.isArray(old) ? old : [];
        if (prev.some(x => x.id === createdLog.id)) {
          console.log('[markRead] Duplicate prevented in dayLogs');
          return prev;
        }
        console.log('[markRead] Adding to dayLogs. Old:', prev.length, 'New:', prev.length + 1);
        return [createdLog, ...prev];
      });
      
      // Update readingLogs cache for any matching range queries (dedupe by id)
      queryClient.setQueriesData(
        { 
          predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
        },
        (old = []) => {
          const prev = Array.isArray(old) ? old : [];
          if (prev.some(x => x.id === createdLog.id)) return prev;
          console.log('[markRead] Adding to readingLogs. Old:', prev.length, 'New:', prev.length + 1);
          return [createdLog, ...prev];
        }
      );
      
      // Invalidate as backstop
      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, variables.dateKey] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
      });
      
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
      await base44.entities.ReadingLog.delete(latestLog.id);
      console.log('[undoRead] Deleted log id:', latestLog.id, 'chapterId:', chapterId);
      return { deletedId: latestLog.id, chapterId, dateKey };
    },
    onSuccess: (data, variables) => {
      console.log('[undoRead] SUCCESS - Deleted id:', data.deletedId, 'chapterId:', data.chapterId);
      
      // Directly update dayLogs cache (remove by id)
      queryClient.setQueryData(['dayLogs', variables.userId, variables.dateKey], (old = []) => {
        const prev = Array.isArray(old) ? old : [];
        const updated = prev.filter(log => log.id !== data.deletedId);
        console.log('[undoRead] Removing from dayLogs. Old:', prev.length, 'New:', updated.length);
        return updated;
      });
      
      // Update readingLogs cache (remove by id)
      queryClient.setQueriesData(
        { 
          predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
        },
        (old = []) => {
          const prev = Array.isArray(old) ? old : [];
          const updated = prev.filter(log => log.id !== data.deletedId);
          console.log('[undoRead] Removing from readingLogs. Old:', prev.length, 'New:', updated.length);
          return updated;
        }
      );
      
      // Invalidate as backstop
      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, variables.dateKey] });
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