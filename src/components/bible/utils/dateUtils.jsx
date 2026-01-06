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