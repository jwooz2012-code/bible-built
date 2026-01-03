import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, todayCount, yearProgress, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card border border-border rounded-2xl p-4 text-left hover:bg-accent/5 transition-colors"
    >
      <h3 className="font-semibold text-foreground mb-1">{book.name}</h3>
      <p className="text-xs text-muted-foreground">
        {todayCount > 0 ? `Today: ${todayCount}` : `${yearProgress}/${book.chapters} this year`}
      </p>
      {yearProgress > 0 && (
        <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${Math.min((yearProgress / book.chapters) * 100, 100)}%` }}
          />
        </div>
      )}
    </motion.button>
  );
}