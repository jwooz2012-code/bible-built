import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, todayCount, yearProgress, onClick }) {
  const progressPct = Math.min((yearProgress / book.chapters) * 100, 100);
  
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
        <h3 className="font-semibold text-foreground mb-1">{book.name}</h3>
        <p className="text-xs text-muted-foreground">
          {todayCount > 0 ? `Today: ${todayCount}` : `${yearProgress}/${book.chapters} this year`}
        </p>
        {yearProgress > 0 && (
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