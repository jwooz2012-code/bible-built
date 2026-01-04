import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, completions, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-3.5 text-left transition-all relative overflow-hidden shadow-sm hover:shadow-md group"
      style={{
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 12px rgba(249, 115, 22, 0.15)';
        e.currentTarget.style.borderColor = 'var(--energy-orange)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'hsl(var(--border))';
      }}
    >
      <div className="relative z-10 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground text-[15px] leading-tight line-clamp-2 flex-1">{book.name}</h3>
          {completions > 0 && (
            <div 
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all relative"
              style={{
                background: 'rgba(249, 115, 22, 0.1)',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.1)), linear-gradient(135deg, var(--energy-orange), var(--energy-gold))',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box'
              }}
            >
              <span className="text-[10px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{completions}</span>
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