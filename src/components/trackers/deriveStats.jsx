// components/trackers/deriveStats.js
// PURE DERIVATION LAYER - NO REACT, NO SIDE EFFECTS

export function dedupeChapterIds(logs) {
  return new Set(logs.map(log => log.chapterId));
}

export function groupByDateKey(logs) {
  const map = new Map();
  for (const log of logs) {
    const count = map.get(log.dateKey) || 0;
    map.set(log.dateKey, count + 1);
  }
  return map;
}

function addDaysToDateKey(dateKey, days) {
  const date = new Date(dateKey + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

function daysBetweenDateKeys(dateKey1, dateKey2) {
  const d1 = new Date(dateKey1 + 'T00:00:00Z');
  const d2 = new Date(dateKey2 + 'T00:00:00Z');
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function computeStreaks(sortedDateKeysDesc, todayKey) {
  if (sortedDateKeysDesc.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if streak is active (today or yesterday)
  const mostRecent = sortedDateKeysDesc[0];
  const daysSinceMostRecent = daysBetweenDateKeys(mostRecent, todayKey);
  
  if (daysSinceMostRecent <= 1) {
    currentStreak = 1;
    for (let i = 1; i < sortedDateKeysDesc.length; i++) {
      const diff = daysBetweenDateKeys(sortedDateKeysDesc[i], sortedDateKeysDesc[i - 1]);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Compute longest streak
  for (let i = 1; i < sortedDateKeysDesc.length; i++) {
    const diff = daysBetweenDateKeys(sortedDateKeysDesc[i], sortedDateKeysDesc[i - 1]);
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak: Math.max(currentStreak, longestStreak) };
}

export function computeWeeklySummary(dateCountMap, todayKey) {
  const weekAgo = addDaysToDateKey(todayKey, -6);
  const twoWeeksAgo = addDaysToDateKey(todayKey, -13);

  let thisWeekChapters = 0;
  let thisWeekActiveDays = 0;
  let lastWeekChapters = 0;

  for (const [dateKey, count] of dateCountMap.entries()) {
    if (dateKey >= weekAgo && dateKey <= todayKey) {
      thisWeekChapters += count;
      thisWeekActiveDays++;
    } else if (dateKey >= twoWeeksAgo && dateKey < weekAgo) {
      lastWeekChapters += count;
    }
  }

  const deltaVsLastWeek = thisWeekChapters - lastWeekChapters;

  return { thisWeekChapters, thisWeekActiveDays, deltaVsLastWeek };
}

export function computeVelocity(dateCountMap, todayKey) {
  const sevenDaysAgo = addDaysToDateKey(todayKey, -6);
  const fourteenDaysAgo = addDaysToDateKey(todayKey, -13);

  let last7Total = 0;
  let prev7Total = 0;

  for (const [dateKey, count] of dateCountMap.entries()) {
    if (dateKey >= sevenDaysAgo && dateKey <= todayKey) {
      last7Total += count;
    } else if (dateKey >= fourteenDaysAgo && dateKey < sevenDaysAgo) {
      prev7Total += count;
    }
  }

  const avg7 = last7Total / 7;
  const prevAvg7 = prev7Total / 7;
  const delta = avg7 - prevAvg7;
  const trend = delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat';

  return { avg7, delta, trend };
}

export function computeBookProgress(logs, books, mode) {
  // mode: 'year' or 'lifetime'
  const bookChaptersRead = new Map();

  for (const log of logs) {
    if (!bookChaptersRead.has(log.bookIndex)) {
      bookChaptersRead.set(log.bookIndex, new Set());
    }
    bookChaptersRead.get(log.bookIndex).add(log.chapter);
  }

  const result = [];
  for (const book of books) {
    const chaptersSet = bookChaptersRead.get(book.index) || new Set();
    const completedDistinct = chaptersSet.size;
    const totalChapters = book.chapters;
    const percent = totalChapters > 0 ? Math.round((completedDistinct / totalChapters) * 100) : 0;
    result.push({
      bookName: book.name,
      bookIndex: book.index,
      completedDistinct,
      totalChapters,
      percent
    });
  }

  return result.sort((a, b) => b.percent - a.percent);
}

export function computeSectionCoverage(logs, bookToSectionMap, sectionTotals) {
  const sectionChapters = new Map();

  for (const log of logs) {
    const section = bookToSectionMap[log.book];
    if (section) {
      if (!sectionChapters.has(section)) {
        sectionChapters.set(section, new Set());
      }
      sectionChapters.get(section).add(log.chapterId);
    }
  }

  const result = [];
  for (const [section, total] of Object.entries(sectionTotals)) {
    const chaptersSet = sectionChapters.get(section) || new Set();
    const completedDistinct = chaptersSet.size;
    const percent = total > 0 ? Math.round((completedDistinct / total) * 100) : 0;
    result.push({ section, completedDistinct, total, percent });
  }

  return result;
}

export function computeRecords(dateCountMap, logs) {
  // Longest streak computed separately
  const sortedDates = Array.from(dateCountMap.keys()).sort().reverse();
  const { longestStreak } = computeStreaks(sortedDates, sortedDates[0] || '2026-01-05');

  // Best rolling 7-day window
  const dateArray = Array.from(dateCountMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  let bestRolling7 = 0;
  for (let i = 0; i < dateArray.length; i++) {
    let sum = 0;
    for (let j = i; j < Math.min(i + 7, dateArray.length); j++) {
      sum += dateArray[j][1];
    }
    bestRolling7 = Math.max(bestRolling7, sum);
  }

  // Best month
  const monthTotals = new Map();
  for (const [dateKey, count] of dateCountMap.entries()) {
    const monthKey = dateKey.substring(0, 7); // YYYY-MM
    monthTotals.set(monthKey, (monthTotals.get(monthKey) || 0) + count);
  }
  const bestMonth = Math.max(0, ...monthTotals.values());

  // Most-read book
  const bookCounts = new Map();
  for (const log of logs) {
    bookCounts.set(log.book, (bookCounts.get(log.book) || 0) + 1);
  }
  let mostReadBook = { name: 'None', count: 0 };
  for (const [bookName, count] of bookCounts.entries()) {
    if (count > mostReadBook.count) {
      mostReadBook = { name: bookName, count };
    }
  }

  return { longestStreak, bestRolling7, bestMonth, mostReadBook };
}