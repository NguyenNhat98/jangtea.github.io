import { FARM_CONFIG, WEATHERS } from '../config.js';
import { gameState } from '../state.js';
import { openModal } from './modalUI.js';
import { html, esc, formatMoney } from '../utils.js';
import { plant, water, fertilize, treat, harvest, buyLand, buyBuilding, farmAction } from '../systems/farmSystem.js';
import { isFeatureUnlocked } from '../systems/economySystem.js';
import { toast } from './toastUI.js';
import { on, EVENTS } from '../events.js';

let current = null;
let selectedPlot = null;

function render(body) {
  const farm = gameState.farm;
  const weather = WEATHERS[gameState.weather];
  if (selectedPlot !== null && selectedPlot >= farm.plots.length) selectedPlot = null;

  body.innerHTML = `
    <div class="farm-screen">
      <header class="farm-header">
        <div><span class="farm-eyebrow">VƯỜN NGUYÊN LIỆU</span><h2>Nông trại của bạn</h2></div>
        <div class="farm-weather">${weather.icon} ${esc(weather.name)} <span>${gameState.temperature}°C</span></div>
      </header>
      <div class="farm-supplies" aria-label="Vật phẩm nông trại">
        <span>💧 <b>${farm.water}</b><small>Nước</small></span>
        <span>🧺 <b>${farm.fertilizer}</b><small>Phân bón</small></span>
        <span>🐞 <b>${farm.pesticide}</b><small>Thuốc sâu</small></span>
      </div>
      <p class="farm-hint">Mưa giúp tưới cây. Chọn một ô đất để gieo hạt hoặc chăm sóc cây trồng.</p>
      <section class="farm-field" aria-label="Các ô đất nông trại">
        ${farm.plots.map((plot, i) => {
          const selected = selectedPlot === i;
          if (!plot) return `<button class="farm-plot farm-plot-empty${selected ? ' is-selected' : ''}" data-plot="${i}" aria-label="Ô đất trống ${i + 1}, nhấn để gieo cây"><span class="farm-soil">＋</span><span>Ô đất trống</span></button>`;
          const crop = FARM_CONFIG.crops[plot.cropId];
          if (!crop) return `<button class="farm-plot farm-plot-empty" data-plot="${i}"><span class="farm-soil">＋</span><span>Ô đất trống</span></button>`;
          const progress = Math.min(100, Math.round(plot.age / crop.days * 100));
          const ready = plot.age >= crop.days;
          return `<button class="farm-plot farm-plot-grown${selected ? ' is-selected' : ''}${ready ? ' is-ready' : ''}" data-plot="${i}" aria-label="${esc(crop.name)}, ${ready ? 'sẵn sàng thu hoạch' : `lớn ${progress}%`}">
            <span class="farm-crop-icon">${crop.icon}</span><span class="farm-crop-name">${esc(crop.name)}</span>
            <span class="farm-growth"><i style="width:${progress}%"></i></span>
            <span class="farm-plot-meta">${ready ? '✨ Đã chín' : `${plot.age}/${crop.days} ngày`}${plot.pest ? ' · 🐛' : ''}${plot.flooded ? ' · 🌊' : ''}</span>
          </button>`;
        }).join('')}
      </section>
      ${selectedPlot !== null && !farm.plots[selectedPlot] ? renderSeedTray(selectedPlot) : ''}
      ${selectedPlot !== null && farm.plots[selectedPlot] ? renderPlantActions(selectedPlot, farm.plots[selectedPlot]) : ''}
      ${renderFarmUpgrades(farm)}
      <section class="farm-selection"><h3>Vật tư chăm sóc</h3><div class="farm-actions">${[['water', '💧 Nước', FARM_CONFIG.waterCost], ['fertilizer', '🧺 Phân bón', FARM_CONFIG.fertilizerCost], ['pesticide', '🐞 Thuốc sâu', FARM_CONFIG.pesticideCost]].map(([id, name, cost]) => `<button class="btn btn-soft" data-farm-action="supply:${id}">+1 ${name} · ${formatMoney(cost)}</button>`).join('')}</div></section>
      ${renderBuildings(farm)}
    </div>`;

  body.querySelectorAll('[data-plot]').forEach((button) => button.addEventListener('click', () => {
    selectedPlot = Number(button.dataset.plot);
    render(body);
  }));
  body.querySelectorAll('[data-seed]').forEach((button) => button.addEventListener('click', () => {
    const message = plant(selectedPlot, button.dataset.seed);
    if (message) toast(message, 'error');
    else { toast(`Đã gieo ${FARM_CONFIG.crops[button.dataset.seed].name}!`, 'success'); render(body); }
  }));
  body.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.action === 'close-selection') { selectedPlot = null; render(body); return; }
    const actions = { water, fertilize, treat, harvest };
    const message = actions[button.dataset.action](selectedPlot);
    if (message) toast(message, 'error');
    else {
      if (button.dataset.action === 'harvest') selectedPlot = null;
      render(body);
    }
  }));
  body.querySelectorAll('[data-land]').forEach((button) => button.addEventListener('click', () => {
    const message = buyLand(button.dataset.land);
    if (message) toast(message, 'error'); else render(body);
  }));
  body.querySelectorAll('[data-building]').forEach((button) => button.addEventListener('click', () => {
    const message = buyBuilding(button.dataset.building);
    if (message) toast(message, 'error'); else render(body);
  }));
  body.querySelectorAll('[data-farm-action]').forEach(button => button.addEventListener('click', () => {
    const message = farmAction(button.dataset.farmAction);
    if (message) toast(message, 'error'); else { toast('Đã hoàn tất thao tác nông trại', 'success', 1600); render(body); }
  }));
}

