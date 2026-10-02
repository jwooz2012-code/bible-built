import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause,
  BookOpen, StickyNote
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchChapter, prefetchChapter } from '@/components/bible/utils/readerUtils';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { triggerHaptic } from '@/components/utils/haptics';
import { useChapterMarks, useVerseMarkActions, colorById, formatVerseRef } from '@/components/bible/hooks/useVerseMarks';
import VerseActionBar from '@/components/bible/VerseActionBar';
import VerseNoteSheet from '@/components/bible/VerseNoteSheet';

// Verse text sizes (px): 22 by default, A+ goes up to 26. Remembered per device.
const FONT_SIZES = ['text-[18px]', 'text-[20px]', 'text-[22px]', 'text-[24px]', 'text-[26px]'];
const FONT_SIZE_PX = [18, 20, 22, 24, 26];
const DEFAULT_FONT_SIZE_IDX = 2;
const FONT_SIZE_KEY = 'bb_reader_font_px';

function loadFontSizeIdx() {
  try {
    const idx = FONT_SIZE_PX.indexOf(Number(localStorage.getItem(FONT_SIZE_KEY)));
    return idx >= 0 ? idx : DEFAULT_FONT_SIZE_IDX;
  } catch {
    return DEFAULT_FONT_SIZE_IDX;
  }
}
const SPEEDS = [0.75, 1, 1.25, 1.5];

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older web views: fall back to a hidden text box.
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * BibleReader — full-screen overlay reader (z-[55], below nav z-[60])
 *
 * Props:
 *   book       — { name, index, testament, chapters } from BIBLE_BOOKS
 *   chapter    — chapter number (1-based)
 *   userId     — for marking chapters read
 *   onClose    — dismiss callback
 *   onMarkRead — called with { book, chapter, chapterId, testament } after logging
 *   initialVerse — optional verse to scroll to when the reader opens
 *
 * Tapping verses selects them for highlighting, notes, or copying (private to the user).
 */
