# Chibi Island Mini — 0.7.2

Game online góc nhìn thứ ba: https://chibi-island-mini.onrender.com

Bản phát hành được người dùng yêu cầu cập nhật sau khi thêm bốn nhân vật 3D chibi phong cách hoạt hình Nhật có thiết kế riêng: Akari, Ren, Aoi, Haru. Chọn trong Trang phục; xem mô hình xoay tại /characters.html. 66 kiểm tra qua trước khi triển khai. Kiểm tra /health và /version để xác nhận bản đang chạy.

Bao gồm đầy đủ thay đổi 0.6.5–0.7.1: màn hình chuẩn bị gọn, chân bảng kết quả giữ nút chơi lại/rời phòng, nút toàn màn hình và khóa ngang khi trình duyệt hỗ trợ; tổ đội 2v2,3v3,4v4,5v5 và chặn sát thương đồng đội; nhạc chỉ ở phòng chờ, bật/tắt nhạc và hiệu ứng riêng, giọng tiếng Anh One kill–Four kills/Pentakill; cụm nút theo ảnh 7.

Mọi map giữ phòng 3/5 người thật, Rừng Gió có 20 người. Chơi riêng và chỗ trống có đối thủ máy. Hai đội vào cùng mã phòng; ♟ chọn Xanh/Cam. Chưa có ghép trận tự động giữa các phòng.

Đảo Kẹo rộng 5×, có tường và chế độ hồi sinh 3 giây/tính kill. Cỏ Xanh 20× và Rừng Gió 40× diện tích gốc, sinh tồn tối đa 10 phút. Loot, năm kỹ năng, ống ngắm, cầu thang/chòi và bụi núp.

PC: WASD, Shift chạy, Space nhảy, E nhặt/mở/leo, R nạp, Q đổi súng, H hồi máu, C kỹ năng, V ngắm. Bấm khóa chuột để vào trận; Esc mở con trỏ, Tab cài đặt. Mở Chrome/Edge trực tiếp nếu trình duyệt nhúng chặn pointer lock.

Điện thoại chơi ngang; có nút toàn màn hình ở trang đầu/phòng chờ/trong trận. Trình duyệt có thể từ chối khóa xoay; xoay thủ công khi cần. Hệ thống vẫn cho thoát fullscreen. Cần tiếp tục thử đa chạm/hiệu năng trên thiết bị thật. Chưa có Android APK/Play Store.

Node >=22: npm install, npm test, npm start. Kiểm tra online: node tests/public-smoke.mjs https://chibi-island-mini.onrender.com

Render Free, một instance; máy chủ chạy độc lập PC. Auto-Deploy Off; tải đủ mã rồi Manual Deploy. Phòng ở RAM mất sau restart. Các bản tiếp theo luôn để người dùng thử local và duyệt trước khi upload/deploy.

---
Lịch sử:
# Bản thử 0.7.1 — nhạc phòng chờ và sửa vị trí cụm nút

Điện thoại cùng Wi-Fi: http://192.168.1.15:3100/?v=071
PC: http://127.0.0.1:3100/?v=071

Nhạc nền chỉ phát ở phòng chờ đã tạo/vào phòng. Trang chọn map, trong trận và kết quả đều không có nhạc nền. Có hai công tắc độc lập Nhạc nền phòng chờ và Hiệu ứng/giọng báo kill trong Cài đặt, và hai nút ♫/♪ ở phòng chờ. Âm lượng chung giữ nguyên. 5 kill phát Pentakill bằng giọng tiếng Anh offline; nghe thử trong Cài đặt.

Cụm nút bên phải theo ảnh 7: Bắn (.907,.780), Chạy (.815,.620), Kỹ năng (.733,.665); căn lại Nhảy/Nhặt/Đổi/Nạp cùng cụm để không đè nhau. Giữ kích thước bắn 145%, độ rõ 65%, kỹ năng 110%/80%. Áp dụng từ 700px vùng an toàn ngang, màn hình nhỏ hơn dùng bố cục gọn. Khóa chibi-hud-photo-v7 giữ khóa cũ để khôi phục và thay vị trí cũ cho cụm nút; các tùy chỉnh khác tiếp tục được giữ.

64 kiểm tra qua. Browser xác nhận nhạc chỉ phát ở phòng chờ, tắt hiệu ứng vẫn giữ nhạc, vào trận nhạc dừng; không có lỗi JS. Bố cục kiểm tra nhiều kích thước không đè các nút cố định. Người dùng cần thử cảm giác trên Samsung.

CHƯA upload/deploy. Server vẫn 0.6.4. Chờ người dùng thử offline và đồng ý trước khi đưa lên server. LAN cùng Wi-Fi 192.168.1.0/24 vẫn được mở trên TCP3100.

---
# Bản thử 0.7.0 — nhạc, giọng kill và tổ đội

