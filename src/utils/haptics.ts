/**
 * Haptic feedback utility using the Web Vibration API
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning' = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(15);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([20, 40, 20]);
          break;
        case 'warning':
          navigator.vibrate([40, 60, 40]);
          break;
      }
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
};
