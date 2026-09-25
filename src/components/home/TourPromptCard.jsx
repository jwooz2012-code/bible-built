import React from 'react';
import { motion } from 'framer-motion';
import { Compass, X } from 'lucide-react';

export default function TourPromptCard({ onStart, onDismiss }) {
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
          background: 'color-mix(in srgb, rgb(59,130,246) 6%, hsl(var(--card)) 94%)',
          border: '1px solid color-mix(in srgb, rgb(59,130,246) 16%, hsl(var(--border)) 84%)',
        }}
      >
        <button onClick={onStart} className="flex items-center gap-3.5 flex-1 min-w-0 text-left">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in srgb, rgb(59,130,246) 15%, hsl(var(--card)) 85%)' }}
          >
            <Compass className="w-4 h-4" style={{ color: 'rgb(59,130,246)' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">New here? Take the 1-minute tour</p>
            <p className="text-xs text-muted-foreground mt-0.5">See everything Bible Built can do</p>
          </div>
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss tour"
          className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
