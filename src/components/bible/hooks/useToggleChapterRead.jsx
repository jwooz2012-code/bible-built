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
      console.log('[markRead] Invalidating queries for:', variables.userId, variables.dateKey);
      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, variables.dateKey] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const match = query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId;
          if (match) console.log('[markRead] Invalidating readingLogs query:', query.queryKey);
          return match;
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
      console.log('[undoRead] Invalidating queries for:', variables.userId, variables.dateKey);
      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, variables.dateKey] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const match = query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId;
          if (match) console.log('[undoRead] Invalidating readingLogs query:', query.queryKey);
          return match;
        }
      });
      toast.success('Chapter unmarked');
    },
    onError: (error) => {
      console.error('[undoRead] Error:', error);
      toast.error(error?.message || 'Failed to undo');
    },
  });

  return { markRead, undoRead };
}