function renderBuildings(farm) {
  const a = farm.livestock;
  const btn = (action, label) => `<button class="btn btn-soft" data-farm-action="${action}">${label}</button>`;
  return `<section class="farm-buildings"><h3>Công trình đang hoạt động</h3>
    ${farm.buildings.coop ? `<article class="farm-selection"><h3>🐔 Chuồng gà · ${a.chickens}/6 con</h3><p>${a.eggs} trứng · Thức ăn còn ${a.feedDays} ngày</p><p class="muted">Gà được cho ăn sẽ đẻ mỗi con 1 trứng khi sang ngày. Trứng bán 2.500đ/quả.</p><div class="farm-actions">${btn('chicken', 'Mua gà · 12.000đ')}${btn('feed', `Cho ăn 3 ngày · ${formatMoney(a.chickens * 1000)}`)}${btn('eggs', `Thu & bán ${a.eggs} trứng`)}</div></article>` : ''}
    ${farm.buildings.pond ? `<article class="farm-selection"><h3>🐟 Ao cá · ${a.fish} con</h3><p>Cá lớn ${a.fishAge}/3 ngày · Thức ăn còn ${a.fishFeedDays} ngày</p><p class="muted">Thả 5 cá giống, cho ăn rồi chờ 3 ngày. Câu từng con nhận 3.500–6.000đ; kéo lưới bán cả lứa 4.000đ/con.</p><div class="farm-actions">${btn('stockFish', 'Thả 5 cá · 12.000đ')}${btn('fishFeed', 'Cho ăn 3 ngày · 2.000đ')}${btn('fish', '🎣 Câu 1 cá')}${btn('net', '🕸️ Thu cả lứa')}</div></article>` : ''}
    ${farm.buildings.flowerGarden ? '<article class="farm-selection"><h3>🌷 Vườn hoa</h3><p>Bướm ghé thường xuyên hơn, thụ phấn giúp cây tăng sản lượng.</p></article>' : ''}
    ${farm.buildings.beehive ? `<article class="farm-selection"><h3>🍯 Tổ ong</h3><p>Tích lũy ${farm.honeyStock || 0}/20 lọ · +1 mỗi ngày</p>${btn('honey', 'Thu mật ong vào kho')}</article>` : ''}
    ${!Object.values(farm.buildings).some(Boolean) ? '<p class="muted">Xây chuồng gà hoặc ao nước ở phần mở rộng để bắt đầu chăn nuôi.</p>' : ''}
  </section>`;
}

