# Canh Cổng — Bảo Vệ Thế Giới

Game thủ thành Canvas 2D dành cho màn hình ngang. Bộ hình hiện tại là nhân vật cartoon vẽ tay, dùng chung trong trận và xưởng nhân vật; trang chính không khởi tạo WebGL hay mô hình 3D.

## Chiến dịch

Sáu thế giới: Rừng Xanh, Thành Cổ, Sa Mạc, Băng Giá, Núi Lửa và Cổng Hỗn Mang. Mỗi thế giới có sáu chặng liên tiếp trên cùng một tuyến đường. Chặng thứ sáu mới tới thành và boss; thắng để sang thế giới tiếp theo. Đoàn xe tìm sáu mảnh Chuông Bình Minh để mở lại các cổng.

Màn chiến dịch có bản đồ sáu đảo. Ảnh xem trước từng chặng được dựng từ đúng địa hình có thể chơi. Mỗi màn có 5–6 vị trí xây trụ; máu quái và các nhóm hỗ trợ tăng theo tiến trình.

## Trụ và vật phẩm

Giữ bốn loại trụ: Người, Elf, Phù Thủy, Người Lùn; mỗi loại bốn cấp. Đã bỏ trụ Orc và toàn bộ kỹ năng tự kích hoạt riêng ở cấp tối đa. Công trình có nền đất, bóng tiếp xúc, lính đúng cỡ và các bộ phận gắn trực tiếp lên thân trụ.

24 loại bộ phận công trình, mỗi loại có sáu bậc: Tệ, Bình thường, Cao, Cao cấp, Huyền thoại, Thần Tích. Tổng cộng 144 vật phẩm có thể xem trong bách khoa, sắp theo bậc; đồ chưa sở hữu tối màu nhưng vẫn đọc được chỉ số và nguồn gốc. Từ Huyền thoại trở lên có câu chuyện. Vật phẩm là cờ, cửa, mái, tường, pha lê, bộ ngắm, nòng pháo, bánh răng… đúng loại trụ và điểm lắp; không dùng trang phục của tướng làm bộ phận công trình.

## Năm tướng

| Tướng | Vai trò | Chính / Phụ |
|---|---|---|
| Mộc Khiên — rùa rừng | Đỡ đòn, bảo hộ | Mai Trấn Lối / Búa Rễ Cây |
| Cáo Lửa — cáo thám hiểm | Truy kích, đánh dấu | Phi Tiêu Hồi Âm / Lướt Lá |
| Bông Tuyết — chim cánh cụt | Băng, khống chế | Vườn Bông Băng / Đóng Băng |
| Rêu Đồng — gấu trúc đỏ | Cơ khí, hỗ trợ | Trạm Hạt Đồng / Xả Hơi |
| Đốm Sao — rồng rừng nhỏ | Hồi phục, rễ trói | Mưa Hạt Sao / Hơi Thở Mầm |

Mở tướng ở cấp hành trình 1/3/6/9/12. Tướng tăng tới cấp 60, có tối đa 60 điểm tài năng. Mỗi tướng có ba nhánh, mỗi nhánh tám nút × năm bậc = 40 điểm. Một bộ 60 điểm đủ một nhánh đầy và nửa nhánh khác. Các nút có điều kiện nối trước; có đặt lại điểm ngoài trận. Kỹ năng phụ mở ở cấp tướng 10, tăng hiệu lực ở cấp 35. Kỹ năng có biểu tượng, mô tả gọn và minh họa động.

## Điều khiển và hiệu năng

- Trong trận: cần điều khiển góc phải để di chuyển tướng, hoặc chọn tướng rồi chạm vị trí cần đến. Thả cần để dừng; hai nút riêng kích hoạt kỹ năng chính/phụ.
- Trang tướng và bách khoa dùng được ở màn hình dọc; trận dùng màn hình ngang.
- Quái, động tác đánh và đạn đã giảm tốc; đợt quái giãn nhịp để dễ nhìn.
- Sói dùng bốn chân với các tư thế chạy nguyên vẹn, không nội suy bằng các dải ảnh bị xé.
- Nấm Tụng Ca hồi phục quái gần nó; Bọ Khiên chống sát thương vật lý, yếu trước phép.
- Bốn atlas nhân vật dùng chung, nền trận dựng một lần, bộ nhớ hoạt ảnh và hạt hiệu ứng có giới hạn; hình trang chủ tĩnh.

## Chạy

Phục vụ thư mục này bằng một HTTP server tĩnh và mở `index.html`. Có thể triển khai GitHub Pages từ nhánh `main` / thư mục gốc. Service worker lưu bản chơi offline và đổi tên cache theo phiên bản. Xưởng 2D ở `design/nhan-vat-3d.html` (giữ đường dẫn cũ để các liên kết đã lưu tiếp tục dùng được).

## Mã chính

`realm55.js`: thiết lập chiến dịch/tướng/đồ/nhịp độ; `atlas55.js`, `cartoon-actors.js`, `painted-motion.js`: hình và chuyển động; `cartoon-world.js`, `landscape55.js`: công trình/vật phẩm/cảnh quan; `world-ui55.js`: bản đồ và trang chủ; `hero-progress.js`, `skill-art.js`: tài năng và kỹ năng; `mobile55.js`: điều khiển và giới hạn hiệu năng. Các file 3D cũ còn trong lịch sử/thư mục, không được trang game hiện tại tải.
