// All sound is generated with WebAudio: filtered noise footsteps, a panned guard step,
// the near-miss tick, the key chime and the two end stingers. No audio files.
let ac = null;
let master = null;
let noise = null;
let lastTick = 0;

function makeNoiseBuffer(context) {
  const frames = Math.floor(context.sampleRate * 0.35);
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    const fade = 1 - i / frames;
    data[i] = (Math.random() * 2 - 1) * fade;
  }
  return buffer;
}

export function initAudio() {
  if (ac) return;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return;
  try {
    ac = new Ctor();
    master = ac.createGain();
    master.gain.value = 0.6;
    master.connect(ac.destination);
    noise = makeNoiseBuffer(ac);
  } catch {
    ac = null;
  }
}

export function resumeAudio() {
  if (ac && ac.state === 'suspended') ac.resume();
}

function panned(pan) {
  if (!ac.createStereoPanner) return master;
  const node = ac.createStereoPanner();
  node.pan.value = Math.max(-1, Math.min(1, pan));
  node.connect(master);
  return node;
}

function thump({ freq, gain, decay, pan = 0, type = 'lowpass', q = 1.1 }) {
  if (!ac || !noise) return;
  const now = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noise;
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, now);
  env.gain.exponentialRampToValueAtTime(gain, now + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, now + decay);
  src.connect(filter).connect(env).connect(panned(pan));
  src.start(now);
  src.stop(now + decay + 0.02);
}

function tone({ freq, to = freq, gain = 0.05, dur = 0.14, pan = 0, type = 'sine', delay = 0 }) {
  if (!ac) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), start + dur);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(env).connect(panned(pan));
  osc.start(start);
  osc.stop(start + dur + 0.03);
}

export function playerStep(stance) {
  if (stance === 'sprint') thump({ freq: 320, gain: 0.16, decay: 0.09, q: 0.8 });
  else if (stance === 'crouch') thump({ freq: 160, gain: 0.05, decay: 0.1, q: 1.4 });
  else if (stance === 'vent') thump({ freq: 210, gain: 0.07, decay: 0.12, q: 2.0 });
  else thump({ freq: 240, gain: 0.09, decay: 0.1, q: 1.0 });
}

// A guard's step is heard by distance and panned by which side it comes from.
export function guardStep(guard, player) {
  if (!ac) return;
  const span = Math.hypot(guard.x - player.x, guard.y - player.y);
  if (span > 9) return;
  const gain = 0.13 * Math.max(0, 1 - span / 9);
  thump({ freq: 150, gain, decay: 0.13, pan: Math.max(-0.85, Math.min(0.85, (guard.x - player.x) / 6)), q: 1.6 });
}

export function alarmTick() {
  const now = performance.now();
  if (now - lastTick < 340) return;
  lastTick = now;
  tone({ freq: 1180, to: 900, gain: 0.05, dur: 0.07, type: 'square' });
}

export function nearMiss() {
  tone({ freq: 520, to: 300, gain: 0.07, dur: 0.24, type: 'triangle' });
  tone({ freq: 760, to: 520, gain: 0.04, dur: 0.18, type: 'sine', delay: 0.05 });
}

export function keyChime() {
  tone({ freq: 660, gain: 0.06, dur: 0.16 });
  tone({ freq: 990, gain: 0.05, dur: 0.22, delay: 0.09 });
}

export function caughtStinger() {
  tone({ freq: 180, to: 70, gain: 0.13, dur: 0.6, type: 'sawtooth' });
  thump({ freq: 420, gain: 0.1, decay: 0.3 });
}

export function cleanStinger() {
  tone({ freq: 520, gain: 0.06, dur: 0.18 });
  tone({ freq: 780, gain: 0.05, dur: 0.2, delay: 0.12 });
  tone({ freq: 1040, gain: 0.04, dur: 0.34, delay: 0.24 });
}
