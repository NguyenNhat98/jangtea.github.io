/** Quầy pha chế: hiển thị order đã chọn, nguyên liệu, tiến trình pha, timing bar, phục vụ. */
import { gameState, markDirty } from '../state.js';
import { INGREDIENT_MAP, RECIPE_MAP, QUALITY } from '../config.js';
import { esc, formatMoney, $ } from '../utils.js';
import { getSelectedCustomer } from '../systems/customerSystem.js';
import { startPreparation, serveCurrent, cancelPreparation, qualityForMarker } from '../systems/recipeSystem.js';
import { getStock } from '../systems/inventorySystem.js';
import { specialRequestName } from '../systems/orderSystem.js';
import { getUpgradeLevel } from '../systems/economySystem.js';
import { playSfx } from '../systems/audioSystem.js';
import { toast } from './toastUI.js';
import { floatText, coinFly, hearts, shake, sparkle } from './fxUI.js';
import { openInventory } from './inventoryUI.js';

function ingredientChips(ingredients) {
  return Object.entries(ingredients)
    .map(([id, qty]) => {
      const def = INGREDIENT_MAP[id];
      const stock = getStock(id);
      const missing = stock < qty ? 'missing' : '';
      return `<span class="ing-chip ${missing}" title="${esc(def?.name || id)}">${def?.icon || '?'} ${qty} <span class="muted">(${stock})</span></span>`;
    })
    .join('');
}

function assistantBlock() {
  const lvl = getUpgradeLevel('assistant');
  if (lvl <= 0) return '';
  const prep = gameState.shop.assistantPrep;
  const recipe = prep ? RECIPE_MAP[prep.recipeId] : null;
  const pct = prep ? Math.min(100, (prep.elapsed / prep.total) * 100).toFixed(0) : 0;
  return `<div class="assistant-slot" data-assistant>👩‍🍳 Trợ lý: ${prep ? `${recipe?.icon || ''} ${esc(recipe?.name || '')}` : 'đang rảnh'}
    <span class="bar"><span data-assistant-bar style="width:${pct}%"></span></span></div>`;
}

export function renderCounter() {
  const el = document.getElementById('counter');
  if (!el) return;
  const shop = gameState.shop;
  const prep = shop.preparation;
  const customer = prep ? shop.customers.find((c) => c.id === prep.customerId) : getSelectedCustomer();
  const head = `<div class="counter-title"><span>🫖 QUẦY PHA CHẾ</span><span>${prep ? 'Đang pha...' : customer ? 'Order' : ''}</span></div>`;

  if (!customer) {
    el.innerHTML = `${head}<div class="counter-idle">${shop.customers.length ? '👆 Chạm vào một khách để xem order' : 'Quầy đang trống'}</div>${assistantBlock()}`;
    return;
  }
  const recipe = RECIPE_MAP[customer.order.recipeId];
  if (!recipe) {
    el.innerHTML = `${head}<div class="counter-idle">Công thức không tồn tại</div>`;
    return;
  }
  const req = customer.order.specialRequest ? `<span class="tag">${esc(specialRequestName(customer.order.specialRequest))}</span>` : '';
  const qty = customer.order.quantity > 1 ? `<span class="tag">×${customer.order.quantity}</span>` : '';
  const orderHead = `
    <div class="order-head">
      <span class="big">${recipe.icon}</span>
      <div class="grow"><div class="bold">${esc(recipe.name)} ${qty} ${req}</div>
      <div class="muted">${esc(customer.name)} · <span class="money">${formatMoney(recipe.price * customer.order.quantity)}</span> · ${recipe.preparationTime}s</div></div>
    </div>`;

  if (!prep) {
    const missing = Object.entries(recipe.ingredients).some(([id, q]) => getStock(id) < q);
    const busy = customer.handledBy === 'assistant';
    el.innerHTML = `${head}<div class="order-panel">${orderHead}
      <div class="order-ings">${ingredientChips(recipe.ingredients)}</div>
      <div class="row">
        <button class="btn btn-primary grow" data-prep ${missing || busy ? 'disabled' : ''} aria-label="Pha chế">${busy ? '👩‍🍳 Trợ lý đang pha' : '🫖 Pha chế'}</button>
        ${missing ? '<button class="btn btn-warm" data-buy aria-label="Mua nguyên liệu">🛒 Mua</button>' : ''}
      </div></div>${assistantBlock()}`;
    el.querySelector('[data-prep]')?.addEventListener('click', (e) => {
      const err = startPreparation(customer.id);
      if (err) {
        toast(err, 'error');
        shake(e.currentTarget);
        playSfx('error');
      } else playSfx('pop');
    });
    el.querySelector('[data-buy]')?.addEventListener('click', () => {
      playSfx('click');
      openInventory();
    });
    return;
  }

  if (prep.phase === 'brewing') {
    const pct = Math.min(100, (prep.elapsed / prep.total) * 100).toFixed(0);
    el.innerHTML = `${head}<div class="order-panel">${orderHead}
      <div class="bar prep-bar"><span data-prep-bar style="width:${pct}%"></span></div>
      <div class="row between"><span class="muted">Đang pha... ☕</span><button class="btn btn-sm btn-soft" data-cancel aria-label="Hủy pha">Hủy</button></div>
    </div>${assistantBlock()}`;
    el.querySelector('[data-cancel]').addEventListener('click', () => {
      cancelPreparation();
      toast('Đã hủy, nguyên liệu không hoàn lại', 'info');
    });
    return;
  }

  // phase timing
  el.innerHTML = `${head}<div class="order-panel">${orderHead}
    <div class="timing-label" data-timing-label>Bấm khi vạch ở vùng xanh đậm!</div>
    <div class="timing" aria-hidden="true"><div class="marker" data-marker></div></div>
    <button class="btn btn-warm btn-block" data-serve aria-label="Phục vụ">🥤 PHỤC VỤ!</button>
  </div>${assistantBlock()}`;
  const serveBtn = el.querySelector('[data-serve]');
  const doServe = () => {
    const result = serveCurrent();
    if (!result) return;
    showServeResult(result, serveBtn);
  };
  serveBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    doServe();
  });
  serveBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      doServe();
    }
  });
}

