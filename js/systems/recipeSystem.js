/** Công thức, pha chế, mini-game timing và phục vụ. */
import { RECIPES, RECIPE_MAP, INGREDIENT_MAP, DELIVERY_DESTINATIONS, QUALITY, DAY_CONFIG } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { hasIngredients, missingIngredients, useIngredients } from './inventorySystem.js';
import { addMoney, addXp, changeRating, prepTimeMultiplier, getUpgradeLevel } from './economySystem.js';
import { getAdditive } from './buffSystem.js';
import { recordUse } from './collectionSystem.js';
import { chance } from '../utils.js';
import { requestSave } from '../save.js';

const TIMING_SPEED = 1.1; // chu kỳ marker chạy hết thanh (giây)

export function getRecipe(id) {
  return RECIPE_MAP[id] || null;
}

export function isRecipeUnlocked(id) {
  return !!gameState.recipes[id]?.unlocked;
}

export function listRecipes() {
  return RECIPES.map((r) => ({ ...r, unlocked: isRecipeUnlocked(r.id), made: gameState.recipes[r.id]?.made || 0, missing: missingIngredients(r.ingredients) }));
}

export function unlockedRecipes() {
  return RECIPES.filter((r) => isRecipeUnlocked(r.id));
}

/** Mở khóa công thức theo level. @returns {object[]} công thức vừa mở */
export function unlockRecipesForLevel(level) {
  const out = [];
  for (const r of RECIPES) {
    if (!gameState.recipes[r.id]) gameState.recipes[r.id] = { unlocked: false, made: 0 };
    if (!gameState.recipes[r.id].unlocked && r.unlockLevel <= level) {
      gameState.recipes[r.id].unlocked = true;
      out.push(r);
      emit(EVENTS.RECIPE_UNLOCKED, r);
    }
  }
  if (out.length) markDirty('nav');
  return out;
}

export function unlockAllRecipes() {
  for (const r of RECIPES) {
    if (!gameState.recipes[r.id]?.unlocked) {
      gameState.recipes[r.id] = { unlocked: true, made: gameState.recipes[r.id]?.made || 0 };
      emit(EVENTS.RECIPE_UNLOCKED, r);
    }
  }
  markDirty('nav');
}

function findCustomer(id) {
  return gameState.shop.customers.find((c) => c.id === id) || null;
}

/**
 * Bắt đầu pha cho khách đang chọn. @returns {string|null} lỗi
 */
export function startPreparation(customerId, options = {}) {
  const shop = gameState.shop;
  if (shop.preparation) return 'Đang pha dở một ly';
  const customer = findCustomer(customerId);
  if (!customer || !customer.order) return 'Không có khách';
  if (customer.state === 'leaving' || customer.state === 'served') return 'Khách đã rời đi';
  if (customer.handledBy === 'assistant') return 'Trợ lý đang pha cho khách này';
  const recipe = getRecipe(customer.order.recipeId);
  if (!recipe) return 'Công thức không tồn tại';
  const ingredients = { ...recipe.ingredients };
  for (const id of options.toppings || []) {
    if (INGREDIENT_MAP[id]) ingredients[id] = (ingredients[id] || 0) + 1;
  }
  if (!hasIngredients(ingredients)) return 'Thiếu nguyên liệu';
  useIngredients(ingredients);
  customer.state = 'preparing';
  customer.handledBy = 'player';
  shop.preparation = {
    customerId,
    recipeId: recipe.id,
    total: recipe.preparationTime * prepTimeMultiplier(),
    elapsed: 0,
    phase: 'brewing',
    marker: 0,
    markerDir: 1,
    ingredients,
    toppings: (options.toppings || []).filter((id) => INGREDIENT_MAP[id]),
    cupSize: ['S', 'M', 'L'].includes(options.cupSize) ? options.cupSize : 'M',
  };
  markDirty('counter', 'customers');
  emit(EVENTS.PREP_STARTED, { customer, recipe });
  return null;
}

/** Hủy pha dở (nguyên liệu đã dùng không hoàn lại). */
export function cancelPreparation() {
  const prep = gameState.shop.preparation;
  if (!prep) return;
  const c = findCustomer(prep.customerId);
  if (c && c.state === 'preparing') {
    c.state = 'waiting';
    c.handledBy = null;
  }
  gameState.shop.preparation = null;
  markDirty('counter', 'customers');
}

/** Kết quả theo vị trí marker (0..1): vùng PERFECT ở giữa. */
export function qualityForMarker(pos) {
  const d = Math.abs(pos - 0.5);
  if (d <= 0.045) return 'PERFECT';
  if (d <= 0.17) return 'GOOD';
  if (d <= 0.32) return 'OK';
  return 'FAILED';
}

/** Người chơi bấm "Phục vụ" khi ly đã pha xong. */
export function serveCurrent() {
  const prep = gameState.shop.preparation;
  if (!prep || prep.phase !== 'timing') return null;
  const quality = qualityForMarker(prep.marker);
  const result = completeServe(prep.customerId, prep.recipeId, quality, 'player', { cupSize: prep.cupSize });
  gameState.shop.preparation = null;
  markDirty('counter', 'customers');
  return result;
}

/**
 * Hoàn tất phục vụ: tính tiền, rating, xp, cập nhật khách.
 * @returns {{quality:string, money:number, customer:object, recipe:object, tip:number}|null}
 */
