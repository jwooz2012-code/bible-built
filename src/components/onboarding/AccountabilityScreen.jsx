import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2, TrendingUp } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';

export default function AccountabilityScreen({ onContinue }) {
  const [isActivating, setIsActivating] = useState(false);

  const handleContinue = async () => {
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
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center space-y-8"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-full flex items-center justify-center shadow-lg"
        >
          <Share2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </motion.div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Accountability</h1>
          <p className="text-sm text-muted-foreground">
            Share your weekly progress and inspire others
          </p>
        </div>

        {/* Real WeeklySummaryCard mockup */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full"
        >
          {/* Mirrors WeeklySummaryCard exactly */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">This Week</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" style={{ color: 'hsl(var(--chart-3))' }} />
                <span className="text-[13px] font-medium" style={{ color: 'hsl(var(--chart-3))' }}>
                  +5
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="text-[13px] text-muted-foreground mt-1">
              5 active days
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-3 opacity-70">
            Tap Share on the Stats page to send this to a friend
          </p>
        </motion.div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-12 w-full max-w-sm"
      >
        <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
          <Button
            onClick={handleContinue}
            disabled={isActivating}
            size="lg"
            className="w-full h-14 rounded-full text-base font-bold"
          >
            {isActivating ? 'Continue...' : 'Next'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}