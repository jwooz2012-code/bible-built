import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import Profile from './pages/Profile';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import OnboardingFlow from './pages/OnboardingFlow';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { CelebrationProvider } from '@/components/celebration/CelebrationContext';
import AuthRecoveryScreen from '@/components/auth/AuthRecoveryScreen';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
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

  // Render the main app
  return (
    <Routes>
      {/* Onboarding route - takes priority */}
      <Route path="/onboarding" element={<OnboardingFlow />} />
      
      {/* Redirect to onboarding if needed */}
      <Route path="/" element={
        needsOnboarding ? <OnboardingFlow /> : (
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
            ) : (
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            )
          }
        />
      ))}
      <Route path="/profile" element={<LayoutWrapper currentPageName="profile"><Profile /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
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
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </CelebrationProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App