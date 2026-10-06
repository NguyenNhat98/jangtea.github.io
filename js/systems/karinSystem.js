/** Karin – linh vật hỗ trợ với kỹ năng "Xin Phước". */
import { KARIN } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { addPatienceAll } from './customerSystem.js';
import { addMoney } from './economySystem.js';
import { addBuff } from './buffSystem.js';
import { requestSave } from '../save.js';

export function karinReady() {
  return gameState.karin.cooldown <= 0;
}

/** Dùng kỹ năng. @returns {boolean} thành công */
export function bless() {
  if (!karinReady()) return false;
  gameState.karin.cooldown = KARIN.cooldown;
  gameState.karin.blessCount += 1;
  addPatienceAll(KARIN.patienceBonus);
  const money = addMoney(KARIN.luckyMoney, 'karin', false);
  addBuff('karinBlessing');
  markDirty('karin', 'customers');
  emit(EVENTS.KARIN_BLESS, { patience: KARIN.patienceBonus, money });
  requestSave();
  return true;
}

export function updateKarin(dt) {
  if (gameState.karin.cooldown > 0) {
    gameState.karin.cooldown = Math.max(0, gameState.karin.cooldown - dt);
    if (gameState.karin.cooldown === 0) markDirty('karin');
  }
}
