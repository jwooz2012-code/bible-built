import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCelebration, CELEBRATION_TYPES } from './CelebrationContext';
import BadgeCelebration from './BadgeCelebration';
import BookCelebration from './BookCelebration';
import StreakCelebration from './StreakCelebration';

export default function CelebrationRenderer() {
  const { current, dismiss } = useCelebration();

  return (
    <AnimatePresence mode="wait">
      {current?.type === CELEBRATION_TYPES.BADGE && (
        <BadgeCelebration key={current.id} data={current.data} onDismiss={dismiss} />
      )}
      {current?.type === CELEBRATION_TYPES.BOOK && (
        <BookCelebration key={current.id} data={current.data} onDismiss={dismiss} />
      )}
      {current?.type === CELEBRATION_TYPES.STREAK && (
        <StreakCelebration key={current.id} data={current.data} onDismiss={dismiss} />
      )}
    </AnimatePresence>
  );
}