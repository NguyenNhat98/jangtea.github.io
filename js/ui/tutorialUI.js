/** Hướng dẫn từng bước cho người chơi mới. */
import { gameState } from '../state.js';
import { html, esc } from '../utils.js';
import { openModal } from './modalUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { requestSave } from '../save.js';

const STEPS = [
  { text: 'Đây là quầy của bạn. Mọi ly trà ngon đều ra đời ở đây 🫖', target: '#counter' },
  { text: 'Khách sẽ xuất hiện ở khu này sau khi bạn bấm "Mở cửa". Mỗi khách có thanh kiên nhẫn, đừng để nó cạn!', target: '#customerArea' },
  { text: 'Order đầu tiên tự hiện trên phiếu ở quầy. Chạm ảnh một khách khác nếu muốn đổi order. Xem số ly, cỡ ly, hương vị và yêu cầu riêng.', target: '#customerArea' },
  { text: 'Bước 1: Bấm vào chồng ly S, M hoặc L đúng cỡ khách gọi. Mỗi ly dùng 1 ly trong kho; đơn 2 ly cần 2 ly và gấp đôi nguyên liệu.', target: '#counter' },
  { text: 'Bước 2: Chọn hương vị. Trà chanh, đào, gừng và vải dùng chung Bình trà, thêm topping tương ứng. Topping trong công thức được tính một lần, topping thêm dùng thêm nguyên liệu.', target: '#counter' },
  { text: 'Bước 3: Bấm Bình trà để rót vào ly. Với trà sữa hoặc matcha, bấm đúng bình riêng. Nếu thiếu hàng, mở Kho: Trà / Hương / Topping / Dụng cụ, chọn số lượng rồi Nhập hàng.', target: '#counter' },
  { text: 'Bước 4: Chờ rót xong, bấm máy TIỆM TRÀ bên phải để đóng nắp và giao khách. Canh vạch giữa vùng xanh đậm được PERFECT (+20% tiền). Đơn online chuyển sang mục Giao hàng.', target: '#counter' },
  { text: 'Nhận tiền, tăng rating và XP. Lên cấp sẽ mở công thức, giao hàng và chi nhánh.', target: '#hud' },
  { text: 'Dùng tiền để nâng cấp tiệm: pha nhanh hơn, khách kiên nhẫn hơn, thêm chỗ ngồi.', target: '#shopActions' },
  { text: 'Khi khách sốt ruột, nhờ Karin "Xin Phước": +20s kiên nhẫn cho mọi khách và tiền may mắn 🐰', target: '#karinArea' },
  { text: 'Mini-game có 2 trò: chạm nhóm nguyên liệu trong 30 giây hoặc xếp khối 8×8 để xóa hàng/cột. Một lượt miễn phí mỗi ngày dùng chung hai trò. Tiệm tạm dừng khi chơi; nhận thưởng một lần sau khi kết thúc.', target: '#shopActions' },
  { text: 'Nông trại mở ở cấp 3: mua thêm đất, gieo hạt, tưới, bón phân và trị sâu. Cây lớn khi sang ngày. Mua vật tư ở nông trại; ô đất mua thêm được lưu lâu dài.', target: '#bottomNav' },
  { text: 'Xây chuồng, mua gà rồi cho ăn để nhận trứng mỗi ngày. Xây ao, thả cá và cho ăn 3 ngày trước khi câu hoặc thu lưới. Cài đặt có 12 màu giao diện, mức rung và nút toàn màn hình.', target: '#bottomNav' },
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
    document.body.appendChild(box);
  }
  box.innerHTML = `<div class="step">HƯỚNG DẪN ${i + 1}/${STEPS.length}</div><p>${esc(step.text)}</p>
    <div class="row"><button class="btn btn-soft btn-sm" data-skip>Bỏ qua</button><button class="btn btn-soft btn-sm" data-back ${i === 0 ? 'disabled' : ''}>← Trước</button><span class="grow"></span><button class="btn btn-primary btn-sm" data-next>${i === STEPS.length - 1 ? 'Bắt đầu! 🎉' : 'Tiếp →'}</button></div>`;
  box.querySelector('[data-back]').addEventListener('click', () => showStep(i - 1));
  box.querySelector('[data-next]').focus();
  const rect = target?.getBoundingClientRect();
  box.classList.toggle('tutorial-top', !!rect && rect.top > window.innerHeight * .55);
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
  if (box) return;
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
