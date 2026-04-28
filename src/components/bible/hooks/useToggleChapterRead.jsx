import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { useCelebration } from '@/components/celebration/CelebrationContext';
import { getVerseCount } from '@/utils/verseCount';
import { getArtifactById } from '@/data/artifactCatalog';
import { triggerHaptic } from '@/components/utils/haptics';
import { CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { dailyMilestoneKey } from '@/hooks/useWallet';

// XP display hint only — actual XP is computed server-side in logChapterRead
const BASE_XP_PER_VERSE = 2; // matches server constant

// Returns display bonuses only — server computes actual multiplier from equipped artifacts
function calcXpMultipliers(book, chapter, user) {
  return { multiplier: 1.0, bonuses: [] };
}

// Book completion bonus scaled by chapter count (100-500 XP)
function getBookCompletionBonus(book) {
  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  if (!bookData) return 0;
  const chapters = bookData.chapters;
  return Math.round(100 + Math.min(400, (chapters / 150) * 400));
}

// Check if completing this chapter finishes the entire book
function isBookComplete(book, chapter, allLogs) {
  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  if (!bookData) return false;
  const allRead = new Set([...(allLogs ?? []).filter(l => l.book === book).map(l => l.chapter), chapter]);
  return allRead.size >= bookData.chapters;
}

export function useToggleChapterRead({ user, allLogs } = {}) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  const { triggerCelebration } = useCelebration();
  const undoReadRef = useRef(null);

  const markRead = useMutation({
    onMutate: async ({ userId, dateKey, chapterId, book, chapter, testament, bookIndex, timestamp }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['dayLogs', userId, dateKey] });

      // Snapshot previous value for rollback
      const previousDayLogs = queryClient.getQueryData(['dayLogs', userId, dateKey]);

      // Build a temporary optimistic log entry
      const optimisticLog = {
        id: `optimistic-${chapterId}-${dateKey}`,
        userId, chapterId, dateKey, book, chapter, testament, bookIndex,
        timestamp: timestamp ?? new Date().toISOString(),
        xpEarned: Math.round(getVerseCount(book, chapter) * BASE_XP_PER_VERSE),
        _optimistic: true,
      };

      // Immediately update the cache so the tile turns "read" instantly
      queryClient.setQueryData(['dayLogs', userId, dateKey], (old = []) => {
        const prev = Array.isArray(old) ? old : [];
        if (prev.some(x => x.chapterId === chapterId && x.dateKey === dateKey)) return prev;
        return [optimisticLog, ...prev];
      });

      queryClient.setQueriesData(
        { predicate: (q) => q.queryKey[0] === 'readingLogs' && q.queryKey[1] === userId },
        (old = []) => {
          const prev = Array.isArray(old) ? old : [];
          if (prev.some(x => x.chapterId === chapterId && x.dateKey === dateKey)) return prev;
          return [optimisticLog, ...prev];
        }
      );

      // Trigger the +1 floater animation immediately
      window.dispatchEvent(new CustomEvent('biblebuilt:chapterRead', { detail: { chapterId } }));
      triggerHaptic();

      return { previousDayLogs, userId, dateKey };
    },
    onError: (_err, vars, context) => {
      // Roll back optimistic update on failure
      if (context?.previousDayLogs !== undefined) {
        queryClient.setQueryData(['dayLogs', context.userId, context.dateKey], context.previousDayLogs);
      }
      queryClient.invalidateQueries({ queryKey: ['userWallet', vars?.userId] });
    },
    mutationFn: async ({ userId, dateKey, timestamp, book, bookIndex, chapter, chapterId, testament }) => {
      if (!userId) {
        throw new Error('User ID is required. Please log in again.');
      }

      // Compute full XP with all bonuses (artifact boost applied server-side)
      const verseCount = getVerseCount(book, chapter);
      const { multiplier } = calcXpMultipliers(book, chapter, user);
      const xpEarned = Math.round(verseCount * BASE_XP_PER_VERSE * multiplier);

      // Route through trusted server function for duplicate protection
      const res = await base44.functions.invoke('logChapterRead', {
        chapters: [{
          userId,
          timestamp,
          dateKey,
          book,
          bookIndex,
          chapter,
          chapterId,
          testament,
          xpEarned,
        }],
      });

      const { created, skipped, wallet: serverWallet, xpGranted } = res.data ?? {};

      // If skipped (duplicate), return the existing log gracefully
      if (skipped?.includes(chapterId) && (!created || created.length === 0)) {
        const existing = await base44.entities.ReadingLog.filter({ userId, chapterId, dateKey });
        if (existing.length > 0) return { log: existing[0], serverWallet: null, xpGranted: 0 };
        throw new Error('Duplicate chapter — already logged today');
      }

      const result = created?.[0];

      // If the server returned a log without an ID, fetch the real record
      if (!result?.id) {
        const existing = await base44.entities.ReadingLog.filter({ userId, chapterId, dateKey });
        if (existing.length > 0) return { log: existing[0], serverWallet, xpGranted };
        throw new Error('Failed to save reading log');
      }

      return { log: result, serverWallet, xpGranted };
    },
    onSuccess: ({ log: createdLog, serverWallet, xpGranted }, variables) => {
      // Replace optimistic entry with the real server entry
      const optimisticId = `optimistic-${variables.chapterId}-${variables.dateKey}`;
      queryClient.setQueryData(['dayLogs', variables.userId, variables.dateKey], (old = []) => {
        const prev = Array.isArray(old) ? old : [];
        const filtered = prev.filter(x => x.id !== optimisticId);
        if (filtered.some(x => x.id === createdLog.id)) return filtered;
        return [createdLog, ...filtered];
      });

      queryClient.setQueriesData(
        { predicate: (q) => q.queryKey[0] === 'readingLogs' && q.queryKey[1] === variables.userId },
        (old = []) => {
          const prev = Array.isArray(old) ? old : [];
          const filtered = prev.filter(x => x.id !== optimisticId);
          if (filtered.some(x => x.id === createdLog.id)) return filtered;
          return [createdLog, ...filtered];
        }
      );

      // Immediately push server wallet into cache — no re-fetch needed
      if (serverWallet) {
        queryClient.setQueryData(['userWallet', variables.userId], serverWallet);
      } else {
        queryClient.invalidateQueries({ queryKey: ['userWallet', variables.userId] });
      }

      // Cache is already updated optimistically above — skip broad invalidations
      // Only invalidate dayLogs after a short debounce so rapid taps don't flood requests
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, variables.dateKey] });
      }, 2000);

      // Track daily goal for milestones and celebrations (verse-count based, UI only)
      if (user?.id) {
        const verseCount = getVerseCount(variables.book, variables.chapter);
        const newVersesReadToday = (user.versesReadToday ?? 0) + verseCount;
        const target = user.dailyVerseTarget ?? 30;
        const wasGoalMet = user.hasActivatedBibleBoost ?? false;
        const goalJustMet = !wasGoalMet && newVersesReadToday >= target;

        const updatePayload = { versesReadToday: newVersesReadToday };

        if (goalJustMet) {
          updatePayload.hasActivatedBibleBoost = true;
          triggerHaptic();
          // Grant milestone currency (fire-and-forget, idempotent)
          base44.functions.invoke('grantMilestoneReward', {
            milestoneKey: dailyMilestoneKey(variables.userId, variables.dateKey, 'daily_goal_hit'),
            source: 'daily_goal_hit',
            metadataJson: JSON.stringify({ dateKey: variables.dateKey }),
          }).catch(() => {});
          // Delay celebration so toast renders first
          setTimeout(() => triggerCelebration(CELEBRATION_TYPES.BIBLE_BOOST_ACTIVATED, {
            title: 'Daily Goal Met! ✨',
            message: '+100 bonus XP earned!',
          }), 600);
        }

        // Book complete milestone currency (fire-and-forget, idempotent)
        if (isBookComplete(variables.book, variables.chapter, allLogs)) {
          base44.functions.invoke('grantMilestoneReward', {
            milestoneKey: `book_complete:${variables.userId}:${variables.book}`,
            source: 'book_complete',
            metadataJson: JSON.stringify({ book: variables.book }),
          }).catch(() => {});
        }

        // Only update versesReadToday and goal state — NOT xp/level (wallet is source of truth)
        updateUser(updatePayload);
        base44.auth.updateMe(updatePayload).catch(() => {});
      }

      // Analytics
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

      // Show toast with server-authoritative XP amount
      const bookFinishedForToast = isBookComplete(variables.book, variables.chapter, allLogs);
      const bookBonusForToast = bookFinishedForToast ? getBookCompletionBonus(variables.book) : 0;
      const displayXp = xpGranted ?? createdLog.xpEarned ?? 0;

      if (bookFinishedForToast) {
        toast.success(`📕 ${variables.book} Ch. ${variables.chapter} complete! +${bookBonusForToast} XP`, {
          duration: 3500,
          action: { label: 'Undo', onClick: () => undoReadRef.current?.({ userId: variables.userId, chapterId: variables.chapterId }) },
        });
      } else {
        toast.success(displayXp > 0 ? `${variables.book} Ch. ${variables.chapter} · +${displayXp} XP` : `${variables.book} Ch. ${variables.chapter} marked as read`, {
          duration: 3000,
          action: { label: 'Undo', onClick: () => undoReadRef.current?.({ userId: variables.userId, chapterId: variables.chapterId }) },
        });
      }
    },
    onError: (error) => {
      console.error('[markRead] Error:', error);
      toast.error(error?.message || 'Failed to mark chapter');
    },
  });

  const undoRead = useMutation({
    mutationFn: async ({ userId, chapterId }) => {
      if (!userId) throw new Error('User ID is required. Please log in again.');

      // Server handles log deletion + XP deduction atomically
      const res = await base44.functions.invoke('removeChapterRead', { chapterId });
      const { deletedLogId, dateKey } = res.data ?? {};

      // Recompute versesReadToday from remaining logs
      const todayKey = getDateKey();
      const remainingTodayLogs = await base44.entities.ReadingLog.filter({ userId, dateKey: todayKey });
      const uniqueToday = [...new Map(remainingTodayLogs.map(l => [l.chapterId, l])).values()];
      const actualVersesReadToday = uniqueToday.reduce((sum, l) => sum + getVerseCount(l.book, l.chapter), 0);

      const target = user?.dailyVerseTarget ?? 30;
      const hasActivatedBibleBoost = actualVersesReadToday >= target;
      const updatePayload = { versesReadToday: actualVersesReadToday, hasActivatedBibleBoost };

      updateUser(updatePayload);
      base44.auth.updateMe(updatePayload).catch(() => {});

      return { deletedId: deletedLogId, chapterId, dateKey };
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

      // Debounce refetches to avoid rate limit spikes
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['dayLogs', variables.userId, affectedDateKey] });
        queryClient.invalidateQueries({ queryKey: ['userWallet', variables.userId] });
      }, 1000);

      toast('Chapter unmarked — XP removed');
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