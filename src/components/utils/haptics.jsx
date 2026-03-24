/**
 * Haptic feedback utility
 * - Uses Median (mobile wrapper) native haptics when available
 * - Falls back to navigator.vibrate on Android web
 * - Fails silently on desktop/unsupported environments
 */

function isMedianApp() {
  return typeof window !== 'undefined' && typeof window.median !== 'undefined';
}

/**
 * Light impact — for tap interactions (chapter mark as read, button presses)
 */
export function impactLight() {
  try {
    if (isMedianApp()) {
      window.median.haptics.impact({ style: 'light' });
      return;
    }
    if (navigator.vibrate) navigator.vibrate(10);
  } catch (_) {}
}

/**
 * Success notification — for reward moments (badge earned, milestone reached)
 */
export function notificationSuccess() {
  try {
    if (isMedianApp()) {
      window.median.haptics.notification({ type: 'success' });
      return;
    }
    if (navigator.vibrate) navigator.vibrate([10, 50, 20]);
  } catch (_) {}
}

/**
 * @deprecated use impactLight() instead
 */
export const triggerHaptic = impactLight;