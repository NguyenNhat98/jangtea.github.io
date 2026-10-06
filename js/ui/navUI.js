/** Thanh điều hướng dưới cùng. */
import { gameState } from '../state.js';
import { FEATURE_LEVELS } from '../config.js';
import { isFeatureUnlocked } from '../systems/economySystem.js';
import { playSfx } from '../systems/audioSystem.js';
import { openInventory } from './inventoryUI.js';
import { openRecipes } from './recipeUI.js';
import { openDelivery } from './deliveryUI.js';
import { openBranches } from './branchUI.js';
import { openCollection } from './collectionUI.js';
import { closeAllModals } from './modalUI.js';
import { toast } from './toastUI.js';
import { openFarm } from './farmUI.js';

const ITEMS = [
  { id: 'shop', icon: '🏠', label: 'Tiệm', open: () => closeAllModals() },
  { id: 'inventory', icon: '📦', label: 'Kho', open: openInventory },
  { id: 'recipes', icon: '📖', label: 'Công thức', open: openRecipes },
  { id: 'delivery', icon: '🛵', label: 'Giao hàng', feature: 'delivery', open: openDelivery, badge: () => gameState.delivery.availableOrders.length },
  { id: 'branch', icon: '🏪', label: 'Chi nhánh', feature: 'branch', open: openBranches, badge: () => gameState.branches.length },
  { id: 'collection', icon: '🎁', label: 'Sưu tập', open: openCollection },
  { id: 'farm', icon: '🌱', label: 'Nông trại', feature: 'farm', open: openFarm },
];

export function renderNav() {
  const el = document.getElementById('bottomNav');
  if (!el) return;
  el.innerHTML = ITEMS.map((it) => {
    const locked = it.feature && !isFeatureUnlocked(it.feature);
    const badge = !locked && it.badge ? it.badge() : 0;
    return `<button class="nav-btn ${it.id === 'shop' ? 'active' : ''}" data-nav="${it.id}" aria-label="${it.label}${locked ? ` (mở ở cấp ${FEATURE_LEVELS[it.feature]})` : ''}">
      <span class="ico">${it.icon}</span><span>${it.label}</span>
      ${locked ? `<span class="lock">🔒${FEATURE_LEVELS[it.feature]}</span>` : badge ? `<span class="badge">${badge}</span>` : ''}
    </button>`;
  }).join('');
  for (const btn of el.querySelectorAll('[data-nav]')) {
    btn.addEventListener('click', () => {
      playSfx('click');
      const it = ITEMS.find((x) => x.id === btn.dataset.nav);
      if (it.feature && !isFeatureUnlocked(it.feature)) {
        toast(`Mở khóa ở cấp ${FEATURE_LEVELS[it.feature]}`, 'info');
        return;
      }
      it.open();
    });
  }
}
