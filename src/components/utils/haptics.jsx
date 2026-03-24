export const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
};