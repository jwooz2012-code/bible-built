/**
 * Standardized date key generation
 * ALWAYS use this function for dateKey to ensure consistency between writes and reads
 */
export function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}