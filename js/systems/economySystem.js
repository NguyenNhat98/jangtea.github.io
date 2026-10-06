/** Tiền, rating, XP, level và nâng cấp tiệm. */
import { LEVELS, MAX_LEVEL, UPGRADES, UPGRADE_COST_GROWTH, FEATURE_LEVELS } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { clamp } from '../utils.js';
import { getMultiplier } from './buffSystem.js';
import { requestSave } from '../save.js';

/**
 * Cộng tiền (đã nhân buff nếu applyBuff).
 * @returns {number} số tiền thực nhận
 */
export function addMoney(amount, source = 'other', applyBuff = false) {
  let value = Math.round(amount);
  if (applyBuff) value = Math.round(value * getMultiplier('moneyMultiplier'));
  if (value <= 0) return 0;
  gameState.money += value;
  gameState.stats.totalEarned += value;
  if (gameState.shop.isOpen || gameState.shop.dayStarted) gameState.shop.revenueToday += value;
  markDirty('hud');
  emit(EVENTS.MONEY_EARNED, { amount: value, source });
  requestSave();
  return value;
}

export function canAfford(amount) {
  return gameState.money >= amount;
}

/** Trừ tiền, trả về false nếu không đủ. */
export function spendMoney(amount, source = 'other') {
  const value = Math.round(amount);
  if (value <= 0) return true;
  if (gameState.money < value) return false;
  gameState.money -= value;
  markDirty('hud');
  emit(EVENTS.MONEY_SPENT, { amount: value, source });
  requestSave();
  return true;
}

export function changeRating(delta) {
  const before = gameState.rating;
  gameState.rating = clamp(gameState.rating + delta, 1, 5);
  if (gameState.rating !== before) {
    markDirty('hud');
    emit(EVENTS.RATING_CHANGED, { delta: gameState.rating - before, rating: gameState.rating });
  }
}

export function xpForLevel(level) {
  return LEVELS[Math.min(level, MAX_LEVEL)]?.xp ?? Infinity;
}

/** Tiến độ XP trong level hiện tại: {current,next,ratio}. */
export function xpProgress() {
  const cur = xpForLevel(gameState.level);
  const next = gameState.level >= MAX_LEVEL ? cur : xpForLevel(gameState.level + 1);
  const ratio = next > cur ? clamp((gameState.experience - cur) / (next - cur), 0, 1) : 1;
  return { current: cur, next, ratio };
}

/** Cộng XP, tự động lên level và trao thưởng. */
export function addXp(amount) {
  const value = Math.round(amount);
  if (value <= 0) return;
  gameState.experience += value;
  if (gameState.shop.dayStarted) gameState.shop.xpToday += value;
  emit(EVENTS.XP_GAINED, value);
  while (gameState.level < MAX_LEVEL && gameState.experience >= xpForLevel(gameState.level + 1)) {
    gameState.level += 1;
    const info = LEVELS[gameState.level];
    const reward = info?.reward || {};
    if (reward.money) {
      gameState.money += reward.money;
      gameState.stats.totalEarned += reward.money;
    }
    const items = reward.items || {};
    for (const [id, qty] of Object.entries(items)) {
      const slot = gameState.inventory[id];
      if (slot) {
        slot.stock += qty;
        slot.unlocked = true;
      }
    }
    emit(EVENTS.LEVEL_UP, { level: gameState.level, reward, note: info?.note || '' });
  }
  markDirty('hud', 'nav', 'actions');
  requestSave();
}

export function isFeatureUnlocked(feature) {
  return gameState.level >= (FEATURE_LEVELS[feature] ?? 1);
}

export function getUpgradeDef(id) {
  return UPGRADES.find((u) => u.id === id);
}

export function getUpgradeLevel(id) {
  return gameState.upgrades[id] || 0;
}

export function getUpgradeCost(id) {
  const def = getUpgradeDef(id);
  if (!def) return Infinity;
  return Math.round(def.baseCost * Math.pow(UPGRADE_COST_GROWTH, getUpgradeLevel(id)) / 1000) * 1000;
}

/** Mua nâng cấp. @returns {string|null} thông báo lỗi hoặc null nếu thành công */
export function buyUpgrade(id) {
  const def = getUpgradeDef(id);
  if (!def) return 'Nâng cấp không tồn tại';
  if (gameState.level < def.unlockLevel) return `Cần đạt cấp ${def.unlockLevel}`;
  if (getUpgradeLevel(id) >= def.maxLevel) return 'Đã đạt cấp tối đa';
  const cost = getUpgradeCost(id);
  if (!spendMoney(cost, 'upgrade')) return 'Không đủ tiền';
  gameState.upgrades[id] = getUpgradeLevel(id) + 1;
  if (id === 'vehicle') gameState.delivery.vehicles += 1;
  emit(EVENTS.UPGRADE_BOUGHT, { id, level: gameState.upgrades[id], def });
  markDirty('hud', 'counter', 'actions');
  requestSave();
  return null;
}

/** Hệ số thời gian pha chế từ nâng cấp quầy. */
export function prepTimeMultiplier() {
  return Math.max(0.5, 1 - 0.08 * getUpgradeLevel('counter'));
}
