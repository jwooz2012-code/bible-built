export function calculateBookProgress(bookIndex, logs) {
  if (!logs || logs.length === 0) {
    return { chaptersRead: 0 };
  }

  const bookLogs = logs.filter(log => log.bookIndex === bookIndex);
  if (bookLogs.length === 0) {
    return { chaptersRead: 0 };
  }

  const uniqueChapters = new Set(bookLogs.map(log => log.chapter)).size;

  return { chaptersRead: uniqueChapters };
}