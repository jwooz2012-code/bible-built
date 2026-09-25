// Checks every Bible Challenge question against the bundled KJV text. Exits non-zero on any problem.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];

const bibleCache = {};
function loadBook(book) {
  const index = BOOKS.indexOf(book);
  if (index < 0) throw new Error(`Unknown book "${book}"`);
  bibleCache[book] ??= JSON.parse(readFileSync(path.join(root, 'public/bible/kjv', `${String(index + 1).padStart(2, '0')}.json`), 'utf8'));
  return bibleCache[book];
}

function verses(book, chapter, from, to = from) {
  const list = loadBook(book)[String(chapter)];
  if (!list) throw new Error(`${book} ${chapter} does not exist`);
  if (from < 1 || to > list.length || to < from) throw new Error(`${book} ${chapter}:${from}${to !== from ? `-${to}` : ''} is out of range`);
  return list.slice(from - 1, to).join(' ');
}

const norm = (s) => s.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').toLowerCase().trim();
const trimPunct = (s) => s.replace(/^[\s.,;:?!'"]+|[\s.,;:?!'"]+$/g, '');
const quotedSegments = (text) => [...text.matchAll(/“([^”]+)”/g)].flatMap((m) => m[1].split('…').map(trimPunct).filter(Boolean));
const hasWord = (haystack, needle) => new RegExp(`(^|[^a-z])${norm(needle).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(norm(haystack));

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

const dir = path.join(root, 'src/data/challenges');
const files = readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'index.js');
let questionCount = 0;

for (const file of files) {
  const mod = await import(pathToFileURL(path.join(dir, file)).href);
  for (const challenge of Object.values(mod).filter((v) => v && Array.isArray(v.questions))) {
    const where = `${file} (${challenge.id})`;
    if (BOOKS.indexOf(challenge.book) !== challenge.bookIndex) fail(where, `bookIndex ${challenge.bookIndex} does not match ${challenge.book}`);
    const mixTotal = Object.values(challenge.mix).reduce((a, b) => a + b, 0);
    if (mixTotal !== challenge.questionsPerTest) fail(where, `mix adds up to ${mixTotal}, not ${challenge.questionsPerTest}`);
    for (const [level, needed] of Object.entries(challenge.mix)) {
      const available = challenge.questions.filter((q) => q.level === level).length;
      if (available < needed * 2) fail(where, `only ${available} ${level} questions; need at least ${needed * 2} so retakes can be fresh`);
    }

    const ids = new Set();
    const bookText = Object.values(loadBook(challenge.book)).flat().join(' ');

    for (const q of challenge.questions) {
      questionCount++;
      const at = `${where} ${q.id}`;
      try {
        if (ids.has(q.id)) fail(at, 'duplicate id');
        ids.add(q.id);
        if (!['easy', 'medium', 'hard'].includes(q.level)) fail(at, `bad level "${q.level}"`);
        if (!q.kind || !q.prompt || !q.explain) fail(at, 'missing kind, prompt, or explain');

        // Every verse this question is allowed to draw quotes from.
        const sources = [];
        if (q.ref) {
          const text = verses(challenge.book, q.ref.chapter, q.ref.verse, q.ref.to ?? q.ref.verse);
          if (!norm(text).includes(norm(q.quote))) fail(at, `quote "${q.quote}" not found in ${challenge.book} ${q.ref.chapter}:${q.ref.verse}`);
          sources.push(text);
        }
        for (const extra of q.also || []) {
          const text = verses(extra.book, extra.chapter, extra.verse);
          if (!norm(text).includes(norm(extra.quote))) fail(at, `cross-reference quote "${extra.quote}" not found in ${extra.book} ${extra.chapter}:${extra.verse}`);
          sources.push(text);
        }

        if (q.type === 'order') {
          if (q.items.length < 3 || q.items.length > 5) fail(at, 'order questions need 3 to 5 items');
          if (new Set(q.items.map((i) => norm(i.text))).size !== q.items.length) fail(at, 'duplicate order items');
          let previous = 0;
          for (const item of q.items) {
            const text = verses(challenge.book, item.chapter, item.verse);
            if (!norm(text).includes(norm(item.quote))) fail(at, `item "${item.text}" quote not found in ${item.chapter}:${item.verse}`);
            const position = item.chapter * 1000 + item.verse;
            if (position < previous) fail(at, `item "${item.text}" is out of Bible order`);
            previous = position;
            sources.push(text);
            for (const seg of quotedSegments(item.text)) if (!norm(text).includes(norm(seg))) fail(at, `item quote "${seg}" not in ${item.chapter}:${item.verse}`);
          }
        } else {
          if (!Array.isArray(q.choices) || q.choices.length !== 4) fail(at, 'needs exactly 4 choices');
          if (new Set(q.choices.map(norm)).size !== q.choices.length) fail(at, 'duplicate choices');
          if (!Number.isInteger(q.answer) || !q.choices[q.answer]) fail(at, 'answer index is invalid');
          if (!q.ref) fail(at, 'choice questions need a ref');
          // Quoted choices must be real lines from the book.
          for (const choice of q.choices) for (const seg of quotedSegments(choice)) if (!norm(bookText).includes(norm(seg))) fail(at, `quoted choice "${seg}" is not in ${challenge.book}`);
        }

        // Prompt quotes must match the text exactly once the blank is filled with the right answer...
        const source = sources.join(' ');
        const answerText = q.type === 'order' ? null : q.choices[q.answer];
        for (const seg of quotedSegments(q.prompt)) {
          const filled = answerText ? seg.replace('___', answerText) : seg;
          if (!norm(source).includes(norm(filled))) fail(at, `prompt quote "${filled}" not found in the cited verses`);
          // ...and must NOT match when filled with any wrong answer.
          if (seg.includes('___')) {
            q.choices.forEach((choice, i) => {
              if (i === q.answer) return;
              if (norm(source).includes(norm(seg.replace('___', choice)))) fail(at, `wrong answer "${choice}" also fits the verse`);
              if (q.ref && hasWord(verses(challenge.book, q.ref.chapter, q.ref.verse, q.ref.to ?? q.ref.verse), choice)) fail(at, `wrong answer "${choice}" appears in the cited verse`);
            });
          }
        }

        // Scripture quoted in explanations must come from the cited verses.
        for (const seg of quotedSegments(q.explain)) if (!norm(source).includes(norm(seg))) fail(at, `explanation quote "${seg}" not found in cited verses`);
      } catch (error) {
        fail(at, error.message);
      }
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${questionCount} questions across ${files.length} challenge file(s) verified against the KJV text.`);
