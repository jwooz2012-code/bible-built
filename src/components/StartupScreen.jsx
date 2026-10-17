import React, { useEffect, useState } from 'react';

// The same startup screen as index.html (its styles live there, so it never
// waits on the app's style file), shown while the app signs the user in.
// Keeps opening the app from ever looking like a blank white page.

function prefersDark() {
  try {
    const theme = localStorage.getItem('theme') || 'system';
    return theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  } catch {
    return false;
  }
}

export default function StartupScreen({ status }) {
  const [slow, setSlow] = useState(false);
  const [dark] = useState(prefersDark);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bb-boot${dark ? ' bb-dark' : ''}${slow ? ' bb-slow' : ''}`} role="status" aria-label="Loading Bible Built">
      <div className="bb-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 7v14" />
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </svg>
      </div>
      <div className="bb-spin" />
      <div className="bb-status">{status}</div>
      <div className="bb-retry">
        <div>Taking longer than usual.</div>
        <button type="button" onClick={() => window.location.reload()}><span>Tap to retry</span></button>
      </div>
    </div>
  );
}
