/** Modal dùng chung: stack, ESC, click backdrop, focus. */
import { html } from '../utils.js';
import { playSfx } from '../systems/audioSystem.js';

const root = () => document.getElementById('modalRoot');
const stack = [];

/**
 * Mở modal.
 * @param {{title:string, body:HTMLElement|string, foot?:HTMLElement|null, center?:boolean, closeOnBackdrop?:boolean, onClose?:Function, id?:string, hideClose?:boolean}} opts
 * @returns {{el:HTMLElement, close:Function, body:HTMLElement}}
 */
export function openModal(opts) {
  const { title, body, foot = null, center = false, closeOnBackdrop = true, onClose = null, id = '', hideClose = false } = opts;
  if (id) {
    const existing = stack.find((m) => m.id === id);
    if (existing) return existing;
  }
  const backdrop = html(`<div class="modal-backdrop ${center ? 'center' : ''}"></div>`);
  const modal = html(`
    <div class="modal ${center ? 'modal-center' : ''}" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-head"><h2>${title}</h2>${hideClose ? '' : '<button class="modal-close" aria-label="Đóng">✕</button>'}</div>
      <div class="modal-body"></div>
    </div>`);
  const bodyEl = modal.querySelector('.modal-body');
  if (typeof body === 'string') bodyEl.innerHTML = body;
  else if (body) bodyEl.appendChild(body);
  if (foot) {
    const f = html('<div class="modal-foot"></div>');
    f.appendChild(foot);
    modal.appendChild(f);
  }
  backdrop.appendChild(modal);
  root().appendChild(backdrop);

  const handle = { id, el: modal, body: bodyEl, close };
  function close() {
    const idx = stack.indexOf(handle);
    if (idx < 0) return;
    stack.splice(idx, 1);
    backdrop.remove();
    if (onClose) onClose();
  }
  modal.querySelector('.modal-close')?.addEventListener('click', () => {
    playSfx('click');
    close();
  });
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop && closeOnBackdrop) close();
  });
  stack.push(handle);
  requestAnimationFrame(() => (modal.querySelector('.modal-close') || modal).focus?.());
  return handle;
}

const queue = [];
let queueActive = false;

/**
 * Xếp hàng modal thông báo (level up, phát hiện mới...) để hiện lần lượt thay vì chồng lên nhau.
 * @param {(done:Function)=>void} openFn nhận callback `done` phải gọi khi modal đóng
 */
export function queueModal(openFn) {
  queue.push(openFn);
  pumpQueue();
}

function pumpQueue() {
  if (queueActive || !queue.length) return;
  const fn = queue.shift();
  queueActive = true;
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    queueActive = false;
    setTimeout(pumpQueue, 120);
  };
  try {
    fn(done);
  } catch (err) {
    console.error('[Modal] lỗi queue', err);
    done();
  }
}

export function closeTopModal() {
  const top = stack[stack.length - 1];
  top?.close();
}

export function closeAllModals() {
  while (stack.length) stack[stack.length - 1].close();
}

export function isModalOpen(id) {
  return id ? stack.some((m) => m.id === id) : stack.length > 0;
}

/** Hộp thoại xác nhận đơn giản. */
export function confirmModal(title, message, onYes, yesLabel = 'Đồng ý') {
  const foot = html(`<div class="row grow" style="width:100%"><button class="btn btn-soft grow" data-no>Hủy</button><button class="btn btn-danger grow" data-yes>${yesLabel}</button></div>`);
  const m = openModal({ title, body: `<p>${message}</p>`, foot, center: true });
  foot.querySelector('[data-no]').addEventListener('click', m.close);
  foot.querySelector('[data-yes]').addEventListener('click', () => {
    m.close();
    onYes();
  });
  return m;
}

export function initModalUI() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTopModal();
  });
}
