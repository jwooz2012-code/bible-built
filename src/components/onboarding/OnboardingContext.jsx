import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [formData, setFormData] = useState({
    displayName: '',
    userIntent: '',
    experienceLevel: '',
    readingMode: 'none',
    selectedPlan: null,
    inviteClicked: false,
  });

  React.useEffect(() => {
    const initUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.onboardingProgress !== undefined) {
          setCurrentScreen(currentUser.onboardingProgress);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    initUser();
  }, []);

  const updateFormData = useCallback((data) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const nextScreen = useCallback(() => {
    setCurrentScreen(prev => prev + 1);
  }, []);

  const previousScreen = useCallback(() => {
    setCurrentScreen(prev => Math.max(0, prev - 1));
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await base44.auth.updateMe({
        displayName: formData.displayName,
        userIntent: formData.userIntent,
        experienceLevel: formData.experienceLevel,
        readingMode: formData.readingMode,
        selectedPlan: formData.selectedPlan,
        inviteClicked: formData.inviteClicked,
        hasCompletedOnboarding: true,
        onboardingProgress: 0,
      });
      setUser(prev => ({
        ...prev,
        hasCompletedOnboarding: true,
      }));
    } catch (error) {
      console.error('Failed to save onboarding:', error);
    }
  }, [formData]);

  const saveProgress = useCallback(async () => {
    try {
      await base44.auth.updateMe({
        onboardingProgress: currentScreen,
        displayName: formData.displayName || user?.displayName,
        userIntent: formData.userIntent || user?.userIntent,
        experienceLevel: formData.experienceLevel || user?.experienceLevel,
        readingMode: formData.readingMode,
        selectedPlan: formData.selectedPlan,
        inviteClicked: formData.inviteClicked,
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [currentScreen, formData, user]);

  return (
    <OnboardingContext.Provider
      value={{
        user,
        loading,
        currentScreen,
        formData,
        updateFormData,
        nextScreen,
        previousScreen,
        completeOnboarding,
        saveProgress,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}