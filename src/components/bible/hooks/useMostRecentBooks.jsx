import { useMemo } from 'react';
import { BIBLE_BOOKS } from '../bibleData';

export function useMostRecentBooks(logs) {
  return useMemo(() => {
    if (!logs || logs.length === 0) return [];

    // Group logs by book and find the most recent dateKey for each
    const bookActivity = {};
    
    logs.forEach(log => {
      const bookIndex = log.bookIndex;
      if (bookIndex === undefined) return;
      
      if (!bookActivity[bookIndex]) {
        bookActivity[bookIndex] = log.dateKey;
      } else {
        // Compare dateKeys to find most recent
        if (log.dateKey > bookActivity[bookIndex]) {
          bookActivity[bookIndex] = log.dateKey;
        }
      }
    });

    // Sort books by their most recent activity
    const sortedBookIndices = Object.keys(bookActivity)
      .map(idx => parseInt(idx))
      .sort((a, b) => {
        // Sort by dateKey descending (most recent first)
        return bookActivity[b].localeCompare(bookActivity[a]);
      });

    // Return top 2 books
    return sortedBookIndices
      .slice(0, 2)
      .map(idx => BIBLE_BOOKS[idx])
      .filter(Boolean);
  }, [logs]);
}