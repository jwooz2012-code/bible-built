import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { HOSEA_CHALLENGE } from './hosea';
import { JONAH_CHALLENGE } from './jonah';
import { RUTH_CHALLENGE } from './ruth';
import { JAMES_CHALLENGE } from './james';
import { MARK_CHALLENGE } from './mark';

// Bible order, so lists (like the Stats page) read naturally.
export const CHALLENGES = [RUTH_CHALLENGE, HOSEA_CHALLENGE, JONAH_CHALLENGE, MARK_CHALLENGE, JAMES_CHALLENGE];

export const getChallenge = (id) => CHALLENGES.find((c) => c.id === id) || null;
export const getChallengeForBook = (bookName) => CHALLENGES.find((c) => c.book === bookName) || null;

// Thresholds and XP must match base44/functions/submitChallengeAttempt.
export const MEDALS = [
  { id: 'gold', label: 'Gold', minRatio: 1, xp: 250, color: '#EAB308' },
  { id: 'silver', label: 'Silver', minRatio: 0.8, xp: 150, color: '#94A3B8' },
  { id: 'bronze', label: 'Bronze', minRatio: 0.6, xp: 100, color: '#C2410C' },
];

export function medalFor(score, total) {
  const ratio = total > 0 ? score / total : 0;
  return MEDALS.find((m) => ratio >= m.minRatio) || null;
}

export const minScoreFor = (medal, total) => Math.ceil(medal.minRatio * total);

const MEDAL_RANK = { gold: 3, silver: 2, bronze: 1 };
export const medalRank = (medalId) => MEDAL_RANK[medalId] || 0;

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Draws the level mix, preferring questions not seen in the previous attempt, easiest first.
export function buildTest(challenge, previousQuestionIds = []) {
  const seen = new Set(previousQuestionIds);
  const picked = [];
  for (const level of ['easy', 'medium', 'hard']) {
    const pool = challenge.questions.filter((q) => q.level === level);
    const fresh = shuffle(pool.filter((q) => !seen.has(q.id)));
    const repeats = shuffle(pool.filter((q) => seen.has(q.id)));
    picked.push(...[...fresh, ...repeats].slice(0, challenge.mix[level] || 0));
  }
  return picked.map((q) => {
    if (q.type === 'order') {
      return { ...q, shuffledItems: shuffle(q.items.map((item, index) => ({ ...item, index }))) };
    }
    return { ...q, shuffledChoices: shuffle(q.choices.map((text, index) => ({ text, index }))) };
  });
}

export function isBookComplete(logs, challenge, chapterCount) {
  const read = new Set(logs.filter((l) => l.book === challenge.book).map((l) => l.chapter));
  return { readCount: read.size, complete: read.size >= chapterCount };
}

// Challenges roll out quietly: nothing about them shows (Stats section, challenge
// badges) until the reader has finished a challenge book or already taken one.
export function hasUnlockedChallenge(logs = [], attemptCount = 0) {
  if (attemptCount > 0) return true;
  return CHALLENGES.some((c) => isBookComplete(logs, c, BIBLE_BOOKS[c.bookIndex].chapters).complete);
}
