import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const EXPERIENCES = [
  {
    value: 'read_freely',
    label: 'Read Freely',
    description: 'Track your own reading'
  },
  {
    value: 'follow_plan',
    label: 'Follow a Plan',
    description: 'Guided structure'
  }
];

export default function ExperienceTypeScreen({ onContinue, initialValue = '' }) {
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
        <h1 className="text-3xl font-black mb-2 text-foreground">How do you want to start?</h1>
        <p className="text-base text-muted-foreground mb-8">You can change this later.</p>

        <div className="space-y-3">
          {EXPERIENCES.map((exp, idx) => (
            <motion.button
              key={exp.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelected(exp.value)}
              className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                selected === exp.value
                  ? 'border-foreground bg-foreground'
                  : 'border-border bg-background hover:border-foreground/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`font-bold text-lg ${selected === exp.value ? 'text-background' : 'text-foreground'}`}>
                {exp.label}
              </div>
              <div className={`text-base mt-1 ${selected === exp.value ? 'text-background/70' : 'text-muted-foreground'}`}>
                {exp.description}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
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