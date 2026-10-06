/** HUD: ngày, mùa, thời tiết, tiền, rating, level, pause, settings. */
import { gameState } from '../state.js';
import { formatMoney, formatRating, esc } from '../utils.js';
import { weatherLabel, getWeather } from '../systems/weatherSystem.js';
import { xpProgress } from '../systems/economySystem.js';
import { setPaused, isPaused } from '../gameLoop.js';
import { openSettings } from './settingsUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { openModal } from './modalUI.js';
import { html } from '../utils.js';
import { toast } from './toastUI.js';

let lastMoney = null;

export function renderHud() {
  const el = document.getElementById('hud');
  if (!el) return;
  const w = getWeather();
  const xp = xpProgress();
  el.innerHTML = `
    <div class="hud-row">
      <span class="pill" title="Ngày">📅 Ngày ${gameState.day}</span>
      <span class="pill" title="${esc(w.tip)}">${esc(weatherLabel())}</span>
      <span class="hud-spacer"></span>
      <button class="hud-icon-btn" data-pause aria-label="${isPaused() ? 'Tiếp tục' : 'Tạm dừng'}">${isPaused() ? '▶️' : '⏸️'}</button>
      <button class="hud-icon-btn" data-settings aria-label="Cài đặt">⚙️</button>
    </div>
    <div class="hud-row">
      <span class="pill money" data-hud-money>💰 ${formatMoney(gameState.money)}</span>
      <span class="pill" title="Đánh giá">⭐ ${formatRating(gameState.rating)}</span>
      <span class="hud-spacer"></span>
      <span class="hud-level">Cấp ${gameState.level} · ${gameState.experience}/${xp.next === Infinity ? 'MAX' : xp.next} XP</span>
    </div>
    <div class="hud-xp" title="Kinh nghiệm" aria-label="Kinh nghiệm"><span style="width:${(xp.ratio * 100).toFixed(1)}%"></span></div>
  `;
  el.querySelector('[data-pause]').addEventListener('click', togglePause);
  el.querySelector('[data-settings]').addEventListener('click', () => {
    playSfx('click');
    openSettings();
  });
  const moneyEl = el.querySelector('[data-hud-money]');
  if (lastMoney !== null && gameState.money > lastMoney) moneyEl.classList.add('bounce');
  lastMoney = gameState.money;
}

let pauseModal = null;
function togglePause() {
  playSfx('click');
  if (isPaused()) {
    setPaused(false);
    pauseModal?.close();
    pauseModal = null;
  } else {
    setPaused(true);
    const foot = html('<button class="btn btn-primary btn-block">▶️ Tiếp tục</button>');
    pauseModal = openModal({ title: '⏸️ Tạm dừng', body: '<p class="center">Khách đang chờ bạn quay lại 🫖</p>', foot, center: true, closeOnBackdrop: false, hideClose: true, onClose: () => { setPaused(false); pauseModal = null; renderHud(); } });
    foot.addEventListener('click', () => pauseModal.close());
    toast('Đã tạm dừng', 'info', 1200);
  }
  renderHud();
}
