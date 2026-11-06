# Game trên Render — link cố định

## Mới ở bản 0.6.4

- Điện thoại chỉ chơi ngang. Xoay dọc sẽ che toàn bộ giao diện và ngừng gửi thao tác; trận online vẫn tiếp diễn.
- PC bấm Vào trận / Khóa chuột để điều khiển tâm bắn. Con trỏ được ẩn khi khóa, Esc mở chuột, Tab cài đặt. Nếu trình duyệt từ chối thì mở trực tiếp trong Chrome/Edge; không còn chế độ kéo chuột tự do thay thế.
- Màn chờ gọn trong một khung ngang. Icon thông tin mở map/chế độ; icon người mở danh sách đầy đủ; bánh răng mở cài đặt. Bản tóm tắt hiện tối đa tám thẻ người, phần chi tiết luôn đủ mọi người.


> **Bản phát hành 0.6.4 đã được người dùng duyệt để cập nhật lên link cố định. Phiên bản đang chạy xem tại /health.**


## Bản thử 0.6.0 — Đảo Rừng Gió

- Map mới riêng, diện tích đúng 40 lần Đảo Kẹo (bán kính 31√40 ≈ 196 m); giữ cả Đảo Cỏ Xanh 20× và Đảo Kẹo. Sinh tồn tối đa 10 phút, trận kết thúc sớm nếu còn một người.
- Lùm cây che vừa nhân vật, chín nhà có cầu thang và bục nhảy lên mái, chín chòi có thang leo bằng E / NHẶT. Có sàn, lan can và va chạm theo độ cao.
- Hòm thêm một kỹ năng ngẫu nhiên dùng một lần và ống ngắm 3×. Giữ một kỹ năng, dùng hết mới nhặt kỹ năng tiếp; không chồng hiệu lực.
- Lướt tốc độ ×3 trong 5s; bật cao và bay 4s; hồi 16 máu/s trong 4s; sát thương súng ×2 trong 4s; tên lửa 65 sát thương/người, xuyên người/vật cản, mỗi người chỉ trúng một lần từ cùng tên lửa.
- C / nút kỹ năng; V / chuột phải khi khóa chuột / nút NGẮM để bật tắt ống ngắm. Ống ngắm cần được nhặt từ hòm và đang cầm súng. Ngắm giảm độ tản, giảm độ nhạy và tắt tự ngắm để bắn đúng tâm.
- PC bấm cảnh để xin khóa chuột, rê chuột nhìn, chuột trái bắn. Esc mở chuột, Tab mở cài đặt. Khung trình duyệt tích hợp báo WrongDocumentError / UnknownError khi thử khóa; cần thử trực tiếp bằng Chrome/Edge. Khi bị từ chối, game cho giữ chuột phải xoay camera.
- Các nút kỹ năng, ống ngắm chỉnh vị trí, cỡ và độ rõ riêng trong trình sửa HUD. Đã kiểm tra hình học 18 UI trên mười kích thước/vùng an toàn, cùng kiểm tra đồng bộ ba kết nối.

**Đã triển khai và kiểm tra thành công ngày 05/11/2026.**

- Chơi: **https://chibi-island-mini.onrender.com**
- Quản lý: https://dashboard.render.com/web/srv-dblv4tt9fdbs73bagjf0
- Kho mã riêng: https://github.com/datmmo0001/chibi-island-mini
- Workspace Render: datpro88.
- Dịch vụ: chibi-island-mini, Docker, **Free**, **Singapore**, một instance.
- Kiểm tra sức khỏe: https://chibi-island-mini.onrender.com/health
- Phiên bản Live trên Render: **0.6.3**. Xem /health và Dashboard để kiểm tra bản Live.
- Mỗi đợt nâng cấp chỉ bàn giao sau khi deploy mới báo Live và qua kiểm tra ba kết nối.

## Đã kiểm tra

- Đã dừng máy chủ chia sẻ Cloudflare trên máy cá nhân; phiên cũ không còn chạy.
- Sau khi dừng phiên cũ, ba kết nối HTTPS/WSS tới Render vẫn vào cùng phòng map Cỏ Xanh, bắt đầu trận tám nhân vật và đồng bộ nhặt súng/nhảy.
- Trình duyệt đã tải game, tạo phòng thành công, không có lỗi JavaScript ở lượt kiểm tra cuối. Phòng kiểm tra đã rời để không chiếm chỗ.
- 22 kiểm thử logic/mạng/sinh tồn đều qua với ws 8.21.0.
- Đã cập nhật ws từ 8.18.3 lên **8.21.0** để vá các cảnh báo bảo mật. Bản dựng Render mới báo `found 0 vulnerabilities` tại thời điểm triển khai.
- Chưa thử bằng ba người thật ở ba mạng khác nhau, hoặc đo hiệu năng trên điện thoại yếu.

## Cách sử dụng

Có thể tắt máy tính cá nhân. Chỉ cần gửi link cố định cho bạn bè. Mọi người vào chung phòng trước khi bắt đầu; xem CHOI_CHUNG_QUA_INTERNET.md. File CHOI_GAME_ONLINE.url mở link nhanh.

Render Free có thể ngủ sau 15 phút không có lưu lượng; lần truy cập tiếp theo có thể chờ khoảng một phút. Link gắn với dịch vụ Render, không đổi mỗi lần ứng dụng khởi động/cập nhật. Giữ dịch vụ và địa chỉ hiện tại để giữ link. Hạn mức miễn phí có thể làm dịch vụ tạm dừng. Phòng và trận trong RAM mất khi khởi động lại.

Không cần bật BAT_GAME_ONLINE.cmd hoặc CHAY_GAME.cmd cho bản Render. CHOI_ONLINE.txt và các nút bật/tắt online cũ chỉ thuộc đường truyền Cloudflare từ máy cá nhân.

## Cập nhật sau này

1. Cập nhật các tệp tương ứng trên nhánh main của kho mã GitHub trên. Thay đổi tệp trong ổ F chưa tự lên Render.
2. Chạy kiểm thử trước khi cập nhật máy chủ. Chỉ duy trì một instance vì chưa chia sẻ trạng thái phòng giữa nhiều máy chủ.
3. Tại Render, chọn **Manual Deploy → Deploy latest commit**. Auto-Deploy đã được chọn Off để chủ động thời điểm cập nhật.
4. Chờ deploy mới báo **Live**, kiểm tra /health rồi chạy `node tests/public-smoke.mjs https://chibi-island-mini.onrender.com` từ thư mục game để kiểm tra ba kết nối.
5. Cập nhật có thể làm gián đoạn phòng đang chơi. Nếu cần, tạo phòng mới sau cập nhật. Link game giữ nguyên.

Máy chủ lấy cổng từ PORT do Render cấp, lắng nghe 0.0.0.0 và phục vụ WebSocket tại /socket. Dockerfile chỉ chép mã game và thư viện cần thiết, không đưa token điều khiển/nhật ký/.runtime/.tools từ máy cá nhân lên.

Nguồn: [Render Free](https://render.com/docs/free), [WebSocket](https://render.com/docs/websocket), [Deploys](https://render.com/docs/deploys), [bản vá ws 8.21.0](https://github.com/websockets/ws/releases/tag/8.21.0).
