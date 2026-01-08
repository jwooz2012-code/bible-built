import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { CURATED_PLANS } from '@/components/bible/plans/curatedPlans';

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
  } else {
    // Try curated plans for any other scope
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
  
  // Debug logging (temporary)
  console.log("TODAY_ASSIGNMENT_DEBUG", {
    todayKey: dateKey,
    plan: { 
      scope: plan?.scope, 
      startDate: plan?.startDate, 
      endDate: plan?.endDate, 
      chaptersPerDay: plan?.chaptersPerDay 
    },
    scopeChaptersLen: scopeChapters.length,
    dayIndex,
    start,
    end,
    resultLen: result.length
  });
  
  if (scopeChapters.length > 0 && result.length === 0) {
    console.warn("TODAY_ASSIGNMENT_EMPTY_SLICE", { 
      dayIndex, 
      start, 
      end, 
      scopeChaptersLen: scopeChapters.length 
    });
  }
  
  return result;
}

/**
 * Compute today's assignment for a reading plan
 * Returns: { perDay, daysLeft, remaining, today: [] }
 */
export function computeTodayAssignment({ plan, logs, todayKey }) {
  const scopeChapters = buildScopeChapters(plan.scope);
  const totalChapters = scopeChapters.length;

  // Filter logs to only those within the plan's scope
  const relevantLogs = logs.filter((log) =>
    scopeChapters.some((ch) => ch.chapterId === log.chapterId)
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