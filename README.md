# Canh Cổng

Game fantasy tower-defense 2D trên trình duyệt, dùng Canvas và các bộ ảnh hoạt hình có nền trong suốt.

## Chiến dịch

Năm chủng tộc: Con Người, Elf, Người Lùn, Phù Thủy và Orc. Chiến dịch gồm 36 màn: năm lãnh địa và chặng cuối Chiến Tuyến Liên Minh. Chặng Liên Minh tiếp nối câu chuyện của năm tộc, không thêm một chủng tộc mới.

Mỗi màn có tọa độ đường đi và bố trí cảnh riêng, gồm một, hai hoặc ba đường. Những màn nhiều đường thường có cửa ra độc lập; màn công thành hội tụ tại ngưỡng cửa cổng. Nền, sông hồ, cụm cây và vật thể được kết hợp theo từng cảnh.

## Bản 79 — Cõi Phù Thủy

Sáu nền vẽ tay riêng: Bờ Biển Pha Lê, Bậc Thác Ngân Lam, Ngã Rẽ Rừng Trăng, Cầu Đài Thiên Văn, Sân Cung Trăng Khuyết và Chính Điện Cõi Phù Thủy. Chặng cuối chiến đấu trong sảnh chính, kết thúc tại bậc Ngai Trăng. Màn 3, 5 và 6 có hai đường vào; màn 4 đi theo cầu vòng, không lặp lại tuyến ngang.

Tọa độ đường, bệ trụ và các lối nối được dò theo ảnh nền. Trụ thu gọn trên tâm bệ đá; điểm phát tên, phép và đạn pháo được thu theo cùng tỷ lệ. Lính và tướng đi theo đồ thị cầu/sàn và cầu thang của bệ, tránh cắt qua nước hay vực. Ảnh màn chơi WebP tải theo màn và cache bộ nhớ tối đa hai ảnh. Ảnh trong thẻ chiến dịch dùng trực tiếp nền từng màn. Giữ các vùng Người, Elf và toàn bộ trang bị hiện tại.

Đã kiểm tra sáu trận mô phỏng 30 giây (2.700 lượt render), đường tướng trên sáu đồ thị và trụ cấp cuối trên toàn bộ 37 bệ. Không ghi nhận lỗi game trong các bài kiểm tra. Kiểm tra khung 667×375 trên trình duyệt desktop; chưa thử điện thoại thật hoặc đánh giá cân bằng toàn chiến dịch.

Bộ thiết kế có 36 PNG riêng nền trong suốt, ba atlas và danh mục tọa độ. [Tải bộ thiết kế](assets/witch79-design.zip) · [Tải sáu map PNG và tọa độ](assets/witch79-maps.zip). Các ZIP là thư viện tải về, không nằm trong cache game hay tải khi vào trận. Ảnh được tạo bằng built-in ImageGen theo reference người dùng; prompt và danh mục nằm trong các bộ ZIP.

## Bản 78 — Rừng Cổ Elf trên tán cây

Vùng Elf gồm sáu ảnh nền mới: Bến Rừng Cổ, Lối Rễ Cổ Thụ, Đường Lên Tán Cây, Ngã Rẽ Cầu Treo, Vườn Treo Linh Mộc và Tháp Linh Mộc. Hai màn đầu đi dưới rừng; từ màn ba, đường nằm trên sàn gỗ và cầu treo. Màn bốn có hai nhánh hợp lưu, màn sáu kết thúc tại cửa tháp.

Đường quái và vị trí trụ lấy theo tọa độ ảnh. Các đơn vị dưới đất dùng đồ thị cầu/sàn để tránh cắt qua vực trên màn cây. Trụ thu gọn trên nền tròn; các nền không bị phủ bằng biển/đất cũ. Ảnh WebP được tải theo màn, giữ tối đa hai ảnh trong bộ nhớ, nền canvas giới hạn độ phân giải trên mobile. Giữ các cập nhật vùng Người và bộ vật phẩm hiện tại.

## Bản 74 — sáu chặng Vương Quốc Người

Giữ bộ dữ liệu sáu màn thiết kế tay: Cảng Biên Giới, Làng Nông Dân, Cầu Đá Bắc, Phố Canh Gác, Đường Tới Vương Thành và Cổng Vương Thành. Cảnh dùng biển, bờ đá, ruộng, kênh nước, cầu và nhà/tháp mái xanh theo ảnh vùng. Bổ sung bộ kiến trúc vẽ tay từ atlas có sẵn. Kiểm tra cả phần mái trụ cấp cuối trước khi đặt ô xây: 8–9 ô mỗi màn, tránh đường và nước; bố trí được cache để giảm tải khi dựng lại. Giữ cơ chế chiến đấu, bộ trang bị đã khôi phục và bản Thần Tích mới. Kiểm tra 6 trận mô phỏng 30 giây, thắng/thua, mở khóa màn và khung 667×375 trên desktop; chưa thử trên điện thoại thật.

