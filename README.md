# Canh Cổng — Bảo Vệ Thế Giới

Game tower-defense Canvas 2D với nhân vật cartoon vẽ tay. Bộ hình và chuyển động dùng chung trong trận và xưởng nhân vật; trang chính không cần WebGL.

## Năm thế giới

Vương Quốc Người → Rừng Cổ Elf → Cõi Phù Thủy → Sơn Thành Người Lùn → Hoang Địa Orc. Năm chủng tộc tìm lại năm Ấn Cổng để ngăn quân Hư Vô chiếm các thành trì.

Mỗi thế giới có sáu chặng nối tiếp trên cùng tuyến đường; chặng sáu mới tới thành và boss. Tổng cộng 30 màn, có các khúc uốn và điểm chặn rõ; tuyến của từng thế giới liên tục qua sáu chặng. Bản đồ chiến dịch có năm vùng, ảnh xem trước dựng từ địa hình có thể chơi. Lối rừng là đường đất, các vùng còn lại có vật liệu và cây đá riêng. Vật thể lấy từ khung hình riêng theo kích thước thực, tránh cắt cây theo ô bằng nhau.

## Công trình và vật phẩm

Bốn loại trụ Người, Elf, Phù Thủy, Người Lùn; mỗi loại bốn cấp. Lính Người có bộ tư thế đi/chém riêng. Lính Elf và phù thủy đứng trên sàn đúng theo từng cấp trụ. Pháo thủ thấp, rộng, vận hành pháo; đạn phát ra từ miệng nòng, công trình giật lùi và lóe lửa khi bắn. Động tác này tách khỏi chu kỳ đi bộ. Trụ có nền đất và bóng tiếp xúc. Không có trụ Orc hay kỹ năng tự kích hoạt ẩn ở cấp cuối.

24 loại bộ phận công trình × sáu bậc = 144 vật phẩm. Cờ thay cờ trên cột; pha lê đặt vào ổ phép; cửa, mái, giằng, ống ngắm, nòng và bánh răng lắp theo hình từng cấp trụ. Kho đồ, bách khoa và các bộ phận gắn trụ dùng chung 24 hình vật phẩm vẽ tay. Bách khoa sắp theo bậc, đồ đã sở hữu sáng lên; đồ chưa có vẫn đọc được chỉ số và nguồn gốc.

Thần Tích có 24 tên và câu chuyện riêng. Không thể ghép Huyền Thoại lên Thần Tích, mua hay phân rã Thần Tích. Chỉ boss ở chặng cuối của hai thế giới cuối có một lần xét rơi mỗi trận, yêu cầu tướng cấp 30, xác suất 0,2%. Di vật đã tìm được không rơi bản trùng. Bộ sưu tập lưu cùng tiến trình.

## Mười tướng — hai tướng mỗi tộc

| Tướng | Chủng tộc | Kỹ năng chính / phụ |
|---|---|---|
| Caelan Giáo Thành | Người | Đội Cận Vệ Cổng / Khiên Phản Kích |
| Aelith Lá Bạc | Elf | Loạt Tên Xuyên Lá / Bước Gió Ghim Chân |
| Mirelle Khắc Ấn | Phù Thủy | Sét Khắc Ấn / Lồng Ấn Hư Không |
| Durik Nòng Đồng | Người Lùn | Chùm Pháo Xuyên Đá / Bãi Mìn Đồng |
| Gorak Nanh Chiến | Orc | Rìu Xé Trận / Tiếng Gầm Chiến Trận |
| Veyra Búa Thề | Người | Búa Phán Quyết / Đội Cận Vệ |
| Thalen Lá Đêm | Elf | Đột Kích Lá / Bẫy Rễ |
| Oria Đèn Trăng | Phù Thủy | Sao Rơi Tím / Ảnh Ảo Đèn Trăng |
| Haldren Búa Núi | Người Lùn | Búa Địa Chấn / Giáp Rèn Sơn Thành |
| Brakka Song Rìu | Orc | Lốc Rìu / Móc Chiến Trận |

Mỗi tướng có sáu tư thế đi và tư thế đánh riêng, hai hình minh họa kỹ năng và hiệu ứng trong trận. Bấm kỹ năng rồi chạm điểm trong tầm tướng: đội cận vệ là lính thực chiến, bẫy kiểm tra quái đi qua, tinh cầu rơi có nhịp tác động, đột kích di chuyển tướng tới điểm chọn. Hai phép toàn map Viện Binh / Thiên Thạch vẫn riêng biệt.

Năm tướng đầu mở ở cấp hành trình 1/3/6/9/12; năm tướng mới mở ở cấp 15/18/21/24/27. Tướng tối đa cấp 60, có 60 điểm tài năng; ba nhánh, mỗi nhánh tám nút × năm bậc = 40 điểm. Đủ một nhánh và nửa nhánh khác. Kỹ năng phụ mở cấp 10, chuyên sâu cấp 35. Giữ khóa lưu cũ để bảo toàn tiến trình khi cập nhật thiết kế.

## Điện thoại và kiểm tra

Cần điều khiển hoặc chọn tướng rồi chạm vị trí để di chuyển. Hai nút riêng dùng kỹ năng chính/phụ. Trận dùng màn ngang; trang tướng và bách khoa dùng được màn dọc. Tốc độ quái, đạn và nhịp đánh được giảm để dễ quan sát. Nền menu là ảnh tĩnh; atlas WebP và nền map được lưu đệm.

