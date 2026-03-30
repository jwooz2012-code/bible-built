import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { triggerHaptic } from '@/components/utils/haptics';

import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import DisplayNameScreen from '@/components/onboarding/DisplayNameScreen';
import MotivationScreen from '@/components/onboarding/MotivationScreen';
import HabitLevelScreen from '@/components/onboarding/HabitLevelScreen';
import ExperienceTypeScreen from '@/components/onboarding/ExperienceTypeScreen';
import PlanGuidanceScreen from '@/components/onboarding/PlanGuidanceScreen';
import AccountabilityScreen from '@/components/onboarding/AccountabilityScreen';
import CommunityScreen from '@/components/onboarding/CommunityScreen';
import DailyCommitmentScreen from '@/components/onboarding/DailyCommitmentScreen';
import FinalScreen from '@/components/onboarding/FinalScreen';
import ReadingTrackingScreen from '@/components/onboarding/ReadingTrackingScreen';

// TOTAL_SCREENS varies: 11-12 depending on whether plan guidance is shown
const getTotalScreens = (experienceType) => {
  return experienceType === 'follow_plan' ? 12 : 11;
};

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    displayName: '',
    motivation: [],
    habitLevel: '',
    experienceType: '',
    dailyCommitment: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = (value) => {
    triggerHaptic();
    
    const stepUpdates = {
      1: { displayName: value },
      2: { motivation: value },
      3: { habitLevel: value },
      4: { experienceType: value },
      5: { dailyCommitment: value }
    };

    if (stepUpdates[currentStep]) {
      setResponses((prev) => ({ ...prev, ...stepUpdates[currentStep] }));
    }

    // Prevent double-tap during transition
    if (!isSaving) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFinish = async () => {
    triggerHaptic();
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ 
        displayName: responses.displayName,
        onboardingComplete: true 
      });
      // Immediately update local user state so App.jsx doesn't redirect back to onboarding
      updateUser({ displayName: responses.displayName, onboardingComplete: true });
    } catch (error) {
      console.error('Failed to save onboarding:', error);
    }
    navigate('/home', { replace: true });
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
        return <AccountabilityScreen {...commonProps} />;
      case 6:
        if (responses.experienceType === 'follow_plan') {
          return <AccountabilityScreen {...commonProps} />;
        }
        return <CommunityScreen {...commonProps} />;
      case 7:
        if (responses.experienceType === 'follow_plan') {
          return <CommunityScreen {...commonProps} />;
        }
        return <ReadingTrackingScreen {...commonProps} />;
      case 8:
        if (responses.experienceType === 'follow_plan') {
          return <ReadingTrackingScreen {...commonProps} />;
        }
        return <DailyCommitmentScreen {...commonProps} initialValue={responses.dailyCommitment} />;
      case 9:
        if (responses.experienceType === 'follow_plan') {
          return <DailyCommitmentScreen {...commonProps} initialValue={responses.dailyCommitment} />;
        }
        return <FinalScreen onContinue={handleFinish} />;
      case 10:
        if (responses.experienceType === 'follow_plan') {
          return <FinalScreen onContinue={handleFinish} />;
        }
        return null;
      case 11:
        return <FinalScreen onContinue={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">

      {/* Progress indicator - hidden on welcome and final screens */}
      {currentStep > 0 && currentStep < getTotalScreens(responses.experienceType) - 1 && (
        <ProgressIndicator currentStep={currentStep} totalSteps={getTotalScreens(responses.experienceType)} />
      )}

      {/* Screen container */}
      <AnimatePresence mode="wait" onExitComplete={() => {}}>
        <div key={currentStep}>{renderScreen()}</div>
      </AnimatePresence>
    </div>
  );
}