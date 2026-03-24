// Service Worker for background notification handling
// Checks every minute if a reminder should trigger

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(clients.claim());
});

// Check reminders every minute when SW is active
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
    checkAndTriggerNotifications();
  }
});

async function checkAndTriggerNotifications() {
  try {
    const settings = await getStoredReminders();
    if (!settings || !settings.enabled) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = now.getDay();

    // Get active days
    const activeDays = getActiveDays(settings);
    if (!activeDays.includes(currentDay)) return;

    // Check if we're within the notification window (±1 minute of scheduled time)
    const [scheduledH, scheduledM] = settings.time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledH, scheduledM, 0, 0);

    const diffMs = Math.abs(now - scheduledTime);
    const diffMinutes = Math.floor(diffMs / 60000);

    // Only trigger within 1 minute window
    if (diffMinutes <= 1) {
      const shownKey = `bb_notif_shown_${now.toISOString().slice(0, 10)}`;
      const alreadyShown = await getFromDB('notifications', shownKey);

      if (!alreadyShown) {
        await self.registration.showNotification('Bible Built', {
          body: 'Time to build in the Word.',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'bb-daily-reminder',
          requireInteraction: false,
        });

        // Mark as shown
        await saveToDB('notifications', shownKey, true);
      }
    }
  } catch (error) {
    console.error('[SW] Error checking notifications:', error);
  }
}

function getActiveDays(settings) {
  if (settings.days === 'daily') return [0, 1, 2, 3, 4, 5, 6];
  if (settings.days === 'weekdays') return [1, 2, 3, 4, 5];
  return settings.customDays || [0, 1, 2, 3, 4, 5, 6];
}

async function getStoredReminders() {
  try {
    return await getFromDB('settings', 'reminderSettings');
  } catch {
    return null;
  }
}

// Simple IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('BibleBuilt', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications');
      }
    };
  });
}

async function getFromDB(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

async function saveToDB(store, key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(value, key);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
