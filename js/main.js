/**
 * Điểm vào: khởi tạo system, UI, game loop, save/load, debug.
 */
import { DEBUG, AUTOSAVE_INTERVAL, RECIPE_MAP } from './config.js';
import { gameState, markDirty, markAllDirty } from './state.js';
import { on, emit, EVENTS } from './events.js';
import { startLoop, registerUpdate, registerRenderer, registerFrameRenderer, flushRender } from './gameLoop.js';
import { loadGame, saveGame, resetGame } from './save.js';
import { formatMoney } from './utils.js';

import { updateBuffs } from './systems/buffSystem.js';
import { addMoney, addXp } from './systems/economySystem.js';
import { unlockIngredientsForLevel, addIngredient } from './systems/inventorySystem.js';
import { unlockRecipesForLevel, unlockAllRecipes, updateRecipeSystem } from './systems/recipeSystem.js';
import { updateCustomerSystem, spawnCustomer, openShop } from './systems/customerSystem.js';
import { setupDay, resumeDay, nextDay, isDayFinishedOnLoad } from './systems/calendarSystem.js';
import { updateKarin } from './systems/karinSystem.js';
import { updateDelivery, completeAllDeliveries, initDeliverySystem } from './systems/deliverySystem.js';
import { updateBranches } from './systems/branchSystem.js';
import { initCollectionSystem, discoverStarting } from './systems/collectionSystem.js';
import { initAchievementSystem, checkAchievements } from './systems/achievementSystem.js';
import { applyOfflineProgress } from './systems/offlineSystem.js';
import { initAudioSystem } from './systems/audioSystem.js';
import { updateFarm } from './systems/farmSystem.js';

import { initModalUI } from './ui/modalUI.js';
import { initToastUI, toast } from './ui/toastUI.js';
import { renderHud } from './ui/hudUI.js';
import { renderCustomers, updatePatienceBars } from './ui/customerUI.js';
import { renderCounter, updateCounterFrame, showServeResult } from './ui/orderUI.js';
import { renderKarin, updateKarinFrame, initKarinUI } from './ui/karinUI.js';
import { renderActions, renderBuffs, renderScene, updateBuffsFrame, initShopUI } from './ui/shopUI.js';
import { renderNav } from './ui/navUI.js';
import { initInventoryUI } from './ui/inventoryUI.js';
import { updateDeliveryFrame, initDeliveryUI } from './ui/deliveryUI.js';
import { updateBranchFrame, initBranchUI } from './ui/branchUI.js';
import { initCollectionUI } from './ui/collectionUI.js';
import { initAchievementUI } from './ui/achievementUI.js';
import { initEndDayUI, openEndDay } from './ui/endDayUI.js';
import { initFarmUI } from './ui/farmUI.js';
import { initMainMenu } from './ui/mainMenuUI.js';
import { openTutorial } from './ui/tutorialUI.js';
import { floatText } from './ui/fxUI.js';

function registerRenderers() {
  registerRenderer('hud', renderHud);
  registerRenderer('customers', renderCustomers);
  registerRenderer('counter', renderCounter);
  registerRenderer('karin', renderKarin);
  registerRenderer('actions', renderActions);
  registerRenderer('nav', renderNav);
  registerRenderer('buffs', renderBuffs);
  registerRenderer('scene', renderScene);

  registerFrameRenderer(updatePatienceBars);
  registerFrameRenderer(updateCounterFrame);
  registerFrameRenderer(updateKarinFrame);
  registerFrameRenderer(updateBuffsFrame);
  registerFrameRenderer(updateDeliveryFrame);
  registerFrameRenderer(updateBranchFrame);
}

let autosaveTimer = 0;
function registerUpdates() {
  registerUpdate(updateBuffs);
  registerUpdate(updateCustomerSystem);
  registerUpdate(updateRecipeSystem);
  registerUpdate(updateKarin);
  registerUpdate(updateDelivery);
  registerUpdate(updateBranches);
  registerUpdate(updateFarm);
  registerUpdate((dt) => {
    autosaveTimer += dt;
    if (autosaveTimer >= AUTOSAVE_INTERVAL) {
      autosaveTimer = 0;
      saveGame();
    }
  });
}

