import { BIBLE_BOOKS } from '@/components/bible/bibleData';

/**
 * Fetch chapter verses from local KJV JSON files (offline, no API required).
 * Files live at public/bible/kjv/01.json … 66.json
 * Format: { "1": ["verse text", "verse text", ...], "2": [...] }
 * Returns array of { number, text }
 */
export async function fetchChapter(bookIndex, chapterNum) {
  const bookEntry = BIBLE_BOOKS[bookIndex];
  if (!bookEntry) throw new Error('Unknown book index: ' + bookIndex);

  const bookNum = String(bookIndex + 1).padStart(2, '0');
  const res = await fetch(`/bible/kjv/${bookNum}.json`);
  if (!res.ok) throw new Error(`Could not load ${bookEntry.name} ${chapterNum}`);
  const book = await res.json();
  const verses = book[String(chapterNum)];
  if (!verses) throw new Error(`Chapter ${chapterNum} not found in ${bookEntry.name}`);
  return verses.map((text, i) => ({ number: i + 1, text }));
}

/** No-op — local files need no prefetching */
export function prefetchChapter() {}
