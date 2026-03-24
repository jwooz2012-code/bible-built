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

        {/* Preview Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Share Your Progress</span>
          </div>
          <p className="text-xs text-muted-foreground/70">Found on your Profile page</p>
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