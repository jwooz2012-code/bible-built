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
        <h1 className="text-4xl font-black mb-6 text-foreground">You're ready.</h1>
        
        <div className="mb-8">
          <p className="text-lg text-foreground/70 leading-relaxed">
            A strong life is built daily.
            <br />
            One chapter at a time.
          </p>
        </div>

        <p className="text-xs text-muted-foreground italic mb-12">
          "But be ye doers of the word, and not hearers only… — James 1:22"
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-14 rounded-full text-base font-semibold"
        >
          Enter Bible Built
        </Button>
      </motion.div>
    </motion.div>
  );
}