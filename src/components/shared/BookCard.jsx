import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, completions, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-2.5 text-left transition-all relative overflow-hidden shadow-sm hover:shadow-md group"
      style={{
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 8px rgba(249, 115, 22, 0.1)';
        e.currentTarget.style.borderColor = 'var(--energy-orange)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'hsl(var(--border))';
      }}
    >
      {completions > 0 && (
        <div 
          className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-md border-[1.5px] border-white/30 dark:border-white/20 z-20"
          style={{
            background: 'linear-gradient(135deg, var(--energy-orange), var(--energy-gold))'
          }}
        >
          <span className="text-[10px] font-bold leading-none text-white">{completions}</span>
        </div>
      )}
      <div className="relative z-10 flex items-center justify-center min-h-full py-2">
        <div className="flex flex-col gap-1 w-full">
          <h3 className="font-semibold text-foreground text-[14px] leading-[1.2] line-clamp-2">{book.name}</h3>
          {completions > 0 && (
            <div 
              className="w-7 h-0.5 rounded-full mt-0.5"
              style={{ background: 'var(--energy-gradient)' }}
            />
          )}
        </div>
      </div>
    </motion.button>
  );
}