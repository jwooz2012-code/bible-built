import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { CURATED_PLANS } from '@/components/bible/plans/curatedPlans';
import { addDaysKey } from '@/components/bible/utils/dateUtils';

/**
 * Normalize a chapter object to consistent shape
 */
function normalizeChapter(c) {
  if (!c) return null;
  const bookName = c.bookName ?? c.book ?? c.book_title ?? "";
  const chapter = Number(c.chapter ?? c.chap ?? 0);
  return bookName && chapter ? { bookName, chapter } : null;
}

/**
 * Build the full list of chapters for a given scope
 * Returns: [{ bookIndex, book, chapter, chapterId, testament }]
 */
export function buildScopeChapters(scope) {
  const chapters = [];

  if (scope === 'NONE') {
    // No plan selected - return empty array
    return [];
  } else if (scope === 'BIBLE') {
    // All books
    BIBLE_BOOKS.forEach((book) => {
      for (let ch = 1; ch <= book.chapters; ch++) {
        chapters.push({
          bookIndex: book.index,
          book: book.name,
          chapter: ch,
          chapterId: generateChapterId(book.index, ch),
          testament: book.testament,
        });
      }
    });
  } else if (scope === 'OT') {
    // Old Testament only
    BIBLE_BOOKS.filter((b) => b.testament === 'OT').forEach((book) => {
      for (let ch = 1; ch <= book.chapters; ch++) {
        chapters.push({
          bookIndex: book.index,
          book: book.name,
          chapter: ch,
          chapterId: generateChapterId(book.index, ch),
          testament: book.testament,
        });
      }
    });
  } else if (scope === 'NT') {
    // New Testament only
    BIBLE_BOOKS.filter((b) => b.testament === 'NT').forEach((book) => {
      for (let ch = 1; ch <= book.chapters; ch++) {
        chapters.push({
          bookIndex: book.index,
          book: book.name,
          chapter: ch,
          chapterId: generateChapterId(book.index, ch),
          testament: book.testament,
        });
      }
    });
  } else if (scope === 'PSALMS') {
    // Single book: Psalms
    const book = BIBLE_BOOKS.find((b) => b.name === 'Psalms');
    if (book) {
      for (let ch = 1; ch <= book.chapters; ch++) {
        chapters.push({
          bookIndex: book.index,
          book: book.name,
          chapter: ch,
          chapterId: generateChapterId(book.index, ch),
          testament: book.testament,
        });
      }
    }
  } else if (scope === 'LEADERSHIP_INTENSIVE' || scope === 'WISDOM_PLUNGE' || scope === 'INTENTIONAL_MOTHERHOOD' || scope === 'GODLY_MAN' || scope === 'LIVE_WITH_PURPOSE' || scope === 'KNOW_KING_DAVID' || scope === 'HEART_OF_GOD' || scope === 'WHO_IS_JESUS' || scope === 'CHRONOLOGICAL_OT_JOURNEY' || scope === 'CHRONOLOGICAL_NT_JOURNEY' || scope === 'TWELVE_VOICES_ONE_HOLY_GOD') {
    // Try curated plans
    const curatedList = CURATED_PLANS[scope] || [];
    const normalized = curatedList.map(normalizeChapter).filter(Boolean);
    
    normalized.forEach((entry) => {
      const book = BIBLE_BOOKS.find((b) => b.name === entry.bookName);
      if (book) {
        chapters.push({
          bookIndex: book.index,
          book: book.name,
          chapter: entry.chapter,
          chapterId: generateChapterId(book.index, entry.chapter),
          testament: book.testament,
        });
      }
    });
  } else {
    // Try curated plans for any other scope (fallback)
    const curatedList = CURATED_PLANS[scope] || [];
    const normalized = curatedList.map(normalizeChapter).filter(Boolean);
    
    normalized.forEach((entry) => {
      const book = BIBLE_BOOKS.find((b) => b.name === entry.bookName);
      if (book) {
        chapters.push({
          bookIndex: book.index,
          book: book.name,
          chapter: entry.chapter,
          chapterId: generateChapterId(book.index, entry.chapter),
          testament: book.testament,
        });
      }
    });
  }

  return chapters;
}

/**
 * Get the assigned chapters for a specific date
 * Returns an array of chapter objects
 */
export function getAssignmentForDate({ plan, dateKey }) {
  if (!plan?.startDate || !plan?.endDate || !plan?.scope || !plan?.chaptersPerDay) {
    return [];
  }

  if (dateKey < plan.startDate) {
    return [];
  }

  const scopeChapters = buildScopeChapters(plan.scope);
  
  // Safe date parsing - treat as UTC dates to avoid timezone issues
  const startDate = new Date(plan.startDate + 'T00:00:00');
  const targetDate = new Date(dateKey + 'T00:00:00');
  
  // Calculate day difference using calendar days
  const dayIndex = Math.max(0, Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24)));
  
  const chaptersPerDay = Number(plan.chaptersPerDay || 0);
  const start = dayIndex * chaptersPerDay;
  const end = start + chaptersPerDay;
  
  const result = scopeChapters.slice(start, end);
  
  return result;
}

/**
 * Compute today's assignment for a reading plan
 * Returns: { perDay, daysLeft, remaining, today: [] }
 */
export function computeTodayAssignment({ plan, logs, todayKey }) {
  const scopeChapters = buildScopeChapters(plan.scope);
  const totalChapters = scopeChapters.length;

  // Filter logs to only those within the plan's scope AND on or after plan start date
  const relevantLogs = logs.filter((log) =>
    scopeChapters.some((ch) => ch.chapterId === log.chapterId) &&
    log.dateKey >= plan.startDate
  );

  // Count unique chapters read
  const readChapterIds = new Set(relevantLogs.map((log) => log.chapterId));
  const remaining = totalChapters - readChapterIds.size;

  // Calculate days left
  const today = new Date(todayKey);
  const endDate = new Date(plan.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

  // ALWAYS use plan.chaptersPerDay if available (for fixed-pace plans)
  // Never compute for plans with preset chaptersPerDay
  const perDay = plan.chaptersPerDay || (daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining);

  // Build today's assignment (first N unread chapters)
  const todayAssignment = [];
  for (const ch of scopeChapters) {
    if (!readChapterIds.has(ch.chapterId)) {
      todayAssignment.push(ch);
      if (todayAssignment.length >= perDay) break;
    }
  }

  return {
    perDay,
    daysLeft,
    remaining,
    today: todayAssignment,
  };
}
/**
 * Find the oldest missed day in the past 7 days.
 * Returns { dateKey, assignment } for the oldest incomplete assigned day,
 * or null if no missed days are found.
 */
export function getOldestMissedDay({ plan, logs, todayKey }) {
  if (!plan?.startDate || !plan?.scope || !plan?.chaptersPerDay || plan?.scope === 'NONE' || plan?.scope === 'CUSTOM') {
    return null;
  }

  const completedIds = new Set(logs.map((l) => l.chapterId));

  // Iterate from 7 days ago → yesterday, return the FIRST (oldest) incomplete day
  for (let daysBack = 7; daysBack >= 1; daysBack--) {
    const checkDate = addDaysKey(todayKey, -daysBack);
    if (checkDate < plan.startDate) continue;

    const assignment = getAssignmentForDate({ plan, dateKey: checkDate });
    if (!assignment.length) continue;

    const isIncomplete = assignment.some((ch) => !completedIds.has(ch.chapterId));
    if (isIncomplete) {
      return { dateKey: checkDate, assignment };
    }
  }

  return null;
}
