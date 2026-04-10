import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause,
  BookOpen
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchChapter, prefetchChapter } from '@/components/bible/utils/readerUtils';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';
import { getDateKey } from '@/components/bible/utils/dateUtils';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FONT_SIZES = ['text-lg', 'text-xl'];
const FONT_SIZE_CLASSES = ['text-base', 'text-lg']; // size of the 'A' indicator button
const SPEEDS = [0.75, 1, 1.25, 1.5];

/**
 * BibleReader — full-screen overlay reader (z-[55], below nav z-[60])
 *
 * Props:
 *   book       — { name, index, testament, chapters } from BIBLE_BOOKS
 *   chapter    — chapter number (1-based)
 *   userId     — for marking chapters read
 *   onClose    — dismiss callback
 *   onMarkRead — called with { book, chapter, chapterId, testament } after logging
 */
export default function BibleReader({ book, chapter: initialChapter, userId, onClose, onMarkRead, demoMode = false }) {
  const [chapter, setChapter] = useState(initialChapter);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [verses, setVerses] = useState([]);
  const [fontSizeIdx, setFontSizeIdx] = useState(0); // default 'text-base'

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
        await base44.entities.ReadingLog.create({
          userId,
          dateKey: getDateKey(now),
          timestamp: now.toISOString(),
          book: book.name,
          bookIndex: book.index,
          chapter,
          chapterId,
          testament: book.testament,
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
  const chapterTitle = `${book.name} ${chapter}`;
  const fontSize = FONT_SIZES[fontSizeIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-[65] flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
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
            {verseList.map((verse, idx) => (
              <p
                key={verse.number}
                ref={el => verseRefs.current[idx] = el}
                className={`${fontSize} font-serif leading-relaxed mb-3 transition-colors duration-300 ${
                  isPlaying && idx === currentVerse
                    ? 'text-foreground bg-primary/10 rounded-md px-2 -mx-2'
                    : 'text-foreground/90'
                }`}
              >
                <sup className="text-[10px] text-muted-foreground font-sans mr-1.5 select-none">{verse.number}</sup>
                {verse.text}
              </p>
            ))}
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

      {/* ── Mark as Read / bottom bar ── */}
      <div
        className="shrink-0 px-5 py-3 border-t border-border bg-card"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {/* Font size */}
          <button
            onClick={() => setFontSizeIdx(idx => (idx + 1) % FONT_SIZES.length)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors font-serif font-bold text-muted-foreground shrink-0"
            title="Change font size"
          >
            <span className={`${FONT_SIZE_CLASSES[fontSizeIdx]} leading-none`}>A</span>
          </button>

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
    </motion.div>
  );
}