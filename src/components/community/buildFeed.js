import { BIBLE_BOOKS } from '@/components/bible/bibleData';

const CHAPTERS_BY_BOOK = Object.fromEntries(BIBLE_BOOKS.map((b) => [b.name, b.chapters]));
const BOOK_ORDER = Object.fromEntries(BIBLE_BOOKS.map((b) => [b.name, b.index]));
export const STREAK_MILESTONES = [7, 14, 30, 50, 100, 150, 200, 365, 500, 1000];
const DAY_MS = 24 * 60 * 60 * 1000;

const timeOf = (l) => new Date(l.created_date ?? l.timestamp ?? `${l.dateKey}T12:00:00`).getTime();

function shiftKey(key, days) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// [1,2,3,5,7,8] -> "1–3, 5, 7–8"
export function formatChapterRanges(chapters) {
  const sorted = [...new Set(chapters)].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < sorted.length; i++) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(j > i ? `${sorted[i]}–${sorted[j]}` : `${sorted[i]}`);
    i = j;
  }
  return parts.join(', ');
}

// Each time a reader completes every chapter of a book (first time or a reread).
export function bookCompletions(logs) {
  const seen = new Map();
  const events = [];
  [...logs].sort((a, b) => timeOf(a) - timeOf(b)).forEach((l) => {
    const total = CHAPTERS_BY_BOOK[l.book];
    if (!total) return;
    const set = seen.get(l.book) ?? new Set();
    set.add(l.chapter);
    if (set.size >= total) { events.push({ book: l.book, dateKey: l.dateKey, time: timeOf(l) }); seen.set(l.book, new Set()); }
    else seen.set(l.book, set);
  });
  return events;
}

// Days a reader reached a streak milestone (consecutive calendar days with reading).
export function streakMilestones(logs) {
  const lastTimeByDay = new Map();
  logs.forEach((l) => {
    const t = timeOf(l);
    if (!lastTimeByDay.has(l.dateKey) || t > lastTimeByDay.get(l.dateKey)) lastTimeByDay.set(l.dateKey, t);
  });
  const days = [...lastTimeByDay.keys()].sort();
  const events = [];
  let run = 0;
  days.forEach((d, i) => {
    run = i > 0 && shiftKey(days[i - 1], 1) === d ? run + 1 : 1;
    if (STREAK_MILESTONES.includes(run)) events.push({ days: run, dateKey: d, time: lastTimeByDay.get(d) });
  });
  return events;
}

/**
 * Turn raw chapter logs into a friendly feed: one card per person per book per day,
 * plus milestone cards (finished a book, streaks). Newest first.
 */
export function buildFeed(logs, { now = Date.now(), days = 14, limit = 60 } = {}) {
  const since = now - days * DAY_MS;
  const byUser = new Map();
  logs.forEach((l) => { if (l.userId && l.book) byUser.set(l.userId, [...(byUser.get(l.userId) ?? []), l]); });

  const items = [];
  byUser.forEach((userLogs, userId) => {
    const sessions = new Map();
    userLogs.forEach((l) => {
      if (timeOf(l) < since) return;
      const key = `s:${userId}:${l.dateKey}:${l.book}`;
      const s = sessions.get(key) ?? { type: 'session', key, userId, book: l.book, dateKey: l.dateKey, testament: l.testament, chapters: [], time: 0 };
      s.chapters.push(l.chapter);
      s.time = Math.max(s.time, timeOf(l));
      sessions.set(key, s);
    });
    sessions.forEach((s) => items.push({ ...s, label: `${s.book} ${formatChapterRanges(s.chapters)}`, count: new Set(s.chapters).size }));

    bookCompletions(userLogs).filter((e) => e.time >= since).forEach((e) => items.push({
      type: 'milestone', kind: 'book', key: `m:book:${userId}:${e.book}:${e.dateKey}`, userId, book: e.book, dateKey: e.dateKey,
      time: e.time + 1, label: `Finished ${e.book}`,
    }));
    streakMilestones(userLogs).filter((e) => e.time >= since).forEach((e) => items.push({
      type: 'milestone', kind: 'streak', key: `m:streak:${userId}:${e.days}:${e.dateKey}`, userId, days: e.days, dateKey: e.dateKey,
      time: e.time + 2, label: `${e.days}-day streak`,
    }));
  });

  return items
    .sort((a, b) => b.time - a.time || (BOOK_ORDER[a.book] ?? 0) - (BOOK_ORDER[b.book] ?? 0))
    .slice(0, limit);
}

/** People who have logged a chapter on the given day. */
export const readOnDay = (logs, dateKey) => new Set(logs.filter((l) => l.dateKey === dateKey).map((l) => l.userId));

/** Each person's most recent book, for "Reading Genesis" hints. */
export function latestBookByUser(logs) {
  const latest = new Map();
  logs.forEach((l) => {
    const prev = latest.get(l.userId);
    if (!prev || timeOf(l) > timeOf(prev)) latest.set(l.userId, l);
  });
  return new Map([...latest].map(([id, l]) => [id, l.book]));
}
