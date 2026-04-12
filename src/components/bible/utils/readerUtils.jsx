import { BIBLE_BOOKS } from '@/components/bible/bibleData';

// bolls.life book numbers (1-indexed, canonical order matching BIBLE_BOOKS)
const BOLLS_BOOK_NUMBERS = [
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
  21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,
  40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,
  59,60,61,62,63,64,65,66
];

/**
 * Strip Strong's concordance markup from verse text.
 * bolls.life KJV returns Strong's numbers appended directly to words (e.g. "God430", "LORD3068")
 * and sometimes as <S>1234</S> tags. We strip them carefully in order.
 */
function stripStrongs(text) {
  return text
    .replace(/<S>\d+<\/S>/g, '')         // remove <S>1234</S> Strong's tags
    .replace(/<f>[^<]*<\/f>/gi, '')       // remove <f>footnote</f> tags
    .replace(/<n>[^<]*<\/n>/gi, '')       // remove <n>note</n> tags
    .replace(/<note>[^<]*<\/note>/gi, '') // remove <note>...</note> tags
    .replace(/<[^>]+>/g, '')               // remove any remaining HTML/XML tags
    .replace(/([A-Za-z])'(\d+)/g, "$1'")  // handle apostrophe+number (e.g. LORD'S3068)
    .replace(/([A-Za-z])\d+/g, '$1')      // strip numbers glued to words (e.g. God430 → God)
    // Remove KJV marginal notes appended after verse text
    // e.g. "rage: or, tumultuously assemble imagine: Heb. meditate"
    // e.g. "set: Heb. anointed upon: Heb. upon Zion, the hill of my holiness"
    .replace(/\s+\w[\w\s]*:\s+(or,|Heb\.|i\.e\.|that is).*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch chapter verses from bolls.life (KJV).
 * Returns array of { number, text }
 */
export async function fetchChapter(bookIndex, chapterNum) {
  const bookEntry = BIBLE_BOOKS[bookIndex];
  if (!bookEntry) throw new Error('Unknown book index: ' + bookIndex);

  const bookNum = BOLLS_BOOK_NUMBERS[bookIndex];
  const url = `https://bolls.life/get-chapter/KJV/${bookNum}/${chapterNum}/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${bookEntry.name} ${chapterNum}`);
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) throw new Error(`No verses returned for ${bookEntry.name} ${chapterNum}`);
  return data.map(v => ({ number: v.verse, text: stripStrongs(v.text) }));
}

/** No-op prefetch */
export function prefetchChapter() {}