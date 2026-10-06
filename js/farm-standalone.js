/* Local-file farm fallback. GitHub Pages uses the complete farm modules. */
(function () {
  const crops = {
    tea: ['🍵', 'Bụi trà', 3, 2500, 1], lemon: ['🍋', 'Cây chanh', 4, 3000, 1], peach: ['🍑', 'Cây đào', 5, 4500, 1],
    rose: ['🌹', 'Hoa hồng', 6, 7000, 7], mint: ['🌿', 'Bạc hà', 3, 3500, 3], ginger: ['🫚', 'Gừng', 4, 4000, 4],
    chrysanthemum: ['🌼', 'Hoa cúc', 4, 5000, 4], lychee: ['🍒', 'Cây vải', 5, 6500, 5], jasmine: ['🌼', 'Hoa nhài', 6, 9000, 6]
  };
  const lands = [
    ['leftGarden', 'Vườn bên trái', 2, 30000, 3, '🌿'], ['rightGarden', 'Vườn bên phải', 2, 60000, 4, '🌳'],
    ['hill', 'Khu đồi', 4, 150000, 5, '⛰️'], ['pondGarden', 'Vườn hồ nước', 4, 300000, 7, '💧'],
    ['greenhouse', 'Nhà kính', 6, 600000, 9, '🏡']
  ];
  let lastDay = null;
  let selectedPlot = null;
  let root = null;
  function notify(message) {
    const note = document.createElement('div');
    note.className = 'farm-notice'; note.textContent = message;
    document.body.append(note);
    setTimeout(() => note.remove(), 2600);
  }
  function state() {
    const s = window.debugGame && window.debugGame.state;
    if (!s) return null;
    if (!s.farm) s.farm = { plots: Array.from({ length: 4 }, () => null), water: 8, fertilizer: 3, pesticide: 2, lands: [], buildings: {}, animals: {} };
    if (lastDay !== null && s.day > lastDay) for (const p of s.farm.plots) if (p) p.age += s.day - lastDay;
    lastDay = s.day;
    return s;
  }
  function save() { window.debugGame && window.debugGame.save && window.debugGame.save(); }
  function render() {
    const s = state();
    if (!s || !root) return;
    const f = s.farm;
    const tiles = f.plots.map((p, i) => {
      const active = selectedPlot === i ? ' is-selected' : '';
      if (!p) return '<button class="farm-plot farm-plot-empty' + active + '" data-fbplot="' + i + '"><span class="farm-soil">＋</span><span>Ô đất trống</span></button>';
      const c = crops[p.cropId] || ['🌱', p.cropId, 3, 0];
      const progress = Math.min(100, Math.round(p.age / c[2] * 100));
      return '<button class="farm-plot farm-plot-grown' + active + (p.age >= c[2] ? ' is-ready' : '') + '" data-fbplot="' + i + '"><span class="farm-crop-icon">' + c[0] + '</span><span class="farm-crop-name">' + c[1] + '</span><span class="farm-growth"><i style="width:' + progress + '%"></i></span><span class="farm-plot-meta">' + (p.age >= c[2] ? '✨ Đã chín' : p.age + '/' + c[2] + ' ngày') + '</span></button>';
    }).join('');
    let panel = '';
    if (selectedPlot !== null && !f.plots[selectedPlot]) {
      const seeds = Object.entries(crops).map(([id, c]) => '<button class="farm-seed" data-fbseed="' + id + '" ' + (s.level < c[4] ? 'disabled' : '') + '><span class="farm-seed-icon">' + c[0] + '</span><span class="farm-seed-name">' + c[1] + '</span><small>' + (s.level < c[4] ? 'Mở ở cấp ' + c[4] : 'Hạt giống · ' + c[3].toLocaleString('vi-VN') + ' đ') + '</small></button>').join('');
      panel = '<section class="farm-selection"><div class="farm-panel-heading"><div><span class="farm-eyebrow">Ô ĐẤT ' + (selectedPlot + 1) + '</span><h3>Chọn hạt giống</h3></div><button class="farm-close-selection" data-fbclose>×</button></div><div class="farm-seeds">' + seeds + '</div></section>';
    } else if (selectedPlot !== null && f.plots[selectedPlot]) {
      const p = f.plots[selectedPlot], c = crops[p.cropId] || ['🌱', p.cropId, 3, 0], ready = p.age >= c[2];
      panel = '<section class="farm-selection farm-care"><div class="farm-panel-heading"><div><span class="farm-eyebrow">Ô ĐẤT ' + (selectedPlot + 1) + '</span><h3>' + c[0] + ' ' + c[1] + '</h3></div><button class="farm-close-selection" data-fbclose>×</button></div><div class="farm-actions"><button class="btn btn-soft" data-fbaction="water">💧 Tưới nước</button><button class="btn ' + (ready ? 'btn-primary' : 'btn-soft') + '" data-fbaction="harvest" ' + (ready ? '' : 'disabled') + '>' + (ready ? '🧺 Thu hoạch' : '⏳ Cây đang lớn') + '</button></div><div class="farm-status">💧 ' + p.water + '% nước</div></section>';
    }
    const expansion = lands.filter((land) => !f.lands.includes(land[0])).map((land) => '<button class="farm-upgrade" data-fbland="' + land[0] + '" ' + (s.level < land[4] ? 'disabled' : '') + '><span>' + land[5] + '</span><b>' + land[1] + ' (+' + land[2] + ' ô)</b><small>' + (s.level < land[4] ? 'Mở ở cấp ' + land[4] : land[3].toLocaleString('vi-VN') + ' đ') + '</small></button>').join('');
    root.innerHTML = '<div class="farm-screen"><header class="farm-header"><div><span class="farm-eyebrow">VƯỜN NGUYÊN LIỆU</span><h2>Nông trại của bạn</h2></div><button class="farm-close-selection" data-fbexit aria-label="Đóng nông trại">×</button></header><div class="farm-supplies"><span>💧 <b>' + f.water + '</b><small>Nước</small></span><span>🧺 <b>' + f.fertilizer + '</b><small>Phân bón</small></span><span>🐞 <b>' + f.pesticide + '</b><small>Thuốc sâu</small></span></div><p class="farm-hint">Chọn một ô đất để gieo hạt hoặc chăm sóc cây trồng.</p><section class="farm-field">' + tiles + '</section>' + panel + '<section class="farm-expansion"><div class="farm-panel-heading"><div><span class="farm-eyebrow">PHÁT TRIỂN</span><h3>Mở thêm ô đất</h3></div></div><div class="farm-upgrade-list">' + expansion + '</div></section><p class="farm-hint">Bản mở trực tiếp hỗ trợ gieo, tưới và thu hoạch cơ bản.</p></div>';
  }
  function install() {
    const nav = document.getElementById('bottomNav');
    if (!nav || nav.querySelector('[data-farm-fallback]')) return;
    const button = document.createElement('button');
    button.className = 'nav-btn'; button.dataset.farmFallback = '';
    button.innerHTML = '<span class="ico">🌱</span><span>Nông trại</span><span class="lock">🔒 3</span>';
    button.onclick = () => {
      const s = state();
      if (!s || s.level < 3) { notify('Nông trại sẽ mở khóa ở cấp 3 🌱'); return; }
      if (root) return;
      selectedPlot = null;
      root = document.createElement('div'); root.className = 'farm-fallback';
      Object.assign(root.style, { position: 'fixed', inset: '0', zIndex: '80', overflow: 'auto', padding: '18px', background: '#382d2680' });
      const panel = document.createElement('div');
      Object.assign(panel.style, { width: 'min(620px, 100%)', margin: '0 auto', padding: '16px', borderRadius: '20px', background: '#fffaf5', boxShadow: '0 12px 40px #0004' });
      root.append(panel); root.addEventListener('click', onClick); document.body.append(root); root = panel; render();
    };
    const branch = nav.querySelector('[data-nav="branch"]');
    (branch ? branch.parentNode : nav).insertBefore(button, branch ? branch.nextSibling : null);
  }
  function onClick(event) {
    const button = event.target.closest('button');
    if (!button) return;
    const s = state();
    if (button.hasAttribute('data-fbexit')) { root.closest('.farm-fallback').remove(); root = null; selectedPlot = null; return; }
    if (button.hasAttribute('data-fbclose')) { selectedPlot = null; render(); return; }
    if (button.dataset.fbplot !== undefined) { selectedPlot = Number(button.dataset.fbplot); render(); return; }
    if (button.dataset.fbseed) {
      const c = crops[button.dataset.fbseed];
      if (s.level < c[4]) { notify('Hạt giống này mở khóa ở cấp ' + c[4]); return; }
      if (s.money < c[3]) { notify('Chưa đủ tiền mua hạt giống 💛'); return; }
      s.money -= c[3]; s.farm.plots[selectedPlot] = { cropId: button.dataset.fbseed, age: 0, water: 65, health: 100 };
      save(); render(); return;
    }
    if (button.dataset.fbland) {
      const land = lands.find((item) => item[0] === button.dataset.fbland);
      if (!land || s.level < land[4]) { notify('Khu đất này sẽ mở khóa ở cấp ' + (land && land[4] || 3)); return; }
      if (s.money < land[3]) { notify('Chưa đủ tiền mở rộng khu đất 💛'); return; }
      s.money -= land[3]; s.farm.lands.push(land[0]);
      s.farm.plots.push(...Array.from({ length: land[2] }, () => null));
      save(); render(); return;
    }
    if (button.dataset.fbaction === 'water') {
      const p = s.farm.plots[selectedPlot];
      if (!s.farm.water) { notify('Bể nước đã cạn 💧'); return; }
      p.water = Math.min(100, p.water + 40); s.farm.water--; save(); render(); return;
    }
    if (button.dataset.fbaction === 'harvest') {
      const p = s.farm.plots[selectedPlot], c = crops[p.cropId];
      if (p.age < c[2]) return;
      const slot = s.inventory[p.cropId] || (s.inventory[p.cropId] = { stock: 0, unlocked: true });
      slot.stock += 2; s.farm.plots[selectedPlot] = null; save(); selectedPlot = null; render();
    }
  }
  const timer = setInterval(() => { install(); if (document.getElementById('bottomNav')?.querySelector('[data-nav="branch"]')) clearInterval(timer); }, 200);
  install();
  new MutationObserver(install).observe(document.body, { childList: true, subtree: true });
})();
