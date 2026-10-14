import { gameState } from '../state.js';
import { on, EVENTS } from '../events.js';
import { requestSave } from '../save.js';

export const THEMES = [
  ['cream', 'Kem sữa', '#e37995', '#fff4ea'], ['coffee', 'Nâu cà phê', '#9b7656', '#f5ebdf'],
  ['chocolate', 'Sô cô la', '#78553f', '#eee2d6'], ['rose', 'Hồng dâu', '#d8638d', '#fff0f4'],
  ['peach', 'Cam đào', '#ec996b', '#fff2e8'], ['thai', 'Trà Thái', '#d88435', '#fff2d8'],
  ['lemon', 'Vàng chanh', '#b7a337', '#faf7df'], ['matcha', 'Xanh matcha', '#729657', '#eff5e6'],
  ['mint', 'Bạc hà', '#569e8c', '#eaf7f1'], ['ocean', 'Xanh biển', '#588fc2', '#edf5ff'],
  ['taro', 'Tím khoai môn', '#9972bf', '#f5edff'], ['night', 'Đêm dịu', '#ba729d', '#252532'],
];
export function applyPreferences() {
  const theme = THEMES.find(t => t[0] === gameState.settings.theme) || THEMES[0];
  const root = document.documentElement;
  root.dataset.theme = theme[0];
  root.style.setProperty('--theme-accent', theme[2]);
  root.style.setProperty('--theme-bg', theme[3]);
  root.style.setProperty('--c-bg', theme[3]);
  root.style.setProperty('--c-cream', theme[0] === 'night' ? '#343442' : theme[3]);
  root.style.setProperty('--c-pink-deep', theme[2]);
  root.style.setProperty('--c-green-deep', theme[2]);
  root.style.setProperty('--c-focus', theme[2]);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme[3]);
}
export function setTheme(id) { gameState.settings.theme = id; applyPreferences(); requestSave(); }
export function vibrate(multiplier = 1) {
  const strength = Number(gameState.settings.vibration) || 0;
  if (!strength || !navigator.vibrate) return;
  try { navigator.vibrate(Math.min(150, strength * 15 * multiplier)); } catch { /* Unsupported device. */ }
}
export function requestFullscreen() {
  if (document.fullscreenElement) return;
  const enter = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
  try { Promise.resolve(enter?.call(document.documentElement)).catch(() => {}); } catch { /* Standalone remains available. */ }
}
export function initPreferences() {
  on(EVENTS.STATE_LOADED, applyPreferences);
  on(EVENTS.GAME_RESET, applyPreferences);
  document.addEventListener('click', e => { if (e.target.closest('button') && !e.target.closest('button')?.disabled) vibrate(); }, true);
  on(EVENTS.PREP_RESULT, () => vibrate(2));
  on(EVENTS.MINIGAME_FINISHED, () => vibrate(3));
  applyPreferences();
}
