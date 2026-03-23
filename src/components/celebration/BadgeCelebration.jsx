import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';

const COPY = [
  'Faithfulness is building something strong.',
  'This is what consistency looks like.',
  'Earned through real commitment.',
  'Keep showing up. It matters.',
];

export default function BadgeCelebration({ badge, onDismiss }) {
  const color = getAchievementColor(badge?.title || '');
  const isBlackWhite = color === 'BLACK_WHITE';
  const copy = COPY[Math.floor(Math.random() * COPY.length)];

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff', '#a3a3a3'],
        scalar: 0.9,
        gravity: 1.1,
        ticks: 180,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <motion.div
        className="relative bg-card border border-border rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
        initial={{ scale: 0.85, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.05 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
              isBlackWhite ? 'bg-gray-900 border border-white/10' : `bg-gradient-to-br ${color}`
            }`}
          >
            {getAchievementIcon(badge?.title || '', true, 'large')}
          </div>
        </div>

        {/* Label */}
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Badge Earned
        </p>

        {/* Badge Name */}
        <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">
          {badge?.title || 'Achievement'}
        </h2>

        {/* Copy */}
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {copy}
        </p>

        <Button
          className="w-full h-12 text-sm font-semibold rounded-xl"
          onClick={onDismiss}
        >
          Keep Building
        </Button>
      </motion.div>
    </motion.div>
  );
}