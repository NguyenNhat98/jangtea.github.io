/** Main-screen barista station: recipe, cup size, toppings, brewing, sealing and handoff. */
import { gameState, markDirty } from '../state.js';
import { INGREDIENTS, INGREDIENT_MAP, RECIPES, RECIPE_MAP, DELIVERY_DESTINATIONS, QUALITY } from '../config.js';
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
import { openDelivery } from './deliveryUI.js';

const TOPPING_IDS = new Set(['pearl', 'lychee', 'fruit', 'honey', 'rose', 'mint', 'ginger', 'chrysanthemum', 'jasmine', 'snowpearl', 'lemon', 'peach']);
let benchCustomerId = null;
let selectedRecipeId = null;
let selectedCupSize = 'M';
let selectedToppings = new Set();
let sealing = false;
let droppingTopping = null;
let toppingAnimationTimer = null;

function assistantBlock() {
  const lvl = getUpgradeLevel('assistant');
  if (lvl <= 0) return '';
  const prep = gameState.shop.assistantPrep;
  const recipe = prep ? RECIPE_MAP[prep.recipeId] : null;
  const pct = prep ? Math.min(100, (prep.elapsed / prep.total) * 100).toFixed(0) : 0;
  return `<div class="assistant-slot" data-assistant>👩‍🍳 Trợ lý: ${prep ? `${recipe?.icon || ''} ${esc(recipe?.name || '')}` : 'đang rảnh'}<span class="bar"><span data-assistant-bar style="width:${pct}%"></span></span></div>`;
}

function syncWorkbench(customer) {
  const id = customer?.id ?? null;
  if (benchCustomerId !== id) {
    benchCustomerId = id;
    selectedRecipeId = customer?.order?.recipeId || null;
    selectedCupSize = customer?.order?.cupSize || 'M';
    selectedToppings = new Set();
    sealing = false;
  }
  if (customer && !selectedRecipeId) selectedRecipeId = customer.order.recipeId;
}

