import { MINIGAME, INGREDIENT_MAP } from '../config.js';
import { gameState } from '../state.js';
import { addMoney, addXp } from '../systems/economySystem.js';
import { addIngredient } from '../systems/inventorySystem.js';
import { discover } from '../systems/collectionSystem.js';
import { showRewardSummary } from '../ui/collectionUI.js';
import { formatMoney } from '../utils.js';
import { requestSave } from '../save.js';
import { emit, on, EVENTS } from '../events.js';

let claiming = false;
export function isClaimingReward() { return claiming; }
export function claimMinigameReward(score, rareDrop = null, kind = 'pearl') {
  const money = score * MINIGAME.moneyPerPoint;
  const requested = Math.floor(score / MINIGAME.pearlPerPoints);
  let pearls = 0;
  let rare = 0;
  const levelRewards = [];
  const unsubscribe = on(EVENTS.LEVEL_UP, ({ level, reward }) => {
    levelRewards.push(`Cấp ${level}: +${formatMoney(reward.money || 0)}${Object.entries(reward.items || {}).map(([id, count]) => `, +${count} ${INGREDIENT_MAP[id]?.name || id}`).join('')}`);
  });
  claiming = true;
  try {
    addMoney(money, 'minigame', false);
    pearls = addIngredient('pearl', requested);
    if (pearls) discover('ingredients', 'pearl');
    if (rareDrop) { rare = addIngredient(rareDrop, 1); if (rare) discover('ingredients', rareDrop); }
    addXp(Math.round(score / 4));
    const key = kind === 'block' ? 'bestBlockScore' : 'bestMinigameScore';
    gameState.stats[key] = Math.max(gameState.stats[key] || 0, score);
    emit(EVENTS.MINIGAME_FINISHED, { score, money, pearls, kind });
    requestSave();
  } finally { claiming = false; unsubscribe(); }
  showRewardSummary(`+${formatMoney(money)} · +${pearls} trân châu · +${Math.round(score / 4)} XP${rare ? ` · +1 ${INGREDIENT_MAP[rareDrop].name}` : ''}${levelRewards.length ? ` · ${levelRewards.join(' · ')}` : ''}${pearls < requested ? ' · Kho trân châu đã đầy, phần dư không được nhập' : ''}`);
}
