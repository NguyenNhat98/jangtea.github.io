/** Modal kho nguyên liệu: mua lẻ / mua đầy. */
import { gameState } from '../state.js';
import { html, esc, formatMoney } from '../utils.js';
import { listIngredients, buyIngredient } from '../systems/inventorySystem.js';
import { openModal } from './modalUI.js';
import { toast } from './toastUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { on, EVENTS } from '../events.js';

let current = null;
let category = 'tea';
const quantities = {};
const categoryFor = i => i.category || (['tea', 'milk', 'matcha', 'sugar', 'ice'].includes(i.id) ? 'tea' : ['pearl', 'snowpearl'].includes(i.id) ? 'toppings' : 'flavor');

function render(body) {
  const items = listIngredients().filter(i => categoryFor(i) === category);
  body.innerHTML = `<div class="row between"><span class="bold">💰 ${formatMoney(gameState.money)}</span><span class="muted">Chạm +1 / +5 / Đầy để mua</span></div>
    <div class="tabs inventory-tabs">${[['tea', '🍵 Trà'], ['flavor', '🍓 Hương'], ['toppings', '⚫ Topping'], ['tools', '🥤 Dụng cụ']].map(([id, label]) => `<button class="tab ${category === id ? 'active' : ''}" data-category="${id}">${label}</button>`).join('')}</div>
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
          <div class="quantity-picker"><button class="btn btn-sm btn-soft" data-qty="-1" aria-label="Giảm số lượng">−</button><input type="number" min="1" max="${Math.max(1, fillQty)}" value="${Math.min(quantities[i.id] || 1, Math.max(1, fillQty))}" aria-label="Số lượng ${esc(i.name)}" data-quantity><button class="btn btn-sm btn-soft" data-qty="1" aria-label="Tăng số lượng">+</button></div>
          <button class="btn btn-sm btn-primary" data-buy="custom" ${full ? 'disabled' : ''}>Nhập hàng</button>
          <div class="row">
            <button class="btn btn-sm btn-soft grow" data-buy="1" ${full ? 'disabled' : ''} aria-label="Mua 1 ${esc(i.name)}">+1</button>
            <button class="btn btn-sm btn-soft grow" data-buy="5" ${full ? 'disabled' : ''} aria-label="Mua 5 ${esc(i.name)}">+5</button>
            <button class="btn btn-sm btn-warm grow" data-buy="${fillQty}" ${full ? 'disabled' : ''} aria-label="Mua đầy ${esc(i.name)}">Đầy</button>
          </div>
        </div>`;
      })
      .join('')}</div>`;
  body.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => { category = button.dataset.category; render(body); }));
  body.querySelectorAll('[data-quantity]').forEach(input => input.addEventListener('change', () => {
    input.value = String(Math.max(1, Math.min(Number(input.max), Math.floor(Number(input.value) || 1))));
    quantities[input.closest('[data-ing]').dataset.ing] = Number(input.value);
  }));
  body.querySelectorAll('[data-qty]').forEach(button => button.addEventListener('click', () => {
    const input = button.closest('[data-ing]').querySelector('[data-quantity]');
    input.value = String(Math.max(1, Math.min(Number(input.max), Number(input.value) + Number(button.dataset.qty))));
    quantities[button.closest('[data-ing]').dataset.ing] = Number(input.value);
  }));
  for (const btn of body.querySelectorAll('[data-buy]')) {
    btn.addEventListener('click', (e) => {
      const id = btn.closest('[data-ing]').dataset.ing;
      const requested = btn.dataset.buy === 'custom' ? Number(btn.closest('[data-ing]').querySelector('[data-quantity]').value) : Number(btn.dataset.buy);
      const before = listIngredients().find(i => i.id === id).stock;
      const err = buyIngredient(id, requested);
      if (err) {
        toast(err, 'error');
        playSfx('error');
      } else {
        playSfx('pop');
        const actual = listIngredients().find(i => i.id === id).stock - before;
        toast(`Đã nhập ${actual} ${listIngredients().find(i => i.id === id).name}`, 'success', 1500);
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
