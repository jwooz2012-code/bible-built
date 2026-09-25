import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCelebration, CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { triggerHaptic } from '@/components/utils/haptics';
import { useReadingPlan, useUpsertReadingPlan } from '@/components/bible/hooks/useReadingPlan';

import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import DisplayNameScreen from '@/components/onboarding/DisplayNameScreen';
import ExperienceTypeScreen from '@/components/onboarding/ExperienceTypeScreen';
import TourOfferScreen from '@/components/onboarding/TourOfferScreen';
import { getStarterPlans } from '@/components/onboarding/starterPlans';

const STEPS = ['welcome', 'name', 'reading_style', 'tour_offer'];

function track(eventName, properties) {
  try {
    base44.analytics.track({ eventName, properties });
  } catch {
    // Analytics must never block onboarding.
  }
}

function suggestedName(user) {
  const name = user?.displayName || user?.full_name || '';
  return name.includes('@') ? '' : name;
}

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { triggerCelebration } = useCelebration();
  const { data: existingPlan } = useReadingPlan(user?.id);
  const { mutateAsync: upsertPlan } = useUpsertReadingPlan();

  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({ displayName: '', experienceType: '', planId: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    track('onboarding_step_viewed', { step: STEPS[step], stepNumber: step + 1 });
  }, [step]);

  const goNext = () => {
    triggerHaptic();
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    if (isSaving) return;
    triggerHaptic('light');
    setStep((s) => Math.max(s - 1, 0));
  };

  const selectedPlan = responses.experienceType === 'follow_plan'
    ? getStarterPlans().find((p) => p.id === responses.planId)
    : null;

  const finish = async (wantsTour) => {
    if (isSaving) return;
    setIsSaving(true);
    triggerHaptic();

    // Restarting setup with the same plan must not reset its progress.
    if (selectedPlan && user?.id && existingPlan?.scope !== selectedPlan.scope) {
      try {
        await upsertPlan({
          existingPlan,
          planData: {
            userId: user.id,
            scope: selectedPlan.scope,
            startDate: selectedPlan.startDate,
            endDate: selectedPlan.endDate,
            chaptersPerDay: selectedPlan.chaptersPerDay,
          },
        });
        localStorage.setItem('bb_plan_prompt_seen', 'true');
      } catch (error) {
        console.error('[onboarding] Failed to start plan:', error);
        toast.error("Couldn't start your plan. Tap Explore Reading Plans on Home to try again.");
      }
    }

    const updates = {
      displayName: responses.displayName,
      readingStyle: responses.experienceType,
      onboardingComplete: true,
      hasSeenReadingTrackingFeature: true,
      tourStatus: wantsTour ? 'started' : 'skipped',
    };
    updateUser(updates);
    base44.auth.updateMe(updates).catch((error) => console.error('Failed to save onboarding:', error));

    track('onboarding_completed', {
      readingStyle: responses.experienceType,
      plan: selectedPlan?.id ?? null,
      tourChoice: wantsTour ? 'tour' : 'skip',
    });

    triggerCelebration(CELEBRATION_TYPES.BADGE, {
      badge: {
        title: 'Battle',
        subtitle: 'You showed up knowing the Christian life is a fight. The Word of God is your weapon — and this is where faithfulness begins.',
      },
      userName: responses.displayName,
    }, { dedupKey: 'onboarding-battle-badge' });

    navigate(wantsTour ? '/tour' : '/home', { replace: true });
  };

  const renderStep = () => {
    switch (STEPS[step]) {
      case 'welcome':
        return <WelcomeScreen onContinue={goNext} />;
      case 'name':
        return (
          <DisplayNameScreen
            initialValue={responses.displayName || suggestedName(user)}
            onContinue={(displayName) => {
              setResponses((prev) => ({ ...prev, displayName }));
              goNext();
            }}
          />
        );
      case 'reading_style':
        return (
          <ExperienceTypeScreen
            initialValue={responses.experienceType}
            initialPlanId={responses.planId}
            onContinue={({ experienceType, planId }) => {
              setResponses((prev) => ({ ...prev, experienceType, planId }));
              goNext();
            }}
          />
        );
      case 'tour_offer':
        return (
          <TourOfferScreen
            name={responses.displayName}
            planName={selectedPlan?.name}
            isSaving={isSaving}
            onTour={() => finish(true)}
            onSkip={() => finish(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" style={{ paddingTop: 'max(env(safe-area-inset-top), 44px)' }}>
      {step > 0 && (
        <div className="relative flex items-center justify-center h-14 px-4">
          <button
            onClick={goBack}
            disabled={isSaving}
            aria-label="Back"
            className="absolute left-3 h-10 w-10 flex items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors disabled:opacity-40"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ProgressIndicator currentStep={step - 1} totalSteps={STEPS.length - 1} />
        </div>
      )}
      <div key={step}>{renderStep()}</div>
    </div>
  );
}