function renderWorkbench(customer, recipe, prep) {
  const recipes = RECIPES;
  const recipeCards = recipes.map((item) => {
    const locked = !gameState.recipes[item.id]?.unlocked;
    return `<button class="tea-choice${selectedRecipeId === item.id ? ' active' : ''}${locked ? ' locked' : ''}" data-tea="${item.id}" title="${esc(item.name)}${locked ? ' · Mở ở cấp ' + item.unlockLevel : ''}" ${prep || locked ? 'disabled' : ''}><span class="tea-vessel" style="--tea-color:${drinkColor(item.id)}"><i></i></span><b>${esc(item.name)}</b>${locked ? '<small>🔒 ' + item.unlockLevel + '</small>' : ''}</button>`;
  }).join('');
  const toppings = INGREDIENTS.filter((item) => TOPPING_IDS.has(item.id)).map((item) => {
    const stock = getStock(item.id);
    const active = selectedToppings.has(item.id);
    const locked = !gameState.inventory[item.id]?.unlocked;
    return `<button class="topping-choice${active ? ' active' : ''}${locked ? ' locked' : ''}" data-topping="${item.id}" title="${esc(item.name)}${locked ? ' · Mở ở cấp ' + item.unlockLevel : ' · Bấm để thêm hoặc bỏ'}" ${prep || locked || stock <= (recipe?.ingredients[item.id] || 0) ? 'disabled' : ''}><span class="topping-fill topping-${item.id}">${locked ? '🔒' : item.icon}</span><b>${esc(item.name)}</b><small>${locked ? 'Cấp ' + item.unlockLevel : '×' + stock}</small></button>`;
  }).join('');
  const sizeChoices = [['S', 'Nhỏ', '×0.9'], ['M', 'Vừa', 'Giá gốc'], ['L', 'Lớn', '+25%']].map(([id, label, price]) => `<button class="cup-size${selectedCupSize === id ? ' active' : ''}" data-size="${id}" ${prep ? 'disabled' : ''}><b>${id}</b><span>${label}</span><small>${price}</small></button>`).join('');
  const selectedRecipe = RECIPE_MAP[selectedRecipeId];
  const mismatch = customer && selectedRecipeId !== customer.order.recipeId;
  const visibleToppings = new Set([...selectedToppings, ...(prep ? Object.keys(prep.ingredients || {}).filter((id) => TOPPING_IDS.has(id)) : [])]);
  const toppingsList = [...visibleToppings].map((id) => `<i class="cup-bit topping-${id}">${INGREDIENT_MAP[id]?.icon || ''}</i>`).join('');
  const progress = prep?.phase === 'brewing' ? Math.min(88, prep.elapsed / prep.total * 88) : prep?.phase === 'timing' ? 88 : 0;
  return `<section class="barista-station" aria-label="Trạm pha chế">
    <div class="station-heading"><div><span class="station-kicker">TRẠM BARISTA</span><b>${customer ? 'Pha theo order của khách' : 'Chọn món trên menu'}</b></div><span class="station-status">${prep?.phase === 'brewing' ? '🫖 Đang rót' : prep?.phase === 'timing' ? '🧢 Đóng nắp' : '● Sẵn sàng'}</span></div>
    <div class="tea-menu" aria-label="Chọn loại trà">${recipeCards || '<span class="muted">Chưa mở khóa món nào.</span>'}</div><div class="counter-machine" aria-hidden="true"><span>TIỆM TRÀ</span><i>🧋</i><b>● ●</b><div></div></div>
    <div class="station-options"><div class="size-picker"><span class="station-label">CỠ LY</span>${sizeChoices}</div><div class="topping-picker"><span class="station-label">TOPPING</span><div class="topping-list">${toppings || '<small class="muted">Chưa có topping trong kho</small>'}</div></div></div>
    <div class="brew-bench"><span class="bench-label">PHA LY</span><div class="cup-stage ${prep?.phase === 'brewing' ? 'pouring' : ''} ${prep?.phase === 'timing' ? 'cup-ready' : ''} ${sealing ? 'sealing' : ''}" style="--tea-color:${drinkColor(selectedRecipeId)}">
      <div class="pour-pitcher" aria-hidden="true"></div><div class="cup-lid"></div><div class="cup-glass"><div class="cup-liquid" data-liquid style="height:${progress}%"></div><span class="cup-ingredients">${toppingsList}</span><span class="cup-size-label">${prep?.cupSize || selectedCupSize}</span></div><div class="pour-stream"></div><div class="tea-splash" aria-hidden="true"></div>${droppingTopping ? `<div class="topping-drop" aria-hidden="true"><span>${INGREDIENT_MAP[droppingTopping]?.icon || ''}</span><span>${INGREDIENT_MAP[droppingTopping]?.icon || ''}</span><span>${INGREDIENT_MAP[droppingTopping]?.icon || ''}</span></div>` : ''}
    </div><div class="cup-build-copy"><b>${prep?.phase === 'brewing' ? 'Đang rót trà vào ly…' : prep?.phase === 'timing' ? 'Ly đã pha xong!' : selectedRecipe?.name || 'Ly trà của bạn'}</b><small>Đường & đá tự động</small></div></div>
    <div class="guest-order"><div class="guest-portrait" aria-hidden="true">${customer?.avatar || '👩🏻'}<span>QUẦY TRÀ</span></div>${customer ? `<div class="station-ticket ${customer.order.channel === 'online' ? 'online-ticket' : ''}"><span>${customer.order.channel === 'online' ? '📱 ĐƠN ONLINE' : esc(customer.name)}</span><b>Cho mình ${customer.order.quantity || 1} ly ${esc(recipe?.name || '')} size ${customer.order.cupSize || 'M'} nhé!</b><small>${customer.order.destination ? 'Giao đến: ' + esc(DELIVERY_DESTINATIONS.find((destination) => destination.id === customer.order.destination)?.name || customer.order.destination) : ''}${customer.order.specialRequest ? ' · ' + esc(specialRequestName(customer.order.specialRequest)) : 'Cảm ơn bạn!'}<div class="guest-patience"><i data-guest-patience style="width:${Math.max(0, customer.patience / customer.maxPatience * 100)}%"></i></div></small></div>` : '<div class="station-ticket"><span>TIỆM TRÀ MƠ ƯỚC</span><b>Mời bạn mở cửa và chọn khách để nhận món.</b><small>Một ly trà ngon, một ngày dịu dàng.</small></div>'}</div>
    <div class="station-guide" role="status">${prep?.phase === 'brewing' ? 'Đang rót trà · chờ ly đầy nhé' : prep?.phase === 'timing' ? 'Canh vạch giữa để đóng nắp và giao khách' : 'Chọn trà, cỡ ly và topping · sau đó rót trà'}</div>
    ${mismatch ? `<p class="station-warning">Khách đang gọi ${esc(recipe?.name || 'món khác')}. Chọn đúng món để pha nhé.</p>` : ''}
    ${customer && !prep ? `<div class="station-controls"><button class="btn btn-primary btn-block" data-prep ${mismatch || customer.handledBy === 'assistant' ? 'disabled' : ''}>🫖 Rót trà vào ly</button>${Object.entries(recipe?.ingredients || {}).some(([id, qty]) => getStock(id) < qty) ? '<button class="btn btn-warm" data-buy>🛒 Mua nguyên liệu</button>' : ''}</div>` : ''}
    ${prep?.phase === 'brewing' ? `<div class="station-controls"><div class="bar prep-bar"><span data-prep-bar style="width:${progress}%"></span></div><button class="btn btn-sm btn-soft" data-cancel>Hủy ly</button></div>` : ''}
    ${prep?.phase === 'timing' ? `<div class="timing-label" data-timing-label>Ly đã đầy · Đóng nắp để chuyển cho khách</div><div class="timing" aria-hidden="true"><div class="marker" data-marker></div></div><button class="btn btn-warm btn-block seal-button" data-seal ${sealing ? 'disabled' : ''}>${sealing ? '🧢 Đang đóng nắp…' : '🧢 Đóng nắp & giao khách'}</button>` : ''}
    ${assistantBlock()}
  </section>`;
}

