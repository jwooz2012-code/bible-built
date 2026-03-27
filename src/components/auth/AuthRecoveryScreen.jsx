import { RefreshCw, LogOut, AlertTriangle } from 'lucide-react';

export default function AuthRecoveryScreen({ onRetry, onLogout, errorType }) {
  const isTimeout = errorType === 'timeout';

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background px-8 text-center gap-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <AlertTriangle className="w-8 h-8 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">
          {isTimeout ? 'Connection Timed Out' : 'Something Went Wrong'}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          {isTimeout
            ? 'The app took too long to load. Please check your connection and try again.'
            : 'The app couldn\'t connect to your session. You can retry or sign out and back in.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-muted text-muted-foreground font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out & Reset
        </button>
      </div>
    </div>
  );
}