Kiểm tra bản 57: cú pháp JavaScript và đường dẫn tài nguyên; 30 màn và 25 điểm nối; bốn cấp của bốn trụ với bộ phận lắp; hai mươi lần sử dụng kỹ năng và lính Người thực sự di chuyển/đánh; quy tắc rơi, ghép và lưu Thần Tích; trận nhiều quái và khung điện thoại. Thử nghiệm trình duyệt không thay thế kiểm tra trên mọi mẫu điện thoại.

Chạy local bằng máy chủ HTTP ở thư mục repository. Xưởng dùng `design/nhan-vat-3d.html` (tên đường dẫn cũ, nội dung là Canvas 2D). Các file `realm57.js`, `mounts56.js`, `battle57.js` và `equipment57.js` cập nhật thế giới, điểm lắp và hành vi chiến đấu sau các module nền.


## Bản 58 — bố cục và chuyển động

30 màn có 30 bố cục riêng, luân phiên một, hai hoặc ba lối; các nhánh nhập vào cửa ra và tọa độ ra/vào nối tiếp trong mỗi thế giới. Vị trí xây được xét theo toàn bộ vùng ảnh của trụ cấp cuối, không chỉ khoảng cách tâm tới đường. Chiều cao trụ từ 88 tới 98 đơn vị; nâng cấp thay thiết kế, không phóng to quá mức. Năm cổng cuối chặng dùng hình riêng cho từng chủng tộc, cửa gắn theo đúng cửa ra.

Nòng pháo là phần riêng: xoay theo mục tiêu, giật lùi, lóe lửa và phát đạn cùng một tọa độ. Thân trụ giữ nguyên hướng trên đất. Doanh trại mở hai cánh cửa, lính ra từng lượt, có nhịp chờ mở cửa khi hồi sinh. Nền tiếp xúc dùng màu đất map, không có đĩa bóng tối phía dưới trụ.

Hai lệnh tướng hiển thị bằng hình tròn có lớp đếm hồi chiêu xoay theo thời gian. Bỏ chữ trạng thái dưới hình. Hồi chiêu tăng 25%; sức mạnh kỹ năng tăng theo cấp được giới hạn, sát thương cơ bản giảm một nửa, tăng tài năng kỹ năng được giới hạn 35%. Lính gọi từ kỹ năng cao 32 đơn vị, thấp hơn lính doanh trại, máu và sát thương thấp hơn trước. Joystick không tạo cờ đích.

Thần Tích có 24 hình vẽ riêng, khác cấu trúc đồ thông thường, dùng chung hình giữa bách khoa và bộ phận lắp trụ. Quy tắc hiếm, duy nhất, cốt truyện và không thể ghép lên Thần Tích giữ nguyên. Quái có mặt dữ và tư thế đánh riêng; chu kỳ đi tính theo quãng đường với bước riêng cho các nhóm, ba làn lệch ngang cố định, hạn chế tăng tốc bất ngờ. Cache hoạt ảnh lấy kích thước theo từng tư thế để không cắt đầu/chân/vũ khí.

## B?n 59 ? s?a gh?p h?nh v? 36 chi?n tr??ng

- N?m ch?ng t?c gi? nguy?n. Th?m s?u ch?ng Chi?n Tuy?n Li?n Minh sau n?m l?nh ??a, t?ng 36 m?n. M?i m?n c? b? t?a ?? ???ng, ??a h?nh s?ng/h?, c?m v?t th? v? seed b? m?t ri?ng; c?c c?a ra ??c l?p ? m?n nhi?u ???ng, ch? m?n c?ng th?nh m?i h?i t? v?o c?a.
- ?i?m k?t th?c ???ng ??t t?i c?a th?t c?a ?nh c?ng, kh?ng ch?y xuy?n qua ph?a sau c?ng. S?a vi?c ??o m?ng bi?n ???ng khi v? l?i khi?n v?ng c?t n?n sai.
- Chi?u cao b?n c?p tr? 62/64/66/68. V? tr? x?y c?ch ???ng 37?113 ??n v?, x?t v?ng h?nh 38?72; kh?ng d?ng c?ch k?o tr? ra xa nh? b?n tr??c. Kh?ng th?m b?ng ??a ho?c c? tam gi?c d??i tr?.
- Th?n tr? Ng??i L?n l? b? ?nh ho?n ch?nh kh?ng c? n?ng, n?ng n?m ? b? ?nh ri?ng; kh?ng c?t x?a n?ng t? th?n c?. V?t ph?m g?n tr?c ti?p b?ng b? m?t ki?n tr?c theo ngu?n: c?a ph? ??ng c?a, m?i ph? ??ng m?i, gi?ng/c?/rune/gia c? ??ng ?i?m. Inventory v?n d?ng b? ?nh minh h?a ri?ng.
- Qu?i c? chi?u cao hi?n th? ??c l?p v?i b?n k?nh va ch?m: goblin 28, Orc 43, s?i 31?32, s?i c??i 43, boss 68. B? s?i v? l?i, s?u t? th? b??c theo qu?ng ???ng, hai t? th? ??nh; kh?ng c?t ch?n hay k?o gi?n th?n.
- 20 hi?u ?ng k? n?ng c? chu?n b?/t?c ??ng/t?n d? theo lo?i v? kh?/ph?p; gi? c?n b?ng b?n 58. Cache n?n gi? t?i ?a s?u m?n ?? h?n ch? b? nh? tr?n ?i?n tho?i.
