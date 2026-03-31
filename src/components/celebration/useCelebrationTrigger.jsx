/**
 * Helper to compute what new celebrations should fire after a chapter is marked read.
 * Compares before/after badge states and logs to detect newly earned events.
 */
import { computeBadgeState } from '@/components/badges/badgeEngine';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { CELEBRATION_TYPES } from './CelebrationContext';
import { computeStreak } from '@/lib/streakUtils';

const STREAK_MILESTONES = new Set([3, 7, 14, 30, 50, 100, 150, 200, 365]);



/**
 * Returns array of { type, data, dedupKey } to trigger
 */
export function detectNewCelebrations({ prevLogs, newLogs, newLog, user }) {
  const celebrations = [];

  // Badge diff
  const prevState = computeBadgeState(prevLogs, user);
  const newState = computeBadgeState(newLogs, user);
  const prevEarned = new Set(prevState.earnedBadgeIds);
  const newEarned = newState.badges.filter(b => b.achieved && !prevEarned.has(b.id) && b.metric !== 'always');
  for (const badge of newEarned) {
    celebrations.push({
      type: CELEBRATION_TYPES.BADGE,
      data: { badge, userName: user?.full_name },
      dedupKey: `badge-${badge.id}`,
    });
  }

  // Book completion — check if newLog's book just completed
  const bookData = BIBLE_BOOKS.find(b => b.name === newLog.book);
  if (bookData) {
    const prevBookChapters = new Set(
      prevLogs.filter(l => l.book === newLog.book).map(l => l.chapter)
    );
    const newBookChapters = new Set(
      newLogs.filter(l => l.book === newLog.book).map(l => l.chapter)
    );
    if (newBookChapters.size >= bookData.chapters && prevBookChapters.size < bookData.chapters) {
      celebrations.push({
        type: CELEBRATION_TYPES.BOOK,
        data: { bookName: newLog.book },
        dedupKey: `book-${newLog.book}-${newBookChapters.size}`,
      });
    }
  }

  // Streak milestone
  const prevStreak = computeStreak(prevLogs);
  const newStreak = computeStreak(newLogs);
  if (newStreak > prevStreak && STREAK_MILESTONES.has(newStreak)) {
    celebrations.push({
      type: CELEBRATION_TYPES.STREAK,
      data: { days: newStreak },
      dedupKey: `streak-${newStreak}`,
    });
  }

  // Sort by priority: badge < book < streak
  const priorityOrder = { badge: 0, book: 1, streak: 2 };
  celebrations.sort((a, b) => (priorityOrder[a.type] ?? 9) - (priorityOrder[b.type] ?? 9));

  return celebrations;
}