/** Lịch: ngày, mùa, sự kiện theo ngày, bắt đầu/kết thúc ngày. */
import { SEASONS, SEASON_ORDER, DAYS_PER_SEASON, DAY_CONFIG } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { rollWeather } from './weatherSystem.js';
import { addBuff, clearDailyBuffs } from './buffSystem.js';
import { dailyCustomerTarget } from './customerSystem.js';
import { clearPreparations } from './recipeSystem.js';
import { chance } from '../utils.js';
import { saveGame } from '../save.js';
import { advanceFarmDay } from './farmSystem.js';

export function seasonForDay(day) {
  return SEASON_ORDER[Math.floor((day - 1) / DAYS_PER_SEASON) % SEASON_ORDER.length];
}

export function getSeason() {
  return SEASONS[gameState.season] || SEASONS.spring;
}

export function isFestivalDay() {
  return gameState.day % DAY_CONFIG.festivalEvery === 0;
}

/** Thiết lập ngày hiện tại (gọi khi game bắt đầu lần đầu hoặc sang ngày). */
export function setupDay(rollNewWeather = true) {
  const shop = gameState.shop;
  gameState.season = seasonForDay(gameState.day);
  document.documentElement.dataset.season = gameState.season;
  clearDailyBuffs();
  if (rollNewWeather) rollWeather();
  shop.isOpen = false;
  shop.dayStarted = false;
  shop.customers = [];
  shop.servedToday = 0;
  shop.leftToday = 0;
  shop.happyToday = 0;
  shop.revenueToday = 0;
  shop.xpToday = 0;
  shop.ratingStart = gameState.rating;
  shop.targetCustomers = dailyCustomerTarget();
  shop.spawnedToday = 0;
  shop.spawnTimer = 1.5;
  shop.selectedCustomerId = null;
  shop.happyHourTriggered = false;
  shop.preparation = null;
  shop.assistantPrep = null;
  gameState.stats.minigamePlaysToday = 0;
  if (isFestivalDay()) addBuff('festivalBonus');
  if (chance(DAY_CONFIG.luckyDayChance)) addBuff('luckyDay');
  markDirty('hud', 'customers', 'counter', 'actions', 'scene', 'buffs', 'nav');
  emit(EVENTS.DAY_STARTED, { day: gameState.day, season: gameState.season, festival: isFestivalDay() });
}

/** Tổng kết ngày hiện tại (để hiển thị). */
export function daySummary() {
  const shop = gameState.shop;
  return {
    day: gameState.day,
    revenue: shop.revenueToday,
    served: shop.servedToday,
    happy: shop.happyToday,
    left: shop.leftToday,
    ratingDelta: gameState.rating - shop.ratingStart,
    xp: shop.xpToday,
  };
}

/** Khôi phục ngày đang dở sau khi load: giữ thời tiết/số liệu, chỉ thiết lập lại buff theo ngày. */
export function resumeDay() {
  const shop = gameState.shop;
  gameState.season = seasonForDay(gameState.day);
  document.documentElement.dataset.season = gameState.season;
  if (!shop.targetCustomers) shop.targetCustomers = dailyCustomerTarget();
  if (gameState.weather === 'rain') addBuff('rainBonus');
  if (isFestivalDay()) addBuff('festivalBonus');
  markDirty('hud', 'customers', 'counter', 'actions', 'scene', 'buffs', 'nav');
}

/** Sau khi load, ngày đã hết khách (chỉ còn tổng kết)? */
export function isDayFinishedOnLoad() {
  const shop = gameState.shop;
  return shop.dayStarted && shop.spawnedToday >= shop.targetCustomers && shop.customers.length === 0;
}

/** Chuyển sang ngày mới. */
export function nextDay() {
  advanceFarmDay();
  clearPreparations();
  gameState.shop.isOpen = false;
  gameState.day += 1;
  setupDay(true);
  saveGame();
}
