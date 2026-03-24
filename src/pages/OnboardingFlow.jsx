import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { triggerHaptic } from '@/components/utils/haptics';
import { useCelebration, CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import DisplayNameScreen from '@/components/onboarding/DisplayNameScreen';
import MotivationScreen from '@/components/onboarding/MotivationScreen';
import HabitLevelScreen from '@/components/onboarding/HabitLevelScreen';
import ExperienceTypeScreen from '@/components/onboarding/ExperienceTypeScreen';
import PlanGuidanceScreen from '@/components/onboarding/PlanGuidanceScreen';
import GoalScreen from '@/components/onboarding/GoalScreen';
import DailyCommitmentScreen from '@/components/onboarding/DailyCommitmentScreen';
import FinalScreen from '@/components/onboarding/FinalScreen';

// TOTAL_SCREENS varies: 8-9 depending on whether plan guidance is shown
const getTotalScreens = (experienceType) => {
  return experienceType === 'follow_plan' ? 9 : 8;
};

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { triggerCelebration } = useCelebration();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    displayName: '',
    motivation: [],
    habitLevel: '',
    experienceType: '',
    goal: '',
    dailyCommitment: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const handleNext = (value) => {
    triggerHaptic();
    
    const stepUpdates = {
      1: { displayName: value },
      2: { motivation: value },
      3: { habitLevel: value },
      4: { experienceType: value },
      5: { goal: value },
      6: { dailyCommitment: value }
    };

    if (stepUpdates[currentStep]) {
      setResponses((prev) => ({ ...prev, ...stepUpdates[currentStep] }));
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleFinish = async () => {
    triggerHaptic();
    setIsSaving(true);
    setShowTransition(true);

    try {
      // Save all onboarding data to user profile
      await base44.auth.updateMe({
        displayName: responses.displayName,
        motivation: responses.motivation,
        habitLevel: responses.habitLevel,
        experienceType: responses.experienceType,
        goal: responses.goal,
        dailyCommitment: responses.dailyCommitment,
        onboardingComplete: true
      });

      // Trigger battle badge celebration
      triggerCelebration(CELEBRATION_TYPES.BADGE, {
        title: 'Battle Badge Earned! 🎖️',
        description: 'You\'ve started your journey. Now build it day by day.'
      });

      // Navigate to home after a brief delay
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1500);
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      setIsSaving(false);
      setShowTransition(false);
    }
  };

  const renderScreen = () => {
    const commonProps = { onContinue: handleNext };

    switch (currentStep) {
      case 0:
        return <WelcomeScreen {...commonProps} />;
      case 1:
        return <DisplayNameScreen {...commonProps} initialValue={responses.displayName} />;
      case 2:
        return <MotivationScreen {...commonProps} initialValue={responses.motivation} />;
      case 3:
        return <HabitLevelScreen {...commonProps} initialValue={responses.habitLevel} />;
      case 4:
        return <ExperienceTypeScreen {...commonProps} initialValue={responses.experienceType} />;
      // Screen 5A: Plan guidance (only if follow_plan selected)
      case 5:
        if (responses.experienceType === 'follow_plan') {
          return <PlanGuidanceScreen {...commonProps} />;
        }
        return <GoalScreen {...commonProps} initialValue={responses.goal} />;
      case 6:
        if (responses.experienceType === 'follow_plan') {
          return <GoalScreen {...commonProps} initialValue={responses.goal} />;
        }
        return <DailyCommitmentScreen {...commonProps} initialValue={responses.dailyCommitment} />;
      case 7:
        if (responses.experienceType === 'follow_plan') {
          return <DailyCommitmentScreen {...commonProps} initialValue={responses.dailyCommitment} />;
        }
        return <FinalScreen onContinue={handleFinish} />;
      case 8:
        return <FinalScreen onContinue={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Transition overlay */}
      <AnimatePresence>
        {showTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-b from-background via-primary/5 to-background z-40"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                  className="text-6xl mb-4"
                >
                  🎖️
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-foreground mb-2"
                >
                  Journey Started
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-sm"
                >
                  Welcome to Bible Built
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator - hidden on welcome and final screens */}
      {currentStep > 0 && currentStep < getTotalScreens(responses.experienceType) - 1 && (
        <ProgressIndicator currentStep={currentStep} totalSteps={getTotalScreens(responses.experienceType)} />
      )}

      {/* Screen container */}
      <AnimatePresence mode="wait">
        {!showTransition && <div key={currentStep}>{renderScreen()}</div>}
      </AnimatePresence>
    </div>
  );
}