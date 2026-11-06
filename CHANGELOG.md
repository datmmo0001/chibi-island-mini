# 0.7.2 — release authorized
Four original anime-style 3D characters with distinct hair/outfits/accessories, matching selection portraits and a rotatable 3D gallery. Includes all 0.6.5–0.7.1 changes. 66 local tests passed; publication pending live verification.

# 0.7.1 — LOCAL ONLY
Lobby-only music; separate music/effects switches on lobby/settings; offline Pentakill voice replaces five-kills cue. Right-side thumb arc restored from photo 7 with new layout storage revision. 64 tests passed; browser phase/switch checks passed. Pending user offline approval.

# 0.7.0 — LOCAL PREVIEW ONLY
Original loop music, heal/defeat/skill/kill effects, five offline English kill voices, sound previews and visibility/volume handling. Two teams of 2–5 players, lobby team choice, authoritative friendly-fire protection and team results. 63 tests passed. User approval of local preview required before upload/deployment.

# 0.6.9 — local preview
User-saved landscape controls promoted to defaults, retaining exact positions/scale/opacity; compact viewport fallback preserved. Added UI layout export. Not uploaded or deployed.

# 0.6.7 — local preview
Results content scrolls independently; replay/leave controls stay visible. Verified a 20-player result list at 915×280 before and after scrolling.

# 0.6.6 — local preview
Fullscreen controls on home/lobby/portrait gate; gesture-triggered landscape lock with visible fallback; compact lobby at 280px height. 55 tests pass. Samsung hardware rotation pending user check.

# 0.6.5 — local preview only

Compact preparation screen; upper-right play actions; outfit-based human player portraits in lobby. User approval of local preview required before every upload/deployment.

# Các bản cập nhật

## 0.6.4 — Chơi ngang, khóa chuột và màn chờ gọn

- Chặn giao diện và thao tác khi điện thoại để dọc, tiếp tục khi xoay ngang. PC bắt buộc khóa chuột trước khi điều khiển tâm, Esc mở chuột.
- Màn chờ một khung, chi tiết phòng và người chơi mở bằng icon.
- 52 kiểm thử qua; giữ nguyên phòng 3/5/20, kỹ năng và các map.


## 0.6.3 — Bố cục theo ảnh, tường đấu trường, phòng 5 người — bản thử local

- Bố cục ngang theo ảnh 3.jpg: ngắm ở trái phía trên cần di chuyển; tiện ích và số người cùng hàng phía trên; máu/hồi phục/súng ở dưới lệch trái tâm màn hình; nhặt/chạy ở phía trên nút bắn; kỹ năng ở trên-trái nút bắn; nạp ở trái nút nhảy. Giữ nút bắn 61,6 px (nhỏ hơn 30% bản 0.6.1). Đổi súng đặt cạnh UI súng. Bố cục dọc và màn ngang hẹp được điều chỉnh để các vùng chạm không chồng nhau. Khóa lưu UI mới, giữ các bản lưu cũ để quay lại nếu cần.
- Đảo Kẹo thêm tám đoạn tường hộp cao 3,3 m, có va chạm thật và chặn đường đạn quét 3D của cả bốn loại súng. Tường không bị bắn vỡ; các kỹ năng xuyên phá vẫn giữ cơ chế riêng.
- Thay ô 20 người bằng danh sách Số người chơi: 3 hoặc 5 trên mọi map, 20 riêng Rừng Gió. Năm người thật cùng phòng, thêm ba đối thủ cho đủ tám nhân vật. Giới hạn người do server xác thực.
- 50 kiểm tra qua, gồm năm kết nối riêng cùng vào từng map, giới hạn người thứ sáu, cả bốn loại súng bị tường chặn và bố cục dọc/ngang/vùng an toàn. Đã kiểm tra phòng chờ 1/5, map/tường trong trình duyệt, 18 UI khung 915×412 không chồng và không có lỗi JavaScript. Đã triển khai Render và kiểm tra thành công ba kết nối HTTPS/WSS ngày 06/11/2026.

## 0.6.2 — Đảo Kẹo mở rộng và sửa hồi sinh — bản thử local

