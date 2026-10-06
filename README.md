# Tiệm Trà Mơ Ước

Game quản lý tiệm trà cozy, chạy dưới dạng website tĩnh, không cần backend hoặc bước build.

## Chơi và triển khai

GitHub Pages tải trực tiếp các ES module trong `js/`, bao gồm toàn bộ hệ thống nông trại. Khi mở `index.html` bằng `file://`, trang tự dùng `js/bundle.js` để tương thích với trình duyệt chặn module trên file cục bộ; chế độ này có giao diện nông trại cơ bản. Không cần cài Node.js.

## Sửa code

Mã nguồn chính nằm trong `js/`. Sau khi sửa, tải lại trang. GitHub Pages dùng `js/main.js`; chế độ mở file dùng bundle tương thích đã có sẵn.

## Debug

`config.js` có `DEBUG = true`. Trong console: `debugGame.addMoney()`, `debugGame.addXp(500)`, `debugGame.unlockAllRecipes()`, `debugGame.nextDay()`, `debugGame.spawnCustomer()`, `debugGame.completeDelivery()`, `debugGame.resetGame()`.

## Cấu trúc

- `js/config.js`: dữ liệu balance và cấu hình game.
- `js/state.js`: trạng thái game và dirty flags cho render.
- `js/events.js`: event bus.
- `js/gameLoop.js`: vòng lặp game và render.
- `js/save.js`: lưu LocalStorage, migration và memory-only fallback.
- `js/systems/`: logic gameplay, bao gồm nông trại.
- `js/ui/`: giao diện DOM cho từng khu vực và modal.
- `js/minigames/pearlGame.js`: minigame Ô Ăn Quan Trân Châu.
