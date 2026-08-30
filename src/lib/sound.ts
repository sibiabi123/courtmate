/**
 * CourtMate — Procedural WebAudio Sound Engine
 * Zero external file assets. All sounds synthesized via Web Audio API.
 * 100% SSR-safe for Next.js static prerendering.
 */

let audioCtx: AudioContext | null = null;

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getCtx(): AudioContext | null {
  if (!isClient()) return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  } catch (e) {
    return null;
  }
  return audioCtx;
}

export function isSoundMuted(): boolean {
  if (!isClient()) return false;
  try {
    return localStorage.getItem('courtmate_sound_muted') === 'true';
  } catch {
    return false;
  }
}

export function toggleSound(): boolean {
  if (!isClient()) return true;
  const current = isSoundMuted();
  const next = !current;
  try {
    localStorage.setItem('courtmate_sound_muted', String(next));
  } catch {}
  return !next; // returns true if enabled
}

/** Crisp mechanical switch click — UI tab/button press */
export function playClick() {
  if (isSoundMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch {}
}

/** Metallic coin chime — coin earn / stake deposit */
export function playCoin() {
  if (isSoundMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    [1200, 1800, 2400].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.3);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.35);
    });
  } catch {}
}

/** Heavy brass duel rumble — challenge issued */
export function playDuel() {
  if (isSoundMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(120, ctx.currentTime);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.28);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
    oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
  } catch {}
}

/** Arpeggio harmonic ping — victory / success / win */
export function playSuccess() {
  if (isSoundMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.4);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.45);
    });
  } catch {}
}

/** Subtle whoosh — route transition */
export function playWhoosh() {
  if (isSoundMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.14);
  } catch {}
}

/**
 * Universal sound singleton export for backwards compatibility
 * with all existing components
 */
export const sound = {
  playClick,
  playCoin,
  playBattle: playDuel,
  playDuel,
  playVictory: playSuccess,
  playSuccess,
  playLevelUp: playSuccess,
  playWhoosh,
  isMuted: isSoundMuted,
  toggle: toggleSound,
  toggleSound,
};
