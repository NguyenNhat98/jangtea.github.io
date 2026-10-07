/* Classic-script barista presentation for direct file:// opening. */
(function () {
  const destinations = [
    { id: 'office', name: 'Văn phòng Mây', duration: 25, reward: 30000 }, { id: 'school', name: 'Trường Hoa Mai', duration: 30, reward: 35000 },
    { id: 'park', name: 'Công viên Xanh', duration: 20, reward: 25000 }, { id: 'hospital', name: 'Bệnh viện Nắng', duration: 40, reward: 45000 },
    { id: 'apartment', name: 'Chung cư Bình Minh', duration: 35, reward: 40000 }, { id: 'beach', name: 'Bãi biển Mơ', duration: 55, reward: 65000 }
  ];
  const toppings = ['pearl', 'lychee', 'fruit', 'honey', 'rose', 'mint', 'ginger', 'chrysanthemum', 'jasmine', 'snowpearl'];
  let cupSize = 'M', selectedToppings = new Set(), selectedRecipe = null, selectedCustomerId = null, sealing = false, replayServe = false;
  let assigned = new Set(), onlineDelivery = null;
  function drinkColor(id) { return /matcha/i.test(id || '') ? '#95ab65' : /milk|latte/i.test(id || '') ? '#c9a77e' : '#d3a253'; }
  function state() { return window.debugGame && window.debugGame.state; }
  function sound(freq, duration) {
    const s = state(); if (!s || !s.settings?.sound) return;
    try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = new C(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = freq; o.type = 'sine'; g.gain.value = .045; o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + duration); o.onended = () => c.close(); } catch (_) {}
  }
  function recipeMap() { return window.debugGame?.recipes || {}; }
  function chosenCustomer(s) {
    const shop = s?.shop; if (!shop) return null;
    const prep = shop.preparation;
    return prep ? shop.customers.find((c) => c.id === prep.customerId) : shop.customers.find((c) => c.id === shop.selectedCustomerId) || null;
  }
  function recipeTiles(s, recipeMap) {
    return Object.entries(recipeMap).map(([id, r]) => '<button class="tea-choice' + (selectedRecipe === id ? ' active' : '') + '" data-local-tea="' + id + '" ' + (!s.recipes?.[id]?.unlocked || s.shop.preparation ? 'disabled' : '') + '><span class="tea-vessel" style="--tea-color:' + drinkColor(id) + '"><i></i></span><b>' + r.name + '</b></button>').join('');
  }
  function renderStation() {
    const s = state(), counter = document.getElementById('counter');
    if (!s || !counter) return;
    const customer = chosenCustomer(s), prep = s.shop.preparation, map = recipeMap();
    if (customer?.order && !assigned.has(customer.id)) {
      assigned.add(customer.id);
      customer.order.cupSize ||= ['S', 'M', 'M', 'L'][Math.floor(Math.random() * 4)];
      if (s.level >= 3 && Math.random() < .18) {
        customer.order.channel = 'online';
        customer.order.destination = destinations[Math.floor(Math.random() * destinations.length)].id;
      } else customer.order.channel = 'counter';
    }
    if ((customer?.id ?? null) !== selectedCustomerId) {
      selectedCustomerId = customer?.id ?? null;
      selectedRecipe = customer?.order?.recipeId || null;
      cupSize = customer?.order?.cupSize || 'M'; selectedToppings.clear();
    }
    const recipe = map[customer?.order?.recipeId] || map[selectedRecipe];
    const mismatch = !!customer && selectedRecipe !== customer.order.recipeId;
    let station = counter.querySelector('.local-barista');
    if (!station) { station = document.createElement('section'); station.className = 'barista-station local-barista'; counter.append(station); }
    const drinkMenu = recipeTiles(s, map);
    const sizes = [['S', 'Nhỏ', '−10%'], ['M', 'Vừa', 'Giá gốc'], ['L', 'Lớn', '+25%']].map(([id, name, price]) => '<button class="cup-size' + (cupSize === id ? ' active' : '') + '" data-size="' + id + '" data-local-size="' + id + '" ' + (prep ? 'disabled' : '') + '><b>' + id + '</b><span>' + name + '</span><small>' + price + '</small></button>').join('');
    const toppingMenu = toppings.map((id) => {
      const d = s.inventory[id] || { stock: 0, unlocked: false };
      const names = { pearl: ['⚫', 'Trân châu'], lychee: ['🍒', 'Vải'], fruit: ['🍓', 'Trái cây'], honey: ['🍯', 'Mật ong'], rose: ['🌹', 'Hoa hồng'], mint: ['🌿', 'Bạc hà'], ginger: ['🫚', 'Gừng'], chrysanthemum: ['🌼', 'Hoa cúc'], jasmine: ['🌼', 'Hoa nhài'], snowpearl: ['💎', 'Trân châu tuyết'] }[id] || ['✨', id];
      return '<button class="topping-choice' + (selectedToppings.has(id) ? ' active' : '') + (!d.unlocked ? ' locked' : '') + '" data-local-top="' + id + '" ' + (d.stock <= 0 || prep || !d.unlocked ? 'disabled' : '') + '><span class="topping-fill topping-' + id + '">' + (d.unlocked ? names[0] : '🔒') + '</span><b>' + names[1] + '</b><small>' + (d.unlocked ? '×' + d.stock : '🔒') + '</small></button>';
    }).join('');
    const progress = prep?.phase === 'timing' ? 88 : prep?.phase === 'brewing' ? Math.min(88, prep.elapsed / prep.total * 88) : 0;
    const requestName = customer?.order?.specialRequest || '';
    let markup = '<div class="station-heading"><div><span class="station-kicker">TRẠM BARISTA</span><b>' + (customer ? 'Pha theo order của khách' : 'Menu trà luôn sẵn sàng') + '</b></div><span class="station-status">' + (prep?.phase === 'brewing' ? '🫖 Đang rót' : prep?.phase === 'timing' ? '🧢 Đóng nắp' : '● Sẵn sàng') + '</span></div>' +
      '<div class="tea-menu">' + drinkMenu + '</div><div class="station-options"><div class="size-picker"><span class="station-label">CỠ LY</span>' + sizes + '</div><div class="topping-picker"><span class="station-label">TOPPING</span><div class="topping-list">' + (toppingMenu || '<small class="muted">Mua topping trong Kho</small>') + '</div></div></div>' +
      '<div class="brew-bench"><div class="cup-stage ' + (prep?.phase === 'brewing' ? 'pouring' : '') + ' ' + (prep?.phase === 'timing' ? 'cup-ready' : '') + '"><div class="cup-lid">◉</div><div class="cup-glass"><div class="cup-liquid" style="height:' + progress + '%"></div><span class="cup-ingredients">' + (recipe?.icon || '🍵') + [...selectedToppings].map((id) => ({ pearl: '⚫', lychee: '🍒', fruit: '🍓', honey: '🍯', rose: '🌹', mint: '🌿', ginger: '🫚', chrysanthemum: '🌼', jasmine: '🌼', snowpearl: '💎' }[id] || '')).join('') + '</span><span class="cup-size-label">' + cupSize + '</span></div><div class="pour-stream">〰</div></div><div class="cup-build-copy"><b>' + (prep?.phase === 'brewing' ? 'Đang rót trà vào ly…' : prep?.phase === 'timing' ? 'Ly đã pha xong!' : (recipe?.name || 'Ly trà của bạn')) + '</b><small>' + (prep ? 'Cốc ' + cupSize + ' · ' + [...selectedToppings].join(', ') : 'Chọn loại trà, cỡ ly và topping.') + '</small></div></div>' +
      '<div class="station-ticket ' + (customer?.order?.channel === 'online' ? 'online-ticket' : '') + '"><span>' + (customer ? (customer.order.channel === 'online' ? '📱 ĐƠN ONLINE' : '🧾 ORDER') : '🧾 ORDER') + '</span><b>' + (customer ? customer.name + ' · ' + (map[customer.order.recipeId]?.name || '') + ' · Cỡ ' + (customer.order.cupSize || 'M') : 'Chọn khách để bắt đầu pha chế') + '</b><small>' + (customer ? requestName : '') + '</small></div>' + (mismatch ? '<p class="station-warning">Khách đang gọi ' + (map[customer.order.recipeId]?.name || 'món khác') + '. Hãy chọn đúng món.</p>' : '');
    markup = markup.replace('<div class="tea-menu">', '<div class="counter-machine" aria-hidden="true"><span>TIỆM TRÀ</span><i>🧋</i><b>● ●</b><div></div></div><div class="tea-menu">');
    markup = markup.replace('<div class="brew-bench">', '<div class="brew-bench"><span class="bench-label">PHA LY</span>');
    markup = markup.replace('<div class="cup-lid">◉</div>', '<div class="pour-pitcher"></div><div class="cup-lid"></div>');
    markup = markup.replace('<div class="pour-stream">〰</div>', '<div class="pour-stream"></div><div class="tea-splash"></div>');
    markup = markup.replace('<div class="station-ticket ', '<div class="guest-order"><div class="guest-portrait">' + (customer?.avatar || '👩🏻') + '<span>QUẦY TRÀ</span></div><div class="station-ticket ');
    const ticketEnd = markup.lastIndexOf('</small></div>') + '</small></div>'.length;
    markup = markup.slice(0, ticketEnd) + '</div>' + markup.slice(ticketEnd);
    markup += '<div class="station-guide">' + (prep ? 'Đang pha trà · chờ ly đầy để đóng nắp' : 'Chọn trà, cỡ ly và topping · sau đó rót trà') + '</div>';
    const stableMarkup = markup.replace(/height:[\d.]+%/g, 'height:0%');
    if (station.dataset.markup !== stableMarkup) { station.innerHTML = markup; station.dataset.markup = stableMarkup; }
    station.querySelector('.cup-stage')?.style.setProperty('--tea-color', drinkColor(selectedRecipe));
    station.querySelector('.cup-ingredients').innerHTML = [...selectedToppings].map((id) => '<i class="cup-bit">' + ({ pearl: '⚫', lychee: '🍒', fruit: '🍓', honey: '🍯', rose: '🌹', mint: '🌿', ginger: '🫚', chrysanthemum: '🌼', jasmine: '🌼', snowpearl: '💎' }[id] || '') + '</i>').join('');
    const liquid = station.querySelector('.cup-liquid');
    const prepNow = s.shop.preparation;
    if (liquid && prepNow?.phase === 'brewing') liquid.style.height = Math.min(88, prepNow.elapsed / prepNow.total * 88) + '%';
    const oldPrep = counter.querySelector('[data-prep]');
    if (oldPrep) {
      if (oldPrep.dataset.localBaseDisabled === undefined) oldPrep.dataset.localBaseDisabled = String(oldPrep.disabled);
      oldPrep.textContent = '🫖 Rót trà vào ly';
      oldPrep.disabled = oldPrep.dataset.localBaseDisabled === 'true' || mismatch;
    }
    const oldServe = counter.querySelector('[data-serve]');
    if (oldServe) oldServe.textContent = sealing ? '🧢 Đang đóng nắp…' : '🧢 Đóng nắp & giao khách';
    station.querySelectorAll('[data-local-tea]').forEach((b) => b.onclick = () => { selectedRecipe = b.dataset.localTea; sound(650, .07); renderStation(); });
    station.querySelectorAll('[data-local-size]').forEach((b) => b.onclick = () => { cupSize = b.dataset.localSize; sound(520, .06); renderStation(); });
    station.querySelectorAll('[data-local-top]').forEach((b) => b.onclick = () => {
      const id = b.dataset.localTop, adding = !selectedToppings.has(id), icon = b.querySelector('.topping-fill').textContent;
      adding ? selectedToppings.add(id) : selectedToppings.delete(id); sound(740, .05); renderStation();
      if (adding) {
        const drop = document.createElement('div'); drop.className = 'topping-drop'; drop.innerHTML = '<span>' + icon + '</span><span>' + icon + '</span><span>' + icon + '</span>';
        station.querySelector('.cup-stage')?.append(drop); setTimeout(() => drop.remove(), 700);
      }
    });
    station.querySelector('[data-prep]');
    station.querySelector('[data-serve]');
  }
  function handleCounterPointer(event) {
    const target = event.target.closest('[data-serve]');
    if (!target || replayServe) return;
    const s = state(), customer = chosenCustomer(s), prep = s?.shop.preparation;
    if (!prep || prep.phase !== 'timing' || sealing) return;
    event.preventDefault(); event.stopImmediatePropagation(); sealing = true;
    target.disabled = true; target.textContent = '🧢 Đang đóng nắp…';
    document.querySelector('.local-barista .cup-stage')?.classList.add('sealing');
    document.querySelector('.local-barista .cup-lid')?.classList.add('lid-drop');
    sound(880, .1);
    const position = prep.marker;
    const moneyBefore = s.money;
    const quality = Math.abs(position - .5) < .32;
    if (customer?.order?.channel === 'online' && quality) {
      const dest = destinations.find((item) => item.id === customer.order.destination) || destinations[0];
      s.delivery.availableOrders ||= [];
      s.delivery.availableOrders.push({ id: s.delivery.nextId++, customer: customer.name, recipeId: customer.order.recipeId, destination: dest.id, duration: dest.duration, reward: Math.round(dest.reward * (cupSize === 'L' ? 1.25 : cupSize === 'S' ? .9 : 1)), status: 'waiting', progress: 0 });
      onlineDelivery = true;
    } else onlineDelivery = false;
    selectedToppings.forEach((id) => { const slot = s.inventory[id]; if (slot?.stock > 0) slot.stock--; });
    window.debugGame?.save?.();
    setTimeout(() => {
      sealing = false; replayServe = true;
      if (s.shop.preparation) s.shop.preparation.marker = position;
      target.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
      replayServe = false;
      if (s.money > moneyBefore && cupSize !== 'M') {
        const earned = s.money - moneyBefore;
        s.money = Math.max(0, s.money + earned * (cupSize === 'L' ? .25 : -.1));
      }
      selectedToppings.clear();
      sound(onlineDelivery ? 990 : 784, .15);
      window.debugGame?.save?.();
      if (onlineDelivery) setTimeout(() => document.querySelector('[data-nav="delivery"]')?.click(), 350);
      setTimeout(renderStation, 80);
    }, 550);
  }
  function observe() {
    const counter = document.getElementById('counter');
    if (!counter) return;
    if (!counter.dataset.localBaristaHooked) {
      counter.dataset.localBaristaHooked = '1';
      counter.addEventListener('pointerdown', handleCounterPointer, true);
      new MutationObserver((records) => {
        if (records.some((record) => !record.target.closest?.('.local-barista'))) renderStation();
      }).observe(counter, { childList: true, subtree: true });
    }
    renderStation();
  }
  setInterval(observe, 300);
})();
