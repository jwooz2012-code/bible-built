import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarChart3, Share2, Users } from 'lucide-react';

export default function ShareAndGrowScreen({ onContinue }) {
  const features = [
    { icon: BarChart3, label: 'Progress summaries', emoji: '📊' },
    { icon: Share2, label: 'Share', emoji: '📲' },
    { icon: Users, label: 'Invite friends', emoji: '👥' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col justify-between px-6 pt-12 pb-20"
    >
      <div>
        <h1 className="text-3xl font-black mb-2 text-foreground">Track it. Share it. Build together.</h1>
        <p className="text-sm text-muted-foreground mb-8">
          You can share your weekly, monthly, and yearly progress…
        </p>

        <p className="text-sm text-muted-foreground mb-12 font-medium">
          And invite friends to stay consistent with you.
        </p>

        {/* Feature Cards */}
        <div className="space-y-3 mb-12">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/40 border border-border/40"
            >
              <span className="text-xl">{feature.emoji}</span>
              <span className="text-sm font-semibold text-foreground">{feature.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Helper Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground/60 italic text-center"
        >
          All of this is available anytime in your Profile page.
        </motion.p>
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-12 rounded-full font-bold transition-all"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}