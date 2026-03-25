import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';

export default function AccountabilityScreen({ onContinue }) {
  const [isActivating, setIsActivating] = useState(false);

  const handleContinue = async () => {
    if (isActivating) return;
    
    setIsActivating(true);
    triggerHaptic();
    
    setTimeout(() => {
      onContinue();
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
    >
      {/* Main Content */}
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
            Share your stats and inspire others
          </p>
        </div>

        {/* Mock Share Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full"
        >
          {/* Fake phone shadow / tilt effect */}
          <div className="relative">
            {/* Card */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Bible Built</p>
                  <p className="text-white font-black text-lg leading-tight">Weekly Progress</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Streak', value: '14🔥', color: 'text-orange-400' },
                  { label: 'Chapters', value: '42', color: 'text-blue-400' },
                  { label: 'Books', value: '3', color: 'text-emerald-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center">
                    <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Bible Coverage</span>
                  <span>18%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[18%] bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" />
                </div>
              </div>

              {/* Footer */}
              <p className="text-[10px] text-slate-500 text-center">biblebuilt.app • Your journey matters 📖</p>
            </div>

            {/* Mock label */}
            <p className="text-center text-xs text-muted-foreground mt-3">Found on your Profile page</p>
          </div>
        </motion.div>

      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-12 w-full max-w-sm"
      >
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <Button
            onClick={handleContinue}
            disabled={isActivating}
            size="lg"
            className="w-full h-14 rounded-full text-base font-bold"
          >
            {isActivating ? 'Continue...' : 'Next: Community'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}