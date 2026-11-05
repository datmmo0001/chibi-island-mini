# Các bản cập nhật

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
