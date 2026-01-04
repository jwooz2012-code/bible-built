import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, completions, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        bg-card border border-border rounded-2xl p-4 text-left transition-all relative overflow-hidden
        shadow-sm hover:shadow-md
        ${completions > 0 ? 'bg-accent/8 border-accent/20' : 'hover:border-border/60'}
      `}
    >
      {completions > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-2xl" />
      )}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-foreground text-sm">{book.name}</h3>
        {completions > 0 && (
          <div className="min-w-[24px] h-[18px] px-2 rounded-full flex items-center justify-center shrink-0 bg-[#E6EEF7] dark:bg-[#24344D] shadow-[0_0_8px_rgba(47,62,92,0.12)] dark:shadow-[0_0_10px_rgba(47,62,92,0.3)]">
            <span className="text-[10px] font-bold text-[#2F3E5C] dark:text-[#E5EEFA]">{completions}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}