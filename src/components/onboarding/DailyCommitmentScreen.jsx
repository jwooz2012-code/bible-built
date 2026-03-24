import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const COMMITMENTS = [
  { value: '5', label: '5 minutes' },
  { value: '10', label: '10 minutes' },
  { value: '15', label: '15 minutes' },
  { value: '20plus', label: '20+ minutes' }
];

export default function DailyCommitmentScreen({ onContinue, initialValue = '' }) {
  const [selected, setSelected] = useState(initialValue);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col justify-between px-6 pt-12 pb-20"
    >
      <div>
        <h1 className="text-3xl font-black mb-2 text-foreground">Let's lock it in</h1>
        <p className="text-sm text-muted-foreground mb-3">How much time can you commit daily?</p>
        <p className="text-xs text-muted-foreground mb-8">A little every day adds up. 🚀</p>

        <div className="grid grid-cols-2 gap-3">
          {COMMITMENTS.map((commitment) => (
            <motion.button
              key={commitment.value}
              onClick={() => setSelected(commitment.value)}
              className={`p-4 rounded-2xl border-2 transition-all text-center font-bold ${
                selected === commitment.value
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:border-foreground/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {commitment.label}
            </motion.button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onContinue(selected)}
        disabled={!selected}
        size="lg"
        className="w-full h-12 rounded-full font-bold"
      >
        Continue
      </Button>
    </motion.div>
  );
}