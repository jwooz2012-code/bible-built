import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'bb_reminder_settings';

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

// Schedule a check: on app load, if today is a reminder day and we're past the time, show notification
export function checkAndShowReminder(settings) {
  if (!settings?.enabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const todayDay = now.getDay();
  const activeDays = getActiveDays(settings);
  if (!activeDays.includes(todayDay)) return;

  const [h, m] = settings.time.split(':').map(Number);
  const reminderTime = new Date();
  reminderTime.setHours(h, m, 0, 0);

  // Show if within 30 min window after reminder time (and not shown today)
  const diffMs = now - reminderTime;
  if (diffMs < 0 || diffMs > 30 * 60 * 1000) return;

  const shownKey = `bb_notif_shown_${now.toISOString().slice(0, 10)}`;
  if (localStorage.getItem(shownKey)) return;
  localStorage.setItem(shownKey, '1');

  new Notification('Bible Built', {
    body: 'Time to build in the Word.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'bb-daily-reminder',
  });
}

export function useReminders() {
  const [settings, setSettings] = useState(() => loadLocal() || DEFAULT_REMINDER);
  const [permissionStatus, setPermissionStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [isSaving, setIsSaving] = useState(false);

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
    const perm = await requestPermission();
    setPermissionStatus(perm);
    if (perm === 'granted') {
      await saveSettings({ ...settingsToSave, enabled: true });
      return true;
    }
    return false;
  }, [saveSettings]);

  const disableReminders = useCallback(async () => {
    await saveSettings({ ...settings, enabled: false });
  }, [settings, saveSettings]);

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