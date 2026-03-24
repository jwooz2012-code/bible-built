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
      className="min-h-screen flex flex-col justify-between px-6 pt-12 pb-20"
    >
      <div>
        <h1 className="text-3xl font-black mb-2 text-foreground">How often are you in God's Word right now?</h1>
        <p className="text-sm text-muted-foreground mb-8">No judgment. Just growth.</p>

        <div className="space-y-3">
          {HABITS.map((habit) => (
            <motion.button
              key={habit.value}
              onClick={() => setSelected(habit.value)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-medium ${
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

      <Button
        onClick={() => onContinue(selected)}
        disabled={!selected}
        size="lg"
        className="w-full h-12 rounded-full font-semibold"
      >
        Continue
      </Button>
    </motion.div>
  );
}