/**
 * Event bus trung tâm. Các system giao tiếp qua emit/on thay vì gọi trực tiếp lẫn nhau.
 */
const listeners = new Map();

/**
 * Đăng ký lắng nghe sự kiện.
 * @param {string} eventName
 * @param {(data:any)=>void} callback
 * @returns {() => void} hàm hủy đăng ký
 */
export function on(eventName, callback) {
  if (!listeners.has(eventName)) listeners.set(eventName, new Set());
  listeners.get(eventName).add(callback);
  return () => off(eventName, callback);
}

export function off(eventName, callback) {
  listeners.get(eventName)?.delete(callback);
}

/**
 * Phát sự kiện. Lỗi trong một listener không làm chết các listener khác hay game loop.
 * @param {string} eventName
 * @param {any} [data]
 */
export function emit(eventName, data) {
  const set = listeners.get(eventName);
  if (!set) return;
  for (const cb of [...set]) {
    try {
      cb(data);
    } catch (err) {
      console.error(`[EventBus] Lỗi listener "${eventName}":`, err);
    }
  }
}

export const EVENTS = {
  STATE_LOADED: 'STATE_LOADED',
  DAY_STARTED: 'DAY_STARTED',
  SHOP_OPENED: 'SHOP_OPENED',
  SHOP_CLOSED: 'SHOP_CLOSED',
  CUSTOMER_SPAWNED: 'CUSTOMER_SPAWNED',
  CUSTOMER_LEFT: 'CUSTOMER_LEFT',
  CUSTOMER_SERVED: 'CUSTOMER_SERVED',
  CUSTOMER_SELECTED: 'CUSTOMER_SELECTED',
  PREP_STARTED: 'PREP_STARTED',
  PREP_READY: 'PREP_READY',
  PREP_RESULT: 'PREP_RESULT',
  MONEY_EARNED: 'MONEY_EARNED',
  MONEY_SPENT: 'MONEY_SPENT',
  RATING_CHANGED: 'RATING_CHANGED',
  XP_GAINED: 'XP_GAINED',
  LEVEL_UP: 'LEVEL_UP',
  RECIPE_UNLOCKED: 'RECIPE_UNLOCKED',
  INGREDIENT_BOUGHT: 'INGREDIENT_BOUGHT',
  INGREDIENT_USED: 'INGREDIENT_USED',
  KARIN_BLESS: 'KARIN_BLESS',
  BUFF_ADDED: 'BUFF_ADDED',
  BUFF_EXPIRED: 'BUFF_EXPIRED',
  DELIVERY_STARTED: 'DELIVERY_STARTED',
  DELIVERY_COMPLETED: 'DELIVERY_COMPLETED',
  BRANCH_OPENED: 'BRANCH_OPENED',
  BRANCH_INCOME: 'BRANCH_INCOME',
  DISCOVERY: 'DISCOVERY',
  ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
  DAY_COMPLETED: 'DAY_COMPLETED',
  WEATHER_CHANGED: 'WEATHER_CHANGED',
  UPGRADE_BOUGHT: 'UPGRADE_BOUGHT',
  MINIGAME_FINISHED: 'MINIGAME_FINISHED',
  TOAST: 'TOAST',
  SAVE_DONE: 'SAVE_DONE',
  OFFLINE_PROGRESS: 'OFFLINE_PROGRESS',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  GAME_RESET: 'GAME_RESET',
  FARM_CHANGED: 'FARM_CHANGED',
  FARM_EVENT: 'FARM_EVENT',
};
