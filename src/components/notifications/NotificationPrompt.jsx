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
  if (count === 0) return true;
  // Second ask: only if 24 hours have passed since first dismissal
  const lastShown = parseInt(localStorage.getItem(PROMPT_LAST_KEY) || '0');
  return Date.now() - lastShown >= HOURS_24;
}

/** Soft notification prompt — centered modal, shown after first chapter mark, retried once after 24h. */
export default function NotificationPrompt({ onClose }) {
  const count = parseInt(localStorage.getItem(PROMPT_COUNT_KEY) || '0');
  const isSecondAsk = count === 1;

  const handleYes = () => {
    // Request push permission — supports AppMyWeb native bridge + Web SDK v4/v3
    try {
      if (window.OneSignal?.Notifications?.requestPermission) {
        // Web SDK v4 / AppMyWeb v4 bridge
        window.OneSignal.Notifications.requestPermission();
      } else if (window.OneSignalDeferred) {
        // Web SDK v4 deferred queue
        window.OneSignalDeferred.push(async (OneSignal) => {
          await OneSignal.Notifications.requestPermission();
        });
      } else if (window.OneSignal?.push) {
        // Legacy Web SDK v3
        window.OneSignal.push(() => {
          window.OneSignal.registerForPushNotifications();
        });
      }
    } catch (e) {
      console.warn('[NotifPrompt] OneSignal requestPermission failed:', e);
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
    <>
      {/* Dim backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={handleDismiss}
      />

      {/* Centered card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
      >
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl pointer-events-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground p-1 -mt-1 -mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Text */}
          <h3 className="text-base font-bold text-foreground mb-2">
            {isSecondAsk ? 'Keep your streak alive 🔥' : 'Never miss a day'}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {isSecondAsk
              ? "We'll only nudge you on days you haven't read yet. No spam, ever."
              : "Get a daily reminder to protect your streak. We only notify you if you haven't read that day."}
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleYes}
              className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-xl transition-opacity active:opacity-80"
            >
              Yes, remind me
            </button>
            <button
              onClick={handleDismiss}
              className="w-full bg-muted text-muted-foreground text-sm font-semibold py-3 rounded-xl transition-opacity active:opacity-80"
            >
              {isSecondAsk ? 'No thanks' : 'Not now'}
            </button>
          </div>

        </div>
      </motion.div>
    </>
  );
}
