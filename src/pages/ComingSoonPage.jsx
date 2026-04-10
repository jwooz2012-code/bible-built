import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

export default function ComingSoonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { featureName } = location.state || { featureName: 'This feature' };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 h-9 w-9 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
        <Clock className="w-10 h-10 text-muted-foreground" />
      </div>

      <h1 className="text-3xl font-extrabold text-foreground mb-3">Coming Soon</h1>
      <p className="text-base text-muted-foreground mb-2 max-w-xs">
        <span className="font-semibold text-foreground">{featureName}</span> is currently being built and will be available shortly.
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Stay tuned for exciting updates!
      </p>

      <button
        onClick={() => navigate('/home')}
        className="mt-10 px-8 py-3.5 rounded-2xl font-bold text-sm bg-primary text-primary-foreground active:scale-95 transition-all"
      >
        Go Home
      </button>
    </div>
  );
}