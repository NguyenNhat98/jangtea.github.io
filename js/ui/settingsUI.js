/** Modal cài đặt: âm thanh, nhạc, lưu, đặt lại. */
import { gameState } from '../state.js';
import { html } from '../utils.js';
import { setSound, setMusic, playSfx } from '../systems/audioSystem.js';
import { saveGame, resetGame, isStorageAvailable } from '../save.js';
import { openModal, confirmModal, closeAllModals } from './modalUI.js';
import { toast } from './toastUI.js';
import { openTutorial } from './tutorialUI.js';
import { openAchievements } from './achievementUI.js';

function toggleRow(label, icon, value, onChange) {
  const row = html(`<button class="toggle" role="switch" aria-checked="${value}" aria-label="${label}"><span>${icon} ${label}</span><span class="sw ${value ? 'on' : ''}"></span></button>`);
  row.addEventListener('click', () => {
    const next = row.getAttribute('aria-checked') !== 'true';
    row.setAttribute('aria-checked', String(next));
    row.querySelector('.sw').classList.toggle('on', next);
    onChange(next);
    playSfx('click');
  });
  return row;
}

export function openSettings() {
  const body = html('<div class="col"></div>');
  body.appendChild(toggleRow('Âm thanh', '🔊', gameState.settings.sound, setSound));
  body.appendChild(toggleRow('Nhạc nền', '🎵', gameState.settings.music, setMusic));
  const info = html(`<p class="muted center">${isStorageAvailable() ? 'Tự động lưu mỗi 30 giây và sau mỗi giao dịch.' : '⚠️ Trình duyệt chặn lưu trữ: tiến trình chỉ giữ trong phiên này.'}</p>`);
  body.appendChild(info);
  const btns = html(`<div class="col">
    <button class="btn btn-soft" data-ach>🏆 Thành tựu</button>
    <button class="btn btn-soft" data-tut>📖 Xem lại hướng dẫn</button>
    <button class="btn btn-primary" data-save>💾 Lưu ngay</button>
    <button class="btn btn-danger" data-reset>🗑️ Chơi lại từ đầu</button>
  </div>`);
  body.appendChild(btns);
  const m = openModal({ title: '⚙️ Cài đặt', body });
  btns.querySelector('[data-save]').addEventListener('click', () => {
    toast(saveGame() ? 'Đã lưu game 💾' : 'Không lưu được (storage bị chặn)', saveGame() ? 'success' : 'error');
  });
  btns.querySelector('[data-ach]').addEventListener('click', () => openAchievements());
  btns.querySelector('[data-tut]').addEventListener('click', () => {
    m.close();
    openTutorial(true);
  });
  btns.querySelector('[data-reset]').addEventListener('click', () => {
    confirmModal('Chơi lại từ đầu?', 'Toàn bộ tiến trình sẽ bị xóa. Bạn chắc chứ?', () => {
      closeAllModals();
      resetGame();
      toast('Đã đặt lại game', 'info');
    }, 'Xóa và chơi lại');
  });
}
