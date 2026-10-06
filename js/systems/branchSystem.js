/** Chi nhánh: thu nhập thụ động theo chu kỳ. */
import { BRANCH_TEMPLATES, BRANCH_CONFIG, UPGRADE_COST_GROWTH, maxBranchesForLevel, OFFLINE_MAX_SECONDS } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { addMoney, spendMoney } from './economySystem.js';
import { unlockRecipesForLevel } from './recipeSystem.js';
import { requestSave } from '../save.js';

let incomeTimer = 0;

export function listTemplates() {
  return BRANCH_TEMPLATES.map((t) => ({ ...t, owned: gameState.branches.some((b) => b.id === t.id) }));
}

export function canOpenMore() {
  return gameState.branches.length < maxBranchesForLevel(gameState.level);
}

/** Doanh thu mỗi chu kỳ của một chi nhánh. */
export function branchRevenue(branch) {
  const t = BRANCH_TEMPLATES.find((x) => x.id === branch.id);
  if (!t) return 0;
  return Math.round(t.baseRevenue * branch.level * (1 + branch.reputation / 10));
}

export function totalRevenuePerInterval() {
  return gameState.branches.reduce((s, b) => s + branchRevenue(b), 0);
}

/** Mở chi nhánh. @returns {string|null} lỗi */
export function openBranch(templateId) {
  const t = BRANCH_TEMPLATES.find((x) => x.id === templateId);
  if (!t) return 'Chi nhánh không tồn tại';
  if (gameState.branches.some((b) => b.id === templateId)) return 'Đã sở hữu';
  if (!canOpenMore()) return `Cần cấp cao hơn để mở thêm (tối đa ${maxBranchesForLevel(gameState.level)})`;
  if (!spendMoney(t.cost, 'branch')) return 'Không đủ tiền';
  const branch = { id: t.id, name: t.name, level: 1, revenue: 0, reputation: 1, upgrades: 0 };
  gameState.branches.push(branch);
  // Mỗi chi nhánh mới mở thêm công thức của level tiếp theo (nếu có).
  unlockRecipesForLevel(gameState.level + 1);
  emit(EVENTS.BRANCH_OPENED, branch);
  markDirty('nav', 'hud');
  requestSave();
  return null;
}

export function branchUpgradeCost(branch) {
  return Math.round((BRANCH_CONFIG.upgradeBaseCost * Math.pow(UPGRADE_COST_GROWTH, branch.level)) / 1000) * 1000;
}

export function upgradeBranch(branchId) {
  const b = gameState.branches.find((x) => x.id === branchId);
  if (!b) return 'Không tìm thấy chi nhánh';
  if (b.level >= BRANCH_CONFIG.maxLevel) return 'Đã đạt cấp tối đa';
  if (!spendMoney(branchUpgradeCost(b), 'branchUpgrade')) return 'Không đủ tiền';
  b.level += 1;
  b.reputation = Math.min(10, b.reputation + 0.5);
  markDirty('nav');
  requestSave();
  return null;
}

export function updateBranches(dt) {
  if (!gameState.branches.length) return;
  incomeTimer += dt;
  if (incomeTimer < BRANCH_CONFIG.incomeInterval) return;
  incomeTimer -= BRANCH_CONFIG.incomeInterval;
  let total = 0;
  for (const b of gameState.branches) {
    const r = branchRevenue(b);
    b.revenue += r;
    total += r;
  }
  if (total > 0) {
    addMoney(total, 'branch', false);
    emit(EVENTS.BRANCH_INCOME, total);
  }
}

/** Thu nhập offline (giới hạn 8 giờ). */
export function offlineIncome(elapsedSeconds) {
  const sec = Math.min(OFFLINE_MAX_SECONDS, Math.max(0, elapsedSeconds));
  const intervals = Math.floor(sec / BRANCH_CONFIG.incomeInterval);
  return { seconds: sec, amount: intervals * totalRevenuePerInterval() };
}

/** Tiến độ tới lần trả thu nhập tiếp theo (0..1). */
export function incomeProgress() {
  return incomeTimer / BRANCH_CONFIG.incomeInterval;
}
