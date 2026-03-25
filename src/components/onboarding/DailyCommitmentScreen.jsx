import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';

export default function DailyCommitmentScreen({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-8"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-20 h-20 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/40 dark:to-violet-800/40 rounded-full flex items-center justify-center shadow-lg"
        >
          <CalendarDays className="w-10 h-10 text-violet-600 dark:text-violet-400" />
        </motion.div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Oops, made a mistake?</h1>
          <p className="text-sm text-muted-foreground">No stress — it's super easy to fix</p>
        </div>

        {/* Preview Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/20 dark:to-violet-900/10 border-2 border-violet-200 dark:border-violet-800 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">Tap any day on the Calendar</span>
          </div>
          <p className="text-xs text-muted-foreground/70">Add or remove chapters for any past day — right from the Calendar page</p>
        </motion.div>

        {/* CTA */}
        <motion.div className="w-full pt-2" whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => onContinue()}
            size="lg"
            className="w-full h-12 rounded-full font-bold"
          >
            Got it!
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}