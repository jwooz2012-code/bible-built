import React from 'react';
import { motion } from 'framer-motion';

export default function OnboardingProgress({ current, total }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-6 py-4">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            {current + 1} / {total}
          </span>
        </div>

        <div className="flex-1 mx-4 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((current + 1) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full bg-green-500 rounded-full"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          {Math.round(((current + 1) / total) * 100)}%
        </div>
      </div>
    </div>
  );
}