/**
 * Game loop dùng requestAnimationFrame. update(dt) cho các system, render() chỉ vẽ phần dirty.
 */
import { consumeDirty } from './state.js';

const updaters = [];
const renderers = new Map();
const frameRenderers = [];
let lastTime = 0;
let running = false;
let paused = false;

/** Đăng ký hàm update(dt) chạy mỗi frame. */
export function registerUpdate(fn) {
  updaters.push(fn);
}

/** Đăng ký renderer cho một dirty key. */
export function registerRenderer(key, fn) {
  renderers.set(key, fn);
}

/** Renderer chạy mỗi frame (ví dụ thanh kiên nhẫn), phải cực nhẹ. */
export function registerFrameRenderer(fn) {
  frameRenderers.push(fn);
}

function update(dt) {
  for (const fn of updaters) {
    try {
      fn(dt);
    } catch (err) {
      console.error('[GameLoop] Lỗi update:', err);
    }
  }
}

function render(dt) {
  for (const key of consumeDirty()) {
    const fn = renderers.get(key);
    if (!fn) continue;
    try {
      fn();
    } catch (err) {
      console.error(`[GameLoop] Lỗi render "${key}":`, err);
    }
  }
  for (const fn of frameRenderers) {
    try {
      fn(dt);
    } catch (err) {
      console.error('[GameLoop] Lỗi frame render:', err);
    }
  }
}

function frame(timestamp) {
  if (!running) return;
  // Giới hạn dt để tab bị ẩn lâu không tạo bước nhảy lớn.
  const dt = Math.min((timestamp - lastTime) / 1000, 0.25);
  lastTime = timestamp;
  if (!paused) update(dt);
  render(dt);
  requestAnimationFrame(frame);
}

export function startLoop() {
  if (running) return;
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

export function setPaused(value) {
  paused = value;
}

export function isPaused() {
  return paused;
}

/** Render ngay các phần dirty (dùng sau khi load để tránh frame trống). */
export function flushRender() {
  render(0);
}