## Bản 72 — khôi phục nét vẽ vật phẩm

Khôi phục bộ hình vật phẩm vẽ tay có vân gỗ, mặt đá, ánh kim và tinh thể từ atlas 57/58. Giữ điểm gắn theo loại/cấp trụ, giới hạn mặt mái và cơ cấu nòng pháo xoay/giật. Cánh cửa gia cố chuyển động trong khung đá cố định. Không thêm vòng hào quang rời. Giữ map cảng và các cập nhật chuyển động của bản 70/71.

## Bản 71 — vật phẩm kiến trúc mới

Thiết kế lại 24 loại bộ phận trụ ở sáu bậc (144 hình trong kho/bách khoa). Cờ, cửa, phù hiệu, mái, tường và chuông dùng nét kim loại/vải của trụ Người; trụ Elf dùng gỗ, lá, giá cung, bồn nhựa và rễ; trụ phép dùng lõi pha lê, vòng niệm, ống dẫn và bệ rune; pháo dùng kính ngắm, vòng nòng, buồng thuốc, bánh răng, lò và chân chống. Hình trong kho và phần lắp dùng chung bộ vẽ; vị trí và kích thước lấy theo loại và cấp trụ. Mái được giới hạn theo mặt mái; cửa gia cố mở cùng cánh cửa; kính ngắm và vòng nòng theo hướng quay/giật của pháo. Các bậc phân biệt màu vật liệu và trang trí, Thần Tích giữ tên và câu chuyện riêng. Bộ phận tĩnh dùng cache giới hạn 192 ảnh để giảm vẽ lại trong trận.

Giữ các sửa map/chuyển động/đạn của bản 70. Đã kiểm tra 144 hình không rỗng/cắt mép, 16 mẫu trụ, ba trạng thái cửa và pháo, cùng trận 30 giây có đủ 24 món trang bị. Không ghi nhận lỗi; khung 667×375 hiển thị đầy đủ. Chưa kiểm tra trên điện thoại thật.

## Bản 66 — tuyến ngắn và điểm hợp lưu

Khung chiến trường thu ngang còn 760. Tuyến chính khoảng 740–905 đơn vị; nhánh vào từ trên/dưới khoảng 380–640. Bố cục gồm đường chữ Y, hai cửa vào riêng, hướng vào dọc và vùng nhập tuyến; màn công thành vẫn kết thúc đúng cửa. Đường được vẽ thành một mặt đất chung ở điểm giao nhau, có vân đất, mép cỏ và vết nứt theo vùng. Cụm cây và mảng đất được bố trí theo khoảng trống giữa đường, tránh vùng trụ. Giữ ít nhất 8 ô xây mỗi màn; không đổi chỉ số nhân vật. Kiểm tra cú pháp, dựng 36 màn và trận mô phỏng 30 giây không ghi nhận lỗi. Đây chưa phải kiểm tra trên điện thoại thật hoặc xác nhận cân bằng toàn chiến dịch.

## Bản 65 — bố cục ôm địa hình

Vẽ lại tuyến của 36 màn theo các bố cục khoảng đất trung tâm, vòng trên/dưới, nhánh giữa và một số hướng vào từ trên hoặc dưới. Giữ một/hai/ba lối cùng vị trí cửa thành. Cụm cây ở rìa được gom lại; lớp nền có bảng màu riêng theo vùng, mảng địa hình có mặt đá tối, gờ sáng và vách đá nối ở mép cảnh. Đường sáng hơn nền để nhân vật và điểm giao chiến dễ đọc.

Vẫn có 8–10 ô trụ đã kiểm tra khoảng hở đường/nước. Chi tiết cảnh tĩnh vẽ một lần và cache tối đa bốn màn. Giữ tỷ lệ tướng/lính/quái của bản 64 và hiệu ứng kỹ năng của bản 62.

Đã dựng toàn bộ 36 màn, kiểm tra ô trụ và trận mô phỏng 30 giây ở vùng Orc; không ghi nhận lỗi game. Đây là kiểm tra trình duyệt desktop, chưa kiểm tra trên điện thoại thật.

## Bản 64 — đường gọn, thêm ô trụ và tỷ lệ đơn vị

Khung map giảm ngang từ 1000 xuống 880, đường rộng 38; đường một lối giảm biên độ uốn, giữ 36 bố cục khác nhau và các nhánh hai/ba lối. Sông, cầu và cổng dùng cùng tọa độ mới. Tăng lên 8–10 ô trụ thực tế mỗi màn; mỗi ô kiểm tra cả vùng trụ cấp cuối với đường và nước, không chỉ điểm chân trụ.

