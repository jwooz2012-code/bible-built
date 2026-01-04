import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, completions, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-3 text-left transition-all relative overflow-hidden shadow-sm hover:shadow-md"
    >
      <div className="relative z-10 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground text-xs leading-tight line-clamp-2 flex-1">{book.name}</h3>
          {completions > 0 && (
            <div 
              className="min-w-[20px] h-[16px] px-1.5 rounded-full flex items-center justify-center shrink-0 border transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--energy-orange), var(--energy-gold))',
                borderColor: 'var(--energy-orange)',
                boxShadow: '0 0 6px rgba(249, 115, 22, 0.12)'
              }}
            >
              <span className="text-[9px] font-bold text-white">{completions}</span>
            </div>
          )}
        </div>
        {completions > 0 && (
          <div 
            className="w-8 h-0.5 rounded-full"
            style={{ background: 'var(--energy-gradient)' }}
          />
        )}
      </div>
    </motion.button>
  );
}