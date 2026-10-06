/** Thông báo nhỏ trượt từ trên xuống. */
import { html, esc } from '../utils.js';
import { on, EVENTS } from '../events.js';

/**
 * @param {string} message
 * @param {'info'|'success'|'error'|'gold'} type
 */
export function toast(message, type = 'info', duration = 2200) {
  const root = document.getElementById('toastRoot');
  if (!root) return;
  const el = html(`<div class="toast ${type}" role="status">${esc(message)}</div>`);
  root.appendChild(el);
  while (root.children.length > 4) root.firstElementChild.remove();
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 260);
  }, duration);
}

export function initToastUI() {
  on(EVENTS.TOAST, ({ message, type }) => toast(message, type));
}
