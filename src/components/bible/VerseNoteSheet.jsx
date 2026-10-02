import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { NOTE_MAX_LENGTH } from '@/components/bible/hooks/useVerseMarks';

const SAVE_DELAY_MS = 700;

// Note editor for a verse or passage. Saves as you type (after a short
// pause) and again when closed, so nothing typed is lost.
export default function VerseNoteSheet({ refLabel, previewText, initialNote, isExisting, onSave, onDelete, onClose }) {
  const [text, setText] = useState(initialNote || '');
  const [status, setStatus] = useState(isExisting ? 'saved' : 'idle');
  const lastSaved = useRef(initialNote || '');
  const timer = useRef(null);

  const flush = (value) => {
    clearTimeout(timer.current);
    if (value === lastSaved.current) return;
    lastSaved.current = value;
    onSave(value);
    setStatus(value.trim() ? 'saved' : 'idle');
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (e) => {
    const value = e.target.value.slice(0, NOTE_MAX_LENGTH);
    setText(value);
    setStatus('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => flush(value), SAVE_DELAY_MS);
  };

  const close = () => {
    flush(text);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-end"
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-2xl mx-auto bg-card rounded-t-3xl p-5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Note on ${refLabel}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-foreground">{refLabel}</h3>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : ''}
          </span>
        </div>
        {previewText && (
          <p className="text-sm font-serif text-muted-foreground line-clamp-3 mb-3">{previewText}</p>
        )}
        <textarea
          value={text}
          onChange={handleChange}
          autoFocus
          rows={5}
          maxLength={NOTE_MAX_LENGTH}
          placeholder="What is God showing you here?"
          className="w-full rounded-xl border border-border bg-background p-3 text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          aria-label="Note"
        />
        <div className="flex items-center justify-between mt-3">
          {isExisting ? (
            <button
              onClick={() => { clearTimeout(timer.current); onDelete(); }}
              className="flex items-center gap-1.5 text-sm font-medium text-destructive px-2 py-2 -ml-2 rounded-lg hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete note
            </button>
          ) : <span />}
          <button
            onClick={close}
            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
