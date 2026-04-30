import React from 'react';
import { motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';

const PROMPT_COUNT_KEY = 'bb_notif_prompt_count';
const PROMPT_LAST_KEY  = 'bb_notif_prompt_last';
const PROMPT_DONE_KEY  = 'bb_notif_prompt_done';
const HOURS_24 = 24 * 60 * 60 * 1000;

/** Returns true if the soft prompt should be shown right now. */
export function shouldShowNotificationPrompt() {
  if (localStorage.getItem(PROMPT_DONE_KEY)) return false;
  const count = parseInt(localStorage.getItem(PROMPT_COUNT_KEY) || '0');
  if (count >= 2) return false;
  if (count === 0) return true; // never shown before
  // Second ask: only if 24 hours have passed since first dismissal
  const lastShown = parseInt(localStorage.getItem(PROMPT_LAST_KEY) || '0');
  return Date.now() - lastShown >= HOURS_24;
}

/** Soft notification prompt — shown after first chapter mark, retried once after 24h. */
export default function NotificationPrompt({ onClose }) {
  const count = parseInt(localStorage.getItem(PROMPT_COUNT_KEY) || '0');
  const isSecondAsk = count === 1;

  const handleYes = () => {
    if (window.OneSignal) {
      window.OneSignal.push(() => {
        window.OneSignal.registerForPushNotifications();
      });
    }
    localStorage.setItem(PROMPT_DONE_KEY, '1');
    localStorage.setItem('bb_notif_enabled', '1');
    onClose();
  };

  const handleDismiss = () => {
    const newCount = count + 1;
    localStorage.setItem(PROMPT_COUNT_KEY, String(newCount));
    localStorage.setItem(PROMPT_LAST_KEY, String(Date.now()));
    if (newCount >= 2) localStorage.setItem(PROMPT_DONE_KEY, '1');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto"
    >
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground mb-0.5">
              {isSecondAsk ? 'Keep your streak alive 🔥' : 'Never miss a day'}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isSecondAsk
                ? "We'll only nudge you on days you haven't read yet. No spam, ever."
                : "Get a daily reminder to protect your streak. We only notify you if you haven't read that day."}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleYes}
                className="flex-1 bg-primary text-primary-foreground text-xs font-semibold py-2 rounded-xl transition-opacity active:opacity-80"
              >
                Yes, remind me
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-muted text-muted-foreground text-xs font-semibold py-2 rounded-xl transition-opacity active:opacity-80"
              >
                {isSecondAsk ? 'No thanks' : 'Not now'}
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground p-1 -mt-1 -mr-1 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
