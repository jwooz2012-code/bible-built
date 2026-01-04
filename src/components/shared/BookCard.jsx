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
      <div className="relative z-10 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground text-[14px] leading-tight line-clamp-2 flex-1">{book.name}</h3>
          {completions > 0 && (
            <div 
              className="w-[24px] h-[24px] rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(249, 115, 22, 0.12)',
                border: '1.5px solid var(--energy-orange)'
              }}
            >
              <span className="text-[11px] font-bold text-foreground">{completions}</span>
            </div>
          )}
        </div>
        {completions > 0 && (
          <div 
            className="w-7 h-0.5 rounded-full mt-0.5"
            style={{ background: 'var(--energy-gradient)' }}
          />
        )}
      </div>
    </motion.button>
  );
}