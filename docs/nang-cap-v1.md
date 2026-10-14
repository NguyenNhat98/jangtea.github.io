# Triển khai PhanTichNangCapV1

Tài liệu Word được dùng làm mô tả nâng cấp sản phẩm, đối chiếu cả nội dung và 17 ảnh tham chiếu. Các thay đổi nằm trong dự án hiện tại; không có thao tác xuất bản hoặc thay đổi tài khoản.

| Mục | Kết quả triển khai |
| --- | --- |
| 1. Màn hình đầu | Menu trang trí theo màu đã chọn; một nút bắt đầu/tiếp tục. Chơi mới nằm trong Cài đặt. Yêu cầu fullscreen từ thao tác bấm nút; thêm manifest và metadata mở từ màn hình chính. |
| 2. Cài đặt | 12 màu theo ảnh: kem, cà phê, sô cô la, dâu, đào, trà Thái, chanh, matcha, bạc hà, biển, khoai môn, đêm. Rung tắt/nhẹ/vừa/mạnh cho nút và sự kiện gameplay, lưu cùng bản lưu. |
| 3. Tiệm | Bỏ phần bàn trang trí trống; tiệm vừa viewport dọc và ngang. Trà và topping cuộn trong khay riêng. Order đầu tiên tự hiện, tự chuyển sang khách chờ tiếp theo sau phục vụ/rời đi; vẫn chọn khách thủ công được. |
| 4. Pha trà | Ly S/M/L là hàng có số lượng. Bốn trà chanh/đào/gừng/vải cùng bình nền trà, hương vị chọn trong khay. Thêm trân châu trắng/sợi, hạt nổ, thạch dừa/cà phê, phô mai; đổi tên trân châu thành trân châu đen. Thêm công thức trà gừng. Bấm chọn ly, thêm hương vị, bấm bình để rót, bấm máy để đóng nắp/giao. |
| 5. Kho | Tab Trà/Hương/Topping/Dụng cụ. Nút −/+, số lượng nhập, nhập hàng, mua nhanh và mua đầy. Kiểm tra số nguyên dương, tiền, mở khóa và sức chứa. |
| 6. Mini-game | Menu chọn hai trò. Trò nhóm dùng icon nguyên liệu ngẫu nhiên mỗi ván, nổ nhóm, rơi ô, combo, âm thanh/rung. Trò xếp khối dùng bàn 8×8, 3 khối, preview vị trí, xóa hàng/cột đồng thời, phát hiện hết nước đi và kết thúc nhận thưởng. |
| 7. Thông báo thưởng | Không xếp hàng popup riêng cho từng phát hiện. Nhận thưởng có một modal gồm tiền, XP, trân châu, quà hiếm, quà lên cấp và các phát hiện mới. Nút kết thúc chỉ cấp thưởng một lần. Tổng kết ngày cũng gom phát hiện. |
| 8. Nông trại | Migration bảo toàn danh sách ô, tính lại số ô dựa trên đất đã mua để phục hồi ô trống bị mất. Công trình có bảng thao tác thực: mua/cho gà ăn/thu trứng; thả/cho cá ăn/câu/thu lưới; thu mật ong. Mua vật tư chăm cây, chặn trồng ngoài đất sở hữu, giữ cây khi kho thiếu chỗ thu hoạch. |
| 9. Hướng dẫn | 13 bước cụ thể, nút trước/tiếp, chữ có chiều cao và cuộn riêng khi cần, lớp hiển thị trên cùng và đặt trong viewport. Dừng kiên nhẫn và pha chế khi xem hướng dẫn. |

## Quy tắc chơi và lưu dữ liệu

- Bản lưu phiên bản 3 giữ tương thích dữ liệu cũ. Bổ sung ly ban đầu khi bản lưu chưa có các mặt hàng mới. Các ô đã bị bản cũ xóa mất cây chỉ có thể khôi phục thành ô trống; dữ liệu cây đã xóa không thể suy ra.
- Mỗi phần trà dùng một ly đúng cỡ và một phần công thức. Topping đã nằm trong công thức không bị trừ lần thứ hai khi bấm chọn. Không đá bỏ nguyên liệu đá; nhiều đá và thêm trân châu tăng định lượng tương ứng. Đơn online tiếp tục chuyển qua hệ thống giao hàng hiện có.
- Chất lượng đóng nắp theo vị trí thanh timing; vị trí được chốt ngay khi bấm máy, hiệu ứng đóng nắp không làm lệch điểm chất lượng.
- Mini-game dùng chung lượt miễn phí và giá chơi hiện có. Trò nhóm: số ô² × combo (tối đa ×5). Xếp khối: mỗi ô +5; xóa dòng +80 × số dòng² × combo (tối đa ×5). Không xóa dòng trong một lượt đặt khối sẽ ngắt combo.
- Tiệm dừng nhận khách và chạy pha chế khi mini-game đang mở; bộ đếm mini-game nhóm vẫn chạy. Đóng ván đang chơi sẽ bỏ ván. Đóng màn hình kết quả sẽ nhận thưởng; cờ trạng thái ngăn nhận lại khi đóng bảng tổng hợp.
- Mỗi gà được cho ăn tạo một trứng khi sang ngày; chuồng tối đa 6 gà. Một lần cho ăn đủ 3 ngày, thu trứng bán 2.500đ/quả. Ao nuôi 5 cá mỗi lứa; cá lớn sau 3 ngày được cho ăn, câu từng con hoặc kéo lưới cả lứa. Tiến độ chăn nuôi tính theo ngày trong game, không phải ngày thực.
- Mỗi tổ ong tạo một lọ mật/ngày, giữ tối đa 20 lọ chờ thu. Thu mật vào kho chỉ trừ số lọ thực nhập được.
- Mã nguồn ES module và bản mở file sử dụng cùng hệ thống. Các script standalone cũ không còn được tải từ `index.html`. Chạy `build.bat` sau khi sửa JavaScript để đồng bộ bundle.

## Giới hạn nền tảng

Trình duyệt không cho website tự xóa thanh địa chỉ. Fullscreen cần thao tác của người chơi và hỗ trợ thiết bị; mở từ màn hình chính có thể dùng chế độ standalone. API rung cũng phụ thuộc thiết bị, và thường không có trên iPhone. Game chưa cài service worker nên không cam kết chơi ngoại tuyến.

## Kiểm chứng

Các kiểm tra Chromium chạy trên mã thật bằng hồ sơ tách biệt, gồm giao dịch kho, quantity, không trừ trùng hương vị, máy đóng nắp, migration đất, trứng/cá, ranh giới khối, giao điểm hàng/cột, điều kiện hết nước đi, chia sẻ lượt miễn phí, nhận thưởng, lưu màu/rung và hình học viewport. Kiểm tra riêng giai đoạn sẵn sàng đóng nắp có trợ lý để tránh nút bị cắt trên màn hình thấp.

Chạy `scripts/test-browser.ps1` cho bundle và thêm `-Modules` cho mã ES module. Ảnh màn hình và kết quả được tạo dưới `.test-output/` và không đưa vào Git. Âm thanh thật, rung vật lý và quyền fullscreen cần thử thêm trên thiết bị thật.

Kết quả chạy: 40/40 kiểm tra đạt trên từng kích thước 320×568 (bundle), 390×844 (ES module), 740×360 (bundle), 1280×800 (ES module). `git diff --check` không báo lỗi khoảng trắng.
