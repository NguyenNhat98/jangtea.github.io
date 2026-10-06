/** Khách hàng: xuất hiện, kiên nhẫn, rời đi, mở/đóng tiệm. */
import { CUSTOMER_CONFIG, CUSTOMER_NAMES, CUSTOMER_AVATARS, SEASON_VIPS, WEATHERS, DAY_CONFIG, RATING_LEAVE_PENALTY } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { generateOrder } from './orderSystem.js';
import { changeRating, getUpgradeLevel } from './economySystem.js';
import { getMultiplier, addBuff } from './buffSystem.js';
import { pick, chance, clamp } from '../utils.js';
import { requestSave } from '../save.js';

const LEAVE_ANIM = 0.5;

export function maxSeats() {
  return CUSTOMER_CONFIG.baseSeats + getUpgradeLevel('seats');
}

export function maxPatience() {
  return (CUSTOMER_CONFIG.basePatience + 5 * getUpgradeLevel('decor')) * getMultiplier('patienceMultiplier');
}

/** Số khách mục tiêu trong ngày. */
export function dailyCustomerTarget() {
  const n = DAY_CONFIG.baseCustomers + Math.floor(gameState.day * DAY_CONFIG.customersPerDay) + gameState.level * DAY_CONFIG.customersPerLevel;
  return Math.min(DAY_CONFIG.maxCustomers, n);
}

function spawnInterval() {
  const weather = WEATHERS[gameState.weather] || WEATHERS.sunny;
  const ratingMul = 1 + (gameState.rating - 4) * 0.1;
  const signMul = 1 + 0.1 * getUpgradeLevel('sign');
  const mul = weather.spawnMul * ratingMul * signMul * getMultiplier('spawnMultiplier');
  return Math.max(CUSTOMER_CONFIG.minSpawnInterval, CUSTOMER_CONFIG.baseSpawnInterval / mul);
}

/** Tạo khách mới vào tiệm. */
export function spawnCustomer(force = false) {
  const shop = gameState.shop;
  const active = shop.customers.filter((c) => c.state !== 'leaving');
  if (!force && active.length >= maxSeats()) return null;
  const vipDef = SEASON_VIPS[gameState.season];
  const vip = vipDef && chance(CUSTOMER_CONFIG.vipChance);
  const patience = maxPatience();
  const customer = {
    id: shop.nextCustomerId++,
    name: vip ? vipDef.name : pick(CUSTOMER_NAMES),
    avatar: vip ? vipDef.avatar : pick(CUSTOMER_AVATARS),
    vip: !!vip,
    tipMul: vip ? vipDef.tipMul : 1,
    patience,
    maxPatience: patience,
    order: generateOrder(),
    state: 'waiting',
    arrivalTime: Date.now(),
    satisfaction: null,
    handledBy: null,
    leaveTimer: 0,
  };
  shop.customers.push(customer);
  shop.spawnedToday += 1;
  markDirty('customers', 'actions');
  emit(EVENTS.CUSTOMER_SPAWNED, customer);
  return customer;
}

/** Khách rời tiệm vì hết kiên nhẫn. */
function customerGivesUp(customer) {
  customer.state = 'leaving';
  customer.leaveTimer = LEAVE_ANIM;
  customer.satisfaction = 'angry';
  gameState.shop.leftToday += 1;
  gameState.stats.totalLeft += 1;
  changeRating(-RATING_LEAVE_PENALTY);
  if (gameState.shop.selectedCustomerId === customer.id) gameState.shop.selectedCustomerId = null;
  markDirty('customers', 'counter', 'actions');
  emit(EVENTS.CUSTOMER_LEFT, customer);
}

export function selectCustomer(id) {
  const c = gameState.shop.customers.find((x) => x.id === id);
  if (!c || c.state === 'leaving') return;
  gameState.shop.selectedCustomerId = id;
  markDirty('customers', 'counter');
  emit(EVENTS.CUSTOMER_SELECTED, c);
}

