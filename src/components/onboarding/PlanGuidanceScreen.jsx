import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function PlanGuidanceScreen({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col justify-between px-6 pt-12 pb-20"
    >
      <div>
        <h1 className="text-3xl font-black mb-4 text-foreground">We've got you covered 📖</h1>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You'll be able to choose from multiple Bible reading plans once you enter the app.
          </p>

          {/* Visual hint */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card border-2 border-border rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-foreground" />
              <span className="font-bold text-foreground">Explore Plans</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Look for this on your home screen. Tap to browse and select your perfect reading plan.
            </p>
          </motion.div>

          <p className="text-xs text-muted-foreground italic">
            No pressure—you can start with free reading and switch to a plan anytime.
          </p>
        </div>
      </div>

      <Button
        onClick={onContinue}
        size="lg"
        className="w-full h-12 rounded-full font-bold"
      >
        Got it
      </Button>
    </motion.div>
  );
}