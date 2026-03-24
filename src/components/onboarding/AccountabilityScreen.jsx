import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2, ChevronRight } from 'lucide-react';
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
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-20"
    >
      {/* Main Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="max-w-sm w-full space-y-8"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Share2 className="w-8 h-8 text-primary" />
          </motion.div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-foreground">Accountability</h1>
          <p className="text-lg text-foreground/70 font-semibold">
            Share your progress with confidence
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Show off your weekly, monthly, and yearly stats. Transparency builds consistency and celebrates your commitment to staying in the Word.
          </p>

          {/* Profile Preview */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-card border-2 border-primary/30 rounded-xl p-4 space-y-3"
          >
            <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide">On your Profile page:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2.5 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Share Your Progress</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground/70 pl-3">
                Found in the <span className="font-semibold">Accountability</span> section
              </p>
            </div>
          </motion.div>
        </div>

        {/* Motivational Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground italic text-center"
        >
          "Therefore confess your sins to each other and pray for each other… — James 5:16"
        </motion.p>
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