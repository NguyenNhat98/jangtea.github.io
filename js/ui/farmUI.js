import { FARM_CONFIG, WEATHERS } from '../config.js';
import { gameState } from '../state.js';
import { openModal } from './modalUI.js';
import { html, esc, formatMoney } from '../utils.js';
import { plant, water, fertilize, treat, harvest, buyLand, buyBuilding } from '../systems/farmSystem.js';
import { isFeatureUnlocked } from '../systems/economySystem.js';
import { toast } from './toastUI.js';
import { on, EVENTS } from '../events.js';

let current=null;
function render(body) {
  const f=gameState.farm; const weather=WEATHERS[gameState.weather];
  body.innerHTML=`<div class="col"><div class="row between"><span>☀️ ${esc(weather.name)} · ${gameState.temperature}°C</span><span>💧${f.water} · 🧪${f.fertilizer} · 🐞${f.pesticide}</span></div><div class="card center">${f.animals.butterfly?'🦋 Bướm ':''}${f.animals.chicken?'🐔 Gà ':''}${f.animals.dragonfly?'🪰 Chuồn chuồn':''}${!f.animals.butterfly&&!f.animals.chicken&&!f.animals.dragonfly?'🌱 Khu vườn đang chờ sinh vật ghé thăm':''}</div><p class="muted">Mưa tự tưới cây. Bão có thể gây ngập; các công trình giúp nông trại sinh động và bền vững hơn.</p><div class="grid-2">${f.plots.map((p,i)=>{
    if(!p) return `<div class="item-card center"><span class="ico">🟫</span><b>Ô đất trống</b><select data-plant="${i}"><option value="">Gieo cây...</option>${Object.entries(FARM_CONFIG.crops).map(([id,c])=>`<option value="${id}" ${c.unlockLevel && gameState.level<c.unlockLevel?'disabled':''}>${c.icon} ${c.name} · ${formatMoney(c.seedCost)}${c.unlockLevel&&gameState.level<c.unlockLevel?` (cấp ${c.unlockLevel})`:''}</option>`).join('')}</select></div>`;
    const c=FARM_CONFIG.crops[p.cropId], ready=p.age>=c.days;
    return `<div class="item-card"><div class="row between"><span class="ico">${c.icon}</span><b>${p.age}/${c.days} ngày</b></div><span>${esc(c.name)} ${p.pest?'🐛':''} ${p.pollinated?'🦋':''} ${p.flooded?'🌊':''}</span><span class="bar"><span style="width:${Math.min(100,p.water)}%"></span></span><small>💧${p.water} · ❤️${p.health}</small><div class="row"><button class="btn btn-sm btn-soft" data-act="water" data-i="${i}">Tưới</button><button class="btn btn-sm btn-soft" data-act="fertilize" data-i="${i}">Phân</button><button class="btn btn-sm btn-soft" data-act="treat" data-i="${i}">Sâu</button></div><button class="btn btn-sm btn-primary btn-block" data-act="harvest" data-i="${i}" ${ready?'':'disabled'}>${ready?'Thu hoạch':'Đang lớn'}</button></div>`;
  }).join('')}</div></div>`;
  body.querySelector('.col').insertAdjacentHTML('beforeend', `<div class="card"><b>🗺️ Mở rộng nông trại</b><div class="grid-auto">${FARM_CONFIG.lands.filter(x=>!f.lands.includes(x.id)).map(x=>`<button class="btn btn-sm btn-soft" data-land="${x.id}" ${gameState.level<x.unlockLevel?'disabled':''}>${x.icon} ${x.name} · ${formatMoney(x.cost)}${gameState.level<x.unlockLevel?` · cấp ${x.unlockLevel}`:''}</button>`).join('')}</div><b>🏡 Công trình</b><div class="grid-auto">${Object.entries(FARM_CONFIG.buildings).filter(([id])=>!f.buildings[id]).map(([id,x])=>`<button class="btn btn-sm btn-soft" data-building="${id}" ${gameState.level<x.unlockLevel?'disabled':''}>${x.icon} ${x.name} · ${formatMoney(x.cost)}</button>`).join('')}</div></div>`);
  body.querySelectorAll('[data-plant]').forEach(s=>s.addEventListener('change',()=>{if(s.value){const e=plant(Number(s.dataset.plant),s.value); if(e) toast(e,'error'); else render(body);}}));
  body.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>{const fn={water,fertilize,treat,harvest}[b.dataset.act]; const e=fn(Number(b.dataset.i)); if(e) toast(e,'error'); else render(body);}));
  body.querySelectorAll('[data-land]').forEach(b=>b.addEventListener('click',()=>{const e=buyLand(b.dataset.land); if(e) toast(e,'error'); else render(body);}));
  body.querySelectorAll('[data-building]').forEach(b=>b.addEventListener('click',()=>{const e=buyBuilding(b.dataset.building); if(e) toast(e,'error'); else render(body);}));
}
export function openFarm(){ if(!isFeatureUnlocked('farm')) return toast('Mở khóa nông trại ở cấp 3','info'); if(current)return; const body=html('<div class="col"></div>'); render(body); current=openModal({title:'🌱 Nông trại nguyên liệu',body,id:'farm',onClose:()=>current=null}); }
export function initFarmUI(){ on(EVENTS.FARM_EVENT,e=>{ if(e.type==='storm') toast('🌪️ Mưa bão đi qua nông trại!','error'); if(e.type==='butterfly') toast('🦋 Bướm đã thụ phấn cho một cây!','success'); if(e.type==='chicken') toast('🐔 Gà Mơ tìm thấy phân hữu cơ!','info'); if(e.type==='dragonfly') toast('🪰 Chuồn chuồn đã giúp giảm sâu bệnh!','success'); }); on(EVENTS.FARM_CHANGED,()=>{ if(current) render(current.body); }); }
