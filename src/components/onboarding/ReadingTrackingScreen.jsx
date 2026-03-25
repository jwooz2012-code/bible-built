import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, Zap } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';

const MOCK_CHAPTERS = [
  { name: 'Genesis 1', done: true },
  { name: 'Genesis 2', done: true },
  { name: 'Genesis 3', done: true },
  { name: 'Genesis 4', done: false },
  { name: 'Genesis 5', done: false },
];

export default function ReadingTrackingScreen({ onContinue }) {
  const [isActivating, setIsActivating] = useState(false);

  const handleContinue = () => {
    if (isActivating) return;
    setIsActivating(true);
    triggerHaptic();
    setTimeout(() => onContinue(), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-7"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-800/40"
        >
          <BookOpen className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </motion.div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Log Your Reading</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From the home screen, tap any chapter to mark it complete. Your progress saves instantly!
          </p>
        </div>

        {/* Mock Chapter List */}
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="w-full rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-900/10 p-4 space-y-2 shadow-md"
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Today's Chapters</span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">3 / 5 done</span>
          </div>

          {/* Chapter rows */}
          {MOCK_CHAPTERS.map((ch, i) => (
            <motion.div
              key={ch.name}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.07, duration: 0.3 }}
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                ch.done
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-white/70 dark:bg-gray-800/40'
              }`}
            >
              <span className={`text-sm font-medium ${ch.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {ch.name}
              </span>
              {ch.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-10 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button
            onClick={handleContinue}
            disabled={isActivating}
            size="lg"
            className="w-full h-14 rounded-full text-base font-bold"
          >
            Got it! 🙌
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}