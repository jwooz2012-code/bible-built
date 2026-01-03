import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, todayCount, currentCycleProgress, timesThrough, onClick }) {
  const progressPct = Math.min((currentCycleProgress / book.chapters) * 100, 100);
  
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card border border-border rounded-2xl p-4 text-left hover:bg-accent/5 transition-colors relative overflow-hidden"
    >
      {progressPct > 0 && (
        <div 
          className="absolute inset-0 bg-accent/5 transition-all duration-500"
          style={{ opacity: Math.min(progressPct / 100, 0.3) }}
        />
      )}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-foreground">{book.name}</h3>
          {timesThrough > 0 && (
            <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              ×{timesThrough}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Chapters: {currentCycleProgress}/{book.chapters}
        </p>
        {currentCycleProgress > 0 && (
          <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>
    </motion.button>
  );
}