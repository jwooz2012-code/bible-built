import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function FinalScreen({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-20"
    >
      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="max-w-sm"
      >
        <h1 className="text-4xl font-black mb-6 text-foreground">You're set. 🎯</h1>
        
        <div className="mb-8">
          <p className="text-lg text-foreground/70 leading-relaxed font-semibold">
            Now it's time to show up daily.
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Start tracking. Build the habit. Stay in the Word.
          </p>
        </div>

        <p className="text-xs text-muted-foreground italic">
          "But be ye doers of the word, and not hearers only… — James 1:22"
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-12 w-full max-w-sm"
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-14 rounded-full text-base font-bold"
        >
          Enter App
        </Button>
      </motion.div>
    </motion.div>
  );
}