export function completeServe(customerId, recipeId, quality, by, options = {}) {
  const customer = findCustomer(customerId);
  const recipe = getRecipe(recipeId);
  const q = QUALITY[quality] || QUALITY.OK;
  if (!recipe) return null;
  const shop = gameState.shop;
  const qty = customer?.order?.quantity || 1;
  const cupSize = ['S', 'M', 'L'].includes(options.cupSize) ? options.cupSize : 'M';
  const sizeMultiplier = cupSize === 'L' ? 1.25 : cupSize === 'S' ? 0.9 : 1;
  const isOnline = customer?.order?.channel === 'online';
  let money = 0;
  let tip = 0;
  let onlineOrder = null;
  if (q.mul > 0) {
    const base = recipe.price * qty * q.mul * (customer?.vip ? customer.tipMul : 1) * sizeMultiplier;
    if (isOnline) {
      const destination = DELIVERY_DESTINATIONS.find((d) => d.id === customer.order.destination) || DELIVERY_DESTINATIONS[0];
      const delivery = gameState.delivery;
      delivery.preparedOrders ||= [];
      onlineOrder = {
        id: delivery.nextId++, customer: customer.name, recipeId, destination: destination.id,
        duration: customer.order.deliveryDuration || destination.duration,
        reward: Math.max(1000, Math.round((customer.order.deliveryReward || destination.reward) * qty * sizeMultiplier * q.mul * (customer?.vip ? customer.tipMul : 1))),
        status: 'prepared', progress: 0, quality, cupSize,
      };
      delivery.preparedOrders.push(onlineOrder);
    } else {
      money = addMoney(base, 'serve', true);
      if (chance(getAdditive('tipChance')) || (quality === 'PERFECT' && chance(0.25))) {
        tip = addMoney(Math.round(recipe.price * 0.3 * sizeMultiplier), 'tip', false);
      }
    }
    gameState.recipes[recipeId].made += 1;
    recordUse('recipes', recipeId);
    gameState.stats.totalServed += 1;
    shop.servedToday += 1;
    if (quality !== 'OK') shop.happyToday += 1;
    if (quality === 'PERFECT') gameState.stats.perfectCount += 1;
  }
  changeRating(q.rating);
  addXp(DAY_CONFIG.xpPerServe * q.xp * qty);

  if (customer) {
    customer.handledBy = null;
    if (q.mul > 0) {
      customer.state = quality === 'OK' ? 'served' : 'happy';
      customer.satisfaction = quality;
      customer.leaveTimer = 0.9;
    } else {
      // Pha hỏng: khách vẫn chờ nhưng mất kiên nhẫn, có thể pha lại.
      customer.state = 'waiting';
      customer.patience = Math.max(0.1, customer.patience - 6);
      customer.satisfaction = 'FAILED';
    }
  }
  const result = { quality, money, tip, customer, recipe, by, onlineOrder, cupSize };
  emit(EVENTS.PREP_RESULT, result);
  if (q.mul > 0) emit(EVENTS.CUSTOMER_SERVED, result);
  if (onlineOrder) markDirty('nav');
  markDirty('customers', 'counter', 'hud', 'actions');
  requestSave();
  return result;
}

/** Cập nhật pha chế của người chơi. */
function updatePlayerPrep(dt) {
  const prep = gameState.shop.preparation;
  if (!prep) return;
  if (prep.phase === 'brewing') {
    prep.elapsed += dt;
    if (prep.elapsed >= prep.total) {
      prep.phase = 'timing';
      prep.marker = 0;
      prep.markerDir = 1;
      emit(EVENTS.PREP_READY, prep);
      markDirty('counter');
    }
  } else if (prep.phase === 'timing') {
    prep.marker += (prep.markerDir * dt) / TIMING_SPEED;
    if (prep.marker >= 1) {
      prep.marker = 1;
      prep.markerDir = -1;
    } else if (prep.marker <= 0) {
      prep.marker = 0;
      prep.markerDir = 1;
    }
  }
  const c = findCustomer(prep.customerId);
  if (!c || c.state === 'leaving') {
    gameState.shop.preparation = null;
    markDirty('counter');
  }
}

/** Trợ lý tự chọn khách đang chờ và pha với chất lượng GOOD. */
function updateAssistant(dt) {
  const lvl = getUpgradeLevel('assistant');
  const shop = gameState.shop;
  if (lvl <= 0) {
    shop.assistantPrep = null;
    return;
  }
  if (shop.assistantPrep) {
    const prep = shop.assistantPrep;
    prep.elapsed += dt;
    const c = findCustomer(prep.customerId);
    if (!c || c.state === 'leaving') {
      shop.assistantPrep = null;
      markDirty('counter');
      return;
    }
    if (prep.elapsed >= prep.total) {
      completeServe(prep.customerId, prep.recipeId, 'GOOD', 'assistant');
      shop.assistantPrep = null;
      markDirty('counter');
    }
    return;
  }
  if (!shop.isOpen) return;
  const candidate = shop.customers.find(
    (c) => c.state === 'waiting' && c.order?.channel !== 'online' && c.id !== shop.selectedCustomerId && c.id !== shop.preparation?.customerId && hasIngredients(getRecipe(c.order.recipeId)?.ingredients || { none: 1 }),
  );
  if (!candidate) return;
  const recipe = getRecipe(candidate.order.recipeId);
  useIngredients(recipe.ingredients);
  candidate.state = 'preparing';
  candidate.handledBy = 'assistant';
  const speed = 1.6 - 0.2 * (lvl - 1);
  shop.assistantPrep = { customerId: candidate.id, recipeId: recipe.id, total: recipe.preparationTime * speed, elapsed: 0 };
  markDirty('counter', 'customers');
}

export function updateRecipeSystem(dt) {
  updatePlayerPrep(dt);
  updateAssistant(dt);
}

/** Dùng khi ngày kết thúc / tiệm đóng. */
export function clearPreparations() {
  gameState.shop.preparation = null;
  gameState.shop.assistantPrep = null;
  markDirty('counter');
}
