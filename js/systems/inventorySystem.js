/** Kho nguyên liệu: mua, dùng, mở khóa, sức chứa. */
import { INGREDIENTS, INGREDIENT_MAP } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { spendMoney } from './economySystem.js';
import { requestSave } from '../save.js';

function slot(id) {
  if (!gameState.inventory[id]) gameState.inventory[id] = { stock: 0, unlocked: false };
  return gameState.inventory[id];
}

export function getStock(id) {
  const s = gameState.inventory[id];
  if (!s) return 0;
  if (s.stock < 0) s.stock = 0;
  return s.stock;
}

export function getMaxStock(id) {
  const def = INGREDIENT_MAP[id];
  if (!def) return 0;
  return def.maxStock + 10 * (gameState.upgrades.storage || 0);
}

export function isUnlocked(id) {
  return !!gameState.inventory[id]?.unlocked;
}

/** Danh sách nguyên liệu đã mở khóa kèm số lượng. */
export function listIngredients() {
  return INGREDIENTS.map((def) => ({ ...def, stock: getStock(def.id), maxStock: getMaxStock(def.id), unlocked: isUnlocked(def.id) }));
}

/** Mở khóa nguyên liệu theo level hiện tại. @returns {string[]} id vừa mở */
export function unlockIngredientsForLevel(level) {
  const unlocked = [];
  for (const def of INGREDIENTS) {
    const s = slot(def.id);
    if (!s.unlocked && def.unlockLevel <= level) {
      s.unlocked = true;
      unlocked.push(def.id);
    }
  }
  return unlocked;
}

/** Kiểm tra đủ nguyên liệu cho một công thức. @returns {string[]} id thiếu */
export function missingIngredients(ingredients) {
  return Object.entries(ingredients).filter(([id, qty]) => getStock(id) < qty).map(([id]) => id);
}

export function hasIngredients(ingredients) {
  return missingIngredients(ingredients).length === 0;
}

/** Trừ nguyên liệu, trả về false nếu thiếu. */
export function useIngredients(ingredients) {
  if (!hasIngredients(ingredients)) return false;
  for (const [id, qty] of Object.entries(ingredients)) {
    slot(id).stock = Math.max(0, getStock(id) - qty);
    emit(EVENTS.INGREDIENT_USED, { id, qty });
  }
  markDirty('counter');
  requestSave();
  return true;
}

/** Cộng nguyên liệu (thưởng). Tự clamp theo sức chứa. */
export function addIngredient(id, qty) {
  const def = INGREDIENT_MAP[id];
  if (!def || qty <= 0) return 0;
  const s = slot(id);
  s.unlocked = true;
  const before = s.stock;
  s.stock = Math.min(getMaxStock(id), s.stock + qty);
  markDirty('counter');
  requestSave();
  return s.stock - before;
}

/** Mua nguyên liệu. @returns {string|null} lỗi hoặc null */
export function buyIngredient(id, qty) {
  const def = INGREDIENT_MAP[id];
  if (!def) return 'Nguyên liệu không tồn tại';
  if (!isUnlocked(id)) return `Cần đạt cấp ${def.unlockLevel}`;
  const room = getMaxStock(id) - getStock(id);
  const amount = Math.min(qty, room);
  if (amount <= 0) return 'Kho đã đầy';
  const cost = def.cost * amount;
  if (!spendMoney(cost, 'ingredient')) return 'Không đủ tiền';
  slot(id).stock += amount;
  emit(EVENTS.INGREDIENT_BOUGHT, { id, qty: amount, cost });
  markDirty('counter');
  requestSave();
  return null;
}

/** Giá nguyên liệu của một công thức. */
export function ingredientCost(ingredients) {
  return Object.entries(ingredients).reduce((s, [id, q]) => s + (INGREDIENT_MAP[id]?.cost || 0) * q, 0);
}
