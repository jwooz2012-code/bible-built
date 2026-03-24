import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useOnboarding } from './OnboardingContext';
import { CheckCircle2 } from 'lucide-react';

const options = [
  { value: 'consistency', label: 'Build consistency in God\'s Word' },
  { value: 'accountability', label: 'Stay accountable' },
  { value: 'spiritual_growth', label: 'Grow deeper spiritually' },
  { value: 'getting_started', label: 'Just getting started' },
];

export default function Screen3Intent() {
  const { formData, updateFormData, nextScreen } = useOnboarding();
  const [selected, setSelected] = useState(formData.userIntent || '');

  const handleSelect = (value) => {
    setSelected(value);
    updateFormData({ userIntent: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 pb-20 pt-12"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-sm">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-foreground mb-3">
            Why are you here?
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full space-y-3"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                selected === option.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-border bg-card hover:border-muted-foreground'
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selected === option.value
                  ? 'border-green-500 bg-green-500'
                  : 'border-muted-foreground'
              }`}>
                {selected === option.value && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
              </div>
              <span className={`text-left font-medium ${
                selected === option.value ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {option.label}
              </span>
            </button>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={nextScreen}
          disabled={!selected}
          size="lg"
          className="w-full h-12 text-base font-semibold"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}