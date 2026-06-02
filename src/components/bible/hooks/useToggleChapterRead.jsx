import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, startTransition } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { useCelebration } from '@/components/celebration/CelebrationContext';
import { detectNewCelebrations } from '@/components/celebration/useCelebrationTrigger';

export function useToggleChapterRead({ user, allLogs } = {}) {
  const queryClient = useQueryClient();
  const { triggerCelebration } = useCelebration();
  const undoReadRef = useRef(null);

  const markRead = useMutation({
    mutationFn: async ({ userId, dateKey, timestamp, book, bookIndex, chapter, chapterId, testament }) => {
      if (!userId) {
        throw new Error('User ID is required. Please log in again.');
      }

      // Route through logChapterRead so XP is awarded on every chapter tap
      const result = await base44.functions.invoke('logChapterRead', {
        chapters: [{ userId, dateKey, timestamp, book, bookIndex, chapter, chapterId, testament }],
      });
      const data = result?.data ?? result;
      const createdLog = Array.isArray(data?.created) ? data.created[0] : null;

      if (!createdLog?.id) {
        throw new Error('Failed to save reading log - no ID returned');
      }

      return createdLog;
    },
    onMutate: ({ chapterId, userId, dateKey, timestamp, book, bookIndex, chapter, testament }) => {
      // Instant visual feedback — fire event before the network call returns
      const optimisticLog = {
        id: `optimistic-${chapterId}-${Date.now()}`,
        chapterId,
        userId,
        dateKey,
        timestamp,
        book,
        bookIndex,
        chapter,
        testament,
        _optimistic: true,
      };
      window.dispatchEvent(new CustomEvent('biblebuilt:chapterRead', {
        detail: { chapterId, optimisticLog }
      }));
      // Show toast immediately with a stable ID so we can update it in-place
      toast.success('Chapter marked as read ✓', {
        id: `read-${chapterId}`,
        duration: 4000,
      });
      return { optimisticLog };
    },
    onSuccess: (createdLog, variables, context) => {
      startTransition(() => {
        queryClient.setQueryData(['dayLogs', variables.userId, variables.dateKey], (old = []) => {
          const prev = Array.isArray(old) ? old : [];
          if (prev.some(x => x.id === createdLog.id)) return prev;
          // Replace any optimistic entry for this chapterId
          const filtered = prev.filter(x => !x._optimistic || x.chapterId !== variables.chapterId);
          return [createdLog, ...filtered];
        });

        queryClient.setQueriesData(
          { 
            predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
          },
          (old = []) => {
            const prev = Array.isArray(old) ? old : [];
            if (prev.some(x => x.id === createdLog.id)) return prev;
            const filtered = prev.filter(x => !x._optimistic || x.chapterId !== variables.chapterId);
            return [createdLog, ...filtered];
          }
        );
      });

      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, variables.dateKey] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
      });
      // Refresh wallet so XPBar shows updated balance
      queryClient.invalidateQueries({ queryKey: ['userWallet', variables.userId] });
      
      // Celebration checks — after successful persistence
      if (allLogs && createdLog) {
        const prevLogs = allLogs.filter(l => l.id !== createdLog.id);
        const newLogs = [...prevLogs, createdLog];
        const celebrations = detectNewCelebrations({
          prevLogs,
          newLogs,
          newLog: createdLog,
          user: user || null,
        });
        for (const c of celebrations) {
          triggerCelebration(c.type, c.data, { dedupKey: c.dedupKey });
        }
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

      // Update the toast in-place with undo action (same ID)
      toast.success('Chapter marked as read', {
        id: `read-${variables.chapterId}`,
        duration: 4000,
        action: {
          label: 'Undo',
          onClick: () => undoReadRef.current?.({ userId: variables.userId, chapterId: variables.chapterId }),
        },
      });
    },
    onError: (error, variables) => {
      console.error('[markRead] Error:', error);
      // Dismiss the optimistic toast and show error
      toast.dismiss(`read-${variables.chapterId}`);
      toast.error(error?.message || 'Failed to mark chapter');
      // Fire reversal event so optimisticLogs can be cleaned up
      window.dispatchEvent(new CustomEvent('biblebuilt:chapterReadError', {
        detail: { chapterId: variables.chapterId }
      }));
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
      return { deletedId: latestLog.id, chapterId, dateKey: latestLog.dateKey };
    },
    onSuccess: (data, variables) => {
      const affectedDateKey = data.dateKey;
      startTransition(() => {
        queryClient.setQueryData(['dayLogs', variables.userId, affectedDateKey], (old = []) => {
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
      });
      
      queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, affectedDateKey] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'readingLogs' && query.queryKey[1] === variables.userId
      });
      
      toast('Chapter unmarked');
    },
    onError: (error) => {
      console.error('[undoRead] Error:', error);
      toast.error(error?.message || 'Failed to undo');
    },
  });

  undoReadRef.current = undoRead.mutateAsync;

  return { 
    markRead: markRead.mutateAsync,
    undoRead: undoRead.mutateAsync,
    isMarkingRead: markRead.isPending,
    isUndoingRead: undoRead.isPending,
  };
}
