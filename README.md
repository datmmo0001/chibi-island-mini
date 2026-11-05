# Chibi Island Mini

**Chơi ngay: https://chibi-island-mini.onrender.com**

Game sinh tồn góc nhìn thứ ba với phòng riêng tối đa ba người, đấu súng nước, nhảy lên vật cản, nhặt đồ và chạy bo. Có Đảo Cỏ Xanh rộng gấp 20 lần diện tích map Đảo Kẹo. Máy chủ bổ sung đối thủ để đủ tám nhân vật mỗi trận.

## Bản 0.4 — Đồng hành trên đảo

- Đánh dấu phía trước bằng T hoặc nút ⌖; cả phòng thấy trên map 3D và bản đồ nhỏ. Dấu tồn tại tám giây, có thời gian chờ để hạn chế gửi dồn.
- La bàn, tiến độ nạp đạn và phản hồi khi bị bắn.
- Nút Cách chơi và Cài đặt ngay trong game; chọn mức đồ họa, độ nhạy camera, đảo chiều nhìn, âm lượng. Tùy chỉnh được lưu trên thiết bị.
- Camera theo sát hơn, gửi thao tác ngay lúc nhấn/thả và phản hồi súng tức thì. Vị trí, đạn, đồ nhặt, trúng đạn và kết quả vẫn do máy chủ quyết định.
- Thông báo có bản mới ở màn hình chờ/kết quả; không tự tải lại giữa trận.

## Chơi cùng bạn

Cả ba mở link → một người Tạo phòng cùng bạn → gửi lời mời/mã phòng → tất cả Mình sẵn sàng → chủ phòng Lên đảo thôi. Chơi ngay tạo trận riêng.

Máy chủ Render hoạt động độc lập với máy tính cá nhân. Gói Free có thể ngủ khi vắng người; lần mở tiếp theo có thể cần chờ khoảng một phút. Link giữ nguyên qua cập nhật. Phòng cũ mất khi máy chủ khởi động lại.

## Phát triển

Node.js 22 trở lên. `npm install`, `npm test`, `npm start`.

Trình duyệt dùng Three.js; máy chủ Node/WebSocket điều khiển trận đấu. Không cần API ChatGPT hoặc cơ sở dữ liệu. Đồ họa được tạo bằng mã, không lấy tài nguyên từ Play Together.

Kiểm tra bản online: `node tests/public-smoke.mjs https://chibi-island-mini.onrender.com`.

Đọc HUONG_DAN.md để biết điều khiển đầy đủ, RENDER_HOSTING.md để quản lý bản đang chạy, PHAT_TRIEN_TIEP.md để xem các bước tiếp theo trước khi làm bản Android.
