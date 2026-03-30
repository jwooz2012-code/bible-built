import { BIBLE_BOOKS } from '@/components/bible/bibleData';

/**
 * Fetches Bible chapter data with caching and robust fallback.
 * Accepts bookIndex (0-65), chapterNum, and language ('en' | 'es').
 * Always returns an array of { number, text } — never throws.
 */

const cache = new Map();

const GENESIS_1_EN = [
  { number: 1, text: "In the beginning God created the heaven and the earth." },
  { number: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
  { number: 3, text: "And God said, Let there be light: and there was light." },
  { number: 4, text: "And God saw the light, that it was good: and God divided the light from the darkness." },
  { number: 5, text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day." },
  { number: 6, text: "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters." },
  { number: 7, text: "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so." },
  { number: 8, text: "And God called the firmament Heaven. And the evening and the morning were the second day." },
  { number: 9, text: "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so." },
  { number: 10, text: "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good." },
  { number: 26, text: "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth." },
  { number: 27, text: "So God created man in his own image, in the image of God created he him; male and female created he them." },
  { number: 31, text: "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day." },
];

const GENESIS_1_ES = [
  { number: 1, text: "En el principio creó Dios los cielos y la tierra." },
  { number: 2, text: "Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la haz del abismo, y el Espíritu de Dios se movía sobre la haz de las aguas." },
  { number: 3, text: "Y dijo Dios: Sea la luz: y fue la luz." },
  { number: 4, text: "Y vio Dios que la luz era buena: y apartó Dios la luz de las tinieblas." },
  { number: 5, text: "Y llamó Dios á la luz Día, y á las tinieblas llamó Noche: y fue la tarde y la mañana un día." },
  { number: 26, text: "Y dijo Dios: Hagamos al hombre á nuestra imagen, conforme á nuestra semejanza; y señoree en los peces de la mar, y en las aves de los cielos, y en las bestias, y en toda la tierra." },
  { number: 27, text: "Y creó Dios al hombre á su imagen, á imagen de Dios lo creó; varón y hembra los creó." },
  { number: 31, text: "Y vio Dios todo lo que había hecho, y he aquí que era bueno en gran manera. Y fue la tarde y la mañana el día sexto." },
];

/**
 * Fetch a chapter's verses by book index.
 * Always returns an array of { number, text } — falls back to Genesis 1 on any error.
 */
export async function fetchChapter(bookIndex, chapterNum, language = 'en') {
  const key = `${language}:${bookIndex}:${chapterNum}`;
  if (cache.has(key)) return cache.get(key);

  const bookEntry = BIBLE_BOOKS[bookIndex];
  if (!bookEntry) return language === 'es' ? GENESIS_1_ES : GENESIS_1_EN;

  const bookName = bookEntry.name; // e.g. "Genesis", "1 Kings"
  const translation = language === 'es' ? 'reinavalera' : 'kjv';
  const url = `https://bible-api.com/${encodeURIComponent(bookName)}+${chapterNum}?translation=${translation}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.verses || !data.verses.length) throw new Error('No verses');
    const verses = data.verses.map(v => ({ number: v.verse, text: v.text.trim() }));
    cache.set(key, verses);
    return verses;
  } catch {
    return language === 'es' ? GENESIS_1_ES : GENESIS_1_EN;
  }
}

/** Non-blocking prefetch for adjacent chapters */
export function prefetchChapter(bookIndex, chapterNum, language = 'en') {
  fetchChapter(bookIndex, chapterNum, language).catch(() => {});
}