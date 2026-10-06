/** Modal kho nguyên liệu: mua lẻ / mua đầy. */
import { gameState } from '../state.js';
import { html, esc, formatMoney } from '../utils.js';
import { listIngredients, buyIngredient } from '../systems/inventorySystem.js';
import { openModal } from './modalUI.js';
import { toast } from './toastUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { on, EVENTS } from '../events.js';
import { floatText } from './fxUI.js';

let current = null;

function render(body) {
  const items = listIngredients();
  body.innerHTML = `<div class="row between"><span class="bold">💰 ${formatMoney(gameState.money)}</span><span class="muted">Chạm +1 / +5 / Đầy để mua</span></div>
    <div class="grid-auto">${items
      .map((i) => {
        const full = i.stock >= i.maxStock;
        const fillQty = i.maxStock - i.stock;
        if (!i.unlocked) return `<div class="item-card locked rarity-${i.rarity}"><span class="ico">🔒</span><span class="name">${esc(i.name)}</span><span class="muted">Mở ở cấp ${i.unlockLevel}</span></div>`;
        return `<div class="item-card rarity-${i.rarity}" data-ing="${i.id}">
          <div class="row between"><span class="ico">${i.icon}</span><span class="rarity">${i.stock}/${i.maxStock}</span></div>
          <span class="name">${esc(i.name)}</span>
          <span class="bar ${i.stock <= 2 ? 'danger' : ''}"><span style="width:${((i.stock / i.maxStock) * 100).toFixed(0)}%"></span></span>
          <span class="muted">${formatMoney(i.cost)}/cái</span>
          <div class="row">
            <button class="btn btn-sm btn-soft grow" data-buy="1" ${full ? 'disabled' : ''} aria-label="Mua 1 ${esc(i.name)}">+1</button>
            <button class="btn btn-sm btn-soft grow" data-buy="5" ${full ? 'disabled' : ''} aria-label="Mua 5 ${esc(i.name)}">+5</button>
            <button class="btn btn-sm btn-warm grow" data-buy="${fillQty}" ${full ? 'disabled' : ''} aria-label="Mua đầy ${esc(i.name)}">Đầy</button>
          </div>
        </div>`;
      })
      .join('')}</div>`;
  for (const btn of body.querySelectorAll('[data-buy]')) {
    btn.addEventListener('click', (e) => {
      const id = btn.closest('[data-ing]').dataset.ing;
      const err = buyIngredient(id, Number(btn.dataset.buy));
      if (err) {
        toast(err, 'error');
        playSfx('error');
      } else {
        playSfx('pop');
        floatText('+' + btn.dataset.buy, e.currentTarget, 'green');
        render(body);
      }
    });
  }
}

export function openInventory() {
  if (current) return;
  const body = html('<div class="col"></div>');
  render(body);
  current = openModal({ title: '📦 Kho nguyên liệu', body, id: 'inventory', onClose: () => (current = null) });
}

export function initInventoryUI() {
  on(EVENTS.MONEY_EARNED, () => current && render(current.body));
}
