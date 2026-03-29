import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function GraceAlertBanner({ tierColor }) {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const pending = localStorage.getItem('bb_grace_alert_pending');
    if (!pending) return;

    // Find the most recent month with a pending alert
    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const alertKey = `bb_grace_alert_${currentMonthKey}`;
    const graceDaysUsed = parseInt(localStorage.getItem(alertKey) || '0', 10);

    const shownKey = `bb_grace_alert_shown_${currentMonthKey}`;
    const alreadyShown = parseInt(localStorage.getItem(shownKey) || '0', 10);

    if (graceDaysUsed > alreadyShown) {
      setAlert({ graceDaysUsed, currentMonthKey });
    } else {
      localStorage.removeItem('bb_grace_alert_pending');
    }
  }, []);

  const dismiss = () => {
    if (!alert) return;
    const shownKey = `bb_grace_alert_shown_${alert.currentMonthKey}`;
    localStorage.setItem(shownKey, String(alert.graceDaysUsed));
    localStorage.removeItem('bb_grace_alert_pending');
    setAlert(null);
  };

  const getMessage = (graceDaysUsed) => {
    if (graceDaysUsed >= 2) {
      return "Second Grace Day used — your streak is still alive. Check your Calendar to see what's left this month.";
    }
    return "Grace Day used — your streak is still alive. Check your Calendar to see how many Grace Days you have left this month.";
  };

  const color = tierColor || '#10B981';

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="mb-4 rounded-2xl px-4 py-3 border flex items-start gap-3"
          style={{
            background: `${color}12`,
            borderColor: `${color}30`,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>🛡️</span>
          <p className="flex-1 text-[12px] leading-relaxed text-foreground/80">
            {getMessage(alert.graceDaysUsed)}
          </p>
          <button
            onClick={dismiss}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}