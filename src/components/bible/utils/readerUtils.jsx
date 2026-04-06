import { BIBLE_BOOKS } from '@/components/bible/bibleData';

/**
 * Fetch chapter verses from bible-api.com (KJV).
 * Returns array of { number, text }
 */
export async function fetchChapter(bookIndex, chapterNum) {
  const bookEntry = BIBLE_BOOKS[bookIndex];
  if (!bookEntry) throw new Error('Unknown book index: ' + bookIndex);

  const url = `https://bible-api.com/${encodeURIComponent(bookEntry.name)}+${chapterNum}?translation=kjv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${bookEntry.name} ${chapterNum}`);
  const data = await res.json();
  if (!data.verses || !data.verses.length) throw new Error(`No verses returned for ${bookEntry.name} ${chapterNum}`);
  return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }));
}

/** No-op prefetch */
export function prefetchChapter() {}