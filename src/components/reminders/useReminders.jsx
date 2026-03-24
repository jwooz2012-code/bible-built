import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { isIOS, isPWAInstalled, canRequestNotificationPermission } from '@/utils/platformDetection';

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
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  // Check if environment allows requesting (PWA on iOS, browser on Android/Web)
  if (!canRequestNotificationPermission()) {
    console.warn('[Reminders] Cannot request notification permission in this environment');
    return 'needs_pwa';
  }
  
  // Return current permission if already granted/denied
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  // Request permission (this only works in PWA on iOS or browser on Android/Web)
  try {
    const result = await Notification.requestPermission();
    console.log('[Reminders] Permission request result:', result);
    return result;
  } catch (error) {
    console.error('[Reminders] Permission request failed:', error);
    return 'error';
  }
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
  const [platformInfo] = useState(() => ({
    isIOS: isIOS(),
    isPWA: isPWAInstalled(),
    canRequest: canRequestNotificationPermission(),
  }));

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
    // On iOS: Check if running as PWA
    if (platformInfo.isIOS && !platformInfo.isPWA) {
      console.warn('[Reminders] iOS detected but not a PWA. User needs to install app.');
      setPermissionStatus('needs_pwa');
      // Still save the setting, but don't request permission
      await saveSettings({ ...settingsToSave, enabled: true });
      return false;
    }
    
    // Save the setting first
    await saveSettings({ ...settingsToSave, enabled: true });
    
    // Request permission (only if environment supports it)
    if (platformInfo.canRequest) {
      const perm = await requestPermission();
      setPermissionStatus(perm);
      console.log('[Reminders] Permission status after request:', perm);
    } else {
      setPermissionStatus('needs_pwa');
    }
    
    // Trigger check immediately if permission granted
    if (Notification.permission === 'granted') {
      checkAndTriggerNotification();
    }
    
    return true;
  }, [saveSettings, platformInfo]);

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
    platformInfo,
  };
}