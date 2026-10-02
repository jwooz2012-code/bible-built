import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

// Private highlights and notes on Bible verses (VerseMark entity).
//   highlight: one record per verse, with a color
//   note:      one record per note, covering verse..endVerse
// Changes show on screen immediately and are saved in the background, one at
// a time per user, with retries — so a quick "yellow → green → clear" or a
// weak connection never leaves the server out of step.

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', label: 'Yellow', swatch: '#FACC15', bg: 'rgba(250, 204, 21, 0.34)' },
  { id: 'green', label: 'Green', swatch: '#4ADE80', bg: 'rgba(74, 222, 128, 0.30)' },
  { id: 'blue', label: 'Blue', swatch: '#60A5FA', bg: 'rgba(96, 165, 250, 0.30)' },
  { id: 'pink', label: 'Pink', swatch: '#F472B6', bg: 'rgba(244, 114, 182, 0.30)' },
  { id: 'purple', label: 'Purple', swatch: '#A78BFA', bg: 'rgba(167, 139, 250, 0.32)' },
];
export const colorById = (id) => HIGHLIGHT_COLORS.find((c) => c.id === id);

export const NOTE_MAX_LENGTH = 2000;

export const chapterMarksKey = (userId, bookIndex, chapter) => ['verseMarks', userId, bookIndex, chapter];
export const allMarksKey = (userId) => ['verseMarks', userId, 'all'];

// "John 3:16", "John 3:16–18"
export function formatVerseRef(bookName, chapter, verse, endVerse) {
  return endVerse && endVerse !== verse ? `${bookName} ${chapter}:${verse}–${endVerse}` : `${bookName} ${chapter}:${verse}`;
}

// Stable local key for a mark, so queued saves can find the server record
// even if it was created a moment ago.
const highlightKey = (userId, bookIndex, chapter, verse) => `h|${userId}|${bookIndex}|${chapter}|${verse}`;
const noteKey = (clientId) => `n|${clientId}`;
const serverIds = new Map(); // local key -> server id
const keyForNewNote = new Map(); // server id -> local key of a note created in this session
const keyOf = (m) => (m.kind === 'highlight'
  ? highlightKey(m.userId, m.bookIndex, m.chapter, m.verse)
  : keyForNewNote.get(m.id) ?? noteKey(m.id));
let saveChain = Promise.resolve();
const enqueue = (op) => {
  const next = saveChain.catch(() => {}).then(op);
  saveChain = next;
  return next;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function withRetry(fn, tries = 3) {
  let lastError;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error?.status ?? error?.response?.status;
      if (status >= 400 && status < 500) break; // a real refusal, not a bad connection
      if (i < tries - 1) await sleep(700 * (i + 1));
    }
  }
  throw lastError;
}

const remember = (marks) => {
  for (const m of marks) if (m?.id && !String(m.id).startsWith('tmp-')) serverIds.set(keyOf(m), m.id);
  return marks.map((m) => ({ ...m, _key: keyOf(m) }));
};

export function useChapterMarks(userId, bookIndex, chapter) {
  return useQuery({
    queryKey: chapterMarksKey(userId, bookIndex, chapter),
    queryFn: async () => remember(await base44.entities.VerseMark.filter({ userId, bookIndex, chapter })),
    enabled: !!userId && bookIndex != null && !!chapter,
    staleTime: 60_000,
  });
}

export function useAllMarks(userId) {
  return useQuery({
    queryKey: allMarksKey(userId),
    queryFn: async () => remember(await base44.entities.VerseMark.filter({ userId }, '-updatedAt', 2000)),
    enabled: !!userId,
  });
}

// The saved highlight for a verse, even if this screen hasn't loaded it yet
// (e.g. tapped instantly, or highlighted on another device).
async function findHighlightId(k, where) {
  const known = serverIds.get(k);
  if (known) return known;
  const found = await withRetry(() => base44.entities.VerseMark.filter({ ...where, kind: 'highlight' }));
  const id = found?.[0]?.id;
  if (id) serverIds.set(k, id);
  return id;
}

let tmpSeq = 0;
const tmpId = () => `tmp-${Date.now().toString(36)}-${(tmpSeq++).toString(36)}`;

export function useVerseMarkActions(userId, book, chapter) {
  const queryClient = useQueryClient();
  const key = chapterMarksKey(userId, book?.index, chapter);

  const patchCache = useCallback(
    (update) => queryClient.setQueryData(key, (old = []) => update(old)),
    [queryClient, userId, book?.index, chapter],
  );

  // Runs a save in the queue; on final failure tells the user and reloads the truth.
  const save = useCallback(
    (op) =>
      enqueue(async () => {
        try {
          await op();
        } catch (error) {
          console.error('[verseMarks] save failed', error);
          toast.error("Couldn't save — check your connection and try again.");
          queryClient.invalidateQueries({ queryKey: key });
        } finally {
          queryClient.invalidateQueries({ queryKey: allMarksKey(userId) });
        }
      }),
    [queryClient, userId, book?.index, chapter],
  );

  const base = () => ({ userId, bookIndex: book.index, bookName: book.name, chapter });

  // verses: [{ number, text }]
  const setHighlight = useCallback(
    (verses, color) => {
      if (!userId || !verses.length) return;
      const now = new Date().toISOString();
      const targets = verses.map((v) => ({ v, k: highlightKey(userId, book.index, chapter, v.number) }));
      patchCache((old) => {
        const rest = old.filter((m) => !targets.some((t) => t.k === m._key));
        const kept = old.filter((m) => targets.some((t) => t.k === m._key));
        const next = targets.map(({ v, k }) => {
          const existing = kept.find((m) => m._key === k);
          return existing
            ? { ...existing, color, updatedAt: now }
            : { ...base(), id: tmpId(), _key: k, kind: 'highlight', verse: v.number, endVerse: v.number, color, text: v.text, createdAt: now, updatedAt: now };
        });
        return [...rest, ...next];
      });
      return save(async () => {
        for (const { v, k } of targets) {
          const id = await findHighlightId(k, { userId, bookIndex: book.index, chapter, verse: v.number });
          if (id) {
            await withRetry(() => base44.entities.VerseMark.update(id, { color, updatedAt: now }));
          } else {
            const created = await withRetry(() => base44.entities.VerseMark.create({
              ...base(), kind: 'highlight', verse: v.number, endVerse: v.number, color, text: v.text, createdAt: now, updatedAt: now,
            }));
            serverIds.set(k, created.id);
            patchCache((old) => old.map((m) => (m._key === k ? { ...m, id: created.id } : m)));
          }
        }
      });
    },
    [userId, book?.index, book?.name, chapter, patchCache, save],
  );

  const clearHighlight = useCallback(
    (verseNumbers) => {
      if (!userId || !verseNumbers.length) return;
      const keys = verseNumbers.map((n) => ({ n, k: highlightKey(userId, book.index, chapter, n) }));
      patchCache((old) => old.filter((m) => !keys.some(({ k }) => k === m._key)));
      return save(async () => {
        for (const { n, k } of keys) {
          const id = await findHighlightId(k, { userId, bookIndex: book.index, chapter, verse: n });
          if (!id) continue;
          await withRetry(() => base44.entities.VerseMark.delete(id));
          serverIds.delete(k);
        }
      });
    },
    [userId, book?.index, chapter, patchCache, save],
  );

  // Creates the note when key is null; returns the note's local key.
  const saveNote = useCallback(
    ({ key: existingKey, verse, endVerse, note, text }) => {
      if (!userId) return existingKey;
      const now = new Date().toISOString();
      const clean = note.slice(0, NOTE_MAX_LENGTH);
      let k = existingKey;
      if (!k) {
        const id = tmpId();
        k = noteKey(id);
        patchCache((old) => [...old, { ...base(), id, _key: k, kind: 'note', verse, endVerse, note: clean, text, createdAt: now, updatedAt: now }]);
      } else {
        patchCache((old) => old.map((m) => (m._key === k ? { ...m, note: clean, updatedAt: now } : m)));
      }
      const localKey = k;
      save(async () => {
        const id = serverIds.get(localKey);
        if (id) {
          await withRetry(() => base44.entities.VerseMark.update(id, { note: clean, updatedAt: now }));
        } else {
          const created = await withRetry(() => base44.entities.VerseMark.create({
            ...base(), kind: 'note', verse, endVerse, note: clean, text, createdAt: now, updatedAt: now,
          }));
          serverIds.set(localKey, created.id);
          keyForNewNote.set(created.id, localKey);
          patchCache((old) => old.map((m) => (m._key === localKey ? { ...m, id: created.id } : m)));
        }
      });
      return localKey;
    },
    [userId, book?.index, book?.name, chapter, patchCache, save],
  );

  const deleteNote = useCallback(
    (k) => {
      if (!userId || !k) return;
      patchCache((old) => old.filter((m) => m._key !== k));
      return save(async () => {
        const id = serverIds.get(k);
        if (!id) return;
        await withRetry(() => base44.entities.VerseMark.delete(id));
        serverIds.delete(k);
      });
    },
    [userId, patchCache, save],
  );

  return { setHighlight, clearHighlight, saveNote, deleteNote };
}
