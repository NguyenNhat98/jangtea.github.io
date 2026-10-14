import { MINIGAME, INGREDIENTS } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { html, formatMoney, randInt } from '../utils.js';
import { openModal } from '../ui/modalUI.js';
import { toast } from '../ui/toastUI.js';
import { spendMoney } from '../systems/economySystem.js';
import { playSfx } from '../systems/audioSystem.js';
import { vibrate } from '../systems/preferencesSystem.js';
import { requestSave } from '../save.js';
import { claimMinigameReward } from './rewards.js';

export const BOARD_SIZE = 8;
export const SHAPES = [
  [[0, 0]], [[0, 0], [0, 1]], [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]], [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 1]], [[0, 0], [0, 1], [1, 1], [1, 2]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
];
export function canPlace(board, shape, row, col) {
  return shape.every(([dy, dx]) => row + dy >= 0 && col + dx >= 0 && row + dy < BOARD_SIZE && col + dx < BOARD_SIZE && !board[row + dy][col + dx]);
}
export function clearLines(board) {
  const rows = [], cols = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (board[i].every(Boolean)) rows.push(i);
    if (board.every(row => Boolean(row[i]))) cols.push(i);
  }
  const cleared = [];
  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
    if (rows.includes(r) || cols.includes(c)) { cleared.push([r, c]); board[r][c] = null; }
  }
  return { count: rows.length + cols.length, cleared };
}
export function hasPlacement(board, pieces) {
  return pieces.some(piece => piece && board.some((row, r) => row.some((_, c) => canPlace(board, piece.shape, r, c))));
}

let game = null;
function newPieces() {
  return Array.from({ length: 3 }, () => ({ shape: SHAPES[randInt(0, SHAPES.length - 1)], icon: INGREDIENTS[randInt(0, INGREDIENTS.length - 1)].icon }));
}
function preview(r, c) {
  const piece = game.pieces[game.selected];
  game.body.querySelectorAll('.block-cell').forEach(cell => cell.classList.remove('preview', 'invalid'));
  if (!piece) return;
  const valid = canPlace(game.board, piece.shape, r, c);
  piece.shape.forEach(([dy, dx]) => game.body.querySelector(`[data-row="${r + dy}"][data-col="${c + dx}"]`)?.classList.add(valid ? 'preview' : 'invalid'));
}
function render() {
  game.body.innerHTML = `<div class="block-game"><div class="mg-head"><b>⭐ ${game.score}</b><span class="mg-combo">${game.combo > 1 ? `Combo ×${game.combo}` : ''}</span><span>🏆 ${gameState.stats.bestBlockScore || 0}</span></div><p class="block-status" role="status">${game.message || 'Chọn khối bên dưới, rồi chạm ô đặt góc trên trái.'}</p><div class="block-board" aria-label="Bàn xếp khối 8 hàng 8 cột">${game.board.map((row, r) => row.map((icon, c) => `<button class="block-cell ${icon ? 'filled' : ''}" data-row="${r}" data-col="${c}" aria-label="Hàng ${r + 1}, cột ${c + 1}, ${icon ? 'đã có khối' : 'trống'}">${icon || ''}</button>`).join('')).join('')}</div><div class="block-tray">${game.pieces.map((piece, index) => {
    if (!piece) return '<div class="block-piece used">✓</div>';
    const width = Math.max(...piece.shape.map(p => p[1])) + 1;
    const height = Math.max(...piece.shape.map(p => p[0])) + 1;
    return `<button class="block-piece ${game.selected === index ? 'active' : ''}" data-piece="${index}" aria-label="Chọn khối ${index + 1}, ${piece.shape.length} ô" aria-pressed="${game.selected === index}"><span class="piece-grid" style="grid-template-columns:repeat(${width}, 1fr)">${Array.from({ length: width * height }, (_, i) => `<i class="${piece.shape.some(([r, c]) => r === Math.floor(i / width) && c === i % width) ? 'piece-tile' : ''}">${piece.shape.some(([r, c]) => r === Math.floor(i / width) && c === i % width) ? piece.icon : ''}</i>`).join('')}</span></button>`;
  }).join('')}</div><p class="muted">Lấp đầy hàng hoặc cột để xóa. Mỗi ô đặt +5 điểm; mỗi dòng +80 × số dòng × combo. Đặt đủ 3 khối sẽ nhận bộ mới.</p><button class="btn btn-warm btn-block" data-finish>Kết thúc & nhận thưởng</button></div>`;
  game.body.querySelectorAll('[data-piece]').forEach(button => button.addEventListener('click', () => { game.selected = Number(button.dataset.piece); playSfx('click'); render(); }));
  game.body.querySelectorAll('[data-row]').forEach(button => {
    const r = Number(button.dataset.row), c = Number(button.dataset.col);
    button.addEventListener('pointerenter', () => preview(r, c));
    button.addEventListener('focus', () => preview(r, c));
    button.addEventListener('click', () => place(r, c));
  });
  game.body.querySelector('[data-finish]').addEventListener('click', finish);
}
function place(r, c) {
  if (!game || game.state !== 'PLAYING' || game.animating) return;
  const piece = game.pieces[game.selected];
  if (!piece) return toast('Chọn một khối ở khay trước nhé', 'info');
  if (!canPlace(game.board, piece.shape, r, c)) { playSfx('error'); preview(r, c); return; }
  piece.shape.forEach(([dy, dx]) => { game.board[r + dy][c + dx] = piece.icon; });
  game.score += piece.shape.length * 5;
  game.pieces[game.selected] = null;
  const result = clearLines(game.board);
  game.combo = result.count ? Math.min(5, game.combo + 1) : 0;
  if (result.count) game.score += 80 * result.count * result.count * game.combo;
  game.message = result.count ? `✨ Xóa ${result.count} dòng! Combo ×${game.combo}` : `+${piece.shape.length * 5} điểm`;
  game.selected = null;
  playSfx(result.count ? 'happy' : 'pop'); vibrate(result.count ? 2 : 1);
  if (game.pieces.every(p => !p)) game.pieces = newPieces();
  render();
  if (result.count) result.cleared.forEach(([y, x]) => game.body.querySelector(`[data-row="${y}"][data-col="${x}"]`)?.classList.add('block-cleared'));
  if (!hasPlacement(game.board, game.pieces)) finish();
}
function finish() {
  if (!game || game.state !== 'PLAYING') return;
  game.state = 'RESULT';
  game.reward = game.score;
  game.body.innerHTML = `<div class="col center"><div class="summary-emoji">🏆</div><h3>${hasPlacement(game.board, game.pieces) ? 'Một ván thật vui!' : 'Hết chỗ đặt khối!'}</h3><div class="summary-big">${game.score} điểm</div><p>+${formatMoney(game.score * MINIGAME.moneyPerPoint)} · ${Math.floor(game.score / MINIGAME.pearlPerPoints)} trân châu</p><p class="muted">Phần thưởng nguyên liệu nhập theo sức chứa kho.</p><button class="btn btn-primary btn-block" data-claim>Nhận thưởng 🎁</button></div>`;
  game.body.querySelector('[data-claim]').addEventListener('click', () => game.modal.close());
  playSfx('levelup');
}
export function openBlockGame() {
  if (game) return;
  const free = gameState.stats.minigamePlaysToday < MINIGAME.freePlaysPerDay;
  const body = html(`<div class="col center"><div class="summary-emoji">🍵🧩</div><h3>Xếp Khối Tiệm Trà</h3><p>Chọn một trong 3 khối và đặt vào bàn 8×8. Xóa hàng, cột và nối combo; ván kết thúc khi không khối nào đặt được.</p><p class="muted">Không giới hạn thời gian · Kỷ lục ${gameState.stats.bestBlockScore || 0}</p><button class="btn btn-primary btn-block" data-start>${free ? '▶ Chơi miễn phí hôm nay' : `▶ Chơi (${formatMoney(MINIGAME.playCost)})`}</button></div>`);
  const modal = openModal({ title: '🧩 Xếp Khối Tiệm Trà', body, id: 'block-game', closeOnBackdrop: false, onClose: () => {
    const score = game?.reward; game = null; markDirty('actions');
    if (score !== undefined) claimMinigameReward(score, null, 'block');
  } });
  game = { body: modal.body, modal, state: 'START' };
  body.querySelector('[data-start]').addEventListener('click', () => {
    const availableFree = gameState.stats.minigamePlaysToday < MINIGAME.freePlaysPerDay;
    if (!availableFree && !spendMoney(MINIGAME.playCost, 'minigame')) return toast('Không đủ tiền', 'error');
    gameState.stats.minigamePlaysToday++; requestSave();
    Object.assign(game, { state: 'PLAYING', board: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)), pieces: newPieces(), selected: null, score: 0, combo: 0 });
    playSfx('success'); render();
  });
}
