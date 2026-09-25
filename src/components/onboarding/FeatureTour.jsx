import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { triggerHaptic } from '@/components/utils/haptics';
import ReadingTrackingScreen from '@/components/onboarding/ReadingTrackingScreen';
import DailyCommitmentScreen from '@/components/onboarding/DailyCommitmentScreen';
import FriendsIntroScreen from '@/components/onboarding/FriendsIntroScreen';
import AccountabilityScreen from '@/components/onboarding/AccountabilityScreen';
import TreasuryIntroScreen from '@/components/onboarding/TreasuryIntroScreen';

const TOUR_STEPS = [
  { id: 'log_reading', Screen: ReadingTrackingScreen },
  { id: 'fix_mistake', Screen: DailyCommitmentScreen },
  { id: 'friends_groups', Screen: FriendsIntroScreen },
  { id: 'share_progress', Screen: AccountabilityScreen },
  { id: 'treasury_xp', Screen: TreasuryIntroScreen },
];

function track(eventName, properties) {
  try {
    base44.analytics.track({ eventName, properties });
  } catch {
    // Analytics must never block the tour.
  }
}

// Callers other than onboarding pass `state.returnTo` so the tour ends where it started.
export default function FeatureTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const returnTo = location.state?.returnTo;
  const [step, setStep] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    track('tour_step_viewed', { step: TOUR_STEPS[step].id, stepNumber: step + 1, replay: !!returnTo });
  }, [step, returnTo]);

  const exitTour = (completed) => {
    track(completed ? 'tour_completed' : 'tour_skipped', { atStep: TOUR_STEPS[step].id, replay: !!returnTo });
    updateUser({ tourStatus: 'seen' });
    base44.auth.updateMe({ tourStatus: 'seen' }).catch((error) => console.error('Failed to save tour status:', error));
    navigate(returnTo || '/home', { replace: true });
  };

  const next = () => {
    if (step === TOUR_STEPS.length - 1) {
      exitTour(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    triggerHaptic('light');
    setStep((s) => Math.max(s - 1, 0));
  };

  const skip = () => {
    triggerHaptic('light');
    exitTour(false);
  };

  const { Screen } = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" style={{ paddingTop: 'max(env(safe-area-inset-top), 44px)' }}>
      <div className="relative flex items-center justify-center h-14 px-4">
        {step > 0 && (
          <button
            onClick={back}
            aria-label="Back"
            className="absolute left-3 h-10 w-10 flex items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex gap-1.5" aria-label={`Step ${step + 1} of ${TOUR_STEPS.length}`}>
          {TOUR_STEPS.map((s, i) => (
            <motion.div
              key={s.id}
              animate={{ width: i === step ? 20 : 6, opacity: i <= step ? 1 : 0.3 }}
              transition={{ duration: 0.25 }}
              className="h-1.5 rounded-full bg-foreground"
            />
          ))}
        </div>
        {!isLast && (
          <button
            onClick={skip}
            className="absolute right-3 h-10 px-3 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Skip tour
          </button>
        )}
      </div>

      <div key={step}>
        {isLast
          ? <Screen onContinue={next} ctaLabel={returnTo ? 'Done' : 'Start Reading'} />
          : <Screen onContinue={next} />}
      </div>
    </div>
  );
}
