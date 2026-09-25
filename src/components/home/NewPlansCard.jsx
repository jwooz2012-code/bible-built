import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

export default function NewPlansCard({ planNames, onExplore, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="mb-5 overflow-hidden"
    >
      <div
        className="rounded-2xl px-4 py-3.5 flex items-center gap-3.5"
        style={{
          background: 'color-mix(in srgb, rgb(245,158,11) 8%, hsl(var(--card)) 92%)',
          border: '1px solid color-mix(in srgb, rgb(245,158,11) 28%, hsl(var(--border)) 72%)',
        }}
      >
        <button onClick={onExplore} className="flex items-center gap-3.5 flex-1 min-w-0 text-left">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in srgb, rgb(245,158,11) 18%, hsl(var(--card)) 82%)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'rgb(217,119,6)' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{planNames.length} new reading plans</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{planNames.join(' · ')}</p>
          </div>
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss new plans"
          className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
