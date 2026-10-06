/** Thành tựu: kiểm tra điều kiện khi có sự kiện liên quan. */
import { ACHIEVEMENTS } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS, on } from '../events.js';
import { addMoney, addXp } from './economySystem.js';
import { allCommonIngredientsFound } from './collectionSystem.js';
import { requestSave } from '../save.js';

const CONDITIONS = {
  firstServe: (s) => s.stats.totalServed >= 1,
  earn100k: (s) => s.stats.totalEarned >= 100000,
  serve100: (s) => s.stats.totalServed >= 100,
  perfectDay: (s) => s.shop.dayStarted && !s.shop.isOpen && s.shop.servedToday >= 5 && s.shop.leftToday === 0,
  recipes10: (s) => Object.values(s.recipes).filter((r) => r.unlocked).length >= 10,
  firstBranch: (s) => s.branches.length >= 1,
  allCommon: () => allCommonIngredientsFound(),
  perfect10: (s) => s.stats.perfectCount >= 10,
  delivery10: (s) => s.stats.deliveriesDone >= 10,
  karin5: (s) => s.karin.blessCount >= 5,
};

export function listAchievements() {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!gameState.achievements[a.id] }));
}

/** Kiểm tra toàn bộ thành tựu chưa đạt. */
export function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (gameState.achievements[a.id]) continue;
    const cond = CONDITIONS[a.id];
    let ok = false;
    try {
      ok = !!cond?.(gameState);
    } catch (err) {
      console.warn('[Achievement] lỗi điều kiện', a.id, err);
    }
    if (!ok) continue;
    gameState.achievements[a.id] = { unlockedAt: Date.now() };
    if (a.reward.money) addMoney(a.reward.money, 'achievement', false);
    if (a.reward.xp) addXp(a.reward.xp);
    emit(EVENTS.ACHIEVEMENT_UNLOCKED, a);
    markDirty('nav');
    requestSave();
  }
}

export function initAchievementSystem() {
  const triggers = [
    EVENTS.CUSTOMER_SERVED, EVENTS.MONEY_EARNED, EVENTS.DAY_COMPLETED, EVENTS.RECIPE_UNLOCKED,
    EVENTS.BRANCH_OPENED, EVENTS.DISCOVERY, EVENTS.DELIVERY_COMPLETED, EVENTS.KARIN_BLESS, EVENTS.LEVEL_UP,
  ];
  for (const t of triggers) on(t, () => checkAchievements());
}
