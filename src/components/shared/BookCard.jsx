import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, completions, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        bg-card border-0 rounded-xl p-4 text-left transition-all relative overflow-hidden
        ${completions > 0 ? 'bg-accent/10' : 'hover:bg-card/80'}
      `}
    >
      <div className="relative z-10 flex items-center justify-between gap-3">
        <h3 className="font-medium text-foreground text-sm">{book.name}</h3>
        {completions > 0 && (
          <div className="min-w-[20px] h-[20px] px-1.5 bg-accent rounded-full flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">{completions}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}