- Đảo Kẹo có diện tích gấp năm bản gốc, bán kính 31√5 ≈ 69,3 m; vật cản, điểm bắt đầu và vòng bo theo diện tích mới. Thêm 40 lùm cây cao đủ che người, đi vào được và không chặn đạn. Map Cỏ Xanh/Rừng Gió giữ kích thước cũ.
- Sửa mô hình nhân vật sau hồi sinh: tháo và giải phóng nhóm bóng bay/dây, xóa mốc thời gian bay lên, hiện lại mô hình và đặt đúng vị trí server ngay. Không tích lũy bóng qua nhiều lần bị loại. Trạng thái leo/bay/chuyển động được xóa khi hồi sinh.
- Đường kính nút bắn giảm 30% (88 → 61,6); nhảy/chạy/nhặt/đổi và kỹ năng/ngắm tiến gần nút bắn. Lưu bố cục mới bằng khóa riêng để bố cục cũ không ghi đè yêu cầu mới; bản cũ còn lưu để có thể quay lại.
- 47 kiểm tra qua, gồm tám chu kỳ xóa hiệu ứng hồi sinh và mười cấu hình HUD. Đã kiểm tra hồi sinh về đất 100% máu trong trình duyệt. Chưa đưa lên Render.

## 0.6.1 — Phòng 20 người, hồi sinh và chat — bản thử local

- Map Rừng Gió có tùy chọn phòng tối đa 20 người thật; chỗ trống được bổ sung cho đủ 20 nhân vật. Mặc định giữ phòng ba người.
- Đảo Kẹo có chế độ tính điểm kill: hồi sinh sau ba giây tại điểm ngẫu nhiên không nằm trong vật cản, giữ vòng đấu trường mở; hết giờ người nhiều kill nhất thắng, sau đó xét máu khi bằng điểm.
- Hiện ai hạ ai cạnh thời gian. Chat ở màn chọn map, tối đa 160 ký tự mỗi tin và giới hạn tốc độ gửi. Chat được gửi đến mọi người đang mở cùng máy chủ.
- 44 kiểm tra qua; bản Render chưa cập nhật.

## 0.6.0 — Đảo Rừng Gió — bản thử local

**Chưa đưa lên Render. Bản công khai vẫn 0.4.0.**

- Thêm map riêng 40× diện tích Đảo Kẹo, chín cụm nhà/cầu thang/bục lên mái và chín chòi canh có thang leo, lùm cây đủ che người. Giữ hai map cũ và trận sinh tồn tối đa 600 giây.
- Va chạm hộp 3D, sàn có độ cao/không gian bên dưới, bước cầu thang 40 cm và chia nhỏ chuyển động chống xuyên tường khi lướt. Mái nhà có bề mặt riêng để tránh nhấp nháy.
- Núp trong cây ẩn nhân vật với AI, tự ngắm, minimap và cảnh của đối thủ ở xa; bắn/skill làm lộ vị trí. Đạn xuyên lá.
- Hòm thêm ngẫu nhiên một trong năm kỹ năng dùng một lần và ống ngắm 3×. Hiệu lực do server quyết định: tốc độ ×3/5s, bay/4s, hồi 16 HP/s/4s, damage ×2/4s và tên lửa xuyên phá 65 damage/người, chỉ một hit mỗi người/quả.
- Nút C / kỹ năng và V / ống ngắm độc lập, chỉnh bố cục/cỡ/độ rõ được. Scope phóng gần, giảm độ nhạy/tản và bỏ tự ngắm. PC xin Pointer Lock khi bấm cảnh, Esc mở chuột, Tab cài đặt. Khung trình duyệt tích hợp trả lỗi WrongDocumentError/UnknownError, cần kiểm tra khóa chuột thật bằng Chrome/Edge; kéo chuột phải vẫn dùng được khi từ chối.
- 41 kiểm thử qua, gồm ba kết nối cùng map mới, kỹ năng, scope và độ cao thang; kiểm tra trình duyệt mở hòm/nhặt/lướt/ngắm/leo/đi cầu thang. Bố cục 18 UI không chồng ở mười cấu hình hình học, đã kiểm tra DOM 915×412. Cần thử đa chạm/hiệu năng thực trên Samsung trước triển khai.

## 0.5.1 — Điều khiển vòng cung và toàn màn hình — bản thử local

**Chưa đưa lên Render. Tiếp tục chờ duyệt trên điện thoại.**

- Nút nhảy bên trái nút bắn; chạy nhanh ở trên nhảy, nhặt/mở ở trên chạy theo vòng cung. Đổi súng cũng là nút tròn riêng quanh nút bắn.
- Hồi máu cạnh trái vòng máu; nạp đạn cạnh phải UI súng theo yêu cầu vị trí cuối. Hiện icon riêng của từng loại súng và đạn bên dưới.
- Từng nút nhặt, nạp, đổi, hồi máu được di chuyển/chỉnh cỡ/độ rõ riêng trong trình sửa UI. Bố cục mới độc lập với hàng nút đã lưu ở bản cũ.
- Nút toàn màn hình cạnh minimap; giữ chế độ khi mở menu, về phòng chờ, kết thúc/chơi lại. Khi không ở trong trận, nút thoát vẫn xuất hiện ở góc dưới phải. Game chỉ gọi thoát khi nhấn nút; thao tác Back/Esc/đổi ứng dụng và chính sách trình duyệt vẫn có thể thoát toàn màn hình. Không ép bật lại nếu hệ thống thoát.
- 28 kiểm thử qua, gồm vị trí và khoảng cách điều khiển dọc/ngang, vùng tai thỏ, lưu bố cục và xử lý toàn màn hình bị từ chối/thoát từ hệ thống. Đã thử bắn/nhảy/nạp, nhặt súng hiện icon, lưu riêng nút nhặt sau tải lại, bật toàn màn hình rồi mở cài đặt và kết thúc trận trong trình duyệt. Cần người dùng duyệt cảm giác thao tác thực tế trên Samsung.

## 0.5.0 — Bản thử local UI điện thoại — 05/11/2026

**Chưa xuất bản lên Render. Chờ người dùng duyệt trên điện thoại.**

- Đồng hồ trận không khung; vòng máu % giữa đáy màn hình; súng và đạn nền trong suốt bên cạnh.
- Bố cục điều khiển dọc/ngang riêng, có khoảng trống cho tai thỏ và thanh vuốt.
- Trình chỉnh UI trong Cài đặt: kéo, chỉnh ngang/dọc, cỡ 60–150%, độ rõ 25–100%, lưu/hủy/mặc định theo hướng màn hình. Xem trước ngoài trận, khóa thao tác game trong lúc chỉnh. Cần di chuyển vẫn đúng biên độ khi phóng to.
- Sinh tồn tối đa 600 giây, bo thu qua năm giai đoạn đến giây 570. Trận có thể kết thúc sớm khi còn một người; Đảo Kẹo giữ 180 giây.
- 25 kiểm thử logic/mạng, gồm ba kết nối cùng nhận trận 600 giây, biên bố cục, vùng an toàn và dữ liệu lưu sai. Kiểm tra trình duyệt dọc/ngang, kéo/chỉnh cỡ/độ mờ, lưu qua tải lại, tách bố cục theo hướng, hủy và mặc định. Chưa thay cho kiểm tra nhiều ngón trên điện thoại thật.

## 0.4.0 — Đồng hành trên đảo — 05/11/2026

- Dấu vị trí chung cho cả phòng: T / nút ⌖, hiện trên đảo và minimap, tồn tại 8 giây, chờ 3 giây giữa hai lần gửi. Máy chủ kiểm tra người gửi, giới hạn phạm vi, xóa dấu cũ và dấu của người rời trận.
- La bàn theo camera, thanh nạp đạn, phản hồi viền màn hình khi mất máu.
- Hướng dẫn ba bước và phím/nút điều khiển ngay trong game.
- Cài đặt đồ họa tự chọn/nhẹ/cân bằng/sắc nét, độ nhạy camera, đảo chiều nhìn và âm lượng; lưu trên thiết bị.
- Tối ưu trên máy yếu: mức Nhẹ giảm độ phân giải, tắt bóng đổ, giảm hạt hiệu ứng. Thông báo trên điện thoại không chặn nút điều khiển.
- Camera theo sát hơn, phản hồi hướng ngắm/súng nhanh hơn, gửi nhấn/thả phím và thao tác cảm ứng ngay. Sát thương và đường đạn vẫn xác nhận tại máy chủ.
- /version và version trong /health/WebSocket; báo bản mới ở màn hình chờ/kết quả, không tự reload giữa trận.
- 22 kiểm thử logic và mạng; đã kiểm tra hướng dẫn/cài đặt lưu qua reload, bắn/nạp/đánh dấu, chơi lại và khung 390 × 844 trong trình duyệt.

## 0.3 — Đảo Cỏ Xanh

- Map sinh tồn diện tích gấp 20; góc nhìn thứ ba, chạy/nhảy, bậc cao thấp.
- Nhặt súng, hai ô súng, tiếp đạn, hồi phục, hòm/cổng/thùng phá được và bo năm giai đoạn.
- Triển khai lên Render Free ở Singapore với link cố định; cập nhật ws 8.21.0 và kiểm tra ba kết nối HTTPS/WSS.
