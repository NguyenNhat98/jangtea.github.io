/* Runs inside Chromium against the generated bundle. Uses an isolated browser profile. */
window.addEventListener('error', e => { window.__testErrors ||= []; window.__testErrors.push(e.message); });
window.addEventListener('unhandledrejection', e => { window.__testErrors ||= []; window.__testErrors.push(String(e.reason)); });
document.addEventListener('DOMContentLoaded', () => setTimeout(async () => {
  const results = [];
  function check(name, condition, details) { results.push({ name, passed: Boolean(condition), details }); }
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  try {
    const loaded = {};
    if (!window.__teaModules) {
      for (const path of ['state', 'gameLoop', 'save', 'ui/modalUI', 'systems/farmSystem', 'systems/inventorySystem', 'systems/recipeSystem', 'systems/customerSystem', 'minigames/blockGame', 'minigames/rewards', 'systems/audioSystem', 'ui/inventoryUI', 'ui/settingsUI', 'minigames/menu', 'minigames/pearlGame', 'ui/tutorialUI', 'systems/preferencesSystem']) {
        loaded[`js/${path}.js`] = await import(`../js/${path}.js`);
      }
    }
    const module = window.__teaModules || (path => loaded[path]);
    const { gameState: s, createInitialState, replaceState, markAllDirty } = module('js/state.js');
    const { flushRender, setPaused } = module('js/gameLoop.js');
    const modal = module('js/ui/modalUI.js');
    const save = module('js/save.js');
    const farm = module('js/systems/farmSystem.js');
    const inventory = module('js/systems/inventorySystem.js');
    const recipe = module('js/systems/recipeSystem.js');
    const customer = module('js/systems/customerSystem.js');
    const block = module('js/minigames/blockGame.js');
    setPaused(true);
    module('js/systems/audioSystem.js').setMusic(false);
    check('One main-menu play button; no redundant new/continue buttons', !!document.querySelector('.main-menu [data-start]') && !document.querySelector('.main-menu [data-new],.main-menu [data-continue]'));
    document.querySelector('.main-menu')?.remove();
    modal.closeAllModals();
    replaceState(createInitialState()); s.settings.sound = false; s.settings.music = false;

    s.level = 10; s.money = 2000000;
    check('Buy additional land', farm.buyLand('leftGarden') === null && farm.buyLand('rightGarden') === null && s.farm.plots.length === 8);
    farm.plant(7, 'tea'); s.farm.plots[7].age = 2;
    farm.buyBuilding('coop'); farm.farmAction('chicken'); farm.farmAction('feed');
    farm.advanceFarmDay();
    check('Fed chicken lays eggs', s.farm.livestock.eggs === 1 && s.farm.livestock.feedDays === 2);
    save.saveGame(); save.loadGame();
    check('Purchased land, crops and chickens survive reload', s.farm.plots.length === 8 && s.farm.plots[7]?.cropId === 'tea' && s.farm.livestock.chickens === 1 && s.farm.livestock.eggs === 1);
    const old = createInitialState(); old.farm.lands = ['leftGarden', 'rightGarden']; old.version = 2;
    localStorage.setItem('dreamTeaSave', JSON.stringify({ version: 2, state: old })); save.loadGame();
    check('Old truncated saves recover purchased empty plots', s.farm.plots.length === 8);
    check('Older saves gain starter cups and new topping slots', s.inventory.cupM.stock === 15 && !!s.inventory.whitePearl);
    s.level = 10; s.money = 2000000;
    farm.buyBuilding('pond'); farm.farmAction('stockFish'); farm.farmAction('fishFeed');
    check('Fish cannot be harvested before maturity', farm.farmAction('fish') !== null);
    for (let i = 0; i < 3; i++) farm.advanceFarmDay();
    const beforeFish = s.money;
    check('Fish mature after three fed days', s.farm.livestock.fishAge === 3);
    farm.farmAction('net');
    check('Net harvest sells one batch and prevents duplicate harvest', s.farm.livestock.fish === 0 && s.money === beforeFish + 20000 && farm.farmAction('net') !== null);
    check('Invalid plot cannot extend land for free', farm.plant(999, 'tea') !== null && s.farm.plots.length === 8);
    const beforeMoney = s.money;
    check('Reject negative/fractional stock purchases', inventory.buyIngredient('tea', -2) !== null && inventory.buyIngredient('tea', .5) !== null && s.money === beforeMoney);

    replaceState(createInitialState()); s.settings.sound = false; s.settings.music = false;
    const c = customer.spawnCustomer(true);
    c.order = { recipeId: 'lemonTea', cupSize: 'M', quantity: 2, channel: 'counter', specialRequest: 'noIce' };
    markAllDirty(); flushRender();
    check('First order automatically appears without selecting customer', document.querySelector('.station-ticket b')?.textContent.includes('Trà chanh') && s.shop.selectedCustomerId === c.id);
    check('Fruit teas share a single pitcher', document.querySelectorAll('[data-tea="teaBase"]').length === 1 && !document.querySelector('[data-tea="lemonTea"],[data-tea="peachTea"],[data-tea="lycheeTea"],[data-tea="gingerTea"]'));
    document.querySelector('[data-tea="teaBase"]').click();
    check('Pitcher cannot pour before selecting cup', s.shop.preparation === null);
    document.querySelector('[data-size="L"]').click(); document.querySelector('[data-topping="lemon"]').click();
    document.querySelector('[data-tea="teaBase"]').click();
    check('Wrong cup size rejected', s.shop.preparation === null);
    document.querySelector('[data-size="M"]').click();
    const teaStock = inventory.getStock('tea'), lemonStock = inventory.getStock('lemon'), cups = inventory.getStock('cupM'), ice = inventory.getStock('ice');
    document.querySelector('[data-tea="teaBase"]').click();
    check('Pitcher click starts brewing', s.shop.preparation?.phase === 'brewing');
    check('Quantity consumes two cups and ingredients; flavor counted once; no-ice respected', inventory.getStock('tea') === teaStock - 2 && inventory.getStock('cupM') === cups - 2 && inventory.getStock('lemon') === lemonStock - 2 && inventory.getStock('ice') === ice);
    recipe.updateRecipeSystem(10); flushRender(); s.shop.preparation.marker = .5;
    check('Machine becomes clickable when tea ready', !document.querySelector('[data-machine]').disabled);
    let readyCounter = document.querySelector('#counter').getBoundingClientRect();
    let sealControl = document.querySelector('[data-seal]').getBoundingClientRect();
    check('Sealing control stays visible when tea ready', sealControl.bottom <= readyCounter.bottom + 2, { counter: readyCounter.toJSON(), control: sealControl.toJSON(), viewport: [innerWidth, innerHeight] });
    document.querySelector('[data-machine]').click();
    await pause(680); flushRender();
    check('Machine seals and serves order', s.shop.preparation === null && s.stats.totalServed >= 1);

    module('js/ui/inventoryUI.js').openInventory();
    document.querySelector('[data-category="tools"]').click();
    const cupCard = document.querySelector('[data-ing="cupM"]');
    const input = cupCard.querySelector('[data-quantity]'); input.value = '3'; input.dispatchEvent(new Event('change'));
    const stockBefore = inventory.getStock('cupM'), moneyBefore = s.money;
    cupCard.querySelector('[data-buy="custom"]').click();
    check('Inventory tools tab buys requested cup quantity and charges money', inventory.getStock('cupM') === stockBefore + 3 && s.money === moneyBefore - 2250);
    modal.closeAllModals();

    module('js/ui/settingsUI.js').openSettings();
    check('12 theme choices available', document.querySelectorAll('button[data-theme]').length === 12);
    document.querySelector('button[data-theme="matcha"]').click();
    const vibration = document.querySelector('[data-vibration]'); vibration.value = '2'; vibration.dispatchEvent(new Event('change'));
    save.saveGame(); save.loadGame();
    check('Theme and vibration persist across reload', s.settings.theme === 'matcha' && s.settings.vibration === 2 && document.documentElement.dataset.theme === 'matcha');
    modal.closeAllModals();

    let board = Array.from({ length: 8 }, () => Array(8).fill(null));
    board[7][7] = '🍵';
    check('Block rejects overlap and out-of-bounds placement', !block.canPlace(board, [[0, 0]], 7, 7) && !block.canPlace(board, [[0, 0], [0, 1]], 0, 7));
    board = Array.from({ length: 8 }, () => Array(8).fill(null));
    board[3].fill('🍵'); board.forEach(row => { row[4] = '🍵'; });
    const cleared = block.clearLines(board);
    check('Simultaneous row and column clearing counts intersection once', cleared.count === 2 && cleared.cleared.length === 15 && board.every(row => row.every(v => v === null)));
    board = Array.from({ length: 8 }, () => Array(8).fill('🍵'));
    check('Block detects game over across all remaining shapes', !block.hasPlacement(board, [{ shape: [[0, 0]] }]) && block.hasPlacement(Array.from({ length: 8 }, () => Array(8).fill(null)), [{ shape: [[0, 0], [0, 1]] }]));
    module('js/minigames/menu.js').openMinigames();
    check('Mini-game chooser offers both games', !!document.querySelector('[data-pearl]') && !!document.querySelector('[data-block]'));
    document.querySelector('[data-block]').click();
    document.querySelector('#modalRoot [data-start]').click();
    check('Block game renders 64 cells and three pieces', document.querySelectorAll('.block-cell').length === 64 && document.querySelectorAll('[data-piece]').length === 3);
    document.querySelector('[data-piece="0"]').click(); document.querySelector('[data-row="0"][data-col="0"]').click();
    const blockMoney = s.money; document.querySelector('[data-finish]').click(); document.querySelector('[data-claim]').click();
    check('Reward grant and discoveries use one summary', s.money > blockMoney && document.querySelectorAll('[aria-label="🎁 Tổng hợp phần thưởng"]').length === 1 && ![...document.querySelectorAll('.modal-head h2')].some(h => h.textContent.includes('Phát hiện mới')));
    const claimedMoney = s.money; modal.closeAllModals();
    check('Closing summary cannot claim reward again', s.money === claimedMoney);
    check('Both games share daily free allowance', s.stats.minigamePlaysToday === 1);

    module('js/minigames/pearlGame.js').openPearlGame();
    const paidBefore = s.money; document.querySelector('#modalRoot [data-start]').click();
    check('Second game uses paid turn and ingredient icons', s.money === paidBefore - 5000 && document.querySelectorAll('.mg-cell').length === 36 && ![...document.querySelectorAll('.mg-cell')].some(cell => ['🩷', '💚', '💛', '💙'].includes(cell.textContent)));
    modal.closeAllModals();
    module('js/ui/tutorialUI.js').openTutorial(true); document.querySelector('[data-go]').click(); await pause(50);
    const guide = document.querySelector('.tutorial-box').getBoundingClientRect();
    check('Tutorial stays entirely in viewport', guide.left >= 0 && guide.right <= innerWidth + 1 && guide.top >= 0 && guide.bottom <= innerHeight + 1);
    document.querySelector('[data-skip]').click();

    replaceState(createInitialState()); s.settings.sound = false; s.settings.music = false;
    s.inventory.pearl.stock = 30;
    module('js/minigames/rewards.js').claimMinigameReward(1800, 'matcha');
    check('Large reward with multiple level-ups uses one summary', s.level >= 3 && document.querySelectorAll('.modal').length === 1 && document.querySelector('.modal-body').textContent.includes('Cấp 2') && document.querySelector('.modal-body').textContent.includes('Cấp 3'));
    check('Full-stock reward states actual imported amount', document.querySelector('.modal-body').textContent.includes('+0 trân châu') && document.querySelector('.modal-body').textContent.includes('Kho trân châu đã đầy'));
    modal.closeAllModals();

    replaceState(createInitialState()); s.settings.sound = false; s.settings.music = false; s.settings.theme = 'cream';
    module('js/systems/preferencesSystem.js').applyPreferences();
    const visual = customer.spawnCustomer(true); visual.order = { recipeId: 'lemonTea', cupSize: 'M', quantity: 1, channel: 'counter' };
    markAllDirty(); flushRender(); document.querySelector('[data-size="M"]').click();
    await pause(50);
    const counter = document.querySelector('#counter').getBoundingClientRect();
    const station = document.querySelector('.barista-station').getBoundingClientRect();
    const controls = document.querySelector('.station-controls').getBoundingClientRect();
    check('Station and controls fit within counter viewport', station.bottom <= counter.bottom + 2 && controls.bottom <= counter.bottom + 2);
    check('Counter, ticket, machine and navigation stay within viewport width', ['#counter', '.station-ticket', '.counter-machine', '#bottomNav', '.station-controls'].every(selector => { const rect = document.querySelector(selector).getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth + 1; }));
    check('Shop does not require vertical page scroll', document.querySelector('#shop').scrollHeight <= document.querySelector('#shop').clientHeight + 2 && document.documentElement.scrollHeight <= innerHeight);
    s.upgrades.assistant = 1;
    s.shop.preparation = { customerId: visual.id, recipeId: 'lemonTea', cupSize: 'M', ingredients: {}, total: 3, elapsed: 3, phase: 'timing', marker: .5 };
    markAllDirty(); flushRender();
    readyCounter = document.querySelector('#counter').getBoundingClientRect();
    sealControl = document.querySelector('[data-seal]').getBoundingClientRect();
    check('Ready station fits with assistant panel enabled', sealControl.bottom <= readyCounter.bottom + 2 && document.querySelector('[data-assistant]').getBoundingClientRect().bottom <= readyCounter.bottom + 2, { counter: readyCounter.toJSON(), control: sealControl.toJSON(), assistant: document.querySelector('[data-assistant]').getBoundingClientRect().toJSON() });
    s.upgrades.assistant = 0; s.shop.preparation = null; markAllDirty(); flushRender();
    document.querySelector('#toastRoot').replaceChildren(); document.querySelector('#fxLayer').replaceChildren();
    check('No uncaught JavaScript errors', !(window.__testErrors || []).length);
  } catch (error) { results.push({ name: 'Unexpected test error', passed: false, error: error.stack }); }
  const output = document.createElement('pre'); output.id = 'test-results'; output.hidden = true;
  output.textContent = JSON.stringify({ passed: results.filter(r => r.passed).length, total: results.length, results, errors: window.__testErrors || [] });
  document.body.appendChild(output);
}, 100));
