import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { useCelebration } from '@/components/celebration/CelebrationContext';
import { detectNewCelebrations } from '@/components/celebration/useCelebrationTrigger';
import { getVerseCount } from '@/utils/verseCount';
import { triggerHaptic } from '@/components/utils/haptics';
import { CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';

const BASE_XP_PER_VERSE = 5;

export function useToggleChapterRead({ user, allLogs } = {}) {
  const queryClient = useQueryClient();
  const { triggerCelebration } = useCelebration();
  const undoReadRef = useRef(null);

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
    onSuccess: (createdLog, variables) => {
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
      
      // XP & momentum update
      if (user?.id) {
        const verseCount = getVerseCount(variables.book, variables.chapter);
        const boostUntil = user.bibleBoostActiveUntil ? new Date(user.bibleBoostActiveUntil) : null;
        const boostActive = boostUntil && boostUntil > new Date();
        const xpGained = Math.round(verseCount * BASE_XP_PER_VERSE * (boostActive ? 1.5 : 1));
        const currentXp = user.xp ?? 0;
        const newXp = currentXp + xpGained;
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        const newVersesReadToday = (user.versesReadToday ?? 0) + verseCount;
        const target = user.dailyVerseTarget ?? 30;
        const wasBoostActive = user.hasActivatedBibleBoost ?? false;
        const shouldActivateBoost = !wasBoostActive && newVersesReadToday >= target;

        const updatePayload = {
          xp: newXp,
          level: newLevel,
          versesReadToday: newVersesReadToday,
        };

        if (shouldActivateBoost) {
          const boostExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          updatePayload.hasActivatedBibleBoost = true;
          updatePayload.bibleBoostActiveUntil = boostExpiry;
          triggerHaptic('heavy');
          triggerCelebration(CELEBRATION_TYPES.BIBLE_BOOST_ACTIVATED, {
            title: 'Bible Boost Activated!',
            message: '1.5× XP for the next 15 minutes!',
          });
        }

        base44.auth.updateMe(updatePayload).catch(() => {});
      }

      // Celebration checks — after successful persistence
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
      toast.success('Chapter marked as read', {
        duration: 4000,
        action: {
          label: 'Undo',
          onClick: () => undoReadRef.current?.({ userId: variables.userId, chapterId: variables.chapterId }),
        },
      });
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
      return { deletedId: latestLog.id, chapterId, dateKey: latestLog.dateKey };
    },
    onSuccess: (data, variables) => {
      const affectedDateKey = data.dateKey;
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