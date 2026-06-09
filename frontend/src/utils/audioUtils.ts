import { MaterialType, MATERIAL_TYPE_INFO } from '../types';

let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    return ctx.resume();
  }
  return Promise.resolve();
}

export function playNote(
  frequency: number,
  materialType: MaterialType,
  duration: number = 2.0,
  volume: number = 0.3
): void {
  const ctx = getAudioContext();
  const materialInfo = MATERIAL_TYPE_INFO[materialType];
  const decayRate = materialInfo.decay_rate;

  const now = ctx.currentTime;

  const fundamentalOsc = ctx.createOscillator();
  const fundamentalGain = ctx.createGain();

  fundamentalOsc.type = 'sine';
  fundamentalOsc.frequency.setValueAtTime(frequency, now);

  fundamentalGain.gain.setValueAtTime(0, now);
  fundamentalGain.gain.linearRampToValueAtTime(volume * 0.6, now + 0.02);
  fundamentalGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  fundamentalOsc.connect(fundamentalGain);
  fundamentalGain.connect(ctx.destination);

  const harmonicCount = 4;
  const harmonics: { osc: OscillatorNode; gain: GainNode }[] = [];

  for (let i = 2; i <= harmonicCount + 1; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency * i, now);

    const amplitude = volume * 0.3 * Math.exp(-decayRate * (i - 1)) / i;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(amplitude, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration * (1 - decayRate * 0.1));

    osc.connect(gain);
    gain.connect(ctx.destination);
    harmonics.push({ osc, gain });
  }

  fundamentalOsc.start(now);
  harmonics.forEach((h) => h.osc.start(now));

  fundamentalOsc.stop(now + duration + 0.1);
  harmonics.forEach((h) => h.osc.stop(now + duration + 0.1));
}

export function playChord(
  frequencies: number[],
  materialTypes: MaterialType[],
  duration: number = 3.0,
  volume: number = 0.2
): void {
  frequencies.forEach((freq, index) => {
    const materialType = materialTypes[index] || materialTypes[0] || 'copper';
    const delay = index * 0.05;
    setTimeout(() => {
      playNote(freq, materialType, duration, volume / Math.sqrt(frequencies.length));
    }, delay * 1000);
  });
}

export function playWindChimeEffect(
  frequencies: number[],
  materialTypes: MaterialType[],
  volume: number = 0.15
): void {
  const ctx = getAudioContext();
  const duration = 4.0;

  const shaker = ctx.createOscillator();
  const shakerGain = ctx.createGain();
  const shakerFilter = ctx.createBiquadFilter();

  shaker.type = 'triangle';
  shaker.frequency.setValueAtTime(2 + Math.random() * 3, ctx.currentTime);

  shakerFilter.type = 'highpass';
  shakerFilter.frequency.setValueAtTime(1000, ctx.currentTime);

  shakerGain.gain.setValueAtTime(0, ctx.currentTime);
  shakerGain.gain.linearRampToValueAtTime(volume * 0.1, ctx.currentTime + 0.1);
  shakerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  shaker.connect(shakerFilter);
  shakerFilter.connect(shakerGain);
  shakerGain.connect(ctx.destination);

  shaker.start(ctx.currentTime);
  shaker.stop(ctx.currentTime + 0.6);

  const sortedFreqs = [...frequencies].sort((a, b) => a - b);
  sortedFreqs.forEach((freq, index) => {
    const materialType = materialTypes[index] || materialTypes[0] || 'copper';
    const delay = index * 0.15 + Math.random() * 0.1;
    setTimeout(() => {
      playNote(freq, materialType, duration, volume / Math.sqrt(frequencies.length));
    }, delay * 1000);
  });
}
