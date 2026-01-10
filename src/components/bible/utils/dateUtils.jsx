/**
 * Standardized date key generation
 * ALWAYS use this function for dateKey to ensure consistency between writes and reads
 * Uses LOCAL timezone to ensure day boundaries align with user's midnight
 */
export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

/**
 * Format a date key as "Jan 6, 2026"
 */
export function formatDateLong(dateKey) {
  const date = new Date(dateKey + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format a date range with smart formatting:
 * - Same month/year: "Jan 6–12, 2026"
 * - Different months same year: "Jan 28 – Feb 3, 2026"
 * - Different years: "Dec 29, 2026 – Jan 4, 2027"
 */
export function formatDateRange(startKey, endKey) {
  const start = new Date(startKey + 'T00:00:00');
  const end = new Date(endKey + 'T00:00:00');
  
  const startMonth = start.getMonth();
  const endMonth = end.getMonth();
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  
  if (startYear === endYear && startMonth === endMonth) {
    // Same month/year: "Jan 6–12, 2026"
    const month = start.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${start.getDate()}–${end.getDate()}, ${startYear}`;
  } else if (startYear === endYear) {
    // Different months same year: "Jan 28 – Feb 3, 2026"
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} – ${endStr}, ${startYear}`;
  } else {
    // Different years: "Dec 29, 2026 – Jan 4, 2027"
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }
}