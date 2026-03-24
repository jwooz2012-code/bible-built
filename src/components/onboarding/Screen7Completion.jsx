import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useOnboarding } from './OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function Screen7Completion() {
  const { formData, completeOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const handleStartReading = async () => {
    await completeOnboarding();
    
    // Route based on reading mode
    if (formData.readingMode === 'plan' && formData.selectedPlan) {
      navigate(`/plan-detail/${formData.selectedPlan}`);
    } else {
      navigate('/calendar');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 pb-20 pt-12"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-4xl font-bold text-foreground">
            You're Ready
          </h2>
          <p className="text-lg text-muted-foreground max-w-sm">
            Let's build something that lasts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg"
        >
          {formData.readingMode === 'plan'
            ? '📖 Your plan is ready to go'
            : '✨ Free reading mode activated'}
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={handleStartReading}
          size="lg"
          className="w-full h-12 text-base font-semibold"
        >
          Start Reading
        </Button>
      </motion.div>
    </motion.div>
  );
}