import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const MOTIVATIONS = [
  'I want to stay consistent',
  'I need a fresh start',
  'I want to grow closer to God',
  'I want to track what matters',
  'I\'ve been off track lately'
];

export default function MotivationScreen({ onContinue, initialValue = [] }) {
  const [selected, setSelected] = useState(initialValue);

  const toggleMotivation = (motivation) => {
    setSelected((prev) =>
      prev.includes(motivation)
        ? prev.filter((m) => m !== motivation)
        : [...prev, motivation]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col justify-between px-6 pt-12 pb-20"
    >
      <div>
        <h1 className="text-3xl font-black mb-2 text-foreground">What's your reason?</h1>
        <p className="text-base text-muted-foreground mb-8">Choose all that apply.</p>

        <div className="space-y-3">
          {MOTIVATIONS.map((motivation, idx) => (
            <motion.button
              key={motivation}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => toggleMotivation(motivation)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-semibold ${
                selected.includes(motivation)
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:border-foreground/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {motivation}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => onContinue(selected)}
          disabled={selected.length === 0}
          size="lg"
          className="w-full h-14 rounded-full font-bold transition-all"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}