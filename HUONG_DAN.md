# Chibi Island Mini — bản thử local 0.6.0

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

Bản 0.4 có góc nhìn thứ ba sau vai, map sinh tồn **Đảo Cỏ Xanh** và map đấu trường **Đảo Kẹo**. Có thể bấm **Chơi ngay** để chơi một mình hoặc tạo phòng mời tối đa hai người bạn. Máy chủ bổ sung đối thủ cho đủ tám nhân vật mỗi trận. Giao diện không gắn nhãn từng đối thủ; phần Thông tin trò chơi cho biết trận có thể có đối thủ máy.

## Mới ở bản 0.4

- **T / nút ⌖:** đánh dấu phía trước cho cả phòng, hiện trên đảo và minimap. Dấu giữ 8 giây; chờ 3 giây để gửi tiếp.
- **? / Cách chơi:** hướng dẫn nhặt đồ, di chuyển, bắn và chạy bo ngay trong game.
- **⚙ / Cài đặt:** mức đồ họa, độ nhạy camera, đảo chiều nhìn và âm lượng; lưu trên thiết bị và áp dụng ngay. Trận vẫn tiếp diễn khi mở menu.
- La bàn, thanh nạp đạn, phản hồi viền màn hình khi mất máu, camera theo sát hơn và gửi thao tác nhấn/thả ngay.
- Báo có phiên bản mới tại phòng chờ hoặc sau trận; không tự tải lại giữa trận.

## Chơi qua link cố định

**https://chibi-island-mini.onrender.com**

Game và máy chủ trận đấu đã được triển khai lên Render Free ở Singapore. Có thể tắt máy tính cá nhân mà mọi người vẫn mở link này để chơi. Không cần chạy CHAY_GAME.cmd hay BAT_GAME_ONLINE.cmd cho link Render.

Cả ba người mở link → một người chọn **Tạo phòng cùng bạn** → gửi lời mời/mã phòng cho hai bạn → cả ba **Mình sẵn sàng** → chủ phòng **Lên đảo thôi**. Nút **Chơi ngay** mở trận riêng.

Sau khoảng 15 phút không có lưu lượng, Render Free có thể ngủ; lần mở tiếp theo có thể cần chờ khoảng một phút. Địa chỉ gắn với dịch vụ Render và giữ nguyên qua các lần khởi động/cập nhật. Các phòng cũ mất khi máy chủ khởi động lại. Có thể mở nhanh bằng **CHOI_GAME_ONLINE.url** trong thư mục game.

## Chạy game trên Windows

1. Nhấp đúp **CHAY_GAME.cmd** trong thư mục game.
2. Giữ cửa sổ máy chủ đó mở, vào **http://localhost:3000** bằng trình duyệt.
3. Chọn **Bản đồ & chế độ**, nhập tên và chọn trang phục.
4. Bấm **Chơi ngay** để vào trận một mình. Với phòng bạn bè, mọi người bấm **Mình sẵn sàng**, chủ phòng bấm **Lên đảo thôi**.
5. Muốn thử ba kết nối trên một máy, mở thêm hai tab, đặt tên riêng và vào cùng mã phòng. Để thử thực tế, dùng ba thiết bị riêng.

Sau khi cập nhật mã nguồn, đóng cửa sổ máy chủ cũ, mở lại CHAY_GAME.cmd rồi tải lại trang bằng F5. Có thể dùng Ctrl+F5 nếu trình duyệt vẫn hiển thị giao diện cũ.

CHAY_GAME.cmd gọi Node.js trực tiếp qua `launch-game.mjs`, không gọi PowerShell và không đổi chính sách bảo mật Windows. Nó tìm Node đã cài hoặc bộ Node đi kèm ứng dụng Codex trên máy này. Máy khác cần **Node.js 22 trở lên**. Gói bàn giao kèm các thư viện chạy; bản mã nguồn thiếu thư viện có thể cài bằng `npm install`.

Không cần khóa API ChatGPT, tài khoản người chơi hoặc cơ sở dữ liệu. Chế độ một mình vẫn dùng máy chủ game đang chạy trên máy tính; đây không phải gói offline mở bằng file HTML.

Nếu cần chạy bằng terminal:

```powershell
node server/index.js
```

