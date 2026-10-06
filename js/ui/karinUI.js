/** Nút Karin với cooldown và hiệu ứng. */
import { gameState } from '../state.js';
import { KARIN } from '../config.js';
import { formatTime, formatMoney } from '../utils.js';
import { bless, karinReady } from '../systems/karinSystem.js';
import { playSfx } from '../systems/audioSystem.js';
import { sparkle, floatText, burst } from './fxUI.js';
import { on, EVENTS } from '../events.js';

export function renderKarin() {
  const area = document.getElementById('karinArea');
  if (!area) return;
  const ready = karinReady();
  area.innerHTML = `
    <button class="karin-btn ${ready ? 'ready' : ''}" data-karin ${ready ? '' : 'disabled'} aria-label="${KARIN.name}: ${KARIN.skillName}">
      ${ready ? '' : `<span class="cd" data-cd>${formatTime(gameState.karin.cooldown)}</span>`}
      <span class="karin-body">${KARIN.avatar}</span>
      <span class="karin-label">${ready ? `✨ ${KARIN.skillName}` : KARIN.name}</span>
    </button>`;
  area.querySelector('[data-karin]').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (!bless()) return;
    btn.classList.add('blessing');
    sparkle(btn, 12);
    burst(btn);
    floatText(`+${KARIN.patienceBonus}s Kiên Nhẫn`, btn, 'green');
    setTimeout(() => floatText(`+${formatMoney(KARIN.luckyMoney)} May Mắn`, btn), 250);
    playSfx('sparkle');
  });
}

/** Cập nhật số giây cooldown mỗi frame (rẻ). */
export function updateKarinFrame() {
  const cd = document.querySelector('[data-cd]');
  if (cd) cd.textContent = formatTime(gameState.karin.cooldown);
}

export function initKarinUI() {
  on(EVENTS.KARIN_BLESS, () => setTimeout(renderKarin, 650));
}