function renderSeedTray(index) {
  const seeds = Object.entries(FARM_CONFIG.crops).map(([id, crop]) => {
    const locked = crop.unlockLevel && gameState.level < crop.unlockLevel;
    return `<button class="farm-seed" data-seed="${id}" ${locked ? 'disabled' : ''}>
      <span class="farm-seed-icon">${crop.icon}</span><span class="farm-seed-name">${esc(crop.name)}</span>
      <small>${locked ? `Mở ở cấp ${crop.unlockLevel}` : `Hạt giống · ${formatMoney(crop.seedCost)}`}</small>
    </button>`;
  }).join('');
  return `<section class="farm-selection"><div class="farm-panel-heading"><div><span class="farm-eyebrow">Ô ĐẤT ${index + 1}</span><h3>Chọn hạt giống</h3></div><button class="farm-close-selection" data-action="close-selection" aria-label="Đóng">×</button></div><div class="farm-seeds">${seeds}</div></section>`;
}

function renderPlantActions(index, plot) {
  const crop = FARM_CONFIG.crops[plot.cropId];
  const ready = crop && plot.age >= crop.days;
  return `<section class="farm-selection farm-care"><div class="farm-panel-heading"><div><span class="farm-eyebrow">Ô ĐẤT ${index + 1}</span><h3>${crop?.icon || '🌱'} ${esc(crop?.name || 'Cây trồng')}</h3></div><button class="farm-close-selection" data-action="close-selection" aria-label="Đóng">×</button></div>
    <div class="farm-actions">
      <button class="btn btn-soft" data-action="water">💧 Tưới nước</button>
      <button class="btn btn-soft" data-action="fertilize">🧺 Bón phân</button>
      <button class="btn btn-soft" data-action="treat">🐞 Trị sâu</button>
      <button class="btn ${ready ? 'btn-primary' : 'btn-soft'}" data-action="harvest" ${ready ? '' : 'disabled'}>${ready ? '🧺 Thu hoạch' : `⏳ Còn ${Math.max(0, crop.days - plot.age)} ngày`}</button>
    </div><div class="farm-status">💧 ${plot.water}% nước <span class="farm-status-bar"><i style="width:${Math.min(100, plot.water)}%"></i></span>　💚 ${plot.health}% sức khỏe</div>
  </section>`;
}

function renderFarmUpgrades(farm) {
  const lands = FARM_CONFIG.lands.filter((land) => !farm.lands.includes(land.id));
  const buildings = Object.entries(FARM_CONFIG.buildings).filter(([id]) => !farm.buildings[id]);
  return `<section class="farm-expansion"><div class="farm-panel-heading"><div><span class="farm-eyebrow">PHÁT TRIỂN</span><h3>Mở rộng nông trại</h3></div></div>
    ${lands.length ? `<div class="farm-upgrade-list">${lands.map((land) => `<button class="farm-upgrade" data-land="${land.id}" ${gameState.level < land.unlockLevel ? 'disabled' : ''}><span>${land.icon}</span><b>${esc(land.name)}</b><small>${gameState.level < land.unlockLevel ? `Cấp ${land.unlockLevel}` : formatMoney(land.cost)}</small></button>`).join('')}</div>` : ''}
    ${buildings.length ? `<h4>Công trình</h4><div class="farm-upgrade-list">${buildings.map(([id, item]) => `<button class="farm-upgrade" data-building="${id}" ${gameState.level < item.unlockLevel ? 'disabled' : ''}><span>${item.icon}</span><b>${esc(item.name)}</b><small>${gameState.level < item.unlockLevel ? `Cấp ${item.unlockLevel}` : formatMoney(item.cost)}</small></button>`).join('')}</div>` : ''}
  </section>`;
}

export function openFarm() {
  if (!isFeatureUnlocked('farm')) return toast('Nông trại mở khóa ở cấp 3', 'info');
  if (current) return;
  selectedPlot = null;
  const body = html('<div class="farm-root"></div>');
  render(body);
  current = openModal({ title: '🌱 Nông trại nguyên liệu', body, id: 'farm', onClose: () => { current = null; selectedPlot = null; } });
}

export function initFarmUI() {
  on(EVENTS.FARM_EVENT, (event) => {
    if (event.type === 'storm') toast('🌪️ Mưa bão vừa đi qua nông trại.', 'error');
    if (event.type === 'butterfly') toast('🦋 Bướm đã thụ phấn cho một cây!', 'success');
    if (event.type === 'chicken') toast('🐔 Gà Mơ tìm thấy phân hữu cơ!', 'info');
    if (event.type === 'dragonfly') toast('🪰 Chuồn chuồn giúp giảm sâu bệnh!', 'success');
  });
  on(EVENTS.FARM_CHANGED, () => { if (current) render(current.body); });
}