Lính Người cao 34, tướng thường 38 (nhỉnh khoảng 12%), tướng Người Lùn 35. Quái thường dùng khoảng 27–40, quái nặng 43–44 và boss 52 để vẫn phân biệt vai trò nhưng giảm chênh lệch quá lớn. Lính triệu hồi cùng quy chuẩn 32. Kích thước hiển thị tách khỏi chỉ số chiến đấu.

Đã kiểm tra đủ 36 màn có ít nhất 8 ô trụ và khoảng hở đường/nước, tỷ lệ của 10 tướng/31 loại quái, trận mô phỏng 30 giây và khung 667×375. Chưa kiểm tra trên điện thoại thật.

## Bản 63 — cảnh chiến dịch và mobile

Toàn bộ 36 nền map có thêm gò đất thấp, nét cỏ/hoa theo cụm và mép lối mòn tự nhiên. Mỗi màn có một điểm nhấn ngoài đường giao chiến: trại Người/Orc, vòm rễ Elf, tinh thể Phù Thủy, giàn khai thác Người Lùn và đài Ấn của Liên Minh. Các điểm nhấn tránh đường, nước, trụ và cổng; cây quanh điểm nhấn được gom lại để không chồng kín cảnh. Cảnh tĩnh được vẽ một lần; cache địa hình mới chỉ giữ bốn màn.

Trên khung điện thoại, giới hạn mật độ canvas 1,5 và nền 1,25; ánh sáng dùng ảnh nhỏ tái sử dụng, lớp nước cập nhật tối đa 30 lần/giây. Chiến đấu và nhân vật vẫn cập nhật đầy đủ. Chất lượng thích ứng dùng chi phí xử lý khung, không dùng thời gian giữa hai khung; phục hồi độ nét khi máy nhẹ tải.

Nhân vật đứng dùng đủ chu kỳ tư thế, chuyển khung đi/đánh mềm hơn; chuẩn bị các khung cần thiết thành từng lượt ngắn để giảm khựng lúc đơn vị xuất hiện. Không cắt ghép chi hoặc kéo giãn thân.

Đã dựng và xem 36 map, kiểm tra chuyển động 31 loại quái và trận mô phỏng 30 giây. Khung 667×375 hiển thị toàn map và các điều khiển không chồng nhau. Đây là kiểm tra desktop ở kích thước mobile, chưa xác nhận trên điện thoại thật.

## Bản 62 — vật phẩm kiến trúc và hiệu ứng kỹ năng

Hình vật phẩm trong kho và bộ phận gắn trên trụ dùng cùng nét vẽ: cờ, cửa gia cố, phù hiệu, mái, giá cung, rễ, tinh thể, vòng phép, cơ cấu pháo. Kính ngắm và vòng nòng đi theo nòng pháo khi xoay và giật. Thần Tích có khắc dấu trên phần gắn, không thêm vòng hào quang rời quanh trụ.

Kỹ năng trong trận dùng hình học hoạt ảnh thay cho ảnh hiệu ứng cố định: đường phép chuyển động, vệt chém, vòng va chạm, tia sáng, lá, bụi và mảnh vỡ tan dần. Đòn rơi có dấu báo trên đất trước đúng thời điểm tác động. Ảnh minh họa vẫn dùng làm biểu tượng nút kỹ năng.

Đã dựng 24 vật phẩm trên 16 kiểu trụ và kiểm tra 20 kỹ năng ở ba thời điểm khác nhau. Cả 20 kỹ năng được gọi trong trận thử với hồi chiêu hoạt động; 600 lượt render không ghi nhận lỗi game. Đây là kiểm tra trình duyệt desktop, chưa xác nhận trên mọi điện thoại thật.

## Bản 61 — chuyển động và điểm trúng đòn

Hướng lệch ngang của quái được nội suy liên tục qua các đoạn đường, tránh nhảy vị trí khi rẽ. Chu kỳ bước theo quãng đường được rút ngắn cho từng nhóm quái. Lính xóa trạng thái đang di chuyển trước mỗi lượt cập nhật, nên khi đứng đánh không tiếp tục chạy tại chỗ.

Đòn cận chiến của quái gây sát thương ở giữa động tác, chỉ trúng một lần; choáng hủy đòn đang chuẩn bị. Các tư thế đứng, đi và đánh chuyển mềm trong 90 ms bằng toàn bộ khung ảnh vẽ, không cắt ghép chân. Lính trên trụ dùng cùng cơ chế chuyển tư thế.

Đã kiểm tra chuyển động riêng của 31 loại quái (3.720 lượt vẽ), các điểm nối đường của 36 màn, và trận mô phỏng 30 giây có tên, phép và đạn pháo. Kiểm tra trình duyệt ở khung 844×390; kết quả này không thay thế kiểm tra trên điện thoại thật hoặc chơi hết chiến dịch.

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
