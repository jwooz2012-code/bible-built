import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const ReviewModeContext = createContext({
  isReviewMode: false,
  isAuthenticating: true,
});

export const useReviewMode = () => useContext(ReviewModeContext);

// Set to true for App Store review, false after approval
const REVIEW_MODE_ENABLED = true;

// Reviewer account credentials (must be pre-created in dashboard)
const REVIEWER_EMAIL = 'applereview@biblebuilt.app';
const REVIEWER_PASSWORD = 'AppleReview2026!';

export const ReviewModeProvider = ({ children }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(REVIEW_MODE_ENABLED);

  useEffect(() => {
    if (!REVIEW_MODE_ENABLED) {
      setIsAuthenticating(false);
      return;
    }

    const authenticateReviewer = async () => {
      try {
        // Check if already authenticated
        const isAuth = await base44.auth.isAuthenticated();
        
        if (!isAuth) {
          // Auto sign-in with reviewer account
          await base44.auth.signInWithPassword({
            email: REVIEWER_EMAIL,
            password: REVIEWER_PASSWORD,
          });
        }
      } catch (error) {
        console.error('Review mode auth failed:', error);
      } finally {
        setIsAuthenticating(false);
      }
    };

    authenticateReviewer();
  }, []);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ReviewModeContext.Provider value={{ isReviewMode: REVIEW_MODE_ENABLED, isAuthenticating }}>
      {children}
    </ReviewModeContext.Provider>
  );
};