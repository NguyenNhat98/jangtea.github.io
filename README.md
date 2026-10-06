# 🧋 Tiệm Trà Mơ Ước

Game quản lý tiệm trà cozy, mobile-first, thuần HTML/CSS/JS, không backend.

## Chơi

Mở `index.html` bằng trình duyệt. Không cần server.

## Sửa code

Mã nguồn dạng ES modules nằm trong `js/`. Trình duyệt chặn module khi mở qua `file://`, nên `index.html` nạp bản gộp `js/bundle.js`.
Sau khi sửa bất kỳ file nào trong `js/`, chạy `build.bat` (cần Node.js) để gộp lại.

Muốn chạy thẳng từ module (không cần build) thì phục vụ thư mục qua một static server bất kỳ và đổi thẻ script trong `index.html` thành `<script type="module" src="js/main.js"></script>`.

## Debug

`config.js` có `DEBUG = true`. Trong console: `debugGame.addMoney()`, `debugGame.addXp(500)`, `debugGame.unlockAllRecipes()`, `debugGame.nextDay()`, `debugGame.spawnCustomer()`, `debugGame.completeDelivery()`, `debugGame.resetGame()`.

## Cấu trúc

- `js/config.js`: toàn bộ dữ liệu balance (công thức, nguyên liệu, mùa, thời tiết, nâng cấp, level, buff, chi nhánh, thành tựu).
- `js/state.js`: GameState (source of truth) + dirty flags cho render.
- `js/events.js`: event bus.
- `js/gameLoop.js`: requestAnimationFrame, chỉ render phần dirty.
- `js/save.js`: LocalStorage key `dreamTeaSave`, migration, memory-only fallback.
- `js/systems/`: logic (khách, order, công thức, kho, kinh tế, Karin, buff, thời tiết, lịch, giao hàng, chi nhánh, sưu tập, thành tựu, offline, âm thanh).
- `js/ui/`: DOM render từng khu vực + modal.
- `js/minigames/pearlGame.js`: Ô Ăn Quan Trân Châu.