function wireEvents() {
  on(EVENTS.LEVEL_UP, ({ level }) => {
    const recipes = unlockRecipesForLevel(level);
    unlockIngredientsForLevel(level);
    for (const r of recipes) toast(`📖 Công thức mới: ${r.name}!`, 'success', 2600);
    markDirty('nav', 'hud', 'actions');
  });
  on(EVENTS.CUSTOMER_LEFT, (c) => {
    const el = document.querySelector(`[data-cid="${c.id}"]`);
    floatText('−0.1 ⭐', el || document.getElementById('customerArea'), 'red');
    toast(`${c.name} bỏ đi vì chờ lâu 😢`, 'error', 1600);
  });
  on(EVENTS.PREP_RESULT, (r) => {
    if (r.by === 'assistant') showServeResult(r, document.querySelector(`[data-cid="${r.customer?.id}"]`) || document.getElementById('counter'));
  });
  on(EVENTS.KARIN_BLESS, () => toast('🐰 Karin ban phước: khách kiên nhẫn hơn!', 'success'));
  on(EVENTS.BUFF_ADDED, (b) => { if (b.id === 'happyHour') toast('🎉 Happy Hour: +30% tiền trong 45s!', 'gold', 2600); });
  on(EVENTS.DAY_STARTED, ({ festival }) => { if (festival) toast('🎊 Hôm nay là ngày lễ hội: +20% tiền & khách!', 'gold', 3000); });
  on(EVENTS.SHOP_OPENED, () => toast('🔔 Tiệm đã mở cửa!', 'success', 1200));
  on(EVENTS.UPGRADE_BOUGHT, () => markDirty('counter', 'customers'));
  on(EVENTS.STATE_LOADED, () => {
    resumeDay();
    discoverStarting();
    markAllDirty();
  });
  on(EVENTS.GAME_RESET, () => {
    setupDay(true);
    discoverStarting();
    setTimeout(() => openTutorial(false), 300);
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
  window.addEventListener('beforeunload', () => saveGame());
  window.addEventListener('error', (e) => console.error('[Game] Lỗi không bắt được:', e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => console.error('[Game] Promise lỗi:', e.reason));
}

function exposeDebug() {
  if (!DEBUG) return;
  window.debugGame = {
    state: gameState,
    addMoney: (n = 100000) => addMoney(n, 'debug'),
    addXp: (n = 100) => addXp(n),
    addIngredient: (id, qty = 10) => addIngredient(id, qty),
    unlockAllRecipes,
    nextDay: () => nextDay(),
    spawnCustomer: () => spawnCustomer(true),
    openShop,
    completeDelivery: completeAllDeliveries,
    resetGame,
    save: saveGame,
    endDay: openEndDay,
    checkAchievements,
    recipes: RECIPE_MAP,
    emit,
  };
  console.info('%c🧋 debugGame sẵn sàng: window.debugGame', 'color:#6cc488;font-weight:bold');
}

function boot() {
  initModalUI();
  initToastUI();
  initAudioSystem();
  initCollectionSystem();
  initAchievementSystem();
  initDeliverySystem();
  initKarinUI();
  initShopUI();
  initInventoryUI();
  initDeliveryUI();
  initBranchUI();
  initCollectionUI();
  initAchievementUI();
  initEndDayUI();
  initFarmUI();
  initMainMenu();
  registerRenderers();
  registerUpdates();
  wireEvents();
  exposeDebug();

  const { loaded, elapsed } = loadGame();
  if (!loaded) {
    setupDay(true);
    discoverStarting();
  }
  markAllDirty();
  flushRender();
  startLoop();

  if (loaded) {
    const offline = applyOfflineProgress(elapsed);
    if (!offline) toast(`Chào mừng trở lại! Ngày ${gameState.day} · ${formatMoney(gameState.money)}`, 'info', 2000);
    if (isDayFinishedOnLoad()) setTimeout(openEndDay, 400);
  }
  checkAchievements();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