export function renderCounter() {
  const el = document.getElementById('counter');
  if (!el) return;
  const shop = gameState.shop;
  const prep = shop.preparation;
  const customer = prep ? shop.customers.find((item) => item.id === prep.customerId) : getSelectedCustomer();
  syncWorkbench(customer);
  const recipe = customer ? RECIPE_MAP[customer.order.recipeId] : RECIPE_MAP[selectedRecipeId];
  if (customer && !recipe) { el.innerHTML = '<div class="counter-idle">Không tìm thấy công thức cho order này.</div>'; return; }
  el.innerHTML = `<div class="counter-title"><span>🥤 QUẦY PHA CHẾ</span><span>${prep ? 'Đang pha…' : customer ? 'Order mới' : 'Mời chọn món'}</span></div>${renderWorkbench(customer, recipe, prep)}`;

  el.querySelectorAll('[data-tea]').forEach((button) => button.addEventListener('click', () => {
    selectedRecipeId = button.dataset.tea;
    playSfx('click');
    renderCounter();
  }));
  el.querySelectorAll('[data-size]').forEach((button) => button.addEventListener('click', () => {
    selectedCupSize = button.dataset.size;
    playSfx('click');
    renderCounter();
  }));
  el.querySelectorAll('[data-topping]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.topping;
    clearTimeout(toppingAnimationTimer);
    if (selectedToppings.has(id)) { selectedToppings.delete(id); droppingTopping = null; }
    else { selectedToppings.add(id); droppingTopping = id; }
    playSfx('pop');
    renderCounter();
    toppingAnimationTimer = setTimeout(() => {
      droppingTopping = null;
      document.querySelector('.topping-drop')?.remove();
    }, 700);
  }));
  el.querySelector('[data-prep]')?.addEventListener('click', (event) => {
    const err = startPreparation(customer.id, { cupSize: selectedCupSize, toppings: [...selectedToppings] });
    if (err) { toast(err, 'error'); shake(event.currentTarget); playSfx('error'); }
    else { droppingTopping = null; playSfx('pour'); }
  });
  el.querySelector('[data-buy]')?.addEventListener('click', () => { playSfx('click'); openInventory(); });
  el.querySelector('[data-cancel]')?.addEventListener('click', () => { cancelPreparation(); selectedToppings.clear(); playSfx('click'); });
  el.querySelector('[data-seal]')?.addEventListener('click', (event) => {
    if (sealing) return;
    sealing = true;
    event.currentTarget.disabled = true;
    el.querySelector('.cup-stage')?.classList.add('sealing');
    el.querySelector('.cup-lid')?.classList.add('lid-drop');
    event.currentTarget.textContent = '🧢 Đang đóng nắp…';
    playSfx('lid');
    const sealedPrep = gameState.shop.preparation;
    const sealedMarker = sealedPrep?.marker;
    setTimeout(() => {
      if (gameState.shop.preparation !== sealedPrep) { sealing = false; return; }
      sealedPrep.marker = sealedMarker;
      const result = serveCurrent();
      sealing = false;
      if (!result) return;
      selectedToppings.clear();
      playSfx('handoff');
      showServeResult(result, el);
      if (result.onlineOrder) {
        toast('Đơn đã đóng nắp, chuyển sang danh sách giao hàng!', 'success', 3000);
        openDelivery();
      }
    }, 620);
  });
}

