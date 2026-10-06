import { FARM_CONFIG } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { addIngredient } from './inventorySystem.js';
import { spendMoney } from './economySystem.js';
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
  const c = FARM_CONFIG.crops[cropId]; if (!c || plot(i)) return 'Ô đất chưa trống';
  if (!spendMoney(c.seedCost, 'farm-seed')) return 'Không đủ tiền mua hạt giống';
  gameState.farm.plots[i] = { cropId, age: 0, water: 65, health: 100, fertilized: false, pest: false, flooded: false };
  touch(); return null;
}
export function water(i) { const p=plot(i); if (!p) return 'Chưa trồng cây'; if (gameState.farm.water<=0) return 'Hết nước'; p.water=Math.min(100,p.water+40); gameState.farm.water--; touch(); return null; }
export function fertilize(i) { const p=plot(i); if (!p) return 'Chưa trồng cây'; if (p.fertilized) return 'Cây đã được bón phân'; if (gameState.farm.fertilizer<=0) return 'Hết phân bón'; p.fertilized=true; gameState.farm.fertilizer--; touch(); return null; }
export function treat(i) { const p=plot(i); if (!p) return 'Chưa trồng cây'; if (!p.pest) return 'Cây không bị sâu'; if (gameState.farm.pesticide<=0) return 'Hết thuốc trừ sâu'; p.pest=false; p.health=Math.min(100,p.health+15); gameState.farm.pesticide--; touch(); return null; }
export function harvest(i) { const p=plot(i); if (!p) return 'Ô đất trống'; const c=FARM_CONFIG.crops[p.cropId]; if (p.age<c.days) return 'Cây chưa chín'; const qty=randInt(c.yield[0],c.yield[1]) + (p.fertilized?1:0) + (p.pollinated?1:0); addIngredient(c.ingredient, qty); gameState.farm.plots[i]=null; touch(); emit(EVENTS.FARM_EVENT,{type:'harvest',qty,crop:c.name}); return null; }
export function advanceFarmDay() {
  const weather=gameState.weather; const rain=weather==='rain'; const storm=rain && chance(0.15); const flood=storm && chance(0.25);
  const f = gameState.farm;
  f.animals.butterfly = f.buildings.flowerGarden && chance(0.7) ? 1 : (chance(0.35) ? 1 : 0);
  f.animals.dragonfly = f.buildings.pond && gameState.weather === 'rain' ? 1 : 0;
  f.animals.chicken = f.buildings.coop ? 1 : 0;
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
