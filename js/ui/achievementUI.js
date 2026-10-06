/** Thành tựu: modal danh sách + thông báo khi đạt. */
import { html, esc, formatMoney } from '../utils.js';
import { listAchievements } from '../systems/achievementSystem.js';
import { openModal } from './modalUI.js';
import { on, EVENTS } from '../events.js';
import { toast } from './toastUI.js';

export function openAchievements() {
  const list = listAchievements();
  const body = html(`<div class="col"><p class="muted center">Đạt ${list.filter((a) => a.unlocked).length}/${list.length}</p>${list
    .map((a) => `<div class="ach-row ${a.unlocked ? 'done' : ''}"><span class="ico">${a.unlocked ? a.icon : '🔒'}</span>
      <div class="grow"><div class="bold">${esc(a.name)}</div><div class="muted">${esc(a.description)}</div></div>
      <span class="small money">${formatMoney(a.reward.money)}${a.reward.xp ? ` · ${a.reward.xp}XP` : ''}</span></div>`)
    .join('')}</div>`);
  openModal({ title: '🏆 Thành tựu', body, id: 'achievements' });
}

export function initAchievementUI() {
  on(EVENTS.ACHIEVEMENT_UNLOCKED, (a) => toast(`🏆 Thành tựu: ${a.name} (+${formatMoney(a.reward.money)})`, 'gold', 3000));
}
