import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { triggerHapticFeedback } from '@/components/utils/haptics';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import DisplayNameScreen from '@/components/onboarding/DisplayNameScreen';
import MotivationScreen from '@/components/onboarding/MotivationScreen';
import HabitLevelScreen from '@/components/onboarding/HabitLevelScreen';
import ExperienceTypeScreen from '@/components/onboarding/ExperienceTypeScreen';
import GoalScreen from '@/components/onboarding/GoalScreen';
import DailyCommitmentScreen from '@/components/onboarding/DailyCommitmentScreen';
import InviteScreen from '@/components/onboarding/InviteScreen';
import FinalScreen from '@/components/onboarding/FinalScreen';

const TOTAL_SCREENS = 9;

export default function OnboardingFlow() {
  const navigate = useNavigate();
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

  const handleNext = (value) => {
    triggerHapticFeedback();
    
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
    triggerHapticFeedback();
    setIsSaving(true);

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

      // Route based on experience type
      if (responses.experienceType === 'follow_plan') {
        navigate('/plans');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      setIsSaving(false);
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
      case 5:
        return <GoalScreen {...commonProps} initialValue={responses.goal} />;
      case 6:
        return <DailyCommitmentScreen {...commonProps} initialValue={responses.dailyCommitment} />;
      case 7:
        return <InviteScreen {...commonProps} />;
      case 8:
        return <FinalScreen onContinue={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Progress indicator - hidden on welcome and final screens */}
      {currentStep > 0 && currentStep < TOTAL_SCREENS - 1 && (
        <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_SCREENS} />
      )}

      {/* Screen container */}
      <AnimatePresence mode="wait">
        <div key={currentStep}>{renderScreen()}</div>
      </AnimatePresence>
    </div>
  );
}