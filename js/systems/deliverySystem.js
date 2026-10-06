/** Giao hàng: đơn phát sinh mỗi ngày, xe giao, thưởng. */
import { DELIVERY_DESTINATIONS, DELIVERY_CONFIG, WEATHERS, DAY_CONFIG } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS, on } from '../events.js';
import { addMoney, addXp, isFeatureUnlocked } from './economySystem.js';
import { getMultiplier } from './buffSystem.js';
import { unlockedRecipes } from './recipeSystem.js';
import { pick, randInt, rand } from '../utils.js';
import { requestSave } from '../save.js';

export function freeVehicles() {
  return Math.max(0, gameState.delivery.vehicles - gameState.delivery.activeOrders.length);
}

/** Tạo danh sách đơn chờ cho ngày hôm nay. */
export function generateDailyOrders() {
  if (!isFeatureUnlocked('delivery')) return;
  const d = gameState.delivery;
  const weather = WEATHERS[gameState.weather] || WEATHERS.sunny;
  const count = Math.round((DELIVERY_CONFIG.baseOrdersPerDay + randInt(0, 2) + Math.floor(gameState.level / 3)) * weather.deliveryMul);
  d.availableOrders = [];
  const growth = 1 + DELIVERY_CONFIG.rewardGrowthPerDay * gameState.day;
  for (let i = 0; i < count; i++) {
    const dest = pick(DELIVERY_DESTINATIONS);
    const recipe = pick(unlockedRecipes());
    d.availableOrders.push({
      id: d.nextId++,
      customer: pick(['Chị Hạnh', 'Anh Tùng', 'Cô Mai', 'Bé Bo', 'Thầy Hùng', 'Nhóm văn phòng']),
      destination: dest.id,
      recipeId: recipe?.id,
      duration: Math.round(dest.duration * rand(0.85, 1.15)),
      reward: Math.round((dest.reward * growth * rand(0.9, 1.2)) / 1000) * 1000,
      status: 'waiting',
      progress: 0,
    });
  }
  markDirty('nav');
}

/** Nhận đơn: cần xe rảnh. @returns {string|null} lỗi */
export function acceptOrder(orderId) {
  const d = gameState.delivery;
  const idx = d.availableOrders.findIndex((o) => o.id === orderId);
  if (idx < 0) return 'Đơn không còn';
  if (freeVehicles() <= 0) return 'Không còn xe rảnh';
  const [order] = d.availableOrders.splice(idx, 1);
  order.status = 'delivering';
  order.progress = 0;
  order.startedAt = Date.now();
  d.activeOrders.push(order);
  emit(EVENTS.DELIVERY_STARTED, order);
  markDirty('nav');
  requestSave();
  return null;
}

function completeOrder(order) {
  order.status = 'completed';
  const reward = Math.round(order.reward * getMultiplier('deliveryMultiplier'));
  const got = addMoney(reward, 'delivery', true);
  addXp(DAY_CONFIG.xpPerServe * 1.5);
  gameState.stats.deliveriesDone += 1;
  emit(EVENTS.DELIVERY_COMPLETED, { order, reward: got });
  markDirty('nav');
  requestSave();
}

export function updateDelivery(dt) {
  const d = gameState.delivery;
  if (!d.activeOrders.length) return;
  for (const o of d.activeOrders) o.progress = Math.min(1, o.progress + dt / o.duration);
  const done = d.activeOrders.filter((o) => o.progress >= 1);
  if (done.length) {
    d.activeOrders = d.activeOrders.filter((o) => o.progress < 1);
    for (const o of done) completeOrder(o);
  }
}

/** Debug: hoàn thành ngay tất cả đơn. */
export function completeAllDeliveries() {
  for (const o of gameState.delivery.activeOrders) o.progress = 1;
  updateDelivery(0);
}

export function destinationOf(order) {
  return DELIVERY_DESTINATIONS.find((x) => x.id === order.destination) || DELIVERY_DESTINATIONS[0];
}

export function initDeliverySystem() {
  on(EVENTS.SHOP_OPENED, () => generateDailyOrders());
  on(EVENTS.DAY_STARTED, () => {
    gameState.delivery.availableOrders = [];
  });
}