Điện thoại cùng Wi-Fi: http://192.168.1.15:3100/?v=070
PC: http://127.0.0.1:3100/?v=070

Chọn Số người chơi → Tổ đội 2 vs 2 / 3 vs 3 / 4 vs 4 / 5 vs 5. Vào tổ đội hoặc Tạo phòng. Mời cả hai đội vào cùng mã phòng; bấm biểu tượng người chơi ♟ để chọn Xanh/Cam. Mỗi đội có số chỗ bằng nhau; đổi đội hủy sẵn sàng. Máy bổ sung chỗ trống khi bắt đầu. Chưa có ghép trận tự động giữa các phòng riêng.

Không bắn mất máu đồng đội, cả đạn thường và tên lửa. Máy chỉ nhắm đội đối thủ. Vòng màu chân nhân vật và chấm bản đồ thể hiện đội. Sinh tồn: đội còn người cuối cùng thắng, hết giờ xét số người sống rồi tổng máu rồi kill. Hồi sinh tính kill ở Đảo Kẹo: tổng kill của đội, hòa xét máu và kill theo thứ tự trong mã; kết quả bằng nhau hiện hòa.

Bật ♫ hoặc Cài đặt → Bật âm thanh. Nhạc nền loop tạo riêng và hiệu ứng hồi máu / bị hạ / skill / hạ đối thủ. Giọng tiếng Anh lưu WAV offline: One kill, Two kills, Three kills, Four kills, Five kills; báo tổng kill cá nhân từ 1 đến 5 trong trận, sau đó vẫn có hiệu ứng kill. Cài đặt có nút nghe thử từng âm. Nhạc tạm dừng khi chuyển tab và âm lượng theo cài đặt.

63 kiểm tra đã qua, gồm WSS với đủ người thật 2v2–5v5, đội cân bằng trên ba map, đạn không hại đồng đội, thắng theo đội, file WAV và định tuyến âm thanh. Đã thử trình duyệt tạo 5v5, đổi đội, bắt đầu/kết thúc trận và trạng thái Nhạc nền đang phát. Cần người dùng nghe thử và đánh giá cảm giác trên Samsung thật.

Chưa upload/deploy. Server giữ 0.6.4. Luôn chờ người dùng thử local và đồng ý trước khi đưa lên server.

---
# Bản thử 0.6.6 — chỉ chạy local, chưa upload/deploy

Điện thoại cùng Wi-Fi: http://192.168.1.15:3100/?v=066
PC: http://127.0.0.1:3100/?v=066

Nút ⛶ có ở trang đầu, phòng chờ và trong trận. Màn hình dọc có nút Toàn màn hình · Xoay ngang. Bấm nút để yêu cầu toàn màn hình, rồi thử khóa ngang trên điện thoại. Trình duyệt có thể từ chối; khi đó xoay máy thủ công. Không tự bật khi tải trang/đổi hướng và không ngăn thoát bằng hệ thống. Khóa được giải phóng khi thoát toàn màn hình.

Phòng chờ đã thử ở 915×280, nút sẵn sàng vẫn nằm trong khung. 55 kiểm tra qua. Tự xoay/khóa ngang trên Samsung thật vẫn cần người dùng kiểm tra. Server hiện giữ nguyên 0.6.4; luôn chờ người dùng duyệt bản local trước khi upload/deploy.

---
# Bản thử 0.6.5 — chưa cập nhật server

Kiểm tra trên máy: http://127.0.0.1:3100/?v=065
Điện thoại cùng Wi-Fi: http://192.168.1.15:3100/?v=065

Màn hình chuẩn bị gọn trong một màn hình ngang, nút Chơi ngay/Tạo phòng ở đầu bảng bên phải. Trang phục và chat mở qua nút. Phòng chờ hiển thị hình nhân vật theo trang phục của người thật.

52 kiểm tra qua; kiểm tra giao diện 915×412 và 568×320, bảng không tràn/không cuộn. Server giữ 0.6.4. Luôn chờ người dùng kiểm tra bản local và đồng ý trước khi upload/deploy từng bản.

---
# Bản đang chạy: 0.6.4

https://chibi-island-mini.onrender.com/?v=064

Đã triển khai và kiểm tra ngày 06/11/2026. Điện thoại cần xoay ngang; phòng chờ gọn trong một khung và mở chi tiết bằng biểu tượng. PC bấm vào trận để khóa và ẩn chuột, Esc để thả chuột. Dùng Chrome/Edge trực tiếp; trình duyệt tích hợp có thể chặn khóa chuột.

52 kiểm tra qua. Kiểm tra online ba người và năm người trên cả ba bản đồ đều qua. Bản Render miễn phí vẫn dùng được khi tắt máy tính; lần mở sau thời gian vắng có thể phải chờ máy chủ khởi động.

---

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
