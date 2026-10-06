/** Modal chi nhánh. */
import { gameState } from '../state.js';
import { BRANCH_CONFIG, maxBranchesForLevel } from '../config.js';
import { html, esc, formatMoney } from '../utils.js';
import { listTemplates, openBranch, upgradeBranch, branchRevenue, branchUpgradeCost, totalRevenuePerInterval, incomeProgress } from '../systems/branchSystem.js';
import { openModal } from './modalUI.js';
import { toast } from './toastUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { sparkle } from './fxUI.js';
import { on, EVENTS } from '../events.js';

let current = null;

function render(body) {
  const owned = gameState.branches;
  const templates = listTemplates().filter((t) => !t.owned);
  const max = maxBranchesForLevel(gameState.level);
  body.innerHTML = `
    <div class="card"><div class="row between"><span class="bold">💸 Thu nhập thụ động</span><span class="money">${formatMoney(totalRevenuePerInterval())}/${BRANCH_CONFIG.incomeInterval}s</span></div>
      <div class="bar" style="margin-top:6px"><span data-income-bar style="width:${(incomeProgress() * 100).toFixed(0)}%"></span></div>
      <p class="muted" style="margin-top:6px">Chi nhánh kiếm tiền cả khi bạn tắt game (tối đa 8 giờ). Sở hữu ${owned.length}/${max}.</p></div>
    <h3>Đang sở hữu</h3>
    ${owned.length ? owned.map((b) => `<div class="upgrade-row"><span class="ico">${listTemplates().find((t) => t.id === b.id)?.icon || '🏪'}</span>
      <div class="grow"><div class="bold">${esc(b.name)} <span class="lvl">Cấp ${b.level}</span></div><div class="muted">${formatMoney(branchRevenue(b))}/chu kỳ · Uy tín ${b.reputation.toFixed(1)} · Tổng ${formatMoney(b.revenue)}</div></div>
      <button class="btn btn-sm btn-warm" data-upb="${b.id}" ${b.level >= BRANCH_CONFIG.maxLevel ? 'disabled' : ''} aria-label="Nâng cấp chi nhánh">${b.level >= BRANCH_CONFIG.maxLevel ? 'MAX' : formatMoney(branchUpgradeCost(b))}</button></div>`).join('')
      : '<p class="muted center">Chưa có chi nhánh nào</p>'}
    <h3>Mở chi nhánh mới</h3>
    ${templates.map((t) => `<div class="upgrade-row"><span class="ico">${t.icon}</span>
      <div class="grow"><div class="bold">${esc(t.name)}</div><div class="muted">${formatMoney(t.baseRevenue)}/chu kỳ ban đầu</div></div>
      <button class="btn btn-sm btn-primary" data-open="${t.id}" ${owned.length >= max ? 'disabled' : ''} aria-label="Mở ${esc(t.name)}">${formatMoney(t.cost)}</button></div>`).join('')}`;
  for (const btn of body.querySelectorAll('[data-open]')) {
    btn.addEventListener('click', (e) => {
      const err = openBranch(btn.dataset.open);
      if (err) {
        toast(err, 'error');
        playSfx('error');
      } else {
        playSfx('levelup');
        sparkle(e.currentTarget, 12);
        toast('🏪 Khai trương chi nhánh mới!', 'gold');
        render(body);
      }
    });
  }
  for (const btn of body.querySelectorAll('[data-upb]')) {
    btn.addEventListener('click', () => {
      const err = upgradeBranch(btn.dataset.upb);
      if (err) {
        toast(err, 'error');
        playSfx('error');
      } else {
        playSfx('success');
        render(body);
      }
    });
  }
}

export function openBranches() {
  if (current) return;
  const body = html('<div class="col"></div>');
  render(body);
  current = openModal({ title: '🏪 Chi nhánh', body, id: 'branches', onClose: () => (current = null) });
}

let tick = 0;
export function updateBranchFrame(dt) {
  if (!current) return;
  tick += dt;
  if (tick < 0.5) return;
  tick = 0;
  const bar = current.body.querySelector('[data-income-bar]');
  if (bar) bar.style.width = `${(incomeProgress() * 100).toFixed(0)}%`;
}

export function initBranchUI() {
  on(EVENTS.BRANCH_INCOME, (total) => {
    toast(`🏪 Chi nhánh gửi về +${formatMoney(total)}`, 'gold', 1800);
    if (current) render(current.body);
  });
}
