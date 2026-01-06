import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, completions, onClick, compact = false }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`bg-card border border-border rounded-xl text-left transition-all relative overflow-hidden shadow-sm hover:shadow-md group ${compact ? 'p-2 h-12' : 'p-2.5 h-14'}`}
      style={{
        minHeight: compact ? '48px' : '56px',
        maxHeight: compact ? '48px' : '56px',
        transition: 'all 0.15s ease',
        boxShadow: completions > 0 ? '0 0 0 0 var(--energy-glow)' : undefined
      }}
      onMouseEnter={(e) => {
        if (completions > 0) {
          e.currentTarget.style.boxShadow = '0 0 16px var(--energy-glow)';
        }
        e.currentTarget.style.borderColor = 'var(--energy-orange)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = completions > 0 ? '0 0 0 0 var(--energy-glow)' : '';
        e.currentTarget.style.borderColor = 'hsl(var(--border))';
      }}
    >
      {completions > 0 && (
        <div 
          className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-md z-20"
          style={{
            background: 'linear-gradient(135deg, var(--energy-orange), var(--energy-gold))',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            minWidth: '22px',
            minHeight: '22px'
          }}
        >
          <span 
            className="text-[10px] font-bold leading-none"
            style={{ color: 'var(--badge-text)', lineHeight: 1 }}
          >
            {completions}
          </span>
        </div>
      )}
      <div className="relative z-10 flex items-center h-full">
        <div className={`flex flex-col w-full ${compact ? 'gap-1 pr-7' : 'gap-1.5 pr-8'}`}>
          <h3 className={`font-semibold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${compact ? 'text-sm' : 'text-base'}`}>{book.name}</h3>
          {completions > 0 && (
            <div 
              className="w-8 h-0.5 rounded-full"
              style={{ background: 'var(--energy-gradient)' }}
            />
          )}
        </div>
      </div>
    </motion.button>
  );
}