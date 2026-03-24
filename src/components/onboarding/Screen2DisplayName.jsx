import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useOnboarding } from './OnboardingContext';

export default function Screen2DisplayName() {
  const { formData, updateFormData, nextScreen } = useOnboarding();
  const [displayName, setDisplayName] = useState(formData.displayName || '');

  const handleContinue = () => {
    if (displayName.trim()) {
      updateFormData({ displayName: displayName.trim() });
      nextScreen();
    }
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
            What should we call you?
          </h2>
          <p className="text-base text-muted-foreground">
            This helps personalize your experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full"
        >
          <Input
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            className="h-12 text-base"
            autoFocus
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={handleContinue}
          disabled={!displayName.trim()}
          size="lg"
          className="w-full h-12 text-base font-semibold"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}