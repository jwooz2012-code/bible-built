import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useOnboarding } from './OnboardingContext';

export default function Screen1Welcome() {
  const { nextScreen } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 pb-20 pt-12"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-5xl font-bold text-foreground">
            Welcome to<br />Bible Built
          </h1>
          <p className="text-lg text-muted-foreground">
            Track what matters. Grow in what lasts.
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-32 h-32 rounded-3xl bg-gradient-to-br from-green-400 to-green-600 opacity-10"
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Button
          onClick={nextScreen}
          size="lg"
          className="w-full px-12 h-12 text-base font-semibold"
        >
          Let's Begin
        </Button>
      </motion.div>
    </motion.div>
  );
}