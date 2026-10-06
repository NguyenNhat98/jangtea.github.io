/** Các nút hành động của tiệm, thanh tiến độ ngày, buff, cảnh nền theo thời tiết. */
import { gameState } from '../state.js';
import { formatTime, esc, html } from '../utils.js';
import { openShop } from '../systems/customerSystem.js';
import { listBuffs } from '../systems/buffSystem.js';
import { getWeather } from '../systems/weatherSystem.js';
import { playSfx } from '../systems/audioSystem.js';
import { openUpgrades } from './upgradeUI.js';
import { openPearlGame } from '../minigames/pearlGame.js';
import { openEndDay } from './endDayUI.js';
import { on, EVENTS } from '../events.js';
import { bounce } from './fxUI.js';
import { MINIGAME } from '../config.js';

let dayFinished = false;

export function renderActions() {
  const el = document.getElementById('shopActions');
  if (!el) return;
  const shop = gameState.shop;
  const pct = shop.targetCustomers ? Math.min(100, (shop.spawnedToday / shop.targetCustomers) * 100) : 0;
  const plays = gameState.stats.minigamePlaysToday;
  const mgLabel = plays < MINIGAME.freePlaysPerDay ? '🎮 Mini-game (miễn phí)' : '🎮 Mini-game';
  let main;
  if (dayFinished) main = '<button class="btn btn-warm grow" data-endday aria-label="Tổng kết ngày">🌙 Tổng kết ngày</button>';
  else if (!shop.isOpen && !shop.dayStarted) main = '<button class="btn btn-primary grow" data-open aria-label="Mở cửa tiệm">🔔 Mở cửa</button>';
  else if (!shop.isOpen && shop.dayStarted) main = '<button class="btn btn-primary grow" data-open aria-label="Mở cửa lại">🔔 Mở cửa lại</button>';
  else main = `<div class="btn btn-soft grow" aria-live="polite">🟢 Đang mở · ${shop.servedToday} khách</div>`;

  el.innerHTML = `
    <div class="day-progress"><span>Khách hôm nay</span><span class="bar"><span style="width:${pct.toFixed(0)}%"></span></span><span>${shop.spawnedToday}/${shop.targetCustomers || '?'}</span></div>
    ${main}
    <button class="btn btn-soft" data-upgrade aria-label="Nâng cấp tiệm">⬆️ Nâng cấp</button>
    <button class="btn btn-soft" data-minigame aria-label="Chơi mini-game">${mgLabel}</button>
  `;
  el.querySelector('[data-open]')?.addEventListener('click', (e) => {
    playSfx('success');
    bounce(e.currentTarget);
    openShop();
  });
  el.querySelector('[data-endday]')?.addEventListener('click', () => {
    playSfx('click');
    openEndDay();
  });
  el.querySelector('[data-upgrade]').addEventListener('click', () => {
    playSfx('click');
    openUpgrades();
  });
  el.querySelector('[data-minigame]').addEventListener('click', () => {
    playSfx('click');
    openPearlGame();
  });
}

export function renderBuffs() {
  let el = document.querySelector('.buffs');
  if (!el) {
    el = html('<div class="buffs" aria-label="Hiệu ứng đang có"></div>');
    document.getElementById('shop')?.appendChild(el);
  }
  const list = listBuffs();
  el.innerHTML = list.map((b) => `<span class="buff">${b.icon} ${esc(b.name)}${b.duration < 9999 ? ` ${formatTime(b.remaining)}` : ''}</span>`).join('');
}

export function renderScene() {
  const w = getWeather();
  const sky = document.querySelector('.scene-sky');
  if (sky) sky.dataset.icon = w.icon;
  document.documentElement.dataset.season = gameState.season;
  const board = document.querySelector('[data-board]');
  if (board) board.innerHTML = `${w.icon} ${esc(w.name)} · ${gameState.temperature}°C<small>${esc(w.tip)}</small>`;
}

/** Cập nhật đồng hồ buff mỗi ~0.5s. */
let buffTick = 0;
export function updateBuffsFrame(dt) {
  buffTick += dt;
  if (buffTick < 0.5) return;
  buffTick = 0;
  if (Object.keys(gameState.buffs).length) renderBuffs();
}

export function initShopUI() {
  on(EVENTS.DAY_COMPLETED, () => {
    dayFinished = true;
    renderActions();
    setTimeout(openEndDay, 500);
  });
  on(EVENTS.DAY_STARTED, () => {
    dayFinished = false;
    renderActions();
  });
  on(EVENTS.STATE_LOADED, () => {
    dayFinished = false;
  });
}