export function showServeResult(result, anchor) {
  const q = QUALITY[result.quality];
  const target = anchor || $('#counter');
  if (result.quality === 'FAILED') {
    floatText('FAILED 😖', target, 'red'); toast('Pha chưa chuẩn, mình thử ly khác nhé.', 'error'); shake($('#counter')); return;
  }
  floatText(`${q.emoji} ${q.label}`, target, result.quality === 'PERFECT' ? 'green' : '');
  setTimeout(() => floatText(result.onlineOrder ? 'Đã vào hàng chờ giao 🛵' : 'Đã chuyển cho khách 🥤', target, 'green'), 180);
  if (result.money) setTimeout(() => floatText(`+${formatMoney(result.money)}`, target), 300);
  if (result.tip) setTimeout(() => floatText(`Tip +${formatMoney(result.tip)}`, target, 'green'), 520);
  coinFly(target, result.quality === 'PERFECT' ? 8 : 5);
  const customerEl = document.querySelector(`[data-cid="${result.customer?.id}"]`);
  if (customerEl) hearts(customerEl, result.quality === 'PERFECT' ? 4 : 2);
  if (result.quality === 'PERFECT') sparkle(target);
  target.classList.add('handoff-flash');
  setTimeout(() => target.classList.remove('handoff-flash'), 650);
}

export function updateCounterFrame() {
  const prep = gameState.shop.preparation;
  const el = document.getElementById('counter');
  if (!el) return;
  if (prep?.phase === 'brewing') {
    const pct = Math.min(100, (prep.elapsed / prep.total) * 100);
    const bar = el.querySelector('[data-prep-bar]');
    const liquid = el.querySelector('[data-liquid]');
    if (bar) bar.style.width = `${pct.toFixed(1)}%`;
    if (liquid) liquid.style.height = `${pct * .88}%`;
  } else if (prep?.phase === 'timing') {
    const marker = el.querySelector('[data-marker]');
    if (marker) marker.style.left = `calc(${(prep.marker * 100).toFixed(2)}% - 3px)`;
    const label = el.querySelector('[data-timing-label]');
    const quality = qualityForMarker(prep.marker);
    if (label && label.dataset.q !== quality) {
      label.dataset.q = quality;
      label.textContent = quality === 'PERFECT' ? '🌟 Đóng nắp ngay lúc này!' : quality === 'GOOD' ? 'Rất tốt · đóng nắp nào!' : quality === 'OK' ? 'Đóng nắp để hoàn tất' : 'Canh nhịp đóng nắp nhé';
    }
  }
  const customer = prep ? gameState.shop.customers.find((item) => item.id === prep.customerId) : getSelectedCustomer();
  const patience = el.querySelector('[data-guest-patience]');
  if (patience && customer) patience.style.width = `${Math.max(0, customer.patience / customer.maxPatience * 100)}%`;
  const assistantPrep = gameState.shop.assistantPrep;
  const assistantBar = el.querySelector('[data-assistant-bar]');
  if (assistantPrep && assistantBar) assistantBar.style.width = `${Math.min(100, (assistantPrep.elapsed / assistantPrep.total) * 100).toFixed(1)}%`;
  else if (!assistantPrep && assistantBar && assistantBar.style.width !== '0%') markDirty('counter');
}

function drinkColor(id) {
  if (/matcha/i.test(id || '')) return '#95ab65';
  if (/milk|latte/i.test(id || '')) return '#c9a77e';
  if (/rose|fruit/i.test(id || '')) return '#d89a95';
  return '#d3a253';
}
