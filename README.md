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
