import { html } from '../utils.js';
import { openModal } from '../ui/modalUI.js';
import { openPearlGame } from './pearlGame.js';
import { openBlockGame } from './blockGame.js';
export function openMinigames() {
  const body = html(`<div class="col minigame-picker"><p class="muted">Một lượt miễn phí mỗi ngày dùng chung cho hai trò. Tiệm tạm dừng đón khách khi bạn đang chơi.</p><button class="game-choice" data-pearl><span>🍋🍑⚫</span><b>Ô Ăn Quan Trân Châu</b><small>30 giây · nổ nhóm nguyên liệu · combo ×5</small></button><button class="game-choice" data-block><span>🍵🧩🥛</span><b>Xếp Khối Tiệm Trà</b><small>Bàn 8×8 · xóa hàng và cột · không giới hạn giờ</small></button></div>`);
  const modal = openModal({ title: '🎮 Chọn mini-game', body, id: 'minigame-menu' });
  body.querySelector('[data-pearl]').addEventListener('click', () => { modal.close(); openPearlGame(); });
  body.querySelector('[data-block]').addEventListener('click', () => { modal.close(); openBlockGame(); });
}
