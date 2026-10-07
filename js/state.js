/**
 * GameState: nguồn dữ liệu duy nhất (source of truth). UI chỉ đọc từ đây.
 */
import { SAVE_VERSION, INGREDIENTS, RECIPES, DELIVERY_CONFIG, FARM_CONFIG } from './config.js';

const STARTING_INVENTORY = { tea: 10, milk: 6, sugar: 10, ice: 10, lemon: 5, peach: 4 };

/** @returns {object} state mới cho game mới */
export function createInitialState() {
  const inventory = {};
  for (const ing of INGREDIENTS) {
    inventory[ing.id] = { stock: STARTING_INVENTORY[ing.id] || 0, unlocked: ing.unlockLevel <= 1 };
  }
  const recipes = {};
  for (const r of RECIPES) recipes[r.id] = { unlocked: r.unlockLevel <= 1, made: 0 };

  return {
    version: SAVE_VERSION,
    day: 1,
    season: 'spring',
    weather: 'sunny',
    temperature: 25,
    money: 100000,
    rating: 4.5,
    experience: 0,
    level: 1,
    shop: {
      isOpen: false,
      dayStarted: false,
      customers: [],
      servedToday: 0,
      leftToday: 0,
      happyToday: 0,
      revenueToday: 0,
      xpToday: 0,
      ratingStart: 4.5,
      targetCustomers: 0,
      spawnedToday: 0,
      spawnTimer: 2,
      nextCustomerId: 1,
      preparation: null,
      assistantPrep: null,
      selectedCustomerId: null,
      happyHourTriggered: false,
    },
    upgrades: { counter: 0, sign: 0, decor: 0, seats: 0, storage: 0, vehicle: 0, assistant: 0 },
    inventory,
    recipes,
    delivery: { vehicles: DELIVERY_CONFIG.baseVehicles, activeOrders: [], availableOrders: [], preparedOrders: [], nextId: 1 },
    branches: [],
    collection: { ingredients: {}, recipes: {} },
    buffs: {},
    karin: { cooldown: 0, blessCount: 0 },
    achievements: {},
    farm: { plots: Array.from({ length: FARM_CONFIG.plots }, () => null), water: 8, fertilizer: 3, pesticide: 2, lands: [], buildings: {}, animals: { butterfly: 0, dragonfly: 0, chicken: 0 }, upgrades: { greenhouse: 0, drainage: 0 } },
    stats: { totalEarned: 0, totalServed: 0, totalLeft: 0, perfectCount: 0, deliveriesDone: 0, minigamePlaysToday: 0, bestMinigameScore: 0 },
    tutorial: { done: false, step: 0 },
    settings: { sound: true, music: true },
    lastPlayed: Date.now(),
  };
}

export const gameState = createInitialState();

/** Thay thế toàn bộ nội dung state (giữ nguyên tham chiếu object). */
export function replaceState(newState) {
  for (const key of Object.keys(gameState)) delete gameState[key];
  Object.assign(gameState, newState);
}

const dirty = new Set();

/** Đánh dấu phần UI cần render lại ở frame tiếp theo. */
export function markDirty(...keys) {
  for (const k of keys) dirty.add(k);
}

/** Lấy và xóa danh sách dirty. */
export function consumeDirty() {
  const out = [...dirty];
  dirty.clear();
  return out;
}

export function markAllDirty() {
  markDirty('hud', 'customers', 'counter', 'karin', 'actions', 'nav', 'buffs', 'scene');
}
