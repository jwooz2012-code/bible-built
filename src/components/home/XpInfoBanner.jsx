import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';

const STORAGE_KEY = 'bb_xp_info_dismissed';

export default function XpInfoBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="mb-5 rounded-2xl border border-border bg-card px-4 py-3.5 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="text-sm font-semibold text-foreground">How XP Works</p>
      </div>

      <ul className="text-sm text-muted-foreground space-y-1 pr-5">
        <li>• Earn <strong className="text-foreground">2 XP per verse</strong> when you log a chapter</li>
        <li>• Earn a <strong className="text-foreground">+100 XP bonus</strong> on days you read 30+ verses</li>
        <li>• Spend XP in the <strong className="text-foreground">Treasury</strong> to unlock artifacts that boost your XP multiplier</li>
        <li>• Your <strong className="text-foreground">level</strong> increases every 1,000 XP</li>
      </ul>
    </div>
  );
}