# Canh Cổng

Game fantasy tower-defense 2D trên trình duyệt, dùng Canvas và các bộ ảnh hoạt hình có nền trong suốt.

## Chiến dịch

Năm chủng tộc: Con Người, Elf, Người Lùn, Phù Thủy và Orc. Chiến dịch gồm 36 màn: năm lãnh địa và chặng cuối Chiến Tuyến Liên Minh. Chặng Liên Minh tiếp nối câu chuyện của năm tộc, không thêm một chủng tộc mới.

Mỗi màn có tọa độ đường đi và bố trí cảnh riêng, gồm một, hai hoặc ba đường. Những màn nhiều đường thường có cửa ra độc lập; màn công thành hội tụ tại ngưỡng cửa cổng. Nền, sông hồ, cụm cây và vật thể được kết hợp theo từng cảnh.

## Bản 60 — bố cục điện thoại

Chiến trường gọn 1000×480, lối mòn rộng 44 đơn vị. Màn nhiều lối tách nhánh từ một đường vào chung rồi nhập lại; không ép tọa độ nhánh vào mép map. Sông hẹp và cầu ngắn, có ván/mạch đá cùng lan can. Cây và vật thể được gom thành cụm quanh vùng chiến đấu.

Gom gọi đợt quái vào một nút ở góc phải. Thu gọn bảng thông tin và cụm kỹ năng; giữ các nút hành động và joystick riêng. Đổi kích thước màn hình giữ mức zoom tương đối, tránh cắt map khi xoay hoặc đổi viewport.

Đã dựng và kiểm tra 36 màn, vùng đặt trụ, cửa cổng và các cầu. Đã kiểm tra toàn cảnh và điều khiển ở 667×375 và 844×390 trên trình duyệt desktop.

## Bản 59

- Căn điểm cuối đường theo cửa thật của ảnh cổng; sửa vùng cắt khi vẽ đường.
- Thu nhỏ trụ ở cả bốn cấp, xét toàn bộ vùng ảnh khi đặt trụ, giữ vị trí gần đường. Bỏ đĩa bóng và lớp cỏ tam giác chung dưới trụ.
- Vẽ lại thân trụ Người Lùn hoàn chỉnh; nòng pháo là phần riêng, xoay theo địch, giật lùi và phát đạn tại miệng nòng. Người vận hành giữ vóc dáng thấp.
- Vật phẩm được thể hiện bằng các phần kiến trúc khớp cửa, mái, thân, lan can hoặc nòng pháo. Bách khoa dùng hình minh họa riêng; khi lắp trụ, bộ phận được dựng theo vị trí và chức năng.
- Bộ ảnh sói, sói băng và sói cưỡi có bốn chân, sáu tư thế đi và hai tư thế đánh. Chu kỳ bước tính theo quãng đường; giữ nguyên toàn bộ tư thế vẽ để tránh cắt chân hoặc kéo giãn thân.
- Chiều cao quái hiển thị độc lập với bán kính va chạm: goblin nhỏ hơn Orc, quái nặng và boss lớn hơn. Lính doanh trại cùng quy chuẩn kích thước với lính khác.
- Mười tướng có 20 hiệu ứng kỹ năng và biểu tượng tương ứng. Hiệu ứng phân biệt chuẩn bị, tác động và tan dần; giữ cân bằng kỹ năng của bản 58. Mỗi bẫy trong ba bẫy mìn được vẽ thành một mìn.
- Cache nền giới hạn sáu màn để giảm bộ nhớ.

## Tướng và vật phẩm

Mười tướng thuộc năm tộc, có kỹ năng chính/phụ và nhánh tài năng. Hai nút kỹ năng dùng lớp hồi chiêu tròn; joystick điều khiển tướng không tạo cờ đích.

24 Thần Tích có tên, hình minh họa và câu chuyện riêng. Chúng hiếm, không thể ghép từ đồ thường, có cơ chế ngăn sở hữu trùng. Vật phẩm được sắp theo bậc trong bách khoa, hiển thị trạng thái sở hữu.

## Chạy và kiểm tra

Chạy máy chủ HTTP tại thư mục repository, mở `index.html`. Xưởng 2D ở `design/nhan-vat-3d.html`; tên đường dẫn được giữ để tương thích.

Bản 59 đã kiểm tra cú pháp, tài nguyên, bố cục và vùng đặt trụ của 36 màn, 20 lần dùng kỹ năng thực tế, vị trí phát đạn pháo, chuyển động lính và một trận hai đường. Đã kiểm tra giao diện 844×390 trên trình duyệt desktop; đây không phải xác nhận tương thích mọi điện thoại hoặc hoàn thành toàn bộ chiến dịch.
