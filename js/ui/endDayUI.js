/** Tổng kết cuối ngày, lên cấp, tiến độ offline. */
import { gameState } from '../state.js';
import { INGREDIENT_MAP } from '../config.js';
import { html, esc, formatMoney, formatSigned, formatRating, pick } from '../utils.js';
import { daySummary, nextDay } from '../systems/calendarSystem.js';
import { addIngredient } from '../systems/inventorySystem.js';
import { openModal, queueModal, isModalOpen, closeAllModals } from './modalUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { on, EVENTS } from '../events.js';
import { sparkle, burst } from './fxUI.js';
import { toast } from './toastUI.js';

const DAY_REWARD_POOL = ['pearl', 'peach', 'lemon', 'milk', 'tea', 'sugar', 'ice'];

export function openEndDay() {
  if (isModalOpen('endday')) return;
  const s = daySummary();
  const rewardId = pick(DAY_REWARD_POOL.filter((id) => gameState.inventory[id]?.unlocked));
  const rewardQty = 1 + Math.floor(s.served / 5);
  const def = INGREDIENT_MAP[rewardId];
  const body = html(`<div class="col">
    <div class="summary-emoji">${s.left === 0 && s.served > 0 ? '🌈' : s.served >= s.left ? '🌙' : '😅'}</div>
    <div class="summary-big">Ngày ${s.day} hoàn thành!</div>
    <div class="summary-row"><span>Doanh thu</span><span class="money">${formatSigned(s.revenue)}</span></div>
    <div class="summary-row"><span>Khách phục vụ</span><span>${s.served}</span></div>
    <div class="summary-row"><span>Khách hài lòng</span><span>${s.happy}</span></div>
    <div class="summary-row"><span>Khách bỏ đi</span><span style="color:${s.left ? 'var(--c-red)' : 'inherit'}">${s.left}</span></div>
    <div class="summary-row"><span>Rating</span><span>${s.ratingDelta >= 0 ? '+' : ''}${formatRating(s.ratingDelta)} (⭐ ${formatRating(gameState.rating)})</span></div>
    <div class="summary-row"><span>Kinh nghiệm</span><span>+${s.xp} XP</span></div>
    <div class="summary-row" style="background:var(--c-yellow)"><span>Phần thưởng</span><span>+${rewardQty} ${def?.icon || ''} ${esc(def?.name || '')}</span></div>
  </div>`);
  const foot = html('<button class="btn btn-primary btn-block">☀️ Ngày tiếp theo</button>');
  const m = openModal({ title: '🌙 Kết thúc ngày', body, foot, center: true, closeOnBackdrop: false, hideClose: true, id: 'endday' });
  foot.addEventListener('click', () => {
    playSfx('success');
    if (rewardId) addIngredient(rewardId, rewardQty);
    m.close();
    closeAllModals();
    nextDay();
    toast(`Ngày ${gameState.day} bắt đầu! ${gameState.season === 'winter' ? '⛄' : '☀️'}`, 'info');
  });
}

function showLevelUp({ level, reward, note }) {
  const items = Object.entries(reward.items || {}).map(([id, q]) => `+${q} ${INGREDIENT_MAP[id]?.icon || ''} ${esc(INGREDIENT_MAP[id]?.name || id)}`);
  const body = html(`<div class="col center">
    <div class="summary-emoji">🎉</div>
    <div class="summary-big">Lên cấp ${level}!</div>
    <p class="bold">${esc(note)}</p>
    <div class="summary-row"><span>Thưởng</span><span class="money">+${formatMoney(reward.money || 0)}</span></div>
    ${items.map((t) => `<div class="summary-row"><span>Quà</span><span>${t}</span></div>`).join('')}
  </div>`);
  const foot = html('<button class="btn btn-primary btn-block">Tuyệt vời! 🎊</button>');
  queueModal((done) => {
    const m = openModal({ title: '⬆️ LEVEL UP', body, foot, center: true, onClose: done });
    foot.addEventListener('click', m.close);
    setTimeout(() => {
      const e = body.querySelector('.summary-emoji');
      sparkle(e, 14);
      burst(e);
    }, 200);
  });
}

function showOffline({ seconds, amount }) {
  const h = Math.floor(seconds / 3600);
  const mnt = Math.floor((seconds % 3600) / 60);
  const body = html(`<div class="col center">
    <div class="summary-emoji">🏪</div>
    <p class="bold">Trong lúc bạn vắng mặt (${h ? `${h} giờ ` : ''}${mnt} phút)...</p>
    <div class="summary-big money">Tiệm đã kiếm được +${formatMoney(amount)}</div>
    <p class="muted">Thu nhập từ các chi nhánh (tối đa 8 giờ)</p></div>`);
  const foot = html('<button class="btn btn-primary btn-block">Nhận 💰</button>');
  queueModal((done) => {
    const m = openModal({ title: '💤 Chào mừng trở lại', body, foot, center: true, onClose: done });
    foot.addEventListener('click', () => {
      playSfx('coin');
      m.close();
    });
  });
}

export function initEndDayUI() {
  on(EVENTS.LEVEL_UP, (data) => showLevelUp(data));
  on(EVENTS.OFFLINE_PROGRESS, showOffline);
}
