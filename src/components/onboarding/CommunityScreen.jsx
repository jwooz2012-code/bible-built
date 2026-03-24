import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '@/components/utils/haptics';

export default function CommunityScreen({ onContinue }) {
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
            <Users className="w-8 h-8 text-primary" />
          </motion.div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-foreground">Community</h1>
          <p className="text-lg text-foreground/70 font-semibold">
            Grow stronger together
          </p>
        </div>

        {/* Description */}
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Invite friends and grow stronger together.
          </p>

          {/* Profile Preview */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-card border-2 border-primary/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Community</span>
            </div>
            <p className="text-sm font-medium">Invite a Friend</p>
            <p className="text-xs text-muted-foreground/60 mt-1">On your Profile page →</p>
          </motion.div>
        </div>


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
            {isActivating ? 'Continue...' : 'You\'re All Set!'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}