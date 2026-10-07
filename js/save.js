/**
 * Lưu/tải game bằng LocalStorage. Nếu storage lỗi, game chạy memory-only.
 */
import { SAVE_KEY, SAVE_VERSION, INGREDIENTS, RECIPES } from './config.js';
import { gameState, createInitialState, replaceState, markAllDirty } from './state.js';
import { emit, EVENTS } from './events.js';

let storageOk = true;
let pendingSave = null;

function getStorage() {
  if (!storageOk) return null;
  try {
    const s = window.localStorage;
    s.getItem(SAVE_KEY);
    return s;
  } catch (err) {
    storageOk = false;
    console.warn('[Save] LocalStorage không khả dụng, chạy memory-only.', err);
    return null;
  }
}

/** Lưu game ngay lập tức. */
export function saveGame() {
  const storage = getStorage();
  gameState.lastPlayed = Date.now();
  if (!storage) return false;
  try {
    const payload = { version: SAVE_VERSION, timestamp: Date.now(), state: gameState };
    storage.setItem(SAVE_KEY, JSON.stringify(payload));
    emit(EVENTS.SAVE_DONE);
    return true;
  } catch (err) {
    console.warn('[Save] Lưu thất bại:', err);
    return false;
  }
}

/** Lưu gộp: nhiều transaction liên tiếp chỉ ghi một lần sau 800ms. */
export function requestSave() {
  if (pendingSave) return;
  pendingSave = setTimeout(() => {
    pendingSave = null;
    saveGame();
  }, 800);
}

/**
 * Nâng cấp save cũ lên version hiện tại.
 * @param {object} saved
 */
function migrate(saved) {
  let state = saved.state || saved;
  const version = saved.version || state.version || 0;
  if (version < 1) {
    state = { ...createInitialState(), ...state };
  }
  state.version = SAVE_VERSION;
  return state;
}

/** Bổ sung field còn thiếu (khi config có thêm nguyên liệu/công thức mới). */
function normalize(state) {
  const fresh = createInitialState();
  const merged = { ...fresh, ...state };
  merged.shop = { ...fresh.shop, ...(state.shop || {}) };
  merged.upgrades = { ...fresh.upgrades, ...(state.upgrades || {}) };
  merged.delivery = { ...fresh.delivery, ...(state.delivery || {}) };
  merged.delivery.preparedOrders = Array.isArray(state.delivery?.preparedOrders) ? state.delivery.preparedOrders : [];
  merged.delivery.activeOrders = Array.isArray(state.delivery?.activeOrders) ? state.delivery.activeOrders : [];
  merged.delivery.availableOrders = Array.isArray(state.delivery?.availableOrders) ? state.delivery.availableOrders : [];
  merged.collection = { ingredients: {}, recipes: {}, ...(state.collection || {}) };
  merged.stats = { ...fresh.stats, ...(state.stats || {}) };
  merged.karin = { ...fresh.karin, ...(state.karin || {}) };
  merged.settings = { ...fresh.settings, ...(state.settings || {}) };
  merged.farm = { ...fresh.farm, ...(state.farm || {}), upgrades: { ...fresh.farm.upgrades, ...(state.farm?.upgrades || {}) }, animals: { ...fresh.farm.animals, ...(state.farm?.animals || {}) }, buildings: { ...fresh.farm.buildings, ...(state.farm?.buildings || {}) } };
  merged.farm.plots = Array.isArray(state.farm?.plots) ? state.farm.plots.slice(0, fresh.farm.plots.length) : fresh.farm.plots;
  while (merged.farm.plots.length < fresh.farm.plots.length) merged.farm.plots.push(null);
  merged.tutorial = { ...fresh.tutorial, ...(state.tutorial || {}) };
  merged.inventory = { ...fresh.inventory };
  for (const ing of INGREDIENTS) {
    const old = state.inventory?.[ing.id];
    if (old) merged.inventory[ing.id] = { stock: Math.max(0, Number(old.stock) || 0), unlocked: !!old.unlocked };
  }
  merged.recipes = { ...fresh.recipes };
  for (const r of RECIPES) {
    const old = state.recipes?.[r.id];
    if (old) merged.recipes[r.id] = { unlocked: !!old.unlocked, made: Number(old.made) || 0 };
  }
  // Khách trong tiệm và pha chế dở không được khôi phục: ngày tiếp tục với tiệm đang đóng.
  merged.shop.customers = [];
  merged.shop.preparation = null;
  merged.shop.assistantPrep = null;
  merged.shop.selectedCustomerId = null;
  merged.shop.isOpen = false;
  merged.buffs = {};
  merged.money = Math.max(0, Number(merged.money) || 0);
  merged.rating = Math.min(5, Math.max(1, Number(merged.rating) || 4.5));
  return merged;
}

/**
 * Tải game. @returns {{loaded:boolean, elapsed:number}}
 */
export function loadGame() {
  const storage = getStorage();
  if (!storage) return { loaded: false, elapsed: 0 };
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return { loaded: false, elapsed: 0 };
    const saved = JSON.parse(raw);
    const state = normalize(migrate(saved));
    const elapsed = Math.max(0, (Date.now() - (saved.timestamp || state.lastPlayed || Date.now())) / 1000);
    replaceState(state);
    markAllDirty();
    emit(EVENTS.STATE_LOADED, gameState);
    return { loaded: true, elapsed };
  } catch (err) {
    console.warn('[Save] Save hỏng, bắt đầu game mới.', err);
    return { loaded: false, elapsed: 0 };
  }
}

/** Xóa save và đặt lại state về ban đầu. */
export function resetGame() {
  const storage = getStorage();
  try {
    storage?.removeItem(SAVE_KEY);
  } catch (err) {
    console.warn('[Save] Không xóa được save:', err);
  }
  replaceState(createInitialState());
  markAllDirty();
  emit(EVENTS.GAME_RESET);
  emit(EVENTS.STATE_LOADED, gameState);
}

export function isStorageAvailable() {
  return !!getStorage();
}
