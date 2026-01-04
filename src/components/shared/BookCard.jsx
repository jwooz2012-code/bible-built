import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, completions, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card border border-border rounded-2xl p-4 text-left transition-all relative overflow-hidden shadow-sm hover:shadow-md"
      style={completions > 0 ? {
        boxShadow: '0 0 18px var(--energy-glow-light, var(--energy-glow-dark, rgba(249, 115, 22, 0.18)))'
      } : {}}
    >
      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-foreground text-sm">{book.name}</h3>
          {completions > 0 && (
            <div 
              className="min-w-[24px] h-[18px] px-2 rounded-full flex items-center justify-center shrink-0 border-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--energy-orange), var(--energy-gold))',
                borderColor: 'var(--energy-orange)',
                boxShadow: '0 0 10px var(--energy-glow-light, var(--energy-glow-dark, rgba(249, 115, 22, 0.2)))'
              }}
            >
              <span className="text-[10px] font-bold text-white">{completions}</span>
            </div>
          )}
        </div>
        {completions > 0 && (
          <div 
            className="w-12 h-0.5 rounded-full"
            style={{ background: 'var(--energy-gradient)' }}
          />
        )}
      </div>
    </motion.button>
  );
}