Nếu Node chưa có trong PATH trên máy này:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server/index.js
```

## Hai bản đồ

| Bản đồ | Quy mô | Luật chính |
| --- | --- | --- |
| Đảo Cỏ Xanh | Diện tích gấp **20 lần** Đảo Kẹo, đường kính khoảng 277 đơn vị | Sinh tồn tối đa 10 phút (bản local 0.5.1), bắt đầu chưa có súng, nhặt đồ, vòng bo dịch chuyển qua 5 giai đoạn |
| Đảo Kẹo | Giữ kích thước nhỏ ban đầu | Đấu nhanh tối đa 3 phút, có sẵn súng nước và nước không giới hạn |

“Gấp 20 lần” được áp dụng cho **diện tích**, không phải chiều dài mỗi cạnh: bán kính tăng từ 31 lên khoảng 138,64. Map mới có hơn 200 vật cản và hơn 80 vị trí vật phẩm ban đầu. Địa hình nền phẳng với các vật cản có độ cao; chưa có địa hình đồi núi liên tục.

Map Cỏ Xanh có các cụm Trại Mây, Vườn Nắng, Đồi Cỏ, Kho Tiếp Tế, Quảng Trường và Rừng Thông; có biển tên trong cảnh. Các bục cạnh điểm xuất phát giúp thử nhảy lên tầng thấp rồi nhảy tiếp lên tầng cao.

## Điều khiển trên máy tính

| Thao tác | Phím / chuột |
| --- | --- |
| Đi theo hướng camera | WASD hoặc phím mũi tên |
| Chạy nhanh | Giữ Shift khi di chuyển |
| Nhảy | Space |
| Xoay camera | Giữ chuột phải và kéo chuột |
| Zoom camera | Con lăn chuột |
| Bắn theo tâm ngắm | Giữ chuột trái |
| Bắn có hỗ trợ ngắm phía trước | Giữ F |
| Nhặt đồ, mở hòm, đóng/mở cổng gần nhất | E |
| Nạp nước/đạn | R |
| Đổi giữa hai súng đang mang | Q hoặc phím 1, 2 |
| Dùng bình hồi phục | H |
| Đánh dấu phía trước cho cả phòng | T hoặc nút ⌖ |
| Ngừng thao tác đang giữ | Escape |

Hãy bỏ con trỏ khỏi ô nhập tên/mã phòng trước khi dùng phím điều khiển. Âm thanh mặc định tắt; bấm nút nốt nhạc để bật. Không khóa chuột vào game; có thể chuyển tab bình thường.

### Điện thoại

- Cần tròn bên trái để di chuyển.
- Vuốt vùng trống bên phải của cảnh để xoay camera.
- Nút **CHẠY** bật/tắt chạy nhanh.
- Nút **NHẢY** để nhảy.
- Giữ nút **BẮN** để bắn và hỗ trợ ngắm đối thủ ở phía trước.
- Các nút **NHẶT/MỞ**, **NẠP**, **ĐỔI**, **HỒI PHỤC** làm đúng thao tác tương ứng.

Bản này đã kiểm tra bố cục và nhấn nút ở khung điện thoại trong trình duyệt máy tính. Chưa nghiệm thu đa chạm trên điện thoại thật.

## Nhảy và tương tác vật cản

- Có thể nhảy lên bục thấp, đá thấp, khúc gỗ, thùng và các bề mặt đủ thấp. Để lên bục cao, dùng bục thấp làm bậc trung gian.
- Rời mép sẽ rơi xuống; không thể nhảy liên tục giữa không trung để bay.
- **Hòm tiếp tế:** đến gần và bấm E để mở. Hòm mở một lần mỗi trận, thả súng, nước tiếp đạn và bình hồi phục phía trước hòm.
- **Cổng gỗ:** đến gần và bấm E để đóng/mở. Cổng không đóng khi có nhân vật đang đứng trong vùng cổng.
- **Thùng gỗ:** bắn để phá, có thể làm rơi vật phẩm. Nếu đứng trên thùng bị phá sẽ rơi xuống.
- Cây và các vật cản quá cao không thể leo trực tiếp.

Dòng nhắc E gần cuối màn hình cho biết vật đang được chọn. Nếu có nhiều vật gần nhau, ưu tiên vật gần nhất theo phạm vi tương tác, có xét bề mặt hòm/cổng.

## Loot và vũ khí

Map Cỏ Xanh có một súng nước nằm gần từng điểm xuất phát. **Bấm E ngay lúc vào trận** để nhặt súng trước khi giao chiến. Vật phẩm được đánh dấu bằng vòng sáng màu.

Có bốn loại súng:

- **Súng nước:** cân bằng, băng 18 phát.
- **Vòi phun liên thanh:** bắn nhanh, băng 28 phát.
- **Kẹo chùm:** năm viên mỗi phát, hiệu quả ở cự ly gần, băng 6 phát.
- **Bong bóng tầm xa:** bắn chậm nhưng mạnh hơn, băng 8 phát.

Mang tối đa hai súng. Nhặt loại thứ ba sẽ đổi súng đang cầm và làm rơi súng cũ. Nhặt thêm cùng loại sẽ bổ sung nước dự trữ. Nước tiếp đạn và bình hồi phục có thể tự nhặt khi đi sát; E cũng nhặt được trong phạm vi. Khi sức khỏe còn cao, bình hồi phục được cất để dùng bằng H, tối đa ba bình.

Súng cần nạp lại trên map sinh tồn. Khi giữ bắn mà băng rỗng, máy chủ thử nạp tự động nếu còn dự trữ. Đường đạn có lõi sáng, vệt màu và chớp ở đầu súng; tâm ngắm nháy khi máy chủ xác nhận trúng đối thủ.

## Chạy bo

- Vòng xanh trên bản đồ nhỏ là vùng an toàn hiện tại.
- Vòng nét đứt sáng là vùng tiếp theo.
- Đồng hồ trên cùng đếm thời gian chờ hoặc thời gian thu của giai đoạn hiện tại.
- Đồng hồ cạnh tên map hiển thị thời gian tối đa còn lại của trận.
- Map mới có năm giai đoạn, thay đổi cả tâm lẫn bán kính. Sát thương ngoài bo tăng về cuối.
- Có nhắc khi bo bắt đầu thu và báo khoảng cách vào vùng an toàn nếu đang ở ngoài.

Người cuối cùng còn sống thắng. Hết thời gian, xét sức khỏe rồi số lần loại; nếu vẫn bằng nhau, máy chủ dùng mã người chơi để chọn kết quả nhất quán. Trận có thể kết thúc sớm khi chỉ còn một nhân vật.

## Chơi cùng bạn

### Cùng Wi-Fi

Chỉ máy chủ cần mở CHAY_GAME.cmd. Tìm IPv4 của máy chủ trong thông tin mạng Windows; các thiết bị cùng Wi-Fi mở `http://DIA_CHI_IPV4:3000`, ví dụ `http://192.168.1.20:3000`. Nếu tường lửa chặn, cần cho phép ứng dụng máy chủ trên mạng riêng bạn tin cậy.

