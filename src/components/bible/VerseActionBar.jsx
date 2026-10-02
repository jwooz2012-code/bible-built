import React from 'react';
import { motion } from 'framer-motion';
import { X, StickyNote, Copy, Eraser } from 'lucide-react';
import { HIGHLIGHT_COLORS } from '@/components/bible/hooks/useVerseMarks';

// Bottom bar shown in the reader while verses are selected.
export default function VerseActionBar({ refLabel, activeColor, canClear, onColor, onClear, onNote, onCopy, onClose }) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="shrink-0 px-5 pt-3 border-t border-border bg-card"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      role="toolbar"
      aria-label="Selected verses"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground truncate">{refLabel}</span>
          <button onClick={onClose} className="p-1.5 -mr-1.5 rounded-lg hover:bg-muted" aria-label="Done selecting">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => onColor(c.id)}
              className="w-10 h-10 flex items-center justify-center rounded-full"
              aria-label={`Highlight ${c.label.toLowerCase()}`}
              aria-pressed={activeColor === c.id}
            >
              <span
                className={`block w-7 h-7 rounded-full transition-transform ${activeColor === c.id ? 'ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110' : ''}`}
                style={{ backgroundColor: c.swatch }}
              />
            </button>
          ))}
          {canClear && (
            <button
              onClick={onClear}
              className="w-10 h-10 flex items-center justify-center rounded-full"
              aria-label="Remove highlight"
            >
              <span className="w-7 h-7 rounded-full border-2 border-border flex items-center justify-center">
                <Eraser className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onNote}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            <StickyNote className="w-4 h-4" />
            Note
          </button>
          <button
            onClick={onCopy}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-muted text-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
      </div>
    </motion.div>
  );
}
