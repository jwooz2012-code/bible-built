import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import Profile from './pages/Profile';
import Social from './pages/Social';
import Treasury from './pages/Treasury';
import FeatureTour from '@/components/onboarding/FeatureTour';
import ChallengePage from '@/components/challenge/ChallengePage';
import GroupDetail from './pages/GroupDetail';
import UserDetail from './pages/UserDetail';
import MyHighlights from './pages/MyHighlights';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import OnboardingFlow from './pages/OnboardingFlow';
import ReadingTrackingIntro from './pages/ReadingTrackingIntro';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { CelebrationProvider } from '@/components/celebration/CelebrationContext';
import AuthRecoveryScreen from '@/components/auth/AuthRecoveryScreen';
import ProtectedRoute from '@/components/ProtectedRoute';
import StartupScreen from '@/components/StartupScreen';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { loginPathFor } from '@/lib/authReturnTo';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Signed-out visitors (e.g. someone opening a group invite link) go to Log in,
// which brings them back to this page once they're in. A sign-in check that
// timed out is not a sign-out: offer Try Again instead of the Log in screen.
const RedirectToLogin = () => {
  const location = useLocation();
  const { authError, retryAuth, logout } = useAuth();
  if (authError?.type === 'timeout') {
    return <AuthRecoveryScreen errorType="timeout" onRetry={retryAuth} onLogout={() => logout(true)} />;
  }
  return <Navigate to={loginPathFor(location.pathname + location.search)} replace />;
};

const AppInner = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user, logout, retryAuth } = useAuth();

  // Keep the branded startup screen up while checking app settings and sign-in
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <StartupScreen status="Signing you in…" />;
  }

  // Check if user needs to complete onboarding (only for authenticated users)
  const needsOnboarding = user && !user.onboardingComplete;
  const needsReadingTrackingIntro = user && user.onboardingComplete && !user.hasSeenReadingTrackingFeature;
  // New users finish setup first, then land on the page they opened.
  const afterSetup = (element) => needsOnboarding ? <OnboardingFlow /> : element;

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* All app routes — gated by ProtectedRoute */}
      <Route element={<ProtectedRoute unauthenticatedElement={<RedirectToLogin />} />}>
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/reading-tracking-intro" element={<ReadingTrackingIntro />} />

        <Route path="/" element={
          authError?.type === 'user_not_registered' ? <UserNotRegisteredError /> :
          authError ? <AuthRecoveryScreen errorType={authError.type} onRetry={retryAuth} onLogout={() => logout(true)} /> :
          needsOnboarding ? <OnboardingFlow /> :
          needsReadingTrackingIntro ? <ReadingTrackingIntro /> : (
            <LayoutWrapper currentPageName={mainPageKey}><MainPage /></LayoutWrapper>
          )
        } />

        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              needsOnboarding && path !== 'onboarding' ? <OnboardingFlow /> :
              needsReadingTrackingIntro && path !== 'reading-tracking-intro' ? <ReadingTrackingIntro /> : (
                <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
              )
            }
          />
        ))}

        <Route path="/tour" element={<FeatureTour />} />
        <Route path="/challenge" element={afterSetup(<ChallengePage />)} />
        <Route path="/social" element={afterSetup(<LayoutWrapper currentPageName="social"><Social /></LayoutWrapper>)} />
        <Route path="/treasury" element={afterSetup(<LayoutWrapper currentPageName="treasury"><Treasury /></LayoutWrapper>)} />
        <Route path="/profile" element={afterSetup(<LayoutWrapper currentPageName="profile"><Profile /></LayoutWrapper>)} />
        <Route path="/group-detail" element={afterSetup(<LayoutWrapper currentPageName="group-detail"><GroupDetail /></LayoutWrapper>)} />
        <Route path="/user-detail" element={afterSetup(<LayoutWrapper currentPageName="user-detail"><UserDetail /></LayoutWrapper>)} />
        <Route path="/highlights" element={afterSetup(<LayoutWrapper currentPageName="highlights"><MyHighlights /></LayoutWrapper>)} />
        <Route path="*" element={<PageNotFound />} />
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