export function getSelectedCustomer() {
  const id = gameState.shop.selectedCustomerId;
  return gameState.shop.customers.find((c) => c.id === id && c.state !== 'leaving') || null;
}

/** Cộng kiên nhẫn cho toàn bộ khách đang chờ (Karin). */
export function addPatienceAll(seconds) {
  for (const c of gameState.shop.customers) {
    if (c.state === 'leaving' || c.state === 'served' || c.state === 'happy') continue;
    c.maxPatience = Math.max(c.maxPatience, c.patience + seconds);
    c.patience = clamp(c.patience + seconds, 0, c.maxPatience);
  }
}

export function openShop() {
  const shop = gameState.shop;
  if (shop.isOpen) return;
  shop.isOpen = true;
  shop.dayStarted = true;
  shop.spawnTimer = 1.2;
  if (!shop.targetCustomers) shop.targetCustomers = dailyCustomerTarget();
  markDirty('actions', 'customers', 'counter');
  emit(EVENTS.SHOP_OPENED);
  requestSave();
}

export function closeShop() {
  if (!gameState.shop.isOpen) return;
  gameState.shop.isOpen = false;
  markDirty('actions');
  emit(EVENTS.SHOP_CLOSED);
}

/** Đã hết khách trong ngày và tiệm trống? */
export function isDayFinished() {
  const shop = gameState.shop;
  return shop.dayStarted && shop.spawnedToday >= shop.targetCustomers && shop.customers.length === 0;
}

export function updateCustomerSystem(dt) {
  const shop = gameState.shop;
  // Khách xuất hiện
  if (shop.isOpen && shop.spawnedToday < shop.targetCustomers) {
    shop.spawnTimer -= dt;
    if (shop.spawnTimer <= 0) {
      if (spawnCustomer()) shop.spawnTimer = spawnInterval();
      else shop.spawnTimer = 0.8;
    }
  }
  // Happy hour một lần mỗi ngày khi đã phục vụ đủ khách
  if (shop.isOpen && !shop.happyHourTriggered && shop.servedToday >= DAY_CONFIG.happyHourAt) {
    shop.happyHourTriggered = true;
    addBuff('happyHour');
  }
  // Kiên nhẫn
  let dirtyList = false;
  for (const c of shop.customers) {
    if (c.state === 'waiting' || c.state === 'preparing') {
      c.patience -= dt;
      if (c.patience <= 0) {
        c.patience = 0;
        customerGivesUp(c);
        dirtyList = true;
      }
    } else if (c.state === 'served' || c.state === 'happy') {
      c.leaveTimer -= dt;
      if (c.leaveTimer <= 0) {
        c.state = 'leaving';
        c.leaveTimer = LEAVE_ANIM;
        if (shop.selectedCustomerId === c.id) shop.selectedCustomerId = null;
        dirtyList = true;
      }
    } else if (c.state === 'leaving') {
      c.leaveTimer -= dt;
    }
  }
  const before = shop.customers.length;
  shop.customers = shop.customers.filter((c) => !(c.state === 'leaving' && c.leaveTimer <= 0));
  if (shop.customers.length !== before || dirtyList) markDirty('customers', 'counter', 'actions');
  if (shop.isOpen && isDayFinished()) {
    closeShop();
    emit(EVENTS.DAY_COMPLETED);
  }
}

/** Mức độ tâm trạng để hiển thị. */
export function moodOf(customer) {
  const r = customer.maxPatience > 0 ? customer.patience / customer.maxPatience : 1;
  if (customer.state === 'happy') return 'happy';
  if (customer.state === 'served') return 'ok';
  if (customer.state === 'leaving') return customer.satisfaction === 'angry' ? 'angry' : 'happy';
  if (r <= 0.1) return 'angry';
  if (r <= 0.3) return 'impatient';
  if (r <= 0.6) return 'neutral';
  return 'fine';
}
