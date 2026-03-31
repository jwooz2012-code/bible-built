import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import ReadingTrackingScreen from '@/components/onboarding/ReadingTrackingScreen';

export default function ReadingTrackingIntro() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleContinue = async () => {
    try {
      await base44.auth.updateMe({ hasSeenReadingTrackingFeature: true });
      updateUser?.({ hasSeenReadingTrackingFeature: true });
    } catch (e) {
      // non-blocking
    }
    navigate('/home', { replace: true });
  };

  return (
    <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
      <ReadingTrackingScreen onContinue={handleContinue} isNewFeature />
    </div>
  );
}