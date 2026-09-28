import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Last-resort safety net: if anything throws while drawing the screen, show a
// way out instead of a blank white page.
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[AppErrorBoundary]', error, info?.componentStack);
    try {
      base44.analytics.track({
        eventName: 'app_crash',
        properties: { message: String(error?.message || error).slice(0, 300), path: window.location.pathname },
      });
    } catch {
      // Reporting must never get in the way of recovering.
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background px-8 text-center gap-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          <AlertTriangle className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your reading progress is safe. Reload to pick up where you left off.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Reload
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-muted text-foreground font-medium text-sm"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go to Home
          </button>
        </div>
      </div>
    );
  }
}
