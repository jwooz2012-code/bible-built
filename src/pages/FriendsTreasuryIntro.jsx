import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import FriendsIntroScreen from '@/components/onboarding/FriendsIntroScreen';
import GroupsIntroScreen from '@/components/onboarding/GroupsIntroScreen';
import TreasuryIntroScreen from '@/components/onboarding/TreasuryIntroScreen';

const TOTAL_STEPS = 3;

export default function FriendsTreasuryIntro() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);

  const markSeen = async () => {
    try {
      await base44.auth.updateMe({ hasSeenFriendsTreasuryIntro: true });
      updateUser?.({ hasSeenFriendsTreasuryIntro: true });
    } catch (e) {
      // non-blocking
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    }
  };

  const handleTreasury = async () => {
    await markSeen();
    navigate('/treasury', { replace: true });
  };

  const renderScreen = () => {
    switch (step) {
      case 0: return <FriendsIntroScreen onContinue={handleNext} />;
      case 1: return <GroupsIntroScreen onContinue={handleNext} />;
      case 2: return <TreasuryIntroScreen onContinue={handleTreasury} />;
      default: return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-background overflow-hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 44px)' }}
    >
      {/* Step dots */}
      <div className="flex justify-center gap-2 pt-4 pb-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === step ? 20 : 6, opacity: i === step ? 1 : 0.35 }}
            transition={{ duration: 0.25 }}
            className="h-1.5 rounded-full bg-foreground"
          />
        ))}
      </div>

      {/* Screens */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
