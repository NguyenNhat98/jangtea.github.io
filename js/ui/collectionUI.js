/** Bộ sưu tập + modal "Phát hiện mới". */
import { html, esc } from '../utils.js';
import { listCollection, collectionProgress } from '../systems/collectionSystem.js';
import { openModal } from './modalUI.js';
import { on, EVENTS } from '../events.js';

function renderTab(body, category) {
  const items = listCollection(category);
  const p = collectionProgress()[category];
  body.querySelector('[data-grid]').innerHTML = `<p class="muted center">Đã khám phá ${p.found}/${p.total}</p><div class="grid-auto">${items
    .map((i) => {
      if (!i.discovered) return `<div class="item-card locked rarity-${i.rarity}"><span class="ico">❔</span><span class="name">???</span><span class="rarity">${i.rarityName}</span></div>`;
      return `<div class="item-card rarity-${i.rarity}"><span class="ico">${i.icon}</span><span class="name">${esc(i.name)}</span><span class="rarity">${i.rarityName} · Cấp ${i.level}</span><span class="muted">${esc(i.desc)}</span><span class="muted">${category === 'recipes' ? 'Đã pha' : 'Đã dùng'}: ${i.count}</span></div>`;
    })
    .join('')}</div>`;
}

export function openCollection() {
  const body = html(`<div class="col">
    <div class="tabs"><button class="tab active" data-tab="ingredients">🧺 Nguyên liệu</button><button class="tab" data-tab="recipes">📖 Công thức</button></div>
    <div data-grid></div></div>`);
  renderTab(body, 'ingredients');
  for (const t of body.querySelectorAll('[data-tab]')) {
    t.addEventListener('click', () => {
      body.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
      renderTab(body, t.dataset.tab);
    });
  }
  openModal({ title: '🎁 Bộ sưu tập', body, id: 'collection' });
}

export function initCollectionUI() {
  // Discoveries remain in the collection; gameplay and reward screens stay usable.
  on(EVENTS.DISCOVERY, ({ category, item }) => pendingDiscoveries.set(`${category}:${item.id}`, item));
  on(EVENTS.GAME_RESET, () => pendingDiscoveries.clear());
}

const pendingDiscoveries = new Map();
export function takeDiscoveries() {
  const items = [...pendingDiscoveries.values()];
  pendingDiscoveries.clear();
  return items;
}
export function showRewardSummary(message) {
  const discoveries = takeDiscoveries();
  const body = html(`<div class="col"><p class="bold">${esc(message)}</p>${discoveries.length ? `<h3>✨ Phát hiện mới (${discoveries.length})</h3><div class="grid-auto">${discoveries.map(item => `<div class="item-card"><span class="ico">${item.icon}</span><b>${esc(item.name)}</b></div>`).join('')}</div>` : ''}</div>`);
  const foot = html('<button class="btn btn-primary btn-block">Tuyệt! ✨</button>');
  const modal = openModal({ title: '🎁 Tổng hợp phần thưởng', body, foot, center: true, id: 'reward-summary' });
  foot.addEventListener('click', modal.close);
}
