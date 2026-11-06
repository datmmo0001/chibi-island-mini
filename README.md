# Chibi Island Mini — 0.6.4

## Mới ở bản 0.6.4

- Điện thoại chỉ chơi ngang. Xoay dọc sẽ che toàn bộ giao diện và ngừng gửi thao tác; trận online vẫn tiếp diễn.
- PC bấm Vào trận / Khóa chuột để điều khiển tâm bắn. Con trỏ được ẩn khi khóa, Esc mở chuột, Tab cài đặt. Nếu trình duyệt từ chối thì mở trực tiếp trong Chrome/Edge; không còn chế độ kéo chuột tự do thay thế.
- Màn chờ gọn trong một khung ngang. Icon thông tin mở map/chế độ; icon người mở danh sách đầy đủ; bánh răng mở cài đặt. Bản tóm tắt hiện tối đa tám thẻ người, phần chi tiết luôn đủ mọi người.


Chơi tại **https://chibi-island-mini.onrender.com**. Bản 0.6.4 đã được người dùng duyệt phát hành; kiểm tra phiên bản đang chạy tại `/health` hoặc `/version`.

Game súng nước góc nhìn thứ ba. Mọi map có phòng tối đa 3 hoặc 5 người thật; Rừng Gió thêm tùy chọn 20 người. Chỗ trống được bổ sung đến 8 nhân vật (phòng 3/5) hoặc 20 nhân vật (phòng 20). Chơi ngay mở trận riêng.

- Đảo Kẹo rộng 5 lần bản gốc, có bụi núp và tường chặn đạn. Tùy chọn hồi sinh sau 3 giây, xếp hạng theo kill khi hết giờ.
- Cỏ Xanh rộng 20 lần và Rừng Gió rộng 40 lần diện tích Đảo Kẹo gốc, sinh tồn tối đa 10 phút. Có loot, vòng bo, công trình, cầu thang và chòi canh.
- Kỹ năng và ống ngắm nhặt từ hòm; chat online ở màn chọn map. Bố cục HUD điện thoại chỉnh được vị trí, cỡ và độ rõ.
- PC: WASD đi, Shift chạy, Space nhảy, E nhặt/mở/leo, R nạp, Q đổi súng, H hồi máu, C kỹ năng, V ngắm. Bấm cảnh để xin khóa chuột; Esc mở chuột, Tab cài đặt. Nếu khung nhúng từ chối khóa chuột, mở link trực tiếp trong Chrome/Edge.

Chơi cùng bạn: chọn map và số người → Tạo phòng cùng bạn → gửi mã/lời mời → mọi người vào và sẵn sàng → chủ phòng bắt đầu.

Máy chủ Render chạy độc lập với máy tính cá nhân. Gói Free có thể cần chờ lúc thức dậy sau khi vắng người. Phòng trong RAM mất khi máy chủ khởi động lại. Auto-Deploy giữ Off; chỉ Manual Deploy sau khi đã tải đủ mã.

Node.js 22+: `npm install`, `npm test`, `npm start`. Kiểm tra link công khai: `node tests/public-smoke.mjs https://chibi-island-mini.onrender.com`. Đã có 52 kiểm thử logic/mạng/HUD; cần tiếp tục thử hiệu năng, đa chạm trên điện thoại thật. Chưa phát hành Android/Play Store.
