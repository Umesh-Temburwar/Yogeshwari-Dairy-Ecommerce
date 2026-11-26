/**
 * Accessible live announcer for screen-reader users during fast quick-commerce cart updates.
 */

let liveRegion: HTMLElement | null = null;

function getLiveRegion(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (!liveRegion) {
    liveRegion = document.getElementById('a11y-live-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'a11y-live-announcer';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
  }
  return liveRegion;
}

export function announceToScreenReader(message: string): void {
  const region = getLiveRegion();
  if (!region) return;

  // Clear briefly then set message to trigger screen-reader speech synthesis
  region.textContent = '';
  setTimeout(() => {
    if (region) {
      region.textContent = message;
    }
  }, 50);
}
