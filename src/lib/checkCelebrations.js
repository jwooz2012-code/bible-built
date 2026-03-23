// Pure logic: given previous logs + new logs, determine what celebrations to fire.
// Returns an array of { type, data, options } objects to pass to triggerCelebration.

import { computeBadgeState } from '@/components/badges/badgeEngine';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';

const STREAK_MILESTONES = new Set([3, 7, 14, 30, 50, 100, 150, 200, 365]);

function computeCurrentStreak(logs) {
  if (!logs.length) return 0;
  const days = Array.from(new Set(logs.map((l) => l.dateKey))).sort().reverse();
  const pad = (n) => String(n).padStart(2, '0');
  const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < days.length; i++) {
    const expected = toKey(cursor);
    if (days[i] === expected) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      // Maybe yesterday
      const yesterday = new Date(cursor);
      yesterday.setDate(yesterday.getDate() - 1);
      if (days[0] === toKey(yesterday)) {
        cursor = yesterday;
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return streak;
}

function isBookComplete(logs, bookName) {
  const bookData = BIBLE_BOOKS.find((b) => b.name === bookName);
  if (!bookData) return false;
  const chaptersRead = new Set(logs.filter((l) => l.book === bookName).map((l) => l.chapter));
  return chaptersRead.size >= bookData.chapters;
}

export function checkCelebrations({ prevLogs, nextLogs, newEntry, user }) {
  const celebrations = [];

  // 1. Badge check
  const prevBadgeState = computeBadgeState(prevLogs, user, { debug: false });
  const nextBadgeState = computeBadgeState(nextLogs, user, { debug: false });

  const prevEarned = new Set(prevBadgeState.badges.filter((b) => b.achieved).map((b) => b.id));
  const newlyEarned = nextBadgeState.badges.filter((b) => b.achieved && !prevEarned.has(b.id));

  newlyEarned.forEach((badge) => {
    celebrations.push({
      type: 'badge',
      data: { badge },
      options: { dedupKey: `badge_${badge.id}` },
    });
  });

  // 2. Book completion check
  const bookName = newEntry?.book;
  if (bookName) {
    const wasComplete = isBookComplete(prevLogs, bookName);
    const isNowComplete = isBookComplete(nextLogs, bookName);
    if (!wasComplete && isNowComplete) {
      celebrations.push({
        type: 'book',
        data: { bookName },
        options: { dedupKey: `book_${bookName}_${new Date().getFullYear()}` },
      });
    }
  }

  // 3. Streak milestone check
  const prevStreak = computeCurrentStreak(prevLogs);
  const nextStreak = computeCurrentStreak(nextLogs);
  if (STREAK_MILESTONES.has(nextStreak) && nextStreak > prevStreak) {
    celebrations.push({
      type: 'streak',
      data: { count: nextStreak },
      options: { dedupKey: `streak_${nextStreak}` },
    });
  }

  return celebrations;
}