`localhost` trên điện thoại chỉ tới chính điện thoại, không phải máy tính. Lời mời sao chép từ localhost chỉ dùng trên cùng máy; hãy mở game bằng địa chỉ LAN trước khi sao chép lời mời gửi cho thiết bị khác.

### Khác mạng Internet

Link chính là **https://chibi-island-mini.onrender.com**, chạy trên Render Free ở Singapore, độc lập với máy tính cá nhân. Xem phần **Chơi qua link cố định** ở đầu tài liệu hoặc `RENDER_HOSTING.md` để quản lý dịch vụ.

#### Phương án Cloudflare cũ (tùy chọn)

Các tệp BAT_GAME_ONLINE.cmd và TAT_GAME_ONLINE.cmd quản lý đường truyền Cloudflare Quick Tunnel từ máy tính này. **CHOI_ONLINE.txt chỉ chứa link tạm của phiên Cloudflare**, không phải link Render. Link tạm đổi khi bật lại và không có cam kết hoạt động liên tục.

1. Cả ba người mở cùng địa chỉ HTTPS trong `CHOI_ONLINE.txt`, kể cả người đang dùng máy chủ.
2. Một người nhập tên, chọn map và bấm **Tạo phòng cùng bạn**.
3. Bấm **Sao chép lời mời** gửi cho hai người còn lại, hoặc gửi mã phòng để họ điền rồi bấm **Vào phòng**.
4. Cả ba bấm **Mình sẵn sàng**, chủ phòng bấm **Lên đảo thôi**. **Chơi ngay** tạo trận riêng, không ghép ba người vào cùng phòng.

**Riêng phương án Cloudflare cần máy tính chủ bật, có Internet và không ngủ trong suốt lúc chơi.** Phiên thử cũ đã dừng sau khi bản Render hoạt động. Chạy `BAT_GAME_ONLINE.cmd` sẽ hiển thị link nếu có phiên đang chạy; nếu chưa chạy, sẽ tạo phiên mới. Nếu tự bật bằng tệp này, giữ cửa sổ đó mở. Dùng `TAT_GAME_ONLINE.cmd` để dừng. Sau khi bật lại, đọc địa chỉ mới từ `CHOI_ONLINE.txt` và gửi lại cho bạn bè. Không cần mở cổng modem.

Máy này đã có `.tools/cloudflared.exe` tải từ nguồn chính thức. Bản ZIP bàn giao không kèm công cụ 55 MB này; khi chuyển sang máy khác, cần tải bản Windows 64-bit từ https://developers.cloudflare.com/tunnel/downloads/ và lưu thành `.tools/cloudflared.exe` cạnh `online-host.mjs`.

