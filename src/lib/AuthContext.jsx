import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AUTH_TIMEOUT_MS = 15000;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  const timeoutRef = useRef(null);

  // Hard timeout: never spin forever in WebView/native
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
      setAuthError({ type: 'timeout', message: 'Auth timed out' });
    }, AUTH_TIMEOUT_MS);

    checkAppState().finally(() => {
      clearTimeout(timeoutRef.current);
    });

    return () => clearTimeout(timeoutRef.current);
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId
        },
        token: appParams.token, // Include token if available
        interceptResponses: true
      });
      
      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);
        
        // If we got the app public settings successfully, check if user is authenticated
        if (appParams.token) {
          await checkUserAuth();
        } else {
          // No token at all — treat as auth required so navigateToLogin() fires
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAuthError({ type: 'auth_required', message: 'Authentication required' });
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('[Auth] Public settings fetch failed:', appError?.status, appError?.message);
        
        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({ type: 'auth_required', message: 'Authentication required' });
          } else if (reason === 'user_not_registered') {
            setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
          } else {
            setAuthError({ type: reason, message: appError.message });
          }
        } else {
          setAuthError({ type: 'unknown', message: appError.message || 'Failed to load app' });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('[Auth] Unexpected checkAppState error:', error);
      setAuthError({ type: 'unknown', message: error.message || 'An unexpected error occurred' });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Tag this device in OneSignal with the user's Bible Built ID
      // so targeted push notifications (streak reminders, etc.) reach the right person
      if (window.OneSignal) {
        window.OneSignal.push(() => {
          window.OneSignal.setExternalUserId(currentUser.id);
        });
      }
      setIsAuthenticated(true);
      setIsLoadingAuth(false);

      const registeredKey = `bb_user_registered_tracked_${currentUser.id}`;
      if (!localStorage.getItem(registeredKey)) {
        localStorage.setItem(registeredKey, '1');
        base44.analytics.track({ eventName: 'user_registered', properties: { user_id: currentUser.id } });
      }
    } catch (error) {
      console.error('[Auth] checkUserAuth failed:', error?.status, error?.message);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      } else {
        // Network or unexpected error — show recovery screen instead of blank
        setAuthError({ type: 'unknown', message: error.message || 'Failed to load user' });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const retryAuth = () => {
    setAuthError(null);
    setIsLoadingAuth(true);
    setIsLoadingPublicSettings(true);
    checkAppState();
  };

  const updateUser = (updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  };

  const refreshUser = async () => {
    await checkUserAuth();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
      retryAuth,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};