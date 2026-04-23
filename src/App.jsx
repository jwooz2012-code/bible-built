import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import Profile from './pages/Profile';
import Treasury from './pages/Treasury';
import Social from './pages/Social';
import BuildersLocked from './pages/BuildersLocked';
import GroupDetail from './pages/GroupDetail';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import OnboardingFlow from './pages/OnboardingFlow';
import ReadingTrackingIntro from './pages/ReadingTrackingIntro';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { CelebrationProvider } from '@/components/celebration/CelebrationContext';
import AuthRecoveryScreen from '@/components/auth/AuthRecoveryScreen';
import TreasuryPreviewPage from './pages/TreasuryPreviewPage';
import ShareSummary from './pages/ShareSummary';
import ComingSoonPage from './pages/ComingSoonPage';
import UserDetail from './pages/UserDetail';
import AdminTools from './pages/AdminTools';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AppContent = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user, logout, retryAuth } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    } else {
      // Unknown error or timeout — show recovery screen instead of permanent spinner
      return (
        <AuthRecoveryScreen
          errorType={authError.type}
          onRetry={retryAuth}
          onLogout={() => logout(true)}
        />
      );
    }
  }

  // Check if user needs to complete onboarding
  const needsOnboarding = user && !user.onboardingComplete;
  // Existing users who haven't seen the reading tracking feature
  const needsReadingTrackingIntro = user && user.onboardingComplete && !user.hasSeenReadingTrackingFeature;

  // Render the main app
  return (
    <>
      <NavigationTracker />
      <Routes>
        {/* Onboarding route - takes priority */}
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/reading-tracking-intro" element={<ReadingTrackingIntro />} />
        
        {/* Redirect to onboarding or feature intro if needed */}
        <Route path="/" element={
          needsOnboarding ? <OnboardingFlow /> : needsReadingTrackingIntro ? <ReadingTrackingIntro /> : (
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
              needsOnboarding && path !== 'onboarding' ? (
                <OnboardingFlow />
              ) : needsReadingTrackingIntro && path !== 'reading-tracking-intro' ? (
                <ReadingTrackingIntro />
              ) : (
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              )
            }
          />
        ))}
        <Route path="/profile" element={<LayoutWrapper currentPageName="profile"><Profile /></LayoutWrapper>} />
        <Route path="/social" element={
          <LayoutWrapper currentPageName="social">
            {user?.role === 'admin' || user?.hasEarlyAccess ? <Social /> : <BuildersLocked />}
          </LayoutWrapper>
        } />
        <Route path="/group-detail" element={<LayoutWrapper currentPageName="group-detail"><GroupDetail /></LayoutWrapper>} />
        <Route path="/treasury" element={<LayoutWrapper currentPageName="treasury">{user?.role === 'admin' || user?.hasEarlyAccess ? <Treasury /> : <TreasuryPreviewPage />}</LayoutWrapper>} />
        <Route path="/treasury-preview" element={<LayoutWrapper currentPageName="treasury-preview"><TreasuryPreviewPage /></LayoutWrapper>} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="/share-summary" element={<LayoutWrapper currentPageName="share-summary"><ShareSummary /></LayoutWrapper>} />
        <Route path="/user-detail" element={<LayoutWrapper currentPageName="user-detail"><UserDetail /></LayoutWrapper>} />
        <Route path="/admin-tools" element={<LayoutWrapper currentPageName="admin-tools"><AdminTools /></LayoutWrapper>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};


function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <CelebrationProvider>
          <Router>
            <AppContent />
          </Router>
          <Toaster />
        </CelebrationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App