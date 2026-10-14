# Tiệm Trà Mơ Ước

Game quản lý tiệm trà cozy, chạy dưới dạng website tĩnh, không cần backend hoặc bước build.

## Chơi và triển khai

GitHub Pages tải trực tiếp các ES module trong `js/`. Khi mở `index.html` bằng `file://`, trang tự dùng `js/bundle.js` được tạo từ cùng mã nguồn: quầy pha chế, nông trại và hai mini-game đều có đủ chức năng. Không cần cài Node.js.

Nhấn nút bắt đầu/tiếp tục để yêu cầu toàn màn hình. Có thể bật lại trong Cài đặt. Trình duyệt yêu cầu tương tác người dùng và một số thiết bị không hỗ trợ Fullscreen API. Trên điện thoại, dùng “Thêm vào màn hình chính” nếu trình duyệt hỗ trợ để mở website ở chế độ riêng, không có thanh địa chỉ. Game chưa hỗ trợ tải ngoại tuyến.

## Sửa code

Mã nguồn chính nằm trong `js/`. GitHub Pages dùng `js/main.js`. Sau khi sửa JavaScript, chạy `build.bat` để đồng bộ `js/bundle.js` cho chế độ mở file. Script PowerShell chỉ dùng công cụ sẵn có trên Windows, không tải thư viện.

## Nâng cấp V1

- Menu có một nút chơi, tiếp tục tiến trình khi đã có bản lưu. Chơi lại từ đầu nằm trong Cài đặt và có xác nhận xóa dữ liệu.
- 12 bảng màu, 4 mức rung (tắt/nhẹ/vừa/mạnh); lưu cùng tiến trình. Rung phụ thuộc thiết bị.
- Order tự hiện; chọn đúng cỡ ly, thêm hương vị, bấm bình trà để rót, bấm máy đóng nắp để phục vụ. Trà chanh/đào/gừng/vải dùng một bình trà chung.
- Kho chia Trà / Hương / Topping / Dụng cụ, hỗ trợ số lượng nhập tùy chọn. Đơn nhiều ly trừ ly và nguyên liệu theo số phần, không trừ trùng hương vị.
- Mini-game nhóm nguyên liệu có hiệu ứng nổ và combo; thêm Xếp Khối Tiệm Trà 8×8. Một lượt miễn phí dùng chung mỗi ngày, các lượt tiếp theo 5.000đ. Khách và pha chế tạm dừng khi mở mini-game.
- Phát hiện mới được gom vào một bảng tổng hợp khi nhận thưởng. Thưởng nguyên liệu bị giới hạn bởi sức chứa kho.
- Giữ đất đã mua khi tải lại; khôi phục số ô bị cắt trong bản lưu cũ. Gà đẻ trứng khi được cho ăn; cá cần 3 ngày được cho ăn để trưởng thành; công trình ong tích mật hàng ngày.
- Hướng dẫn 13 bước có nút quay lại, giữ nội dung trong màn hình và tạm dừng thời gian chờ của khách.

Chi tiết đối chiếu tài liệu: [docs/nang-cap-v1.md](docs/nang-cap-v1.md).

## Kiểm tra

Chạy các bài kiểm tra trong hồ sơ Chromium riêng, không dùng dữ liệu trình duyệt cá nhân:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-browser.ps1 -Width 320 -Height 568
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-browser.ps1 -Width 390 -Height 844 -Modules
```

Script dùng Chrome hoặc Edge đã cài, kiểm tra lưu/tải, pha chế, kho, màu/rung, hai mini-game, nhận thưởng và bố cục. Kết quả JSON và ảnh màn hình nằm trong `.test-output/`. Cờ `-Modules` kiểm tra mã ES module; mặc định kiểm tra bundle dùng khi mở file.

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