Link Render đã đáp ứng việc chơi khi tắt máy tính. Khi tự chuyển sang hosting khác, cần dịch vụ hỗ trợ Node.js, WebSocket và HTTPS; hosting chỉ phục vụ file tĩnh không chạy được máy chủ trận đấu. Các thông số triển khai riêng:

- Cài: `npm install --omit=dev --ignore-scripts`.
- Chạy: `npm start`.
- Cổng lấy từ biến PORT, mặc định 3000, lắng nghe 0.0.0.0.
- Reverse proxy phải hỗ trợ WebSocket `/socket` và giữ Host công khai. Trang HTTPS tự dùng WSS.
- Health check: `GET /health`.
- Chỉ chạy một tiến trình/instance trong bản thử nghiệm này. Phòng, trận và đồ nhặt nằm trong RAM; khởi động lại máy chủ sẽ mất phòng.
- Có Dockerfile. Chưa có chia sẻ trạng thái giữa nhiều máy chủ hay hệ thống tài khoản.

Trong phòng mời bạn, mọi người sẵn sàng rồi chủ phòng bắt đầu. Người mới vào giữa trận sẽ bị từ chối và cần chờ vòng tiếp theo. Trong trận, chỗ mất kết nối được giữ tối đa 25 giây, nhân vật vẫn có thể bị bắn. Trang tự thử nối lại. Trong phòng chờ, mất kết nối giải phóng chỗ ngay. Khi chủ phòng rời đi, quyền được chuyển cho người còn kết nối.

## Kiểm thử

**22 kiểm thử tự động đã qua**: luật cũ, map có diện tích gấp 20, điểm xuất phát không chồng vật cản, nhảy lên hai tầng bục rồi rơi xuống, không bay giữa không trung, chạy nhanh, mở hòm một lần, cổng không đóng lên người, loot/đổi/nạp súng, đạn 3D, phá thùng, bo liên tục, cùng ba kết nối WebSocket đồng bộ nhặt súng và độ cao nhảy trên map mới.

```powershell
npm test
```

Đã kiểm tra trực tiếp trong trình duyệt: chuyển map cũ/mới, chơi riêng và chơi lại, ba tab vào cùng phòng map mới và nhận cùng kết quả, nhặt súng, bắn thấy vệt sáng, nhảy, giao diện nút trên khung 390 × 844. Không ghi nhận lỗi JavaScript ở các lượt kiểm tra cuối.

Đã kiểm tra qua địa chỉ Internet công khai: HTTPS tải trang/health, ba kết nối WSS cùng vào phòng và bắt đầu trận map mới, đồng bộ nhặt súng và nhảy. Trình duyệt cũng tạo phòng thành công qua địa chỉ công khai. Tệp `tests/public-smoke.mjs` cho phép kiểm tra lại với `node tests/public-smoke.mjs https://DIA_CHI_CONG_KHAI`.

Chưa kiểm tra ba thiết bị ở ba mạng Internet, đa chạm thực tế và hiệu năng trên điện thoại yếu. Chưa có dự đoán chuyển động ở máy người chơi hay bù trễ bắn; mạng chậm có thể làm thao tác chậm phản hồi. Va chạm nhiều vật cản dùng hình trụ gần đúng. Bot tránh vật cản cục bộ, chưa có tìm đường toàn bản đồ. Đây là bản thử nghiệm chơi được, chưa phải bản phát hành hoàn chỉnh.

## Cấu trúc chính

- `shared.js`: hai map, vũ khí, va chạm, nhảy và lịch vòng bo.
- `server/game.js`: phòng, nhân vật, bot, vòng lặp và kết quả.
- `server/survival.js`: loot, hòm/cổng, súng, nạp đạn và đường đạn 3D.
- `server/index.js`: HTTP, WebSocket và quản lý phiên.
- `public/scene.js`: map 3D, nhân vật, camera sau vai, vệt đạn.
- `public/client.js`: giao diện, phím, nút cảm ứng và kết nối.
- `tests/`: kiểm thử logic/mạng/sinh tồn.

Tên, lựa chọn đồ và map được lưu trên thiết bị. Không lấy tài nguyên từ Play Together; mô hình và cảnh được tạo bằng mã, tham khảo hướng thời trang theo chủ đề/phụ kiện của game đó. Đồ họa dùng Three.js 0.180.0 và mạng dùng ws 8.21.0, đều theo MIT; giấy phép nằm trong thư mục thư viện tương ứng. Không tải tài nguyên từ CDN khi chơi.
