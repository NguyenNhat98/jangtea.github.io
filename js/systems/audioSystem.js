/** Âm thanh tổng hợp bằng Web Audio API (không cần file asset). */
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS, on } from '../events.js';
import { requestSave } from '../save.js';

let ctx = null;
let masterGain = null;
let musicGain = null;
let musicTimer = null;
let musicStep = 0;
let unlocked = false;

function ensureContext() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.12;
    musicGain.connect(ctx.destination);
  } catch (err) {
    console.warn('[Audio] Không tạo được AudioContext', err);
    ctx = null;
  }
  return ctx;
}

/** Gọi sau tương tác đầu tiên của người dùng (trình duyệt yêu cầu). */
export function unlockAudio() {
  if (unlocked) return;
  const c = ensureContext();
  if (!c) return;
  unlocked = true;
  if (c.state === 'suspended') c.resume().catch(() => {});
  if (gameState.settings.music) startMusic();
}

function tone(freq, duration, type = 'sine', volume = 1, when = 0) {
  if (!ctx || !gameState.settings.sound) return;
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ctx.currentTime + when;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g).connect(masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch (err) {
    console.warn('[Audio] tone lỗi', err);
  }
}

const SFX = {
  click: () => tone(660, 0.07, 'triangle', 0.5),
  success: () => { tone(523, 0.12, 'triangle'); tone(659, 0.12, 'triangle', 1, 0.1); tone(784, 0.2, 'triangle', 1, 0.2); },
  error: () => { tone(220, 0.15, 'sawtooth', 0.5); tone(180, 0.2, 'sawtooth', 0.5, 0.12); },
  coin: () => { tone(1046, 0.08, 'square', 0.35); tone(1318, 0.14, 'square', 0.35, 0.07); },
  serve: () => { tone(740, 0.1, 'sine'); tone(988, 0.16, 'sine', 1, 0.08); },
  happy: () => { tone(880, 0.1, 'triangle'); tone(1108, 0.1, 'triangle', 1, 0.1); tone(1318, 0.18, 'triangle', 1, 0.2); },
  levelup: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, 'triangle', 1, i * 0.09)); },
  unlock: () => { tone(698, 0.12, 'sine'); tone(932, 0.12, 'sine', 1, 0.1); tone(1174, 0.25, 'sine', 1, 0.2); },
  sparkle: () => { [1568, 1975, 2349].forEach((f, i) => tone(f, 0.1, 'sine', 0.5, i * 0.05)); },
  pop: () => tone(440, 0.06, 'square', 0.3),
  sad: () => { tone(392, 0.15, 'sine'); tone(311, 0.3, 'sine', 1, 0.14); },
  pour: () => { tone(330, 0.24, 'sine', 0.45); tone(392, 0.28, 'sine', 0.35, 0.12); tone(494, 0.2, 'triangle', 0.25, 0.3); },
  lid: () => { tone(540, 0.07, 'triangle', 0.55); tone(820, 0.12, 'sine', 0.5, 0.07); },
  handoff: () => { tone(659, 0.1, 'triangle'); tone(784, 0.12, 'triangle', 0.7, 0.1); tone(988, 0.18, 'sine', 0.7, 0.21); },
};

/** Phát hiệu ứng theo tên. */
export function playSfx(name) {
  if (!unlocked || !ctx) return;
  SFX[name]?.();
}

// Giai điệu nhẹ lặp lại (nốt theo tần số Hz), 0 = nghỉ
const MELODY = [523, 659, 784, 659, 698, 880, 784, 0, 587, 740, 880, 740, 784, 988, 880, 0];
const BASS = [262, 0, 330, 0, 349, 0, 392, 0, 294, 0, 370, 0, 392, 0, 440, 0];

function startMusic() {
  if (musicTimer || !ctx) return;
  musicStep = 0;
  musicTimer = setInterval(() => {
    if (!gameState.settings.music || !ctx) return;
    try {
      const i = musicStep % MELODY.length;
      const t = ctx.currentTime;
      for (const [arr, type, vol, len] of [[MELODY, 'triangle', 0.5, 0.28], [BASS, 'sine', 0.35, 0.5]]) {
        const f = arr[i];
        if (!f) continue;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        osc.connect(g).connect(musicGain);
        osc.start(t);
        osc.stop(t + len + 0.05);
      }
    } catch (err) {
      console.warn('[Audio] music lỗi', err);
    }
    musicStep++;
  }, 300);
}

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
}

export function setSound(v) {
  gameState.settings.sound = !!v;
  emit(EVENTS.SETTINGS_CHANGED, gameState.settings);
  requestSave();
}

export function setMusic(v) {
  gameState.settings.music = !!v;
  if (v && unlocked) startMusic();
  else stopMusic();
  emit(EVENTS.SETTINGS_CHANGED, gameState.settings);
  requestSave();
}

export function initAudioSystem() {
  const unlockOnce = () => {
    unlockAudio();
    window.removeEventListener('pointerdown', unlockOnce);
    window.removeEventListener('keydown', unlockOnce);
  };
  window.addEventListener('pointerdown', unlockOnce);
  window.addEventListener('keydown', unlockOnce);

  on(EVENTS.CUSTOMER_SERVED, ({ quality }) => playSfx(quality === 'PERFECT' ? 'happy' : 'serve'));
  on(EVENTS.PREP_RESULT, ({ quality }) => { if (quality === 'FAILED') playSfx('error'); });
  on(EVENTS.MONEY_EARNED, ({ source }) => { if (source === 'serve' || source === 'delivery' || source === 'tip') playSfx('coin'); });
  on(EVENTS.LEVEL_UP, () => playSfx('levelup'));
  on(EVENTS.RECIPE_UNLOCKED, () => playSfx('unlock'));
  on(EVENTS.ACHIEVEMENT_UNLOCKED, () => playSfx('unlock'));
  on(EVENTS.KARIN_BLESS, () => playSfx('sparkle'));
  on(EVENTS.CUSTOMER_LEFT, () => playSfx('sad'));
  on(EVENTS.DISCOVERY, () => playSfx('sparkle'));
  on(EVENTS.STATE_LOADED, () => { if (unlocked) { if (gameState.settings.music) startMusic(); else stopMusic(); } });
  markDirty('hud');
}
