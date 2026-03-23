import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { subscribeToCelebrations } from '@/lib/celebrationBus';
import BadgeCelebration from './BadgeCelebration';
import BookCelebration from './BookCelebration';
import StreakCelebration from './StreakCelebration';

export default function CelebrationManager() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const processingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToCelebrations((event) => {
      setQueue((prev) => {
        const merged = [...prev, event];
        // Sort by priority (lower number = higher priority)
        return merged.sort((a, b) => a.priority - b.priority);
      });
    });
    return unsubscribe;
  }, []);

  // Process queue
  useEffect(() => {
    if (current || processingRef.current || queue.length === 0) return;
    processingRef.current = true;
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrent(next);
    processingRef.current = false;
  }, [queue, current]);

  const handleDismiss = useCallback(() => {
    setCurrent(null);
  }, []);

  const renderCelebration = () => {
    if (!current) return null;
    const { type, data } = current;

    if (type === 'badge') {
      return (
        <BadgeCelebration
          key={current.id}
          badge={data?.badge}
          onDismiss={handleDismiss}
        />
      );
    }

    if (type === 'book') {
      return (
        <BookCelebration
          key={current.id}
          bookName={data?.bookName}
          onDismiss={handleDismiss}
        />
      );
    }

    if (type === 'streak') {
      return (
        <StreakCelebration
          key={current.id}
          count={data?.count}
          onDismiss={handleDismiss}
        />
      );
    }

    return null;
  };

  return (
    <AnimatePresence mode="wait">
      {renderCelebration()}
    </AnimatePresence>
  );
}