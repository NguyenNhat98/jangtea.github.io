/** Khu khách hàng: thẻ khách, thanh kiên nhẫn, chọn khách. */
import { gameState, markDirty } from '../state.js';
import { esc } from '../utils.js';
import { RECIPE_MAP } from '../config.js';
import { moodOf, selectCustomer } from '../systems/customerSystem.js';
import { specialRequestName } from '../systems/orderSystem.js';
import { playSfx } from '../systems/audioSystem.js';

const MOOD_ICON = { fine: '', neutral: '', impatient: '😤', angry: '😡', happy: '😍', ok: '🙂' };

export function renderCustomers() {
  const area = document.getElementById('customerArea');
  if (!area) return;
  const shop = gameState.shop;
  if (!shop.customers.length) {
    let msg = 'Bấm "Mở cửa" để đón khách ☀️';
    if (shop.isOpen) msg = 'Khách sắp đến... 🚶';
    else if (shop.dayStarted) msg = 'Hết khách hôm nay 🌙';
    area.innerHTML = `<div class="customer-empty">${msg}</div>`;
    return;
  }
  area.innerHTML = shop.customers
    .map((c) => {
      const recipe = RECIPE_MAP[c.order?.recipeId];
      const mood = moodOf(c);
      const req = c.order?.specialRequest ? `<span class="req">${esc(specialRequestName(c.order.specialRequest))}</span>` : '';
      const qty = c.order?.quantity > 1 ? ` ×${c.order.quantity}` : '';
      const size = c.order?.cupSize ? ` · ${c.order.cupSize}` : '';
      const selected = shop.selectedCustomerId === c.id ? 'selected' : '';
      const byAssistant = c.handledBy === 'assistant' ? '<span class="small">👩‍🍳 trợ lý</span>' : '';
      return `
      <button class="customer state-${c.state} mood-${mood} ${selected} ${c.vip ? 'vip' : ''}" data-cid="${c.id}" aria-label="Khách ${esc(c.name)} muốn ${esc(recipe?.name || '')}" ${c.state === 'leaving' ? 'disabled' : ''}>
        ${c.vip ? '<span class="vip-tag">VIP</span>' : ''}
        <span class="mood" data-mood>${MOOD_ICON[mood] || ''}</span>
        <span class="avatar">${c.avatar}</span>
        <span class="cname">${esc(c.name)}</span>
        ${c.order?.channel === 'online' ? '<span class="online-customer-tag">📱 Đơn online</span>' : ''}
        <span class="bubble"><span class="ico">${recipe?.icon || '❓'}</span>${esc(recipe?.name || '???')}${size}${qty}${req}</span>
        ${byAssistant}
        <span class="bar" data-bar><span style="width:${((c.patience / c.maxPatience) * 100).toFixed(0)}%"></span></span>
      </button>`;
    })
    .join('');
  for (const btn of area.querySelectorAll('[data-cid]')) {
    btn.addEventListener('click', () => {
      playSfx('click');
      selectCustomer(Number(btn.dataset.cid));
    });
  }
}

/** Cập nhật thanh kiên nhẫn mỗi frame mà không render lại thẻ. */
export function updatePatienceBars() {
  const area = document.getElementById('customerArea');
  if (!area) return;
  for (const c of gameState.shop.customers) {
    const btn = area.querySelector(`[data-cid="${c.id}"]`);
    if (!btn) continue;
    const bar = btn.querySelector('[data-bar]');
    const ratio = c.maxPatience > 0 ? c.patience / c.maxPatience : 0;
    bar.firstElementChild.style.width = `${(ratio * 100).toFixed(0)}%`;
    bar.classList.toggle('warn', ratio <= 0.6 && ratio > 0.3);
    bar.classList.toggle('danger', ratio <= 0.3);
    const mood = moodOf(c);
    const cls = `mood-${mood}`;
    if (!btn.classList.contains(cls)) {
      btn.className = btn.className.replace(/mood-\w+/, cls);
      btn.querySelector('[data-mood]').textContent = MOOD_ICON[mood] || '';
      if (mood === 'impatient') markDirty('counter');
    }
  }
}
