/** Modal giao hàng với bản đồ minh họa. */
import { gameState } from '../state.js';
import { RECIPE_MAP } from '../config.js';
import { html, esc, formatMoney, formatTime } from '../utils.js';
import { acceptOrder, dispatchPreparedOrder, freeVehicles, destinationOf } from '../systems/deliverySystem.js';
import { openModal } from './modalUI.js';
import { toast } from './toastUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { on, EVENTS } from '../events.js';

let current = null;

function render(body) {
  const d = gameState.delivery;
  const vehicles = ['🛵', '🚲', '🚗'];
  const map = `<div class="delivery-map" aria-label="Bản đồ giao hàng">
    <span class="cloud" style="animation-delay:-3s">☁️</span><span class="cloud" style="animation-delay:-9s">☁️</span>
    <span class="home">🏠</span><span class="dest">🏙️</span>
    <div class="road"></div>
    ${d.activeOrders.map((o, i) => `<span class="vehicle v${(i % 3) + 1}" data-vehicle="${o.id}" style="left:${(8 + o.progress * 84).toFixed(1)}%">${vehicles[i % 3]}</span>`).join('')}
  </div>`;
  const active = d.activeOrders.length
    ? d.activeOrders.map((o) => {
        const dest = destinationOf(o);
        return `<div class="summary-row"><span>${dest.icon} ${esc(dest.name)}</span><span data-eta="${o.id}">${formatTime(o.duration * (1 - o.progress))}</span><span class="money">${formatMoney(o.reward)}</span></div>`;
      }).join('')
    : '<p class="muted center">Chưa có xe nào đang chạy</p>';
  const avail = d.availableOrders.length
    ? d.availableOrders.map((o) => {
        const dest = destinationOf(o);
        const r = RECIPE_MAP[o.recipeId];
        return `<div class="upgrade-row"><span class="ico">${dest.icon}</span>
          <div class="grow"><div class="bold">${esc(dest.name)}</div><div class="muted">${esc(o.customer)} · ${r?.icon || ''} ${esc(r?.name || '')} · ${formatTime(o.duration)}</div></div>
          <button class="btn btn-sm btn-warm" data-accept="${o.id}" ${freeVehicles() <= 0 ? 'disabled' : ''} aria-label="Nhận đơn">${formatMoney(o.reward)}</button></div>`;
      }).join('')
    : `<p class="muted center">${gameState.shop.dayStarted ? 'Hết đơn hôm nay. Mở cửa ngày mai để nhận thêm!' : 'Mở cửa tiệm để nhận đơn giao hàng 🛵'}</p>`;
  const prepared = (d.preparedOrders || []).length
    ? d.preparedOrders.map((o) => {
        const dest = destinationOf(o);
        const recipe = RECIPE_MAP[o.recipeId];
        return `<div class="upgrade-row prepared-delivery"><span class="ico">${recipe?.icon || '🥤'}</span>
          <div class="grow"><div class="bold">${esc(dest.name)}</div><div class="muted">${esc(o.customer)} · ${esc(recipe?.name || '')} · Cỡ ${o.cupSize || 'M'}</div></div>
          <button class="btn btn-sm btn-primary" data-dispatch="${o.id}" ${freeVehicles() <= 0 ? 'disabled' : ''}>🛵 Giao · ${formatMoney(o.reward)}</button></div>`;
      }).join('')
    : '<p class="muted center">Chưa có đơn online đã pha xong.</p>';
  body.innerHTML = `${map}
    <div class="row between"><span class="bold">🛵 Xe rảnh: ${freeVehicles()}/${d.vehicles}</span><span class="muted">Đã giao: ${gameState.stats.deliveriesDone}</span></div>
    <h3>📦 Đơn đã đóng nắp · Sẵn sàng giao</h3>${prepared}
    <h3>Đang giao</h3>${active}
    <h3>Đơn chờ nhận</h3>${avail}`;
  for (const btn of body.querySelectorAll('[data-accept]')) {
    btn.addEventListener('click', () => {
      const err = acceptOrder(Number(btn.dataset.accept));
      if (err) {
        toast(err, 'error');
        playSfx('error');
      } else {
        playSfx('success');
        toast('Xe đã xuất phát! 🛵', 'success');
        render(body);
      }
    });
  }
  for (const btn of body.querySelectorAll('[data-dispatch]')) {
    btn.addEventListener('click', () => {
      const err = dispatchPreparedOrder(Number(btn.dataset.dispatch));
      if (err) { toast(err, 'error'); playSfx('error'); }
      else { playSfx('success'); toast('Tài xế đã nhận đơn và lên đường! 🛵', 'success'); render(body); }
    });
  }
}

export function openDelivery() {
  if (current) return;
  const body = html('<div class="col"></div>');
  render(body);
  current = openModal({ title: '🛵 Giao hàng', body, id: 'delivery', onClose: () => (current = null) });
}

/** Mỗi frame: cập nhật vị trí xe trên bản đồ. */
let tick = 0;
export function updateDeliveryFrame(dt) {
  if (!current) return;
  tick += dt;
  if (tick < 0.3) return;
  tick = 0;
  for (const o of gameState.delivery.activeOrders) {
    const v = current.body.querySelector(`[data-vehicle="${o.id}"]`);
    if (v) v.style.left = `${(8 + o.progress * 84).toFixed(1)}%`;
    const eta = current.body.querySelector(`[data-eta="${o.id}"]`);
    if (eta) eta.textContent = formatTime(o.duration * (1 - o.progress));
  }
}

export function initDeliveryUI() {
  on(EVENTS.DELIVERY_COMPLETED, ({ order, reward }) => {
    toast(`📦 Giao xong ${destinationOf(order).name}: +${formatMoney(reward)}`, 'gold');
    if (current) render(current.body);
  });
  on(EVENTS.SHOP_OPENED, () => current && render(current.body));
}
