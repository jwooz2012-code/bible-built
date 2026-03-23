// Celebration Bus — lightweight event emitter for cross-app celebration triggers
// Use triggerCelebration(type, data) from anywhere. CelebrationManager subscribes.

const listeners = [];

const PRIORITY = {
  badge: 1,
  book: 2,
  streak: 3,
  milestone: 4,
};

const DEDUP_PREFIX = 'bb_cel_';

export function triggerCelebration(type, data, options = {}) {
  const dedupKey = options.dedupKey;
  if (dedupKey) {
    const storageKey = DEDUP_PREFIX + dedupKey;
    if (sessionStorage.getItem(storageKey)) return; // Already celebrated this session
    sessionStorage.setItem(storageKey, '1');
  }

  const event = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    data,
    priority: PRIORITY[type] ?? 99,
    timestamp: Date.now(),
  };

  listeners.forEach((fn) => fn(event));
}

export function subscribeToCelebrations(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}