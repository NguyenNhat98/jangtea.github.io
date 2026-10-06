/** Tiến độ offline: thu nhập chi nhánh trong lúc vắng mặt. */
import { gameState } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { offlineIncome } from './branchSystem.js';
import { addMoney } from './economySystem.js';

/**
 * Áp dụng tiến độ offline sau khi load.
 * @param {number} elapsedSeconds
 */
export function applyOfflineProgress(elapsedSeconds) {
  if (elapsedSeconds < 60 || !gameState.branches.length) return null;
  const { seconds, amount } = offlineIncome(elapsedSeconds);
  if (amount <= 0) return null;
  addMoney(amount, 'offline', false);
  const result = { seconds, amount };
  emit(EVENTS.OFFLINE_PROGRESS, result);
  return result;
}