/** Hiệu ứng khi phục vụ xong. */
export function showServeResult(result, anchor) {
  const q = QUALITY[result.quality];
  const target = anchor || $('#counter');
  if (result.quality === 'FAILED') {
    floatText('FAILED 😖', target, 'red');
    toast('Pha hỏng rồi! Thử lại nhé', 'error');
    shake($('#counter'));
    return;
  }
  floatText(`${q.emoji} ${q.label}`, target, result.quality === 'PERFECT' ? 'green' : '');
  setTimeout(() => floatText(`+${formatMoney(result.money)}`, target), 180);
  if (result.tip) setTimeout(() => floatText(`Tip +${formatMoney(result.tip)}`, target, 'green'), 420);
  coinFly(target, result.quality === 'PERFECT' ? 8 : 5);
  const cEl = document.querySelector(`[data-cid="${result.customer?.id}"]`);
  if (cEl) hearts(cEl, result.quality === 'PERFECT' ? 4 : 2);
  if (result.quality === 'PERFECT') sparkle(target);
}

/** Mỗi frame: tiến trình pha + marker timing (không render lại DOM). */
export function updateCounterFrame() {
  const prep = gameState.shop.preparation;
  const el = document.getElementById('counter');
  if (!el) return;
  if (prep?.phase === 'brewing') {
    const bar = el.querySelector('[data-prep-bar]');
    if (bar) bar.style.width = `${Math.min(100, (prep.elapsed / prep.total) * 100).toFixed(1)}%`;
  } else if (prep?.phase === 'timing') {
    const marker = el.querySelector('[data-marker]');
    if (marker) {
      marker.style.left = `calc(${(prep.marker * 100).toFixed(2)}% - 3px)`;
      const label = el.querySelector('[data-timing-label]');
      const q = qualityForMarker(prep.marker);
      if (label && label.dataset.q !== q) {
        label.dataset.q = q;
        label.textContent = q === 'PERFECT' ? '🌟 NGAY BÂY GIỜ!' : q === 'GOOD' ? 'Tốt 👍' : q === 'OK' ? 'Tạm được' : 'Chưa phải lúc...';
      }
    }
  }
  const ap = gameState.shop.assistantPrep;
  const abar = el.querySelector('[data-assistant-bar]');
  if (ap && abar) abar.style.width = `${Math.min(100, (ap.elapsed / ap.total) * 100).toFixed(1)}%`;
  else if (!ap && abar && abar.style.width !== '0%') markDirty('counter');
}
