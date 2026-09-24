import React from 'react';
import { motion } from 'framer-motion';

export default function BookCard({ book, completions, chaptersRead = 0, onClick, compact = false }) {
  // Progress through the current read-through; a finished book with no new pass started shows full.
  const progress = chaptersRead > 0
    ? Math.min(chaptersRead / book.chapters, 1)
    : completions > 0 ? 1 : 0;

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
      {completions > 0 && (() => {
        const tierStyles = completions >= 5
          ? { bg: 'linear-gradient(135deg, #3B82F6, #06B6D4)', border: 'rgba(59,130,246,0.5)', shadow: '0 2px 8px rgba(59,130,246,0.5)' }
          : completions === 4
          ? { bg: 'linear-gradient(135deg, #F59E0B, #F97316)', border: 'rgba(245,158,11,0.5)', shadow: '0 2px 8px rgba(249,115,22,0.55)' }
          : completions === 3
          ? { bg: 'linear-gradient(135deg, #8B5CF6, #6366F1)', border: 'rgba(139,92,246,0.5)', shadow: '0 2px 8px rgba(139,92,246,0.55)' }
          : completions === 2
          ? { bg: 'linear-gradient(135deg, #22C55E, #10B981)', border: 'rgba(34,197,94,0.5)', shadow: '0 2px 8px rgba(34,197,94,0.5)' }
          : { bg: 'linear-gradient(135deg, #1a1a1a, #3a3a3a)', border: 'rgba(255,255,255,0.25)', shadow: '0 2px 8px rgba(0,0,0,0.4)' };
        return (
          <div
            className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center z-20"
            style={{ background: tierStyles.bg, border: `1.5px solid ${tierStyles.border}`, boxShadow: tierStyles.shadow }}
          >
            <span className="text-[10px] font-bold leading-none" style={{ color: '#fff', lineHeight: 1 }}>
              {completions}
            </span>
          </div>
        );
      })()}
      <div className="relative z-10 flex items-center h-full">
        <div className={`flex flex-col w-full ${compact ? 'pr-7' : 'pr-8'}`}>
          <h3 className={`font-semibold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${compact ? 'text-sm' : 'text-base'}`}>{book.name}</h3>
        </div>
      </div>
      {progress > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] z-10"
          style={{ background: 'hsl(var(--muted))' }}
          role="progressbar"
          aria-label={`${book.name} progress`}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #16A34A, #22C55E)' }}
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}
    </motion.button>
  );
}