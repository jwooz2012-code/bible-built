import React from 'react';
import { Trophy } from 'lucide-react';

export default function WeeklyRecapCard({ message, onDismiss }) {
  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden mb-5"
      style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))' }}>
      <div className="px-4 py-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,158,11,0.2)' }}>
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">Weekly Recap 🏆</p>
          <p className="text-sm text-foreground leading-snug">{message}</p>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground text-xs shrink-0 mt-0.5">✕</button>
      </div>
    </div>
  );
}