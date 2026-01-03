import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, completions, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card border border-border rounded-2xl p-4 text-left hover:bg-accent/5 transition-colors relative overflow-hidden"
    >
      {completions > 0 && (
        <div 
          className="absolute inset-0 bg-accent/5 transition-all duration-500"
          style={{ opacity: 0.3 }}
        />
      )}
      <div className="relative z-10 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{book.name}</h3>
        {completions > 0 && (
          <div className="min-w-[24px] h-[24px] px-1.5 bg-accent rounded-full flex items-center justify-center shrink-0 ml-2">
            <span className="text-xs font-bold text-white">{completions}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}