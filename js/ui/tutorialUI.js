/** Hướng dẫn từng bước cho người chơi mới. */
import { gameState } from '../state.js';
import { html, esc } from '../utils.js';
import { openModal } from './modalUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { requestSave } from '../save.js';

const STEPS = [
  { text: 'Đây là quầy của bạn. Mọi ly trà ngon đều ra đời ở đây 🫖', target: '#counter' },
  { text: 'Khách sẽ xuất hiện ở khu này sau khi bạn bấm "Mở cửa". Mỗi khách có thanh kiên nhẫn, đừng để nó cạn!', target: '#customerArea' },
  { text: 'Khách muốn một món. Chạm vào khách để xem công thức họ gọi.', target: '#customerArea' },
  { text: 'Kiểm tra nguyên liệu rồi bấm "Pha chế". Thiếu gì thì ghé Kho để mua.', target: '#counter' },
  { text: 'Khi pha xong, một thanh timing hiện ra. Bấm "PHỤC VỤ" lúc vạch ở vùng xanh đậm để được PERFECT (+20% tiền)!', target: '#counter' },
  { text: 'Nhận tiền, tăng rating và XP. Lên cấp sẽ mở công thức, giao hàng và chi nhánh.', target: '#hud' },
  { text: 'Dùng tiền để nâng cấp tiệm: pha nhanh hơn, khách kiên nhẫn hơn, thêm chỗ ngồi.', target: '#shopActions' },
  { text: 'Khi khách sốt ruột, nhờ Karin "Xin Phước": +20s kiên nhẫn cho mọi khách và tiền may mắn 🐰', target: '#karinArea' },
];

let box = null;
let highlighted = null;

function clearHighlight() {
  highlighted?.classList.remove('tutorial-highlight');
  highlighted = null;
}

function finish() {
  clearHighlight();
  box?.remove();
  box = null;
  gameState.tutorial.done = true;
  gameState.tutorial.step = 0;
  requestSave();
}

function showStep(i) {
  clearHighlight();
  if (i >= STEPS.length) {
    finish();
    return;
  }
  const step = STEPS[i];
  gameState.tutorial.step = i;
  const target = document.querySelector(step.target);
  if (target) {
    target.classList.add('tutorial-highlight');
    highlighted = target;
  }
  if (!box) {
    box = html('<div class="tutorial-box" role="dialog" aria-label="Hướng dẫn"></div>');
    document.getElementById('app').appendChild(box);
  }
  box.innerHTML = `<div class="step">HƯỚNG DẪN ${i + 1}/${STEPS.length}</div><p>${esc(step.text)}</p>
    <div class="row"><button class="btn btn-soft btn-sm" data-skip>Bỏ qua hướng dẫn</button><span class="grow"></span><button class="btn btn-primary btn-sm" data-next>${i === STEPS.length - 1 ? 'Bắt đầu! 🎉' : 'Tiếp →'}</button></div>`;
  box.querySelector('[data-skip]').addEventListener('click', () => {
    playSfx('click');
    finish();
  });
  box.querySelector('[data-next]').addEventListener('click', () => {
    playSfx('click');
    showStep(i + 1);
  });
}

/** Mở hướng dẫn (force = xem lại). */
export function openTutorial(force = false) {
  if (!force && gameState.tutorial.done) return;
  const body = html('<div class="col center"><div class="summary-emoji">🧋</div><p class="bold">Chào mừng đến Tiệm Trà Mơ Ước!</p><p class="muted">Bạn vừa nhận một tiệm trà nhỏ xinh. Hãy pha những ly trà ngon, làm khách vui và biến nó thành thương hiệu trong mơ nhé.</p></div>');
  const foot = html('<div class="row" style="width:100%"><button class="btn btn-soft grow" data-skip>Bỏ qua</button><button class="btn btn-primary grow" data-go>Hướng dẫn</button></div>');
  const m = openModal({ title: '🌸 Xin chào!', body, foot, center: true, closeOnBackdrop: false, hideClose: true });
  foot.querySelector('[data-skip]').addEventListener('click', () => {
    m.close();
    finish();
  });
  foot.querySelector('[data-go]').addEventListener('click', () => {
    m.close();
    showStep(0);
  });
}
