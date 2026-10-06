import { gameState } from '../state.js';
import { SAVE_KEY } from '../config.js';
import { loadGame, resetGame, saveGame } from '../save.js';
import { openSettings } from './settingsUI.js';
import { openTutorial } from './tutorialUI.js';
import { openAchievements } from './achievementUI.js';
import { confirmModal, closeAllModals } from './modalUI.js';
import { toast } from './toastUI.js';

let root = null;
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; } }
function closeMenu() { root?.remove(); root = null; }
function continueGame() { if (!hasSave()) return toast('Chưa có dữ liệu để tiếp tục', 'info'); closeMenu(); }
function newGame() {
  const go = () => { closeAllModals(); resetGame(); closeMenu(); setTimeout(() => openTutorial(false), 250); };
  if (hasSave()) confirmModal('Chơi mới?', 'Toàn bộ tiến trình hiện tại sẽ bị xóa.', go, 'Xóa và chơi mới');
  else go();
}
export function openMainMenu() {
  if (root) return;
  const canContinue = hasSave();
  root = document.createElement('div');
  root.className = 'main-menu';
  root.innerHTML = `<div class="main-menu-card"><div class="main-menu-logo">🧋</div><h1>TIỆM TRÀ MƠ ƯỚC</h1><p>Một tách trà, một giấc mơ</p><div class="main-menu-actions">
    <button class="btn btn-primary btn-block" data-start>▶ Bắt đầu chơi</button>
    <button class="btn btn-soft btn-block" data-continue ${canContinue ? '' : 'disabled'}>↩ Tiếp tục</button>
    <button class="btn btn-soft btn-block" data-new>🌱 Chơi mới</button>
    <button class="btn btn-soft btn-block" data-settings>⚙ Cài đặt</button>
    <button class="btn btn-soft btn-block" data-tutorial>📖 Hướng dẫn</button>
    <button class="btn btn-soft btn-block" data-achievements>🏆 Thành tích</button>
  </div><small>Phiên bản 1.0</small></div>`;
  document.body.appendChild(root);
  root.querySelector('[data-start]').onclick = () => (canContinue ? continueGame() : newGame());
  root.querySelector('[data-continue]').onclick = continueGame;
  root.querySelector('[data-new]').onclick = newGame;
  root.querySelector('[data-settings]').onclick = openSettings;
  root.querySelector('[data-tutorial]').onclick = () => openTutorial(true);
  root.querySelector('[data-achievements]').onclick = openAchievements;
}
export function initMainMenu() { openMainMenu(); }
