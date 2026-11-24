// Tiny synthesised sound effects, so the prototype needs no audio files.
import { signal } from '@preact/signals';

export const soundOn = signal(true);

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (!soundOn.value) return null;
  try {
    ctx ??= new AudioContext();
    // Browsers keep audio suspended until the first tap; every later call resumes it.
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.06, at = 0, slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  tap: () => tone(700, 0.06, 'triangle', 0.05),
  page: () => tone(320, 0.12, 'triangle', 0.05, 0, 200),
  knock: () => {
    for (const at of [0, 0.2, 0.4]) tone(150, 0.09, 'triangle', 0.16, at, 90);
  },
  beep: () => {
    tone(1400, 0.07, 'square', 0.03);
    tone(1400, 0.07, 'square', 0.03, 0.13);
  },
  stamp: () => tone(110, 0.16, 'sawtooth', 0.14, 0, 50),
  good: () => {
    tone(660, 0.09, 'triangle', 0.06);
    tone(880, 0.14, 'triangle', 0.06, 0.09);
  },
  bad: () => tone(240, 0.22, 'triangle', 0.06, 0, 170),
  /** Closing time: the same chime, coming down. */
  close: () => {
    tone(1175, 0.5, 'sine', 0.06);
    tone(880, 0.6, 'sine', 0.06, 0.25);
    tone(659, 1.0, 'sine', 0.06, 0.5);
  },
  /** The clinic opening: a little two-note chime. */
  bell: () => {
    tone(1319, 0.5, 'sine', 0.07);
    tone(1760, 0.8, 'sine', 0.06, 0.2);
  },
};
