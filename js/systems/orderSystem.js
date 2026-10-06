/** Sinh order cho khách dựa trên công thức đã mở và thời tiết. */
import { WEATHERS, SPECIAL_REQUESTS, CUSTOMER_CONFIG } from '../config.js';
import { gameState } from '../state.js';
import { unlockedRecipes } from './recipeSystem.js';
import { hasIngredients } from './inventorySystem.js';
import { pick, chance, weightedPick } from '../utils.js';

/**
 * Tạo order: ưu tiên món có nguyên liệu, lệch theo thời tiết.
 * @returns {{recipeId:string, quantity:number, specialRequest:string|null}}
 */
export function generateOrder() {
  const recipes = unlockedRecipes();
  const weather = WEATHERS[gameState.weather] || WEATHERS.sunny;
  const weights = {};
  for (const r of recipes) {
    let w = 1;
    if (r.temp === 'cold') w += weather.coldBias * 5 - weather.hotBias * 2;
    if (r.temp === 'hot') w += weather.hotBias * 5 - weather.coldBias * 2;
    // Nhẹ nhàng ưu tiên món có thể pha để ngày đầu không bế tắc.
    if (hasIngredients(r.ingredients)) w *= 1.6;
    weights[r.id] = Math.max(0.15, w);
  }
  const recipeId = weightedPick(weights) || recipes[0]?.id;
  const quantity = gameState.level >= 3 && chance(0.15) ? 2 : 1;
  const specialRequest = chance(CUSTOMER_CONFIG.specialRequestChance) ? pick(SPECIAL_REQUESTS).id : null;
  return { recipeId, quantity, specialRequest };
}

export function specialRequestName(id) {
  return SPECIAL_REQUESTS.find((s) => s.id === id)?.name || '';
}
