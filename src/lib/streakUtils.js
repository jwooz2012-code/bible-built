/**
 * Shared streak calculation utility.
 * Simple consecutive-day streak with no grace day logic.
 * Used by celebration triggers and any other place needing a raw streak count.
 */
export function computeStreak(logs) {
  if (!logs || logs.length === 0) return 0;
  const days = Array.from(new Set(logs.map(l => l.dateKey))).sort().reverse();
  if (!days.length) return 0;
  const today = new Date();
  const pad = n => String(n).padStart(2, '0');
  const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayKey = toKey(today);
  const yesterdayKey = toKey(new Date(today.getTime() - 86400000));
  if (days[0] !== todayKey && days[0] !== yesterdayKey) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((prev - curr) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}