/** Bộ sưu tập nguyên liệu & công thức. */
import { INGREDIENTS, RECIPES, INGREDIENT_MAP, RECIPE_MAP, RARITY } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS, on } from '../events.js';

function entry(category, id) {
  const col = gameState.collection[category];
  if (!col[id]) col[id] = { discovered: false, count: 0 };
  return col[id];
}

/** Đánh dấu khám phá; phát DISCOVERY nếu lần đầu. */
export function discover(category, id) {
  const def = category === 'ingredients' ? INGREDIENT_MAP[id] : RECIPE_MAP[id];
  if (!def) return false;
  const e = entry(category, id);
  if (e.discovered) return false;
  e.discovered = true;
  markDirty('nav');
  emit(EVENTS.DISCOVERY, { category, item: def });
  return true;
}

export function recordUse(category, id) {
  const e = entry(category, id);
  e.count += 1;
  discover(category, id);
}

export function itemLevel(category, id) {
  return Math.floor((gameState.collection[category][id]?.count || 0) / 10) + 1;
}

/** Danh sách hiển thị theo category. */
export function listCollection(category) {
  const defs = category === 'ingredients' ? INGREDIENTS : RECIPES;
  return defs
    .map((def) => {
      const e = gameState.collection[category][def.id] || { discovered: false, count: 0 };
      return { ...def, discovered: e.discovered, count: e.count, level: Math.floor(e.count / 10) + 1, rarityName: RARITY[def.rarity].name };
    })
    .sort((a, b) => RARITY[a.rarity].order - RARITY[b.rarity].order);
}

export function collectionProgress() {
  const ing = listCollection('ingredients');
  const rec = listCollection('recipes');
  return {
    ingredients: { found: ing.filter((i) => i.discovered).length, total: ing.length },
    recipes: { found: rec.filter((r) => r.discovered).length, total: rec.length },
  };
}

export function allCommonIngredientsFound() {
  return INGREDIENTS.filter((i) => i.rarity === 'common').every((i) => gameState.collection.ingredients[i.id]?.discovered);
}

/** Đánh dấu các nguyên liệu/công thức có sẵn từ đầu là đã khám phá, không hiện modal. */
export function discoverStarting() {
  for (const [id, s] of Object.entries(gameState.inventory)) if (s.stock > 0 && INGREDIENT_MAP[id]) entry('ingredients', id).discovered = true;
  for (const [id, r] of Object.entries(gameState.recipes)) if (r.unlocked && RECIPE_MAP[id]) entry('recipes', id).discovered = true;
  markDirty('nav');
}

export function initCollectionSystem() {
  on(EVENTS.INGREDIENT_BOUGHT, ({ id }) => discover('ingredients', id));
  on(EVENTS.INGREDIENT_USED, ({ id }) => recordUse('ingredients', id));
  on(EVENTS.RECIPE_UNLOCKED, (recipe) => discover('recipes', recipe.id));
  on(EVENTS.LEVEL_UP, () => {
    for (const [id, s] of Object.entries(gameState.inventory)) if (s.stock > 0) discover('ingredients', id);
  });
}
