import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAchievementIcon, getAchievementColor } from '@/components/badges/badgeIcons';
import confetti from 'canvas-confetti';

export default function BadgeCelebration({ data, onDismiss }) {
  const { badge, userName } = data;
  const color = getAchievementColor(badge?.title);
  const isBlackWhite = color === 'BLACK_WHITE';

  useEffect(() => {
    // Single tasteful burst — not a party, a recognition
    const t = setTimeout(() => {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.35 },
        colors: ['#ffffff', '#e2e8f0', '#94a3b8', '#64748b'],
        gravity: 1.3,
        scalar: 0.75,
        ticks: 120,
        disableForReducedMotion: true,
      });
    }, 250);
    return () => clearTimeout(t);
  }, []);

  const firstName = userName?.split(' ')[0];
  const hasName = firstName && firstName.length > 1 && firstName.length < 20;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.90, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.05 }}
        className="w-full max-w-[340px] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center px-8 pt-10 pb-8">
          {/* Badge icon */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 18 }}
            className={`w-20 h-20 flex items-center justify-center rounded-full shadow-lg mb-5 ${
              isBlackWhite
                ? 'bg-gray-900 border border-white/10'
                : `bg-gradient-to-br ${color} border border-black/5`
            }`}
          >
            {getAchievementIcon(badge?.title, true, 'large')}
          </motion.div>

          {/* Eyebrow */}
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Badge Earned
          </p>

          {/* Badge name */}
          <h2 className="text-[22px] font-bold text-foreground text-center leading-tight mb-2">
            {badge?.title}
          </h2>

          {/* Badge subtitle */}
          <p className="text-sm text-muted-foreground text-center leading-relaxed mb-5 max-w-[240px]">
            {badge?.subtitle}
          </p>

          {/* Motivational line */}
          <p className="text-sm font-semibold text-foreground/70 text-center mb-7">
            {hasName
              ? `Well done, ${firstName}. Keep building.`
              : 'Faithfulness is building something strong.'}
          </p>

          {/* CTA */}
          <button
            onClick={onDismiss}
            className="w-full py-3.5 rounded-2xl bg-foreground text-background font-semibold text-sm tracking-wide transition-opacity active:opacity-75"
          >
            Keep Building
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}