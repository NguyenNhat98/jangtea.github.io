/** Modal công thức. */
import { gameState } from '../state.js';
import { INGREDIENT_MAP, RARITY } from '../config.js';
import { html, esc, formatMoney } from '../utils.js';
import { listRecipes } from '../systems/recipeSystem.js';
import { ingredientCost } from '../systems/inventorySystem.js';
import { openModal } from './modalUI.js';

export function openRecipes() {
  const recipes = listRecipes();
  const body = html(`<div class="col">
    <p class="muted">Đã mở ${recipes.filter((r) => r.unlocked).length}/${recipes.length} công thức. Lên cấp để mở thêm!</p>
    <div class="grid-auto">${recipes
      .map((r) => {
        const ings = Object.entries(r.ingredients).map(([id, q]) => `${INGREDIENT_MAP[id]?.icon || '?'}${q}`).join(' ');
        if (!r.unlocked) return `<div class="item-card locked rarity-${r.rarity}"><span class="ico">🔒</span><span class="name">${esc(r.name)}</span><span class="muted">Mở ở cấp ${r.unlockLevel}</span><span class="muted">${ings}</span></div>`;
        const profit = r.price - ingredientCost(r.ingredients);
        return `<div class="item-card rarity-${r.rarity}">
          <div class="row between"><span class="ico">${r.icon}</span><span class="tag ${r.temp}">${r.temp === 'cold' ? '🧊 Lạnh' : '♨️ Nóng'}</span></div>
          <span class="name">${esc(r.name)}</span>
          <span class="rarity">${RARITY[r.rarity].name}</span>
          <span class="muted">${esc(r.desc)}</span>
          <span class="muted">${ings} · ${r.preparationTime}s</span>
          <span class="money">${formatMoney(r.price)} <span class="muted">(lãi ${formatMoney(profit)})</span></span>
          <span class="muted">Đã pha: ${r.made}${r.missing.length ? ' · <span style="color:var(--c-red)">thiếu nguyên liệu</span>' : ''}</span>
        </div>`;
      })
      .join('')}</div></div>`);
  openModal({ title: `📖 Công thức (cấp ${gameState.level})`, body, id: 'recipes' });
}