export default function BibleReader({ book, chapter: initialChapter, userId, onClose, onMarkRead, demoMode = false, initialVerse }) {
  const [chapter, setChapter] = useState(initialChapter);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [verses, setVerses] = useState([]);
  const [fontSizeIdx, setFontSizeIdx] = useState(loadFontSizeIdx);

  // Audio state
  const [audioVisible, setAudioVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1); // default 1x
  const utteranceRef = useRef(null);
  const verseRefs = useRef([]);
  const scrollContainerRef = useRef(null);

  // Voice selection
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(
    () => localStorage.getItem('bb_voice_uri') || ''
  );

  // Mark-as-read
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isMarked, setIsMarked] = useState(false);

  // Highlights & notes
  const canMark = !demoMode && !!userId;
  const { data: marks = [] } = useChapterMarks(canMark ? userId : null, book.index, chapter);
  const markActions = useVerseMarkActions(userId, book, chapter);
  const [selected, setSelected] = useState([]); // verse numbers
  const [noteEditor, setNoteEditor] = useState(null); // { key, verse, endVerse, note, text }
  const noteKeyRef = useRef(null);
  const scrolledToInitialVerse = useRef(false);

  // Populate voices
  useEffect(() => {
    const populate = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      const eng = voices.filter(v => v.lang.startsWith('en'));
      setAvailableVoices(eng);
      if (!selectedVoiceURI && eng.length > 0) {
        setSelectedVoiceURI(eng[0].voiceURI);
      }
    };
    populate();
    window.speechSynthesis.onvoiceschanged = populate;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Load chapter
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setVerses([]);
    setSelected([]);
    setNoteEditor(null);
    stopAudio();

    fetchChapter(book.index, chapter)
      .then(v => { if (!cancelled) { setVerses(v); setIsLoading(false); setCurrentVerse(0); } })
      .catch(err => { if (!cancelled) { setLoadError(err.message); setIsLoading(false); } });

    return () => { cancelled = true; };
  }, [book.index, chapter]);

  // Prefetch adjacent chapters
  useEffect(() => {
    if (chapter > 1) prefetchChapter(book.index, chapter - 1);
    if (chapter < book.chapters) prefetchChapter(book.index, chapter + 1);
  }, [book.index, book.chapters, chapter]);



  // Opened from Highlights & Notes: bring that verse into view once.
  useEffect(() => {
    if (isLoading || scrolledToInitialVerse.current || !initialVerse || chapter !== initialChapter) return;
    scrolledToInitialVerse.current = true;
    const el = verseRefs.current[initialVerse - 1];
    if (el) el.scrollIntoView({ block: 'center' });
  }, [isLoading, initialVerse, chapter, initialChapter]);

  // Auto-scroll to highlighted verse
  useEffect(() => {
    const el = verseRefs.current[currentVerse];
    if (el && scrollContainerRef.current && isPlaying) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentVerse, isPlaying]);

  // Stop audio on unmount
  useEffect(() => () => stopAudio(), []);

  const stopAudio = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    utteranceRef.current = null;
  }, []);

  const speakVerse = useCallback((idx, speed, versesList) => {
    if (!versesList?.length || idx >= versesList.length) {
      setIsPlaying(false);
      setAudioVisible(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(versesList[idx].text);
    utterance.rate = speed;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const chosen = voices.find(v => v.voiceURI === selectedVoiceURI)
      || voices.find(v => v.lang.startsWith('en'));
    if (chosen) utterance.voice = chosen;

    utterance.onend = () => {
      const nextIdx = idx + 1;
      if (nextIdx < versesList.length) {
        setCurrentVerse(nextIdx);
        speakVerse(nextIdx, speed, versesList);
      } else {
        setIsPlaying(false);
        setCurrentVerse(0);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      toast.error('Audio not supported on this device');
      return;
    }
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakVerse(currentVerse, SPEEDS[speedIdx], verses);
    }
  }, [isPlaying, currentVerse, speedIdx, verses, speakVerse]);

  const handleSpeedChange = useCallback(() => {
    const nextIdx = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(nextIdx);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setTimeout(() => speakVerse(currentVerse, SPEEDS[nextIdx], verses), 50);
    }
  }, [speedIdx, isPlaying, currentVerse, verses, speakVerse]);

  const handleVoiceChange = useCallback((uri) => {
    setSelectedVoiceURI(uri);
    localStorage.setItem('bb_voice_uri', uri);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setTimeout(() => speakVerse(currentVerse, SPEEDS[speedIdx], verses), 50);
    }
  }, [isPlaying, currentVerse, speedIdx, verses, speakVerse]);

  const handlePrevChapter = useCallback(() => {
    if (chapter > 1) { stopAudio(); setChapter(c => c - 1); }
  }, [chapter, stopAudio]);

  const handleNextChapter = useCallback(() => {
    if (chapter < book.chapters) { stopAudio(); setChapter(c => c + 1); }
  }, [chapter, book.chapters, stopAudio]);



  const handleMarkRead = useCallback(async () => {
    if (isMarkingRead || isMarked) return;
    if (!demoMode && !userId) return;
    setIsMarkingRead(true);
    stopAudio();
    try {
      const chapterId = generateChapterId(book.index, chapter);
      if (!demoMode) {
        const now = new Date();
        const dateKey = getDateKey(now);
        const timestamp = now.toISOString();
        // Route through the trusted backend function (XP, idempotency, wallet update)
        await base44.functions.invoke('logChapterRead', {
          chapters: [{
            userId,
            timestamp,
            dateKey,
            book: book.name,
            bookIndex: book.index,
            chapter,
            chapterId,
            testament: book.testament,
            xpEarned: 0, // server computes actual XP
          }],
        });
        base44.analytics.track({ eventName: 'chapter_read_completed', properties: { book: book.name, chapter, testament: book.testament, chapterId } });
      }
      setIsMarked(true);
      toast.success('Chapter marked as read');
      onMarkRead?.({ book, chapter, chapterId, testament: book.testament });
      setTimeout(() => onClose(), 600);
    } catch (err) {
      toast.error('Failed to mark chapter');
      setIsMarkingRead(false);
    }
  }, [demoMode, userId, isMarkingRead, isMarked, book, chapter, stopAudio, onMarkRead, onClose]);

  const verseList = useMemo(() => verses, [verses]);

  const highlightByVerse = useMemo(() => {
    const map = new Map();
    for (const m of marks) if (m.kind === 'highlight') map.set(m.verse, m.color);
    return map;
  }, [marks]);
  const notesEndingAt = useMemo(() => {
    const map = new Map();
    for (const m of marks) {
      if (m.kind !== 'note') continue;
      const end = m.endVerse || m.verse;
      map.set(end, [...(map.get(end) || []), m]);
    }
    return map;
  }, [marks]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedVerses = useMemo(
    () => verses.filter((v) => selectedSet.has(v.number)),
    [verses, selectedSet],
  );
  const selectionRef = useMemo(() => {
    if (!selectedVerses.length) return '';
    const nums = selectedVerses.map((v) => v.number);
    const contiguous = nums[nums.length - 1] - nums[0] === nums.length - 1;
    return contiguous
      ? formatVerseRef(book.name, chapter, nums[0], nums[nums.length - 1])
      : `${book.name} ${chapter}:${nums.join(', ')}`;
  }, [selectedVerses, book.name, chapter]);
  const selectionColor = useMemo(() => {
    const colors = new Set(selectedVerses.map((v) => highlightByVerse.get(v.number) || null));
    return colors.size === 1 ? [...colors][0] : null;
  }, [selectedVerses, highlightByVerse]);
  const selectionHasHighlight = selectedVerses.some((v) => highlightByVerse.has(v.number));

  const toggleVerse = (number) => {
    if (!canMark) return;
    triggerHaptic('light');
    setSelected((s) => (s.includes(number) ? s.filter((n) => n !== number) : [...s, number]));
  };

  const handleColor = (color) => {
    triggerHaptic();
    markActions.setHighlight(selectedVerses, color);
    setSelected([]);
  };

  const handleClearHighlight = () => {
    triggerHaptic('light');
    markActions.clearHighlight(selectedVerses.map((v) => v.number));
    setSelected([]);
  };

  const openNote = (note) => {
    noteKeyRef.current = note._key;
    const range = verses.filter((v) => v.number >= note.verse && v.number <= (note.endVerse || note.verse));
    setNoteEditor({
      key: note._key,
      verse: note.verse,
      endVerse: note.endVerse || note.verse,
      note: note.note || '',
      text: range.map((v) => v.text).join(' ') || note.text || '',
    });
  };

  const handleNote = () => {
    const first = selectedVerses[0].number;
    const last = selectedVerses[selectedVerses.length - 1].number;
    const existing = marks.find((m) => m.kind === 'note' && m.verse === first && (m.endVerse || m.verse) === last);
    setSelected([]);
    if (existing) return openNote(existing);
    noteKeyRef.current = null;
    setNoteEditor({
      key: null,
      verse: first,
      endVerse: last,
      note: '',
      text: verses.filter((v) => v.number >= first && v.number <= last).map((v) => v.text).join(' '),
    });
  };

  const handleSaveNote = (value) => {
    if (!noteEditor) return;
    if (!value.trim()) {
      if (noteKeyRef.current) markActions.deleteNote(noteKeyRef.current);
      noteKeyRef.current = null;
      setNoteEditor((e) => (e ? { ...e, key: null } : e));
      return;
    }
    const key = markActions.saveNote({
      key: noteKeyRef.current,
      verse: noteEditor.verse,
      endVerse: noteEditor.endVerse,
      note: value,
      text: noteEditor.text,
    });
    noteKeyRef.current = key;
    setNoteEditor((e) => (e ? { ...e, key } : e));
  };

  const handleDeleteNote = () => {
    if (noteKeyRef.current) markActions.deleteNote(noteKeyRef.current);
    noteKeyRef.current = null;
    setNoteEditor(null);
    toast.success('Note deleted');
  };

  const handleCopy = async () => {
    const body = selectedVerses.map((v) => v.text).join(' ');
    const ok = await copyText(`“${body}” — ${selectionRef}`);
    setSelected([]);
    if (ok) toast.success('Copied');
    else toast.error("Couldn't copy on this device");
  };
  const chapterTitle = `${book.name} ${chapter}`;
  const fontSize = FONT_SIZES[fontSizeIdx];
  const changeFontSize = (step) => {
    const next = Math.min(Math.max(fontSizeIdx + step, 0), FONT_SIZES.length - 1);
    setFontSizeIdx(next);
    try {
      localStorage.setItem(FONT_SIZE_KEY, String(FONT_SIZE_PX[next]));
    } catch {
      // Private mode etc. — the size still applies for this session.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-[65] flex flex-col"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0" style={{ paddingTop: 'max(4rem, env(safe-area-inset-top, 0px))' }}>
        {/* Left: close */}
        <div className="w-10">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Center: chapter nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevChapter}
            disabled={chapter <= 1}
            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground min-w-[90px] text-center">{chapterTitle}</span>
          <button
            onClick={handleNextChapter}
            disabled={chapter >= book.chapters}
            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Right: spacer to balance */}
        <div className="w-10" />
      </div>

      {/* ── Content ── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 pt-4 pb-2" style={{ overscrollBehavior: 'contain' }}>
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {loadError && (
          <div className="text-center py-12 text-destructive text-sm">
            <p className="mb-2">⚠️ Could not load this chapter.</p>
            <p className="text-muted-foreground text-xs">{loadError}</p>
            <button onClick={() => { setLoadError(null); setIsLoading(true); fetchChapter(book.index, chapter).then(v => { setVerses(v); setIsLoading(false); }).catch(e => { setLoadError(e.message); setIsLoading(false); }); }} className="mt-4 text-primary text-sm underline">
              Try again
            </button>
          </div>
        )}
        {!isLoading && !loadError && (
          <div className="max-w-2xl mx-auto">
            {verseList.map((verse, idx) => {
              const color = colorById(highlightByVerse.get(verse.number));
              const isSelected = selectedSet.has(verse.number);
              const notes = notesEndingAt.get(verse.number);
              return (
                <p
                  key={verse.number}
                  ref={el => verseRefs.current[idx] = el}
                  onClick={() => toggleVerse(verse.number)}
                  data-verse={verse.number}
                  data-selected={isSelected || undefined}
                  className={`${fontSize} font-serif leading-[1.7] mb-3 rounded-md px-2 -mx-2 transition-colors duration-300 ${
                    isPlaying && idx === currentVerse
                      ? 'text-foreground bg-primary/10'
                      : 'text-foreground/90'
                  } ${isSelected ? 'underline decoration-dotted decoration-2 underline-offset-[6px] decoration-primary' : ''} ${canMark ? 'cursor-pointer' : ''}`}
                  style={color ? { backgroundColor: color.bg } : undefined}
                >
                  <sup className="text-[0.55em] text-muted-foreground font-sans mr-1.5 select-none">{verse.number}</sup>
                  {verse.text}
                  {notes?.map((n) => (
                    <button
                      key={n._key}
                      onClick={(e) => { e.stopPropagation(); openNote(n); }}
                      className="inline-flex align-middle ml-1.5 p-1 rounded-md text-primary hover:bg-primary/10"
                      aria-label={`Open note on ${formatVerseRef(book.name, chapter, n.verse, n.endVerse)}`}
                    >
                      <StickyNote className="w-[0.8em] h-[0.8em]" />
                    </button>
                  ))}
                </p>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Audio bar ── */}
      <AnimatePresence>
        {audioVisible && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="border-t border-border bg-card px-5 py-3 shrink-0"
          >
            <div className="max-w-2xl mx-auto space-y-2">
            {/* Voice selector */}
            {availableVoices.length > 0 && (
              <Select value={selectedVoiceURI} onValueChange={handleVoiceChange}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map(v => (
                    <SelectItem key={v.voiceURI} value={v.voiceURI} className="text-xs">
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {/* Controls row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground w-20">
                {verses.length > 0 ? `Verse ${currentVerse + 1} / ${verses.length}` : '—'}
              </span>
              <button
                onClick={handlePlayPause}
                disabled={isLoading || verses.length === 0}
                className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shadow-md"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                onClick={handleSpeedChange}
                className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors w-20 text-center"
              >
                {SPEEDS[speedIdx]}x
              </button>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selected verses: highlight / note / copy ── */}
      {selectedVerses.length > 0 && (
        <VerseActionBar
          refLabel={selectionRef}
          activeColor={selectionColor}
          canClear={selectionHasHighlight}
          onColor={handleColor}
          onClear={handleClearHighlight}
          onNote={handleNote}
          onCopy={handleCopy}
          onClose={() => setSelected([])}
        />
      )}

      {/* ── Mark as Read / bottom bar ── */}
      <div
        className={`shrink-0 px-5 py-3 border-t border-border bg-card ${selectedVerses.length > 0 ? 'hidden' : ''}`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {/* Text size */}
          <div className="flex items-center rounded-xl bg-muted shrink-0">
            <button
              onClick={() => changeFontSize(-1)}
              disabled={fontSizeIdx === 0}
              className="w-10 h-10 flex items-center justify-center rounded-xl font-serif font-bold text-foreground disabled:opacity-30 transition-opacity"
              aria-label="Smaller text"
            >
              <span className="text-sm leading-none">A−</span>
            </button>
            <button
              onClick={() => changeFontSize(1)}
              disabled={fontSizeIdx === FONT_SIZES.length - 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl font-serif font-bold text-foreground disabled:opacity-30 transition-opacity"
              aria-label="Larger text"
            >
              <span className="text-lg leading-none">A+</span>
            </button>
          </div>

          <button
            onClick={handleMarkRead}
            disabled={isMarkingRead || isMarked || (!demoMode && !userId)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-2xl font-semibold text-sm transition-all
              ${isMarked
                ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
              } disabled:opacity-60`}
          >
            <BookOpen className="w-4 h-4" />
            {isMarked ? 'Marked as Read ✓' : isMarkingRead ? 'Saving...' : 'Mark as Read'}
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => setAudioVisible(v => !v)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors shrink-0 ${
              audioVisible ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            {audioVisible ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Note editor ── */}
      <AnimatePresence>
        {noteEditor && (
          <VerseNoteSheet
            key={`${noteEditor.verse}-${noteEditor.endVerse}`}
            refLabel={formatVerseRef(book.name, chapter, noteEditor.verse, noteEditor.endVerse)}
            previewText={noteEditor.text}
            initialNote={noteEditor.note}
            isExisting={!!noteEditor.key}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
            onClose={() => setNoteEditor(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}