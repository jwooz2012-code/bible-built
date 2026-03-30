import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { bibleData } from '@/lib/bibleData';

/**
 * Fetch chapter verses.
 * English: fetches from bible-api.com (KJV)
 * Spanish: uses local bibleData.js fallback
 * Returns array of { number, text }
 */
export async function fetchChapter(bookIndex, chapterNum, language = 'en') {
  const bookEntry = BIBLE_BOOKS[bookIndex];
  if (!bookEntry) return bibleData['en']['Genesis'][1];

  if (language === 'en') {
    const url = `https://bible-api.com/${encodeURIComponent(bookEntry.name)}+${chapterNum}?translation=kjv`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load ${bookEntry.name} ${chapterNum}`);
    const data = await res.json();
    if (!data.verses || !data.verses.length) throw new Error('No verses returned');
    return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }));
  }

  // Spanish: use local data
  const langData = bibleData['es'];
  const bookData = langData?.[bookEntry.name];
  if (bookData && bookData[chapterNum]) return bookData[chapterNum];

  // Fallback to local EN
  const enData = bibleData['en']?.[bookEntry.name];
  if (enData && enData[chapterNum]) return enData[chapterNum];

  return bibleData['en']['Genesis'][1];
}

/** No-op prefetch */
export function prefetchChapter() {}