/**
 * Mini-game "Ô Ăn Quan Trân Châu": chạm nhóm ≥2 trân châu cùng màu kề nhau để ăn.
 * Trạng thái: START → PLAYING → SUCCESS/FAIL → RESULT.
 */
import { MINIGAME, INGREDIENT_MAP } from '../config.js';
import { gameState, markDirty } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { html, formatMoney, randInt, chance } from '../utils.js';
import { openModal } from '../ui/modalUI.js';
import { toast } from '../ui/toastUI.js';
import { playSfx } from '../systems/audioSystem.js';
import { addMoney, spendMoney, addXp } from '../systems/economySystem.js';
import { addIngredient } from '../systems/inventorySystem.js';
import { discover } from '../systems/collectionSystem.js';
import { floatText, sparkle } from '../ui/fxUI.js';
import { requestSave } from '../save.js';

const SUCCESS_SCORE = 120;
const PEARL = ['⚫', '🩷', '💚', '💛', '💙'];

let game = null;

function newBoard() {
  const b = [];
  for (let r = 0; r < MINIGAME.rows; r++) {
    b.push([]);
    for (let c = 0; c < MINIGAME.cols; c++) b[r].push(randInt(0, MINIGAME.colors - 1));
  }
  return b;
}

/** Tìm nhóm cùng màu kề nhau (flood fill). */
function groupAt(board, r, c) {
  const color = board[r][c];
  if (color < 0) return [];
  const seen = new Set();
  const stack = [[r, c]];
  const out = [];
  while (stack.length) {
    const [y, x] = stack.pop();
    const key = `${y},${x}`;
    if (seen.has(key) || y < 0 || x < 0 || y >= MINIGAME.rows || x >= MINIGAME.cols || board[y][x] !== color) continue;
    seen.add(key);
    out.push([y, x]);
    stack.push([y + 1, x], [y - 1, x], [y, x + 1], [y, x - 1]);
  }
  return out;
}

/** Trân châu rơi xuống lấp chỗ trống rồi sinh mới ở trên. */
function collapse(board) {
  for (let c = 0; c < MINIGAME.cols; c++) {
    const col = [];
    for (let r = MINIGAME.rows - 1; r >= 0; r--) if (board[r][c] >= 0) col.push(board[r][c]);
    for (let r = MINIGAME.rows - 1; r >= 0; r--) {
      const idx = MINIGAME.rows - 1 - r;
      board[r][c] = idx < col.length ? col[idx] : randInt(0, MINIGAME.colors - 1);
    }
  }
}

function hasMoves(board) {
  for (let r = 0; r < MINIGAME.rows; r++) for (let c = 0; c < MINIGAME.cols; c++) if (groupAt(board, r, c).length >= 2) return true;
  return false;
}

function renderBoard() {
  const el = game.body.querySelector('[data-board]');
  el.innerHTML = game.board
    .map((row, r) => row.map((v, c) => `<button class="mg-cell p${v}" data-r="${r}" data-c="${c}" aria-label="Trân châu">${PEARL[v]}</button>`).join(''))
    .join('');
  for (const cell of el.querySelectorAll('.mg-cell')) cell.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(Number(cell.dataset.r), Number(cell.dataset.c), cell); });
}

function updateHead() {
  game.body.querySelector('[data-score]').textContent = game.score;
  game.body.querySelector('[data-time]').textContent = `${Math.ceil(game.timeLeft)}s`;
  game.body.querySelector('[data-timer-bar]').style.width = `${(game.timeLeft / MINIGAME.duration) * 100}%`;
}

function tap(r, c, cellEl) {
  if (game.state !== 'PLAYING') return;
  const group = groupAt(game.board, r, c);
  if (group.length < 2) {
    game.combo = 0;
    game.body.querySelector('[data-combo]').textContent = '';
    playSfx('pop');
    return;
  }
  game.combo += 1;
  const comboMul = game.combo >= 5 ? 5 : game.combo >= 3 ? 3 : game.combo >= 2 ? 2 : 1;
  const gained = group.length * group.length * comboMul;
  game.score += gained;
  for (const [y, x] of group) game.board[y][x] = -1;
  const comboEl = game.body.querySelector('[data-combo]');
  comboEl.textContent = comboMul > 1 ? `Combo x${comboMul}!` : '';
  comboEl.classList.remove('mg-combo');
  void comboEl.offsetWidth;
  comboEl.classList.add('mg-combo');
  floatText(`+${gained}`, cellEl, 'green');
  playSfx(group.length >= 5 ? 'happy' : 'coin');
  collapse(game.board);
  renderBoard();
  updateHead();
  if (!hasMoves(game.board)) {
    game.board = newBoard();
    renderBoard();
    toast('Bàn mới! 🔄', 'info', 1000);
  }
}

function endGame() {
  if (!game || game.state !== 'PLAYING') return;
  game.state = game.score >= SUCCESS_SCORE ? 'SUCCESS' : 'FAIL';
  clearInterval(game.timer);
  const money = game.score * MINIGAME.moneyPerPoint;
  const pearls = Math.floor(game.score / MINIGAME.pearlPerPoints);
  const rareDrop = game.state === 'SUCCESS' && chance(0.25) ? (gameState.level >= 5 ? 'honey' : 'matcha') : null;
  addMoney(money, 'minigame', false);
  if (pearls) addIngredient('pearl', pearls);
  if (rareDrop) {
    addIngredient(rareDrop, 1);
    discover('ingredients', rareDrop);
  }
  addXp(Math.round(game.score / 4));
  gameState.stats.bestMinigameScore = Math.max(gameState.stats.bestMinigameScore, game.score);
  requestSave();
  emit(EVENTS.MINIGAME_FINISHED, { score: game.score, money, pearls });
  playSfx(game.state === 'SUCCESS' ? 'levelup' : 'sad');
  showResult(money, pearls, rareDrop);
}

function showResult(money, pearls, rareDrop) {
  game.state = 'RESULT';
  game.body.innerHTML = `<div class="col center" style="width:100%">
    <div class="summary-emoji">${money > 0 && game.score >= SUCCESS_SCORE ? '🏆' : '🙂'}</div>
    <div class="summary-big">${game.score >= SUCCESS_SCORE ? 'THÀNH CÔNG!' : 'Cố lên lần sau!'}</div>
    <div class="summary-row"><span>Điểm</span><span>${game.score} (kỷ lục ${gameState.stats.bestMinigameScore})</span></div>
    <div class="summary-row"><span>Tiền thưởng</span><span class="money">+${formatMoney(money)}</span></div>
    <div class="summary-row"><span>Trân châu</span><span>+${pearls} ⚫</span></div>
    ${rareDrop ? `<div class="summary-row" style="background:var(--c-yellow)"><span>Quà hiếm</span><span>+1 ${INGREDIENT_MAP[rareDrop].icon} ${INGREDIENT_MAP[rareDrop].name}</span></div>` : ''}
    <button class="btn btn-primary btn-block" data-close>Nhận thưởng 🎁</button></div>`;
  game.body.querySelector('[data-close]').addEventListener('click', () => game.modal.close());
  sparkle(game.body.querySelector('.summary-emoji'), 10);
}

function startPlaying() {
  game.state = 'PLAYING';
  game.board = newBoard();
  game.score = 0;
  game.combo = 0;
  game.timeLeft = MINIGAME.duration;
  game.body.innerHTML = `<div class="minigame" style="width:100%">
    <div class="mg-head"><span>⭐ <span data-score>0</span></span><span data-combo class="mg-combo"></span><span>⏱️ <span data-time></span></span></div>
    <div class="bar mg-timer"><span data-timer-bar style="width:100%"></span></div>
    <div class="mg-board" data-board></div>
    <p class="muted center">Chạm nhóm ≥2 trân châu cùng màu kề nhau. Combo liên tiếp = nhân điểm! Mục tiêu ${SUCCESS_SCORE} điểm.</p></div>`;
  renderBoard();
  updateHead();
  let last = performance.now();
  game.timer = setInterval(() => {
    const now = performance.now();
    game.timeLeft -= (now - last) / 1000;
    last = now;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      updateHead();
      endGame();
      return;
    }
    updateHead();
  }, 100);
}

export function openPearlGame() {
  if (game) return;
  const free = gameState.stats.minigamePlaysToday < MINIGAME.freePlaysPerDay;
  const body = html(`<div class="col center" style="width:100%">
    <div class="summary-emoji">⚫🩷💚</div>
    <div class="summary-big">Ô Ăn Quan Trân Châu</div>
    <p class="muted">Ăn thật nhiều trân châu trong ${MINIGAME.duration} giây. Điểm đổi thành tiền, trân châu và đôi khi là nguyên liệu hiếm!</p>
    <p class="muted">Kỷ lục: ${gameState.stats.bestMinigameScore} điểm</p>
    <button class="btn btn-primary btn-block" data-start>${free ? '▶️ Chơi (miễn phí hôm nay)' : `▶️ Chơi (${formatMoney(MINIGAME.playCost)})`}</button></div>`);
  const modal = openModal({ title: '🎮 Mini-game', body, id: 'minigame', onClose: () => { if (game?.timer) clearInterval(game.timer); game = null; markDirty('actions'); } });
  game = { modal, body: modal.body, state: 'START', timer: null };
  body.querySelector('[data-start]').addEventListener('click', () => {
    if (!free && !spendMoney(MINIGAME.playCost, 'minigame')) {
      toast('Không đủ tiền', 'error');
      playSfx('error');
      return;
    }
    gameState.stats.minigamePlaysToday += 1;
    playSfx('success');
    startPlaying();
  });
}
