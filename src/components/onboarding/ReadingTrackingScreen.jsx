import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/components/utils/haptics';
import { useAuth } from '@/lib/AuthContext';
import ChapterTile from '@/components/shared/ChapterTile';
import BibleReader from '@/components/shared/BibleReader';
import { BIBLE_BOOKS, generateChapterId } from '@/components/bible/bibleData';

const DEMO_BOOK = BIBLE_BOOKS[0]; // Genesis
const DEMO_CHAPTERS = 12;

export default function ReadingTrackingScreen({ onContinue, isNewFeature = false }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [isReadModeActive, setIsReadModeActive] = useState(false);
  const [counts, setCounts] = useState({});
  const [readerMarkedChapters, setReaderMarkedChapters] = useState(new Set());
  const [readerState, setReaderState] = useState(null);
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [hasReadChapter, setHasReadChapter] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleToggle = (toReadMode) => {
    if (toReadMode === isReadModeActive) return;
    triggerHaptic();
    setIsReadModeActive(toReadMode);
  };

  const handleChapterClick = (chapter) => {
    triggerHaptic();
    if (isReadModeActive) {
      setReaderState({ chapter });
    } else {
      setCounts(prev => ({ ...prev, [chapter]: (prev[chapter] || 0) + 1 }));
      setHasMarkedComplete(true);
    }
  };

  const handleReaderMarkRead = ({ chapter: markedChapter } = {}) => {
    setHasReadChapter(true);
    if (markedChapter) {
      setReaderMarkedChapters(prev => new Set([...prev, markedChapter]));
    }
    setReaderState(null);
  };

  const canContinue = hasMarkedComplete && hasReadChapter;

  const handleContinue = () => {
    if (!canContinue || isActivating) return;
    setIsActivating(true);
    triggerHaptic();
    setTimeout(() => onContinue(), 300);
  };

  const totalMarked = Object.values(counts).filter(c => c > 0).length + readerMarkedChapters.size;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 pt-8"
      >
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full max-w-sm flex flex-col items-center space-y-6"
        >
          {/* Heading */}
          <div className="text-center space-y-2">
            {isNewFeature && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 18 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-600 text-xs font-bold tracking-wide mb-1"
              >
                <span>✨</span> NEW FEATURE
              </motion.div>
            )}
            <h1 className="text-3xl font-black text-foreground">{isNewFeature ? 'Track Your Reading' : 'Log Your Reading'}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isNewFeature ? 'You can now log chapters two ways — mark them complete instantly, or open and read them right here in the app.' : 'Try both modes below before continuing — mark a chapter complete, then open one to read it.'}
            </p>
          </div>

          {/* Book Card */}
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-full bg-card border border-border rounded-2xl p-4 shadow-md"
          >
            {/* Book header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-foreground">{DEMO_BOOK.name}</h2>
                <p className="text-xs text-muted-foreground">Showing first {DEMO_CHAPTERS} chapters</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {totalMarked} / {DEMO_CHAPTERS} read
              </span>
            </div>

            {/* Segmented Control */}
            <div
              className="relative flex rounded-full border border-border overflow-hidden mb-3"
              style={{ background: 'var(--btn-inactive-bg)', padding: '2px' }}
            >
              <div
                className="absolute top-[2px] bottom-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                  width: 'calc(50% - 2px)',
                  left: isReadModeActive ? '50%' : '2px',
                  transition: 'left 140ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
              <button
                onClick={() => handleToggle(false)}
                className="relative flex-1 flex items-center justify-center gap-1.5 h-10 text-sm font-semibold z-10 whitespace-nowrap"
                style={{ color: !isReadModeActive ? '#fff' : 'var(--btn-inactive-text)', transition: 'color 140ms' }}
              >
                <CheckSquare className="w-4 h-4 shrink-0" />
                Mark Complete
              </button>
              <button
                onClick={() => handleToggle(true)}
                className="relative flex-1 flex items-center justify-center gap-1.5 h-10 text-sm font-semibold z-10 whitespace-nowrap"
                style={{ color: isReadModeActive ? '#fff' : 'var(--btn-inactive-text)', transition: 'color 140ms' }}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                Read Chapter
              </button>
            </div>

            {/* Mode hint */}
            <p
              key={isReadModeActive ? 'read' : 'mark'}
              className="text-xs text-center mb-4 animate-in fade-in duration-200"
              style={{ opacity: 0.55 }}
            >
              {isReadModeActive ? '📖 Tap a chapter to read' : '✅ Tap a chapter to mark complete'}
            </p>

            {/* Chapter tile grid */}
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: DEMO_CHAPTERS }, (_, i) => i + 1).map((chapter) => {
                const chapterId = generateChapterId(DEMO_BOOK.index, chapter);
                const timesRead = (counts[chapter] || 0) + (readerMarkedChapters.has(chapter) ? 1 : 0);
                return (
                  <ChapterTile
                    key={chapter}
                    chapter={chapter}
                    chapterId={chapterId}
                    timesRead={timesRead}
                    onClick={() => handleChapterClick(chapter)}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Progress indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full flex gap-3"
          >
            <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${hasMarkedComplete ? 'border-green-500/40 bg-green-500/10 text-green-600' : 'border-border text-muted-foreground'}`}>
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{hasMarkedComplete ? 'Marked complete' : 'Mark a chapter'}</span>
              {hasMarkedComplete && <span className="ml-auto shrink-0">✓</span>}
            </div>
            <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${hasReadChapter ? 'border-green-500/40 bg-green-500/10 text-green-600' : 'border-border text-muted-foreground'}`}>
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{hasReadChapter ? 'Chapter read' : 'Read a chapter'}</span>
              {hasReadChapter && <span className="ml-auto shrink-0">✓</span>}
            </div>
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-8 w-full max-w-sm"
        >
          <motion.div whileTap={{ scale: canContinue ? 0.96 : 1 }}>
            <Button
              onClick={handleContinue}
              disabled={!canContinue || isActivating}
              size="lg"
              className="w-full h-14 rounded-full text-base font-bold"
            >
              {canContinue ? "Got it! 🙌" : "Try both modes to continue"}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* BibleReader overlay */}
      <AnimatePresence>
        {readerState && (
          <BibleReader
            key={readerState.chapter}
            book={DEMO_BOOK}
            chapter={readerState.chapter}
            userId={userId}
            onClose={() => setReaderState(null)}
            onMarkRead={({ chapter: c }) => handleReaderMarkRead({ chapter: c })}
            demoMode
          />
        )}
      </AnimatePresence>
    </>
  );
}