import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useOnboarding } from './OnboardingContext';
import { CheckCircle2 } from 'lucide-react';

const options = [
  { value: 'consistent', label: 'Consistent', subtext: 'Reading regularly' },
  { value: 'inconsistent', label: 'Inconsistent', subtext: 'On and off' },
  { value: 'just_starting', label: 'Just Starting', subtext: 'New to Bible reading' },
];

export default function Screen4ExperienceLevel() {
  const { formData, updateFormData, nextScreen } = useOnboarding();
  const [selected, setSelected] = useState(formData.experienceLevel || '');

  const handleSelect = (value) => {
    setSelected(value);
    updateFormData({ experienceLevel: value });
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
            How would you describe your Bible reading?
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
              className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                selected === option.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-border bg-card hover:border-muted-foreground'
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 mt-1 rounded-full border-2 flex items-center justify-center ${
                selected === option.value
                  ? 'border-green-500 bg-green-500'
                  : 'border-muted-foreground'
              }`}>
                {selected === option.value && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <p className={`font-medium ${
                  selected === option.value ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {option.label}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {option.subtext}
                </p>
              </div>
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