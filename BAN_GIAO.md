# Bàn giao bản 0.6.0 — Đảo Rừng Gió

> **Bản phát hành 0.6.3 đã được người dùng duyệt để cập nhật lên link cố định. Phiên bản đang chạy xem tại /health.**


## Bản thử 0.6.0 — Đảo Rừng Gió

- Map mới riêng, diện tích đúng 40 lần Đảo Kẹo (bán kính 31√40 ≈ 196 m); giữ cả Đảo Cỏ Xanh 20× và Đảo Kẹo. Sinh tồn tối đa 10 phút, trận kết thúc sớm nếu còn một người.
- Lùm cây che vừa nhân vật, chín nhà có cầu thang và bục nhảy lên mái, chín chòi có thang leo bằng E / NHẶT. Có sàn, lan can và va chạm theo độ cao.
- Hòm thêm một kỹ năng ngẫu nhiên dùng một lần và ống ngắm 3×. Giữ một kỹ năng, dùng hết mới nhặt kỹ năng tiếp; không chồng hiệu lực.
- Lướt tốc độ ×3 trong 5s; bật cao và bay 4s; hồi 16 máu/s trong 4s; sát thương súng ×2 trong 4s; tên lửa 65 sát thương/người, xuyên người/vật cản, mỗi người chỉ trúng một lần từ cùng tên lửa.
- C / nút kỹ năng; V / chuột phải khi khóa chuột / nút NGẮM để bật tắt ống ngắm. Ống ngắm cần được nhặt từ hòm và đang cầm súng. Ngắm giảm độ tản, giảm độ nhạy và tắt tự ngắm để bắn đúng tâm.
- PC bấm cảnh để xin khóa chuột, rê chuột nhìn, chuột trái bắn. Esc mở chuột, Tab mở cài đặt. Khung trình duyệt tích hợp báo WrongDocumentError / UnknownError khi thử khóa; cần thử trực tiếp bằng Chrome/Edge. Khi bị từ chối, game cho giữ chuột phải xoay camera.
- Các nút kỹ năng, ống ngắm chỉnh vị trí, cỡ và độ rõ riêng trong trình sửa HUD. Đã kiểm tra hình học 18 UI trên mười kích thước/vùng an toàn, cùng kiểm tra đồng bộ ba kết nối.

## Đã có bản chơi được

- Bản 0.4 thêm dấu vị trí chung, la bàn, thanh nạp đạn và phản hồi khi mất máu.
- Có hướng dẫn và cài đặt đồ họa/camera/âm lượng trong game, lưu trên thiết bị; thao tác và phản hồi súng nhanh hơn.
- Đã thử cài đặt lưu sau reload, menu trong trận, bắn/nạp/đánh dấu, chơi lại và khung điện thoại 390 × 844; không ghi nhận lỗi JavaScript ở lượt cuối.

- Chọn giữa map cũ và map sinh tồn mới có diện tích gấp 20 lần.
- Nền cỏ xanh, hơn 200 vật cản, các cụm địa điểm và biển tên.
- Góc nhìn thứ ba sau vai; camera xoay bằng chuột phải hoặc vuốt vùng phải, có zoom.
- Chạy nhanh, nhảy, đứng lên bục thấp/cao theo bậc, rơi khi rời mép.
- Hòm mở được, cổng đóng/mở được, thùng gỗ bắn vỡ và làm rơi đồ.
- Loot súng, nước tiếp đạn, bình hồi phục; bốn loại súng, hai ô súng, đổi/nạp súng.
- Đường đạn 3D có độ cao, lõi sáng/vệt màu/chớp đầu súng và báo trúng.
- Chạy bo năm giai đoạn, tâm bo dịch chuyển, vòng tiếp theo trên bản đồ nhỏ và nhắc vào bo.
- Chơi ngay một mình hoặc phòng một đến ba người; vẫn đủ tám nhân vật mỗi trận.
- Tệp CHAY_GAME.cmd chạy trực tiếp bằng Node, không cần mở quyền PowerShell.
- Đã triển khai trên Render Free ở Singapore: **https://chibi-island-mini.onrender.com**. Máy tính cá nhân có thể tắt. Sau thời gian vắng người, lần truy cập đầu có thể chờ khoảng một phút để máy chủ thức dậy.
- Nút CHOI_GAME_ONLINE.url mở link cố định. Các nút BAT_GAME_ONLINE.cmd và TAT_GAME_ONLINE.cmd chỉ quản lý đường truyền Cloudflare tạm từ máy cá nhân.

## Đã xác minh

- 22 kiểm thử tự động đều qua.
- Kiểm thử ba tab trên máy này: vào cùng phòng map mới, nhặt súng và nhận cùng kết quả.
- Kiểm tra trực tiếp góc nhìn sau vai, súng/vệt đạn, nút nhặt và nhảy.
- Kiểm tra bố cục desktop và khung điện thoại 390 × 844.
- Qua địa chỉ Internet công khai: HTTPS/WSS, ba kết nối cùng phòng map mới, bắt đầu trận và đồng bộ nhặt súng/nhảy; trình duyệt tạo phòng thành công.
- Đã dừng đường truyền Cloudflare trên máy cá nhân rồi kiểm tra lại ba kết nối qua Render thành công. Bản Render đang Live dùng ws 8.21.0; 22 kiểm thử đều qua sau cập nhật thư viện.
- Bản 0.2 đã được sao lưu trước khi sửa lớn trong vùng làm việc của chat.

## Việc còn cần kiểm tra / phát triển tiếp

1. **Thiết bị thật:** thử đa chạm vừa chạy, xoay camera, nhảy và bắn; đo FPS/nhiệt/pin trên điện thoại yếu. Khung điện thoại trong trình duyệt chưa thay được việc này.
2. **Internet:** đã chuyển lên Render độc lập với máy tính cá nhân. Cần ba người chơi thật thử từ ba mạng khác nhau; kiểm tra tự động dùng ba kết nối qua HTTPS/WSS công khai. Gói miễn phí có thể ngủ khi vắng người và có hạn mức sử dụng, chưa có cam kết hoạt động 24/7.
3. **Độ trễ:** chưa có client prediction/lag compensation; phản hồi có thể chậm khi ping cao.
4. **Vật cản:** một số va chạm hình trụ gần đúng; cần tinh chỉnh mép tường/cổng và camera khi sát vật cản.
5. **AI:** đang tránh vật cản theo hướng cục bộ; có thể đi vòng chưa tối ưu hoặc mắc kẹt ở cụm phức tạp. Chưa có navmesh toàn map.
6. **Cân bằng:** map lớn nhưng vẫn chỉ tám nhân vật; cần chơi thử để chỉnh mật độ đồ, vị trí giao tranh, tốc độ bo và độ khó.
7. **Lưu trữ/phát hành:** chưa có tài khoản, shop, lưu tiến trình trên server, APK, nhiều instance máy chủ hay vận hành public chống phá hoại.

Không có kiểm thử tự động còn thất bại tại thời điểm đóng gói. Các mục trên là giới hạn/chưa nghiệm thu, không phải báo rằng đã kiểm tra xong trên điện thoại hay Internet.

## Mở bản mới

Đóng cửa sổ máy chủ cũ → mở CHAY_GAME.cmd → vào http://localhost:3000 → F5 → chọn Đảo Cỏ Xanh → Chơi ngay → bấm E nhặt súng.

Phím nhanh: WASD đi, Shift chạy, Space nhảy, chuột phải kéo để xoay, chuột trái bắn, E nhặt/mở, R nạp, Q đổi, H hồi phục.
