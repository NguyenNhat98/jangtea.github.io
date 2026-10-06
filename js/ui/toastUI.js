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
  const icon = { info: '💡', success: '🌿', error: '🌸', gold: '✨' }[type] || '💬';
  const role = type === 'error' ? 'alert' : 'status';
  const el = html(`<div class="toast ${type}" role="${role}"><span class="toast-icon" aria-hidden="true">${icon}</span><span>${esc(message)}</span></div>`);
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
