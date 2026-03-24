import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const GOALS = [
  { value: 'consistency', label: 'Consistency' },
  { value: 'discipline', label: 'Discipline' },
  { value: 'bible_knowledge', label: 'Bible knowledge' },
  { value: 'stronger_walk', label: 'A stronger walk with God' }
];

export default function GoalScreen({ onContinue, initialValue = '' }) {
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
        <h1 className="text-3xl font-black mb-2 text-foreground">What are you building?</h1>
        <p className="text-sm text-muted-foreground mb-8">This shapes your journey.</p>

        <div className="space-y-3">
          {GOALS.map((goal, idx) => (
            <motion.button
              key={goal.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelected(goal.value)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-semibold ${
                selected === goal.value
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:border-foreground/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {goal.label}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => onContinue(selected)}
          disabled={!selected}
          size="lg"
          className="w-full h-12 rounded-full font-bold transition-all"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}