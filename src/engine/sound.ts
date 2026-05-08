// Lightweight Web Audio sound effects — synthesized, no asset files.

let ctx: AudioContext | null = null;
let muted = false;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
      if (Ctx) ctx = new Ctx();
    } catch {
      return null;
    }
  }
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

interface BeepOpts {
  freq: number;
  duration?: number;
  type?: OscillatorType;
  gain?: number;
  decay?: number;
  freqEnd?: number;
}

function beep(opts: BeepOpts) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = opts.type ?? 'sine';
  o.frequency.setValueAtTime(opts.freq, ac.currentTime);
  if (opts.freqEnd) {
    o.frequency.exponentialRampToValueAtTime(opts.freqEnd, ac.currentTime + (opts.duration ?? 0.15));
  }
  const peak = opts.gain ?? 0.06;
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(peak, ac.currentTime + 0.01);
  const decay = opts.decay ?? opts.duration ?? 0.18;
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + decay);
  o.connect(g).connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + decay + 0.02);
}

function chord(freqs: number[], duration = 0.18, type: OscillatorType = 'sine') {
  freqs.forEach((f, i) => setTimeout(() => beep({ freq: f, duration, type }), i * 40));
}

export const sfx = {
  setMuted(m: boolean) { muted = m; },
  isMuted() { return muted; },
  emailDing() { chord([880, 1320], 0.18, 'sine'); },
  chatPop() { beep({ freq: 660, duration: 0.08, type: 'sine', gain: 0.05 }); },
  alert() { beep({ freq: 1100, freqEnd: 600, duration: 0.45, type: 'sawtooth', gain: 0.07, decay: 0.5 }); },
  deploySuccess() { chord([523, 659, 784], 0.12, 'triangle'); },
  deployFail() { beep({ freq: 220, freqEnd: 110, duration: 0.4, type: 'square', gain: 0.05, decay: 0.4 }); },
  click() { beep({ freq: 1200, duration: 0.04, type: 'square', gain: 0.03, decay: 0.05 }); },
  win() { setTimeout(() => chord([523, 659, 784, 1046], 0.18, 'triangle'), 0); },
  lose() { setTimeout(() => chord([392, 311, 233, 196], 0.25, 'sawtooth'), 0); },
  achievement() { setTimeout(() => chord([784, 988, 1318], 0.15, 'triangle'), 0); },
};
