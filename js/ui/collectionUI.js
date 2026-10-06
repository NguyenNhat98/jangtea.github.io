/** Bộ sưu tập + modal "Phát hiện mới". */
import { RARITY } from '../config.js';
import { html, esc } from '../utils.js';
import { listCollection, collectionProgress } from '../systems/collectionSystem.js';
import { openModal, queueModal } from './modalUI.js';
import { on, EVENTS } from '../events.js';
import { sparkle } from './fxUI.js';

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
  on(EVENTS.DISCOVERY, ({ category, item }) => {
    queueModal((done) => {
      const body = html(`<div class="col center">
        <div class="summary-emoji">${item.icon}</div>
        <div class="summary-big">${esc(item.name)}</div>
        <span class="rarity-${item.rarity}"><span class="rarity">${RARITY[item.rarity].name}</span></span>
        <p class="muted">${esc(item.desc)}</p>
        <p class="muted">${category === 'recipes' ? 'Công thức' : 'Nguyên liệu'} mới trong bộ sưu tập</p></div>`);
      const foot = html('<button class="btn btn-primary btn-block">Tuyệt! ✨</button>');
      const m = openModal({ title: '✨ Phát hiện mới!', body, foot, center: true, onClose: done });
      foot.addEventListener('click', m.close);
      setTimeout(() => sparkle(body.querySelector('.summary-emoji'), 10), 150);
    });
  });
}
