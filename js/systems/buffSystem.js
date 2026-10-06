/** Buff generic: {id, name, duration, effects}. */
import { BUFFS } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';

/**
 * Thêm buff (làm mới thời gian nếu đã có).
 * @param {string} buffId key trong BUFFS
 */
export function addBuff(buffId) {
  const def = BUFFS[buffId];
  if (!def) return;
  gameState.buffs[buffId] = { id: buffId, remaining: def.duration };
  markDirty('buffs');
  emit(EVENTS.BUFF_ADDED, def);
}

export function removeBuff(buffId) {
  if (!gameState.buffs[buffId]) return;
  delete gameState.buffs[buffId];
  markDirty('buffs');
  emit(EVENTS.BUFF_EXPIRED, BUFFS[buffId]);
}

export function hasBuff(buffId) {
  return !!gameState.buffs[buffId];
}

/**
 * Nhân toàn bộ hệ số của các buff đang hoạt động.
 * @param {'patienceMultiplier'|'moneyMultiplier'|'deliveryMultiplier'|'spawnMultiplier'} key
 */
export function getMultiplier(key) {
  let mul = 1;
  for (const id of Object.keys(gameState.buffs)) {
    const v = BUFFS[id]?.effects?.[key];
    if (typeof v === 'number') mul *= v;
  }
  return mul;
}

/** Tổng của các effect dạng xác suất (ví dụ tipChance). */
export function getAdditive(key) {
  let sum = 0;
  for (const id of Object.keys(gameState.buffs)) {
    const v = BUFFS[id]?.effects?.[key];
    if (typeof v === 'number') sum += v;
  }
  return sum;
}

/** Xóa các buff theo ngày (duration 9999) khi sang ngày mới. */
export function clearDailyBuffs() {
  for (const id of Object.keys(gameState.buffs)) {
    if (BUFFS[id]?.duration >= 9999) delete gameState.buffs[id];
  }
  markDirty('buffs');
}

export function updateBuffs(dt) {
  let changed = false;
  for (const [id, b] of Object.entries(gameState.buffs)) {
    if (BUFFS[id]?.duration >= 9999) continue;
    b.remaining -= dt;
    if (b.remaining <= 0) {
      delete gameState.buffs[id];
      emit(EVENTS.BUFF_EXPIRED, BUFFS[id]);
      changed = true;
    }
  }
  if (changed) markDirty('buffs');
}

/** Danh sách buff đang hoạt động để hiển thị. */
export function listBuffs() {
  return Object.values(gameState.buffs).map((b) => ({ ...BUFFS[b.id], remaining: b.remaining }));
}
