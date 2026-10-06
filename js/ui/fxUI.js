/** Hiệu ứng bay: chữ nổi, xu, lấp lánh, tim, burst. Tự hủy sau khi animation kết thúc. */
import { html, esc, rand } from '../utils.js';

const layer = () => document.getElementById('fxLayer');
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function centerOf(target) {
  if (!target) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  if (typeof target.x === 'number') return target;
  const r = target.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function spawn(el, ms) {
  const root = layer();
  if (!root) return;
  root.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

/** Chữ bay lên (ví dụ "+35.000đ"). */
export function floatText(text, target, color = '') {
  const { x, y } = centerOf(target);
  const el = html(`<div class="fx-float ${color}" style="left:${x}px;top:${y}px">${esc(text)}</div>`);
  spawn(el, 950);
}

/** Xu bay từ target tới ô tiền trên HUD. */
export function coinFly(target, count = 5) {
  if (reduced()) return;
  const from = centerOf(target);
  const to = centerOf(document.querySelector('[data-hud-money]'));
  for (let i = 0; i < count; i++) {
    const sx = from.x + rand(-20, 20);
    const sy = from.y + rand(-10, 10);
    const el = html(`<div class="fx-coin" style="left:${sx}px;top:${sy}px;--dx:${to.x - sx}px;--dy:${to.y - sy}px;animation-delay:${i * 40}ms">🪙</div>`);
    spawn(el, 900 + i * 40);
  }
}

export function sparkle(target, count = 8) {
  if (reduced()) return;
  const { x, y } = centerOf(target);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const d = rand(30, 60);
    const el = html(`<div class="fx-spark" style="left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px">✨</div>`);
    spawn(el, 750);
  }
}

export function hearts(target, count = 3) {
  if (reduced()) return;
  const { x, y } = centerOf(target);
  for (let i = 0; i < count; i++) {
    const el = html(`<div class="fx-heart" style="left:${x + rand(-18, 18)}px;top:${y - 10}px;animation-delay:${i * 120}ms">💗</div>`);
    spawn(el, 900 + i * 120);
  }
}

export function burst(target) {
  if (reduced()) return;
  const { x, y } = centerOf(target);
  spawn(html(`<div class="fx-burst" style="left:${x}px;top:${y}px"></div>`), 650);
}

/** Lắc nhẹ một element khi lỗi. */
export function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

export function bounce(el) {
  if (!el) return;
  el.classList.remove('bounce');
  void el.offsetWidth;
  el.classList.add('bounce');
}
