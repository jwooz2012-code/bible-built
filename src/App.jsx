import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import Profile from './pages/Profile';
import Social from './pages/Social';
import Treasury from './pages/Treasury';
import FriendsTreasuryIntro from './pages/FriendsTreasuryIntro';
import GroupDetail from './pages/GroupDetail';
import UserDetail from './pages/UserDetail';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import OnboardingFlow from './pages/OnboardingFlow';
import ReadingTrackingIntro from './pages/ReadingTrackingIntro';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { CelebrationProvider } from '@/components/celebration/CelebrationContext';
import AuthRecoveryScreen from '@/components/auth/AuthRecoveryScreen';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AppInner = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user, logout, retryAuth } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if user needs to complete onboarding (only for authenticated users)
  const needsOnboarding = user && !user.onboardingComplete;
  const needsReadingTrackingIntro = user && user.onboardingComplete && !user.hasSeenReadingTrackingFeature;
  const needsFriendsTreasuryIntro = user && user.onboardingComplete && user.hasSeenReadingTrackingFeature && !user.hasSeenFriendsTreasuryIntro;

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* All app routes — gated by ProtectedRoute */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        {/* Handle auth errors for registered users */}
        {authError && authError.type === 'user_not_registered' ? (
          <Route path="*" element={<UserNotRegisteredError />} />
        ) : authError && authError.type !== 'auth_required' ? (
          <Route path="*" element={
            <AuthRecoveryScreen
              errorType={authError.type}
              onRetry={retryAuth}
              onLogout={() => logout(true)}
            />
          } />
        ) : (
          <>
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/reading-tracking-intro" element={<ReadingTrackingIntro />} />

            <Route path="/" element={
              needsOnboarding ? <OnboardingFlow /> :
              needsReadingTrackingIntro ? <ReadingTrackingIntro /> :
              needsFriendsTreasuryIntro ? <FriendsTreasuryIntro /> : (
                <LayoutWrapper currentPageName={mainPageKey}>
                  <MainPage />
                </LayoutWrapper>
              )
            } />

            {Object.entries(Pages).map(([path, Page]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  needsOnboarding && path !== 'onboarding' ? <OnboardingFlow /> :
                  needsReadingTrackingIntro && path !== 'reading-tracking-intro' ? <ReadingTrackingIntro /> :
                  needsFriendsTreasuryIntro && path !== 'friends-treasury-intro' ? <FriendsTreasuryIntro /> : (
                    <LayoutWrapper currentPageName={path}>
                      <Page />
                    </LayoutWrapper>
                  )
                }
              />
            ))}

            <Route path="/friends-treasury-intro" element={<FriendsTreasuryIntro />} />
            <Route path="/social" element={<LayoutWrapper currentPageName="social"><Social /></LayoutWrapper>} />
            <Route path="/treasury" element={<LayoutWrapper currentPageName="treasury"><Treasury /></LayoutWrapper>} />
            <Route path="/profile" element={<LayoutWrapper currentPageName="profile"><Profile /></LayoutWrapper>} />
            <Route path="/group-detail" element={<LayoutWrapper currentPageName="group-detail"><GroupDetail /></LayoutWrapper>} />
            <Route path="/user-detail" element={<LayoutWrapper currentPageName="user-detail"><UserDetail /></LayoutWrapper>} />
            <Route path="*" element={<PageNotFound />} />
          </>
        )}
      </Route>
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <CelebrationProvider>
          <Router>
            <NavigationTracker />
            <AppInner />
          </Router>
        </CelebrationProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App