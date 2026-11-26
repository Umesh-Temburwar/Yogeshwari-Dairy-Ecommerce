/**
 * Gentle Web Audio Synthesizer for Blinkit Quick-Commerce Micro-interactions.
 * Zero external audio files required, purely synthesized in browser!
 */

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playCartAddChime(): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    // Gentle melodic pop: C5 (523Hz) to G5 (784Hz)
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.16);
  } catch {
    // Graceful fallback for non-supported browsers or privacy modes
  }
}

export function toggleAudioMute(): boolean {
  isAudioMuted = !isAudioMuted;
  return isAudioMuted;
}

export function isMuted(): boolean {
  return isAudioMuted;
}
