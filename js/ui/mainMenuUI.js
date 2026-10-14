import { SAVE_KEY } from '../config.js';
import { openSettings } from './settingsUI.js';
import { openTutorial } from './tutorialUI.js';
import { openAchievements } from './achievementUI.js';
import { requestFullscreen } from '../systems/preferencesSystem.js';
import { on, EVENTS } from '../events.js';

let root = null;
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; } }
function closeMenu() { root?.remove(); root = null; }
export function openMainMenu() {
  if (root) return;
  const canContinue = hasSave();
  root = document.createElement('div');
  root.className = 'main-menu';
  root.innerHTML = `<div class="main-menu-card"><div class="main-menu-logo">🧋</div><h1>TIỆM TRÀ MƠ ƯỚC</h1><p>Một tách trà, một giấc mơ</p><div class="main-menu-actions">
    <button class="btn btn-primary btn-block" data-start>${canContinue ? '▶ Tiếp tục chơi' : '▶ Bắt đầu chơi'}</button>
    <button class="btn btn-soft btn-block" data-settings>⚙ Cài đặt</button>
    <button class="btn btn-soft btn-block" data-tutorial>📖 Hướng dẫn</button>
    <button class="btn btn-soft btn-block" data-achievements>🏆 Thành tích</button>
  </div><small>Phiên bản 1.1 · Khu vườn và những ly trà</small></div>`;
  document.body.appendChild(root);
  root.querySelector('[data-start]').onclick = () => { requestFullscreen(); const saved = hasSave(); closeMenu(); if (!saved) openTutorial(false); };
  root.querySelector('[data-settings]').onclick = openSettings;
  root.querySelector('[data-tutorial]').onclick = () => { closeMenu(); openTutorial(true); };
  root.querySelector('[data-achievements]').onclick = openAchievements;
}
export function initMainMenu() { on(EVENTS.GAME_RESET, closeMenu); openMainMenu(); }
