/** Modal nâng cấp tiệm. */
import { gameState } from '../state.js';
import { UPGRADES } from '../config.js';
import { html, esc, formatMoney } from '../utils.js';
import { buyUpgrade, getUpgradeCost, getUpgradeLevel } from '../systems/economySystem.js';
import { openModal } from './modalUI.js';
import { toast } from './toastUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { sparkle } from './fxUI.js';

function render(body) {
  body.innerHTML = `<div class="row between"><span class="bold">💰 ${formatMoney(gameState.money)}</span><span class="muted">Cấp ${gameState.level}</span></div>` +
    UPGRADES.map((u) => {
      const lvl = getUpgradeLevel(u.id);
      const locked = gameState.level < u.unlockLevel;
      const maxed = lvl >= u.maxLevel;
      const cost = getUpgradeCost(u.id);
      return `<div class="upgrade-row">
        <span class="ico">${u.icon}</span>
        <div class="grow"><div class="bold">${esc(u.name)} <span class="lvl">${lvl}/${u.maxLevel}</span></div><div class="muted">${esc(u.desc)}</div></div>
        <button class="btn btn-sm ${maxed ? 'btn-soft' : 'btn-warm'}" data-up="${u.id}" ${locked || maxed ? 'disabled' : ''} aria-label="Nâng cấp ${esc(u.name)}">
          ${locked ? `🔒 Cấp ${u.unlockLevel}` : maxed ? 'MAX' : formatMoney(cost)}
        </button></div>`;
    }).join('');
  for (const btn of body.querySelectorAll('[data-up]')) {
    btn.addEventListener('click', (e) => {
      const err = buyUpgrade(btn.dataset.up);
      if (err) {
        toast(err, 'error');
        playSfx('error');
      } else {
        playSfx('success');
        sparkle(e.currentTarget);
        toast('Nâng cấp thành công! ⬆️', 'success');
        render(body);
      }
    });
  }
}

export function openUpgrades() {
  const body = html('<div class="col"></div>');
  render(body);
  openModal({ title: '⬆️ Nâng cấp tiệm', body, id: 'upgrades' });
}
