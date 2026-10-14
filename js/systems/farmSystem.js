import { FARM_CONFIG } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { addIngredient, getMaxStock, getStock } from './inventorySystem.js';
import { spendMoney, addMoney } from './economySystem.js';
import { requestSave } from '../save.js';
import { chance, randInt } from '../utils.js';

const plot = (i) => gameState.farm.plots[i];
function touch() { markDirty('nav'); emit(EVENTS.FARM_CHANGED, gameState.farm); requestSave(); }
export function buyLand(id) {
  const land = FARM_CONFIG.lands.find((x) => x.id === id);
  if (!land || gameState.farm.lands.includes(id)) return 'Khu đất đã được mua';
  if (gameState.level < land.unlockLevel) return `Cần đạt cấp ${land.unlockLevel}`;
  if (!spendMoney(land.cost, 'farm-land')) return 'Không đủ tiền mua đất';
  gameState.farm.lands.push(id);
  gameState.farm.plots.push(...Array.from({ length: land.plots }, () => null));
  touch(); return null;
}
export function buyBuilding(id) {
  const b = FARM_CONFIG.buildings[id];
  if (!b || gameState.farm.buildings[id]) return 'Công trình đã có';
  if (gameState.level < b.unlockLevel) return `Cần đạt cấp ${b.unlockLevel}`;
  if (!spendMoney(b.cost, 'farm-building')) return 'Không đủ tiền xây công trình';
  gameState.farm.buildings[id] = true;
  touch(); return null;
}
export function plant(i, cropId) {
  if (!Number.isInteger(i) || i < 0 || i >= gameState.farm.plots.length) return 'Ô đất không tồn tại';
  if (gameState.level < FARM_CONFIG.unlockLevel) return 'Nông trại mở khóa ở cấp 3';
  const c = FARM_CONFIG.crops[cropId]; if (!c || plot(i)) return 'Ô đất chưa trống';
  if (gameState.level < (c.unlockLevel || 3)) return `Cần đạt cấp ${c.unlockLevel || 3}`;
  if (!spendMoney(c.seedCost, 'farm-seed')) return 'Không đủ tiền mua hạt giống';
  gameState.farm.plots[i] = { cropId, age: 0, water: 65, health: 100, fertilized: false, pest: false, flooded: false };
  touch(); return null;
}
export function water(i) { const p=plot(i); if (!p) return 'Chưa trồng cây'; if (gameState.farm.water<=0) return 'Hết nước'; p.water=Math.min(100,p.water+40); gameState.farm.water--; touch(); return null; }
export function fertilize(i) { const p=plot(i); if (!p) return 'Chưa trồng cây'; if (p.fertilized) return 'Cây đã được bón phân'; if (gameState.farm.fertilizer<=0) return 'Hết phân bón'; p.fertilized=true; gameState.farm.fertilizer--; touch(); return null; }
export function treat(i) { const p=plot(i); if (!p) return 'Chưa trồng cây'; if (!p.pest) return 'Cây không bị sâu'; if (gameState.farm.pesticide<=0) return 'Hết thuốc trừ sâu'; p.pest=false; p.health=Math.min(100,p.health+15); gameState.farm.pesticide--; touch(); return null; }
export function harvest(i) {
  const p = plot(i); if (!p) return 'Ô đất trống';
  const c = FARM_CONFIG.crops[p.cropId]; if (p.age < c.days) return 'Cây chưa chín';
  const bonus = (p.fertilized ? 1 : 0) + (p.pollinated ? 1 : 0);
  if (getMaxStock(c.ingredient) - getStock(c.ingredient) < c.yield[1] + bonus) return 'Kho thiếu chỗ, hãy dùng nguyên liệu hoặc nâng cấp kho trước';
  const qty = addIngredient(c.ingredient, randInt(c.yield[0], c.yield[1]) + bonus);
  gameState.farm.plots[i] = null; touch(); emit(EVENTS.FARM_EVENT, { type: 'harvest', qty, crop: c.name }); return null;
}
export function farmAction(action) {
  const f = gameState.farm, animals = f.livestock;
  if (action.startsWith('supply:')) {
    const id = action.split(':')[1];
    const costs = { water: FARM_CONFIG.waterCost, fertilizer: FARM_CONFIG.fertilizerCost, pesticide: FARM_CONFIG.pesticideCost };
    if (!costs[id]) return 'Vật tư không tồn tại';
    if (f[id] >= 30) return 'Đã đủ 30 vật tư';
    if (!spendMoney(costs[id], 'farm-supply')) return 'Không đủ tiền';
    f[id]++;
  } else if (['chicken', 'feed', 'eggs'].includes(action)) {
    if (!f.buildings.coop) return 'Hãy xây chuồng gà trước';
    if (action === 'chicken') {
      if (animals.chickens >= 6) return 'Chuồng đã đủ 6 con gà';
      if (!spendMoney(12000, 'farm-chicken')) return 'Không đủ tiền';
      animals.chickens++;
    } else if (action === 'feed') {
      if (!animals.chickens) return 'Hãy mua gà trước';
      if (animals.feedDays >= 6) return 'Đã đủ thức ăn';
      if (!spendMoney(animals.chickens * 1000, 'farm-feed')) return 'Không đủ tiền';
      animals.feedDays += 3;
    } else {
      if (!animals.eggs) return 'Chưa có trứng để thu hoạch';
      addMoney(animals.eggs * 2500, 'farm-eggs'); animals.eggs = 0;
    }
  } else if (['stockFish', 'fishFeed', 'fish', 'net'].includes(action)) {
    if (!f.buildings.pond) return 'Hãy xây ao nước trước';
    if (action === 'stockFish') {
      if (animals.fish) return 'Thu hoạch hết lứa cá hiện tại trước';
      if (!spendMoney(12000, 'farm-fish')) return 'Không đủ tiền';
      animals.fish = 5; animals.fishAge = 0; animals.fishFeedDays = 0;
    } else if (action === 'fishFeed') {
      if (!animals.fish) return 'Ao chưa có cá';
      if (animals.fishFeedDays >= 6) return 'Đã đủ thức ăn';
      if (!spendMoney(2000, 'farm-fish-feed')) return 'Không đủ tiền';
      animals.fishFeedDays += 3;
    } else {
      if (!animals.fish || animals.fishAge < 3) return 'Cá cần 3 ngày được cho ăn để lớn';
      const count = action === 'net' ? animals.fish : 1;
      animals.fish -= count;
      addMoney(count * (action === 'net' ? 4000 : randInt(3500, 6000)), 'farm-fishing');
    }
  } else if (action === 'honey') {
    if (!f.buildings.beehive || !f.honeyStock) return 'Chưa có mật ong';
    const received = addIngredient('honey', f.honeyStock);
    if (!received) return 'Kho mật ong đã đầy';
    f.honeyStock -= received;
  } else return 'Thao tác không tồn tại';
  touch(); return null;
}
export function advanceFarmDay() {
  const weather=gameState.weather; const rain=weather==='rain'; const storm=rain && chance(0.15); const flood=storm && chance(0.25);
  const f = gameState.farm;
  f.animals.butterfly = f.buildings.flowerGarden && chance(0.7) ? 1 : (chance(0.35) ? 1 : 0);
  f.animals.dragonfly = f.buildings.pond && gameState.weather === 'rain' ? 1 : 0;
  f.animals.chicken = f.buildings.coop ? f.livestock.chickens : 0;
  if (f.buildings.coop && f.livestock.feedDays > 0) { f.livestock.eggs += f.livestock.chickens; f.livestock.feedDays--; }
  if (f.buildings.pond && f.livestock.fish > 0 && f.livestock.fishFeedDays > 0) { f.livestock.fishAge = Math.min(3, f.livestock.fishAge + 1); f.livestock.fishFeedDays--; }
  if (f.buildings.beehive) f.honeyStock = Math.min(20, (f.honeyStock || 0) + 1);
  if (f.animals.chicken && chance(0.65)) f.fertilizer = Math.min(20, f.fertilizer + 1);
  for (const p of gameState.farm.plots) if (p) {
    if (rain) p.water=Math.min(100,p.water+30); else p.water=Math.max(0,p.water-25);
    if (flood && !(gameState.farm.upgrades.drainage>0)) p.flooded=true;
    if (p.flooded) { p.health-=20; p.flooded=false; }
    if (p.water<20) p.health-=12;
    if (weather==='sunny') p.age += p.health>50 ? 1 : 0;
    else if (weather==='cloudy') p.age += 1;
    else if (weather==='rain') p.age += p.water>20 ? 1 : 0;
    else p.age += 1;
    if (chance(0.18) && !p.pest) p.pest=true;
    if (f.animals.dragonfly && p.pest && chance(0.6)) p.pest=false;
    if (p.pest) p.health-=8;
    p.health=Math.max(0,p.health);
    if (p.health===0) p.age=0;
  }
  if (f.animals.butterfly) {
    const live = f.plots.filter(Boolean);
    if (live.length && chance(0.55)) live[randInt(0, live.length - 1)].pollinated = true;
    emit(EVENTS.FARM_EVENT, { type: 'butterfly' });
  }
  if (f.animals.chicken && chance(0.25)) emit(EVENTS.FARM_EVENT, { type: 'chicken' });
  if (f.animals.dragonfly) emit(EVENTS.FARM_EVENT, { type: 'dragonfly' });
  if (storm) emit(EVENTS.FARM_EVENT,{type:'storm'});
  touch();
}
export function updateFarm() {}
