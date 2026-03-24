import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'bb_reminder_settings';
const REMINDER_INTERVAL = 60000; // Check every minute

export const DEFAULT_REMINDER = {
  enabled: false,
  time: '07:00',
  days: 'daily', // 'daily' | 'weekdays' | 'custom'
  customDays: [0, 1, 2, 3, 4, 5, 6], // 0=Sun
};

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocal(settings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
}

async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

export function getActiveDays(settings) {
  if (settings.days === 'daily') return [0, 1, 2, 3, 4, 5, 6];
  if (settings.days === 'weekdays') return [1, 2, 3, 4, 5];
  return settings.customDays || [0, 1, 2, 3, 4, 5, 6];
}

export function getReminderStatusText(settings) {
  if (!settings?.enabled) return 'Off';
  const [h, m] = settings.time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mStr = String(m).padStart(2, '0');
  const timeStr = `${h12}:${mStr} ${period}`;
  const daysStr = settings.days === 'daily' ? 'Daily'
    : settings.days === 'weekdays' ? 'Weekdays'
    : 'Custom days';
  return `${daysStr} at ${timeStr}`;
}

// Check reminders and trigger notification if time matches
function checkAndTriggerNotification() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const currentDay = now.getDay();

  try {
    const settings = loadLocal() || DEFAULT_REMINDER;
    if (!settings.enabled) return;

    const activeDays = getActiveDays(settings);
    if (!activeDays.includes(currentDay)) return;

    // Check if current time matches scheduled time (within 1 minute window)
    const [scheduledH, scheduledM] = settings.time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledH, scheduledM, 0, 0);

    const diffMs = Math.abs(now - scheduledTime);
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes <= 1) {
      const shownKey = `bb_notif_shown_${now.toISOString().slice(0, 10)}`;
      if (!localStorage.getItem(shownKey)) {
        localStorage.setItem(shownKey, '1');
        new Notification('Bible Built', {
          body: 'Time to build in the Word.',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'bb-daily-reminder',
          requireInteraction: false,
        });
      }
    }
  } catch (error) {
    console.error('[Reminder] Error checking notification:', error);
  }
}

// Clear all scheduled notifications
function clearAllNotifications() {
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => {
          reg.getNotifications({ tag: 'bb-daily-reminder' }).then(notifications => {
            notifications.forEach(n => n.close());
          }).catch(() => {});
        });
      }).catch(() => {});
    }
  } catch (error) {
    console.error('[Reminder] Error clearing notifications:', error);
  }
}

export function useReminders() {
  const [settings, setSettings] = useState(() => loadLocal() || DEFAULT_REMINDER);
  const [permissionStatus, setPermissionStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [isSaving, setIsSaving] = useState(false);

  // Register Service Worker on mount (only once)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.warn('[Reminder] SW registration failed:', err);
      });
    }
  }, []);

  // Start background check interval when enabled
  useEffect(() => {
    if (settings.enabled) {
      // Check immediately
      checkAndTriggerNotification();
      // Then check every minute
      const interval = setInterval(checkAndTriggerNotification, REMINDER_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [settings.enabled, settings.time, settings.days, settings.customDays]);

  // Load from user profile on mount
  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.reminderSettings) {
        const merged = { ...DEFAULT_REMINDER, ...u.reminderSettings };
        setSettings(merged);
        saveLocal(merged);
      }
    }).catch(() => {});
  }, []);

  const saveSettings = useCallback(async (newSettings) => {
    setIsSaving(true);
    const merged = { ...DEFAULT_REMINDER, ...newSettings };
    setSettings(merged);
    saveLocal(merged);
    try {
      await base44.auth.updateMe({ reminderSettings: merged });
    } catch {}
    setIsSaving(false);
    return merged;
  }, []);

  const enableReminders = useCallback(async (settingsToSave) => {
    // Save the setting first, regardless of permission
    await saveSettings({ ...settingsToSave, enabled: true });
    // Then request permission (best-effort)
    const perm = await requestPermission();
    setPermissionStatus(perm);
    // Trigger check immediately
    checkAndTriggerNotification();
    return true;
  }, [saveSettings]);

  const disableReminders = useCallback(async () => {
    // Clear any pending notifications
    clearAllNotifications();
    await saveSettings({ enabled: false });
  }, [saveSettings]);

  const updateSettings = useCallback(async (partial) => {
    await saveSettings({ ...settings, ...partial });
  }, [settings, saveSettings]);

  return {
    settings,
    permissionStatus,
    isSaving,
    enableReminders,
    disableReminders,
    updateSettings,
    saveSettings,
  };
}