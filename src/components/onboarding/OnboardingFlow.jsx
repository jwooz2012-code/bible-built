import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from './OnboardingContext';
import Screen1Welcome from './Screen1Welcome';
import Screen2DisplayName from './Screen2DisplayName';
import Screen3Intent from './Screen3Intent';
import Screen4ExperienceLevel from './Screen4ExperienceLevel';
import Screen5ChoosePath from './Screen5ChoosePath';
import Screen6Invite from './Screen6Invite';
import Screen7Completion from './Screen7Completion';
import OnboardingProgress from './OnboardingProgress';

const screens = [
  Screen1Welcome,
  Screen2DisplayName,
  Screen3Intent,
  Screen4ExperienceLevel,
  Screen5ChoosePath,
  Screen6Invite,
  Screen7Completion,
];

export default function OnboardingFlow() {
  const { currentScreen, saveProgress } = useOnboarding();
  const CurrentScreen = screens[currentScreen];

  useEffect(() => {
    saveProgress();
  }, [currentScreen]);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      <OnboardingProgress current={currentScreen} total={screens.length} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {CurrentScreen && <CurrentScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}