/** Modal cài đặt: âm thanh, nhạc, lưu, đặt lại. */
import { gameState } from '../state.js';
import { html } from '../utils.js';
import { setSound, setMusic, playSfx } from '../systems/audioSystem.js';
import { saveGame, resetGame, isStorageAvailable } from '../save.js';
import { openModal, confirmModal, closeAllModals } from './modalUI.js';
import { toast } from './toastUI.js';
import { openTutorial } from './tutorialUI.js';
import { openAchievements } from './achievementUI.js';
import { THEMES, setTheme, vibrate, requestFullscreen } from '../systems/preferencesSystem.js';
import { requestSave } from '../save.js';

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
  const preferences = html(`<section class="preferences"><h3>Màu giao diện</h3><p class="muted">Chọn màu bạn thích, đổi lúc nào cũng được.</p><div class="theme-grid">${THEMES.map(([id, name, accent, bg]) => `<button class="theme-choice ${gameState.settings.theme === id ? 'active' : ''}" data-theme="${id}" aria-pressed="${gameState.settings.theme === id}"><i style="background:linear-gradient(135deg,${bg} 50%,${accent} 50%)"></i>${name}</button>`).join('')}</div><label class="vibration-label">📳 Mức rung <select data-vibration><option value="0">Tắt</option><option value="1">Nhẹ</option><option value="2">Vừa</option><option value="3">Mạnh</option></select></label><p class="muted">Rung cho thao tác và kết quả trò chơi trên thiết bị hỗ trợ.</p><button class="btn btn-soft btn-block" data-fullscreen>⛶ Toàn màn hình</button></section>`);
  preferences.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => {
    setTheme(button.dataset.theme);
    preferences.querySelectorAll('[data-theme]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  }));
  const vibration = preferences.querySelector('[data-vibration]');
  vibration.value = String(gameState.settings.vibration || 0);
  vibration.addEventListener('change', () => { gameState.settings.vibration = Number(vibration.value); vibrate(2); requestSave(); });
  preferences.querySelector('[data-fullscreen]').addEventListener('click', requestFullscreen);
  body.appendChild(preferences);
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
    const saved = saveGame();
    toast(saved ? 'Đã lưu game 💾' : 'Không lưu được (storage bị chặn)', saved ? 'success' : 'error');
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
