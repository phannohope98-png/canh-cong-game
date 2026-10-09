# Canh Cổng — Bảo Vệ Thế Giới

Game tower-defense Canvas 2D với nhân vật cartoon vẽ tay. Bộ hình và chuyển động dùng chung trong trận và xưởng nhân vật; trang chính không cần WebGL.

## Năm thế giới

Vương Quốc Người → Rừng Cổ Elf → Cõi Phù Thủy → Sơn Thành Người Lùn → Hoang Địa Orc. Năm chủng tộc tìm lại năm Ấn Cổng để ngăn quân Hư Vô chiếm các thành trì.

Mỗi thế giới có sáu chặng nối tiếp trên cùng tuyến đường; chặng sáu mới tới thành và boss. Tổng cộng 30 màn. Bản đồ chiến dịch có năm vùng, ảnh xem trước dựng từ địa hình có thể chơi. Lối rừng là đường đất, các vùng còn lại có vật liệu và cây đá riêng. Vật thể lấy từ khung hình riêng theo kích thước thực, tránh cắt cây theo ô bằng nhau.

## Công trình và vật phẩm

Bốn loại trụ Người, Elf, Phù Thủy, Người Lùn; mỗi loại bốn cấp. Lính Elf đứng kéo cung, phù thủy niệm phép và bay lên, pháo thủ nạp và giật lùi khi bắn. Động tác này tách khỏi chu kỳ đi bộ. Trụ có nền đất và bóng tiếp xúc. Không có trụ Orc hay kỹ năng tự kích hoạt ẩn ở cấp cuối.

24 loại bộ phận công trình × sáu bậc = 144 vật phẩm. Cờ thay cờ trên cột; pha lê đặt vào ổ phép; cửa, mái, giằng, ống ngắm, nòng và bánh răng lắp theo hình từng cấp trụ. Bách khoa sắp theo bậc, đồ đã sở hữu sáng lên; đồ chưa có vẫn đọc được chỉ số và nguồn gốc.

Thần Tích có 24 tên và câu chuyện riêng. Không thể ghép Huyền Thoại lên Thần Tích, mua hay phân rã Thần Tích. Chỉ boss ở chặng cuối của hai thế giới cuối có một lần xét rơi mỗi trận, yêu cầu tướng cấp 30, xác suất 0,2%. Di vật đã tìm được không rơi bản trùng. Bộ sưu tập lưu cùng tiến trình.

## Năm tướng

| Tướng | Chủng tộc | Kỹ năng chính / phụ |
|---|---|---|
| Caelan Giáo Thành | Người | Mũi Giáo Phá Trận / Khiên Chặn Tuyến |
| Aelith Lá Bạc | Elf | Loạt Tên Xuyên Lá / Bước Gió Ghim Chân |
| Mirelle Khắc Ấn | Phù Thủy | Sét Khắc Ấn / Lồng Ấn Hư Không |
| Durik Nòng Đồng | Người Lùn | Chùm Pháo Xuyên Đá / Bãi Mìn Đồng |
| Gorak Nanh Chiến | Orc | Rìu Xé Trận / Tiếng Gầm Chiến Trận |

Mỗi tướng có sáu tư thế đi và tư thế đánh riêng, hai hình minh họa kỹ năng và hiệu ứng trong trận. Đâm giáo đẩy lùi, tên đánh dấu, sét nối mục tiêu, phong ấn giữ quái, mìn kích hoạt theo khoảng cách, rìu gây chảy máu theo quái và tiếng gầm tăng sát thương đồng đội.

Mở tướng theo cấp hành trình 1/3/6/9/12. Tướng tối đa cấp 60, có 60 điểm tài năng; ba nhánh, mỗi nhánh tám nút × năm bậc = 40 điểm. Đủ một nhánh và nửa nhánh khác. Kỹ năng phụ mở cấp 10, chuyên sâu cấp 35. Giữ khóa lưu cũ để bảo toàn tiến trình khi cập nhật thiết kế.

## Điện thoại và kiểm tra

Cần điều khiển hoặc chọn tướng rồi chạm vị trí để di chuyển. Hai nút riêng dùng kỹ năng chính/phụ. Trận dùng màn ngang; trang tướng và bách khoa dùng được màn dọc. Tốc độ quái, đạn và nhịp đánh được giảm để dễ quan sát. Nền menu là ảnh tĩnh; atlas WebP và nền map được lưu đệm.

Kiểm tra bản 56: cú pháp JavaScript và đường dẫn tài nguyên; 30 màn và 25 điểm nối; bốn cấp của bốn trụ với bộ phận lắp; mười lần sử dụng kỹ năng; quy tắc rơi, ghép và lưu Thần Tích; trận nhiều quái và khung điện thoại. Thử nghiệm trình duyệt không thay thế kiểm tra trên mọi mẫu điện thoại.

Chạy local bằng máy chủ HTTP ở thư mục repository. Xưởng dùng `design/nhan-vat-3d.html` (tên đường dẫn cũ, nội dung là Canvas 2D). Các file `realm56.js`, `mounts56.js` và `battle56.js` cập nhật thế giới, điểm lắp và hành vi chiến đấu sau các module nền.
