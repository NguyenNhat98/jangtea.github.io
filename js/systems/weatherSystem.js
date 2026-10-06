/** Thời tiết theo mùa và ảnh hưởng gameplay. */
import { SEASONS, WEATHERS } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { weightedPick, randInt } from '../utils.js';
import { addBuff, removeBuff } from './buffSystem.js';

/** Quay thời tiết mới cho ngày hiện tại. */
export function rollWeather() {
  const season = SEASONS[gameState.season] || SEASONS.spring;
  const id = weightedPick(season.weathers) || 'sunny';
  const [lo, hi] = season.temp;
  let temp = randInt(lo, hi);
  if (id === 'hot') temp = hi + randInt(0, 3);
  if (id === 'cold') temp = lo - randInt(0, 3);
  if (id === 'rain') temp -= 2;
  gameState.weather = id;
  gameState.temperature = temp;
  if (id === 'rain') addBuff('rainBonus');
  else removeBuff('rainBonus');
  markDirty('hud', 'scene');
  emit(EVENTS.WEATHER_CHANGED, getWeather());
  return getWeather();
}

export function getWeather() {
  return WEATHERS[gameState.weather] || WEATHERS.sunny;
}

export function weatherLabel() {
  const w = getWeather();
  const s = SEASONS[gameState.season];
  return `${w.icon} ${s.name} · ${gameState.temperature}°C`;
}
