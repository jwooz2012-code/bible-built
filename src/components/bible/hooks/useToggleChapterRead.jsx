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

const BASE_XP_PER_VERSE = 5;

// Returns { multiplier, bonuses } for display
function calcXpMultipliers(book, chapter, user) {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
  const streak = user?.streakDays ?? user?.streak ?? 0;
  const verseCount = getVerseCount(book, chapter);

  const bonuses = [];
  let multiplier = 1.0;

  if (streak >= 7) { multiplier += 0.10; bonuses.push('🔥 Streak Bonus +10%'); }
  if (hour < 8) { multiplier += 0.15; bonuses.push('🌅 Early Bird +15%'); }
  if (verseCount > 50) { multiplier += 0.20; bonuses.push('📖 Deep Dive +20%'); }
  if (dayOfWeek === 0 || dayOfWeek === 6) { multiplier += 0.25; bonuses.push('⚔️ Weekend Warrior +25%'); }

  return { multiplier, bonuses };
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
    mutationFn: async ({ userId, dateKey, timestamp, book, bookIndex, chapter, chapterId, testament }) => {
      if (!userId) {
        throw new Error('User ID is required. Please log in again.');
      }

      // Fetch equipped artifact for XP boost
      let artifactBoost = 1.0;
      try {
        const equipped = await base44.entities.ArtifactOwnership.filter({ userId, isEquipped: true });
        if (equipped.length > 0) {
          const artifact = getArtifactById(equipped[0].artifactId);
          if (artifact?.xpBoost) artifactBoost = artifact.xpBoost;
        }
      } catch (e) {}

      // Compute full XP with all bonuses + artifact boost so it's stored on the log
      const verseCount = getVerseCount(book, chapter);
      const { multiplier } = calcXpMultipliers(book, chapter, user);
      const xpEarned = Math.round(verseCount * BASE_XP_PER_VERSE * multiplier * artifactBoost);

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

      const { created, skipped } = res.data ?? {};

      // If skipped (duplicate), return the existing log gracefully
      if (skipped?.includes(chapterId) && (!created || created.length === 0)) {
        // Fetch existing log for cache consistency
        const existing = await base44.entities.ReadingLog.filter({ userId, chapterId, dateKey });
        if (existing.length > 0) return existing[0];
        throw new Error('Duplicate chapter — already logged today');
      }

      const result = created?.[0];
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
        // Use the exact XP stored on the log
        const xpGained = createdLog.xpEarned ?? Math.round(verseCount * BASE_XP_PER_VERSE);
        const currentXp = user.xp ?? 0;
        const newVersesReadToday = (user.versesReadToday ?? 0) + verseCount;
        const target = user.dailyVerseTarget ?? 30;
        const wasGoalMet = user.hasActivatedBibleBoost ?? false;
        const goalJustMet = !wasGoalMet && newVersesReadToday >= target;

        // Book completion bonus
        const bookFinished = isBookComplete(variables.book, variables.chapter, allLogs);
        const bookBonus = bookFinished ? getBookCompletionBonus(variables.book) : 0;

        const bonusXp = goalJustMet ? 100 : 0;
        const newXp = currentXp + xpGained + bonusXp + bookBonus;
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

        const updatePayload = {
          xp: newXp,
          level: newLevel,
          versesReadToday: newVersesReadToday,
        };

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

        // Optimistic update first so context is immediately current
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

      // Show exactly ONE toast — most specific wins
      const { bonuses } = calcXpMultipliers(variables.book, variables.chapter, user);
      const xpGained = createdLog.xpEarned ?? Math.round(getVerseCount(variables.book, variables.chapter) * BASE_XP_PER_VERSE);
      const bookFinishedForToast = isBookComplete(variables.book, variables.chapter, allLogs);
      const bookBonusForToast = bookFinishedForToast ? getBookCompletionBonus(variables.book) : 0;

      if (bookFinishedForToast) {
        triggerHaptic();
        toast.success(`📕 ${variables.book} complete! +${bookBonusForToast} XP`, {
          duration: 3500,
          action: { label: 'Undo', onClick: () => undoReadRef.current?.({ userId: variables.userId, chapterId: variables.chapterId }) },
        });
      } else if (bonuses.length > 0) {
        toast.success(`+${xpGained} XP · ${bonuses[0].replace(/ \+\d+%$/, '')}`, {
          duration: 3000,
          action: { label: 'Undo', onClick: () => undoReadRef.current?.({ userId: variables.userId, chapterId: variables.chapterId }) },
        });
      } else {
        toast.success('Chapter marked as read', {
          duration: 4000,
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
      if (!userId) {
        throw new Error('User ID is required. Please log in again.');
      }
      const logs = await base44.entities.ReadingLog.filter({ userId, chapterId });
      if (logs.length === 0) throw new Error('No matching log found');
      const latestLog = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      // Delete the log first
      await base44.entities.ReadingLog.delete(latestLog.id);

      // Compute versesReadToday from remaining logs (ground truth)
      const todayKey = getDateKey();
      const remainingTodayLogs = await base44.entities.ReadingLog.filter({ userId, dateKey: todayKey });
      const uniqueToday = [...new Map(remainingTodayLogs.map(l => [l.chapterId, l])).values()];
      const actualVersesReadToday = uniqueToday.reduce((sum, l) => sum + getVerseCount(l.book, l.chapter), 0);

      // Use stored xpEarned for precise reversal (includes all bonuses and artifact boosts)
      const verseCount = getVerseCount(latestLog.book, latestLog.chapter);
      const xpToSubtract = latestLog.xpEarned ?? Math.round(verseCount * BASE_XP_PER_VERSE);
      const currentXp = user?.xp ?? 0;
      let newXp = Math.max(0, currentXp - xpToSubtract);
      const target = user?.dailyVerseTarget ?? 30;
      const wasBoostActive = user?.hasActivatedBibleBoost ?? false;
      const hasActivatedBibleBoost = actualVersesReadToday >= target;

      // Reverse the +100 bonus if boost was active but now below target
      if (wasBoostActive && !hasActivatedBibleBoost) {
        newXp = Math.max(0, newXp - 100);
      }

      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
      const updatePayload = { xp: newXp, level: newLevel, versesReadToday: actualVersesReadToday, hasActivatedBibleBoost };

      // Optimistic update first
      updateUser(updatePayload);
      await base44.auth.updateMe(updatePayload);

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