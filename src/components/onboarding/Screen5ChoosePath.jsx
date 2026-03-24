import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useOnboarding } from './OnboardingContext';
import { BookOpen, Zap } from 'lucide-react';

export default function Screen5ChoosePath() {
  const { formData, updateFormData, nextScreen } = useOnboarding();
  const [selected, setSelected] = useState(formData.readingMode || '');
  const [showPlans, setShowPlans] = useState(false);

  const handleSelectPlan = () => {
    setSelected('plan');
    updateFormData({ readingMode: 'plan' });
    setShowPlans(true);
  };

  const handleSelectFree = () => {
    setSelected('free');
    updateFormData({ readingMode: 'free' });
    nextScreen();
  };

  const handlePlanSelected = (planId) => {
    updateFormData({ selectedPlan: planId });
    nextScreen();
  };

  if (showPlans) {
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
              Explore Reading Plans
            </h2>
            <p className="text-base text-muted-foreground">
              Select a plan to get started. You can change it anytime.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-full bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4"
          >
            <p className="text-sm text-blue-900 dark:text-blue-300">
              🔄 The full Plans page will open in a moment. Select any plan and come back to finish onboarding.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full max-w-sm space-y-3"
        >
          <Button
            onClick={() => window.location.href = '/plans'}
            size="lg"
            className="w-full h-12 text-base font-semibold"
          >
            Open Plans
          </Button>
          <Button
            onClick={() => setShowPlans(false)}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base"
          >
            Back
          </Button>
        </motion.div>
      </motion.div>
    );
  }

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
          <h2 className="text-4xl font-bold text-foreground">
            Choose Your Path
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full space-y-3"
        >
          <button
            onClick={handleSelectPlan}
            className={`w-full flex items-start gap-4 p-6 rounded-lg border-2 transition-all text-left ${
              selected === 'plan'
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-border bg-card hover:border-muted-foreground'
            }`}
          >
            <BookOpen className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-lg">Explore Reading Plans</p>
              <p className="text-sm text-muted-foreground mt-1">
                Follow a structured plan and stay on track
              </p>
            </div>
          </button>

          <button
            onClick={handleSelectFree}
            className={`w-full flex items-start gap-4 p-6 rounded-lg border-2 transition-all text-left ${
              selected === 'free'
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-border bg-card hover:border-muted-foreground'
            }`}
          >
            <Zap className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-lg">Read Freely</p>
              <p className="text-sm text-muted-foreground mt-1">
                Log any chapter anytime, no structure needed
              </p>
            </div>
          </button>
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