import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { bibleData } from '@/lib/bibleData';

/**
 * Returns verses for a given chapter from local data.
 * Falls back to the first available chapter in the book, or Genesis 1.
 * Always returns an array of { number, text }.
 * Wrapped in a Promise to maintain the async interface expected by BibleReader.
 */
export async function fetchChapter(bookIndex, chapterNum, language = 'en') {
  const bookEntry = BIBLE_BOOKS[bookIndex];
  const langData = bibleData[language] || bibleData['en'];

  if (bookEntry) {
    const bookData = langData[bookEntry.name];
    if (bookData && bookData[chapterNum]) {
      return bookData[chapterNum];
    }
    // Try any available chapter in this book
    if (bookData) {
      const firstChapter = Object.keys(bookData)[0];
      if (firstChapter) return bookData[firstChapter];
    }
  }

  // Final fallback: Genesis 1
  return bibleData['en']['Genesis'][1];
}

/** No-op prefetch — data is local, nothing to prefetch */
export function prefetchChapter() {}