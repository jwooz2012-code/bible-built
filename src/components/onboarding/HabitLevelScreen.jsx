import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const HABITS = [
  { value: 'just_starting', label: 'Just getting started' },
  { value: 'few_times_week', label: 'A few times a week' },
  { value: 'almost_daily', label: 'Almost daily' },
  { value: 'every_day', label: 'Every day' }
];

export default function HabitLevelScreen({ onContinue, initialValue = '' }) {
  const [selected, setSelected] = useState(initialValue);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col px-6 pt-12 pb-8"
    >
      <div>
        <h1 className="text-3xl font-black mb-2 text-foreground">Where are you at right now?</h1>
        <p className="text-base text-muted-foreground mb-8">No pressure. Just honesty.</p>

        <div className="space-y-3">
          {HABITS.map((habit, idx) => (
            <motion.button
              key={habit.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelected(habit.value)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-semibold ${
                selected === habit.value
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:border-foreground/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {habit.label}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div whileTap={{ scale: 0.98 }} className="mt-8">
        <Button
          onClick={() => onContinue(selected)}
          disabled={!selected}
          size="lg"
          className="w-full h-14 rounded-full font-bold transition-all"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}