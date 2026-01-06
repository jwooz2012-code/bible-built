/**
 * Standardized date key generation
 * ALWAYS use this function for dateKey to ensure consistency between writes and reads
 */
export function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/**
 * Add days to a date key
 */
export function addDaysKey(dateKey, days) {
  const date = new Date(dateKey);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Add years to a date key
 */
export function addYearsKey(dateKey, years) {
  const date = new Date(dateKey);
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().slice(0, 10);
}

/**
 * Format a date key (YYYY-MM-DD) as "Tue, Jan 6"
 */
export function formatDateKey(dateKey) {
  const date = new Date(dateKey + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}