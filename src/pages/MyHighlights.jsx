import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, StickyNote, Highlighter, Lock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import BibleReader from '@/components/shared/BibleReader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useAllMarks, HIGHLIGHT_COLORS, colorById, formatVerseRef } from '@/components/bible/hooks/useVerseMarks';

// Joins neighbouring highlighted verses of the same color into one entry,
// e.g. John 3:16, 3:17, 3:18 (yellow) -> John 3:16–18.
function groupHighlights(highlights) {
  const sorted = [...highlights].sort((a, b) =>
    a.bookIndex - b.bookIndex || a.chapter - b.chapter || a.verse - b.verse);
  const groups = [];
  for (const h of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.bookIndex === h.bookIndex && last.chapter === h.chapter
        && last.color === h.color && last.endVerse + 1 === h.verse) {
      last.endVerse = h.verse;
      last.text = `${last.text} ${h.text || ''}`.trim();
      if ((h.updatedAt || '') > (last.updatedAt || '')) last.updatedAt = h.updatedAt;
    } else {
      groups.push({ ...h, endVerse: h.verse, text: h.text || '' });
    }
  }
  return groups;
}

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function MyHighlights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: marks = [], isLoading } = useAllMarks(user?.id);
  const [filter, setFilter] = useState('all'); // all | notes | <color id>
  const [bookFilter, setBookFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [reader, setReader] = useState(null); // { book, chapter, verse }

  const items = useMemo(() => {
    const highlights = groupHighlights(marks.filter((m) => m.kind === 'highlight' && m.color));
    const notes = marks.filter((m) => m.kind === 'note' && m.note);
    return [...highlights, ...notes].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }, [marks]);

  const booksUsed = useMemo(() => {
    const ids = [...new Set(items.map((i) => i.bookIndex))].sort((a, b) => a - b);
    return ids.map((i) => BIBLE_BOOKS[i]).filter(Boolean);
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (filter === 'notes' && i.kind !== 'note') return false;
      if (filter !== 'all' && filter !== 'notes' && !(i.kind === 'highlight' && i.color === filter)) return false;
      if (bookFilter !== 'all' && String(i.bookIndex) !== bookFilter) return false;
      if (!q) return true;
      const ref = formatVerseRef(i.bookName || BIBLE_BOOKS[i.bookIndex]?.name || '', i.chapter, i.verse, i.endVerse).toLowerCase();
      return ref.includes(q) || (i.text || '').toLowerCase().includes(q) || (i.note || '').toLowerCase().includes(q);
    });
  }, [items, filter, bookFilter, query]);

  const open = (item) => {
    const book = BIBLE_BOOKS[item.bookIndex];
    if (book) setReader({ book, chapter: item.chapter, verse: item.verse });
  };

  const chip = (id, label, swatch) => (
    <button
      key={id}
      onClick={() => setFilter(id)}
      aria-pressed={filter === id}
      className={`shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-medium border transition-colors ${
        filter === id ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground border-border'
      }`}
    >
      {swatch && <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: swatch }} />}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-2xl mx-auto px-5" style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate('/profile')} className="p-2 -ml-2 rounded-xl hover:bg-muted" aria-label="Back to Profile">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Highlights &amp; Notes</h1>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5">
          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          Only you can see these
        </p>

        {isLoading ? (
          <div className="py-16 flex justify-center"><LoadingSpinner /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Highlighter className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Nothing marked yet</h2>
            <p className="text-sm text-muted-foreground">
              While reading a chapter, tap any verse to highlight it or add a note. They'll all be saved here.
            </p>
          </div>
        ) : (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your highlights and notes"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-card text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Search"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 mb-2" style={{ scrollbarWidth: 'none' }}>
              {chip('all', 'All')}
              {chip('notes', 'Notes')}
              {HIGHLIGHT_COLORS.map((c) => chip(c.id, c.label, c.swatch))}
            </div>

            {booksUsed.length > 1 && (
              <select
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value)}
                className="w-full h-10 px-3 mb-4 rounded-xl border border-border bg-card text-sm text-foreground"
                aria-label="Filter by book"
              >
                <option value="all">All books</option>
                {booksUsed.map((b) => <option key={b.index} value={String(b.index)}>{b.name}</option>)}
              </select>
            )}

            {visible.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">No matches.</p>
            ) : (
              <ul className="space-y-3">
                {visible.map((item) => {
                  const color = item.kind === 'highlight' ? colorById(item.color) : null;
                  const name = item.bookName || BIBLE_BOOKS[item.bookIndex]?.name || '';
                  return (
                    <li key={item._key || item.id}>
                      <button
                        onClick={() => open(item)}
                        className="w-full text-left bg-card border border-border rounded-2xl p-4 flex gap-3 active:scale-[0.99] transition-transform"
                      >
                        <span
                          className="w-1.5 self-stretch rounded-full shrink-0"
                          style={{ backgroundColor: color ? color.swatch : 'hsl(var(--primary))' }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                              {item.kind === 'note' && <StickyNote className="w-3.5 h-3.5 text-primary" aria-label="Note" />}
                              {formatVerseRef(name, item.chapter, item.verse, item.endVerse)}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">{formatDate(item.updatedAt)}</span>
                          </div>
                          {item.text && (
                            <p className="font-serif text-[15px] leading-relaxed text-foreground/85 line-clamp-3">{item.text}</p>
                          )}
                          {item.kind === 'note' && (
                            <p className="mt-2 text-sm text-foreground bg-muted rounded-xl px-3 py-2 whitespace-pre-wrap line-clamp-4">{item.note}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {reader && (
          <BibleReader
            book={reader.book}
            chapter={reader.chapter}
            initialVerse={reader.verse}
            userId={user?.id}
            onClose={() => setReader(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
