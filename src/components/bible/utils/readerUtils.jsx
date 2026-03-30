/**
 * readerUtils.js — Bible chapter fetching & caching via getbible.net API
 *
 * API: https://getbible.net/v2/{translation}/{bookNr}/{chapterNr}.json
 * bookNr is 1-indexed canonical order (matches our book.index + 1)
 * Supports: kjv (English), rvr1909 (Spanish)
 */

const cache = new Map();

/**
 * Fetch a chapter's verses.
 * @param {number} bookIndex - 0-based book index from bibleData
 * @param {number} chapter   - chapter number (1-based)
 * @param {string} language  - 'en' | 'es'
 * @returns {Promise<Array<{number: number, text: string}>>}
 */
export async function fetchChapter(bookIndex, chapter, language = 'en') {
  const translation = language === 'es' ? 'rvr1909' : 'kjv';
  const bookNr = bookIndex + 1;
  const key = `${translation}-${bookNr}-${chapter}`;

  if (cache.has(key)) return cache.get(key);

  const url = `https://getbible.net/v2/${translation}/${bookNr}/${chapter}.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${translation} ${bookNr}:${chapter}`);

  const data = await response.json();
  const verses = Object.values(data.verses || {}).map(v => ({
    number: v.verse,
    text: v.text?.trim() || '',
  }));

  cache.set(key, verses);
  return verses;
}

/** Pre-warm cache for a chapter (fire-and-forget) */
export function prefetchChapter(bookIndex, chapter, language) {
  fetchChapter(bookIndex, chapter, language).catch(() => {});
}