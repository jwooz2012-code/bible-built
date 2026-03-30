import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { bibleData } from '@/lib/bibleData';

/**
 * Fetch chapter verses from bible-api.com (KJV).
 * Falls back to local EN data, then Genesis 1.
 * Returns array of { number, text }
 */
export async function fetchChapter(bookIndex, chapterNum) {
  const bookEntry = BIBLE_BOOKS[bookIndex];
  if (!bookEntry) return bibleData.en.Genesis[1];

  const url = `https://bible-api.com/${encodeURIComponent(bookEntry.name)}+${chapterNum}?translation=kjv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${bookEntry.name} ${chapterNum}`);
  const data = await res.json();
  if (!data.verses || !data.verses.length) throw new Error('No verses returned');
  return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }));
}

/** No-op prefetch */
export function prefetchChapter() {}