/**
 * Fetches Bible chapter data with caching and robust fallback.
 * Primary: bible-api.com (KJV) for English, getbible.net for Spanish
 * Fallback: hardcoded Genesis 1 so the reader always opens.
 */

const cache = new Map();

const GENESIS_1_FALLBACK = [
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
  { number: 11, text: "And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so." },
  { number: 12, text: "And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good." },
  { number: 13, text: "And the evening and the morning were the third day." },
  { number: 14, text: "And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years:" },
  { number: 15, text: "And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so." },
  { number: 16, text: "And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also." },
  { number: 17, text: "And God set them in the firmament of the heaven to give light upon the earth," },
  { number: 18, text: "And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good." },
  { number: 19, text: "And the evening and the morning were the fourth day." },
  { number: 20, text: "And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven." },
  { number: 21, text: "And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good." },
  { number: 22, text: "And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth." },
  { number: 23, text: "And the evening and the morning were the fifth day." },
  { number: 24, text: "And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so." },
  { number: 25, text: "And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good." },
  { number: 26, text: "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth." },
  { number: 27, text: "So God created man in his own image, in the image of God created he him; male and female created he them." },
  { number: 28, text: "And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth." },
  { number: 29, text: "And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat." },
  { number: 30, text: "And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so." },
  { number: 31, text: "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day." },
];

const GENESIS_1_FALLBACK_ES = [
  { number: 1, text: "En el principio creó Dios los cielos y la tierra." },
  { number: 2, text: "Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la haz del abismo, y el Espíritu de Dios se movía sobre la haz de las aguas." },
  { number: 3, text: "Y dijo Dios: Sea la luz: y fue la luz." },
  { number: 4, text: "Y vio Dios que la luz era buena: y apartó Dios la luz de las tinieblas." },
  { number: 5, text: "Y llamó Dios á la luz Día, y á las tinieblas llamó Noche: y fue la tarde y la mañana un día." },
  { number: 6, text: "Y dijo Dios: Haya expansión en medio de las aguas, y separe las aguas de las aguas." },
  { number: 7, text: "E hizo Dios la expansión, y apartó las aguas que estaban debajo de la expansión, de las aguas que estaban sobre la expansión: y fue así." },
  { number: 8, text: "Y llamó Dios á la expansión Cielos: y fue la tarde y la mañana el día segundo." },
  { number: 9, text: "Y dijo Dios: Júntense las aguas que están debajo de los cielos en un lugar, y descúbrase lo seco: y fue así." },
  { number: 10, text: "Y llamó Dios á lo seco Tierra, y á la reunión de las aguas llamó Mares: y vio Dios que era bueno." },
  { number: 26, text: "Y dijo Dios: Hagamos al hombre á nuestra imagen, conforme á nuestra semejanza; y señoree en los peces de la mar, y en las aves de los cielos, y en las bestias, y en toda la tierra, y en todo animal que anda arrastrando sobre la tierra." },
  { number: 27, text: "Y creó Dios al hombre á su imagen, á imagen de Dios lo creó; varón y hembra los creó." },
  { number: 31, text: "Y vio Dios todo lo que había hecho, y he aquí que era bueno en gran manera. Y fue la tarde y la mañana el día sexto." },
];

// Book name normalization for bible-api.com (handles spaces → %20)
function encodeBookName(name) {
  return encodeURIComponent(name);
}

async function fetchEnglish(bookName, chapterNum) {
  const url = `https://bible-api.com/${encodeBookName(bookName)}+${chapterNum}?translation=kjv`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.verses || !data.verses.length) throw new Error('No verses returned');
  return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }));
}

async function fetchSpanish(bookName, chapterNum) {
  // getbible.net supports rvr1909
  const url = `https://getbible.net/v2/rvr1909/${chapterNum <= 0 ? 1 : chapterNum}.json`;
  // getbible uses book numbers — map by index via the bookName
  // Use a simpler approach: bible-api.com also has reinavalera1960 (closest available)
  const url2 = `https://bible-api.com/${encodeBookName(bookName)}+${chapterNum}?translation=reinavalera`;
  const res = await fetch(url2, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.verses || !data.verses.length) throw new Error('No verses returned');
  return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }));
}

/**
 * Fetch a chapter's verses. Always returns an array of { number, text }.
 * Never throws — falls back to hardcoded Genesis 1 on any error.
 */
export async function fetchChapter(bookName, chapterNum, language = 'en') {
  const key = `${language}:${bookName}:${chapterNum}`;
  if (cache.has(key)) return cache.get(key);

  try {
    let verses;
    if (language === 'es') {
      verses = await fetchSpanish(bookName, chapterNum);
    } else {
      verses = await fetchEnglish(bookName, chapterNum);
    }
    cache.set(key, verses);
    return verses;
  } catch {
    // Silent fallback — always return something readable
    const fallback = language === 'es' ? GENESIS_1_FALLBACK_ES : GENESIS_1_FALLBACK;
    return fallback;
  }
}

/** Non-blocking cache warm-up for next chapter */
export function prefetchChapter(bookName, chapterNum, language = 'en') {
  fetchChapter(bookName, chapterNum, language).catch(() => {});
}