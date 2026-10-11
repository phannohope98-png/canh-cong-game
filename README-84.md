# Chiến Tuyến Liên Minh — bản 84

Sáu map HD riêng, thứ tự: Cờ Trận Gãy; Hai Cầu Tro Tàn; Trại Cháy Vòng Vây; Ba Lỗ Thủng; Vòng Siết Thành Vỡ; Tâm Khe Nứt.
Map tương ứng màn 31–36 trong game. Boss cuối Chúa Tể Hư Không xuất hiện từ đài trung tâm ở màn 36, đợt cuối.

01-map.png…06-map.png: nền gốc 1672×941. toa-do.json: đường, bệ trụ, lối nối theo pixel ảnh; engine thu về 608×342. Không lấy tọa độ ảnh thu nhỏ để đặt trụ.
chi-tiet/: 12 PNG trong suốt, cờ năm tộc và di tích chiến trường tách riêng.
quai-bay/: Imp, Drake, Wraith, mỗi loại 18 khung đầy đủ và atlas; bố cục sáu cột, ba hàng (hover, bay, đánh trên không). Crystal Wraith dùng cùng hình linh hồn; Harpy dùng sáu tư thế cánh đã có, đổi sang đồng hồ bay.
dan-cu/: sáu tư thế giặt đồ và sáu tư thế nông dân. Các hoạt động cũ vẫn được dùng, căn lại theo sân nhà, sàn cây, bờ nước và xưởng.
hoat-anh.json: đăng ký khung ảnh, trục chân, FPS và chi tiết. Asset bay không cắt theo ô lưới máy móc: giữ trọn thành phần cánh/thân rồi đặt lên ô có cùng trục.
Mã và WebP thực thi trong goi-code-84.zip, giữ nguyên cấu trúc thư mục repository. Chép đè lên bản 83; không xóa dữ liệu lưu người chơi.

Chất lượng mobile: canvas theo DPR, tối đa 2.75 và ngân sách 3.2 triệu pixel; nền vẽ theo độ phân giải nguồn, cư dân và môi trường dùng ảnh WebP. Không ép xoay ngang, xử lý resize/fullscreen và đổi chiều.
Tỉ lệ cơ bản: tướng 32, tướng lùn 29, lính 28, viện binh 26; quái có cấp vóc dáng riêng. Trụ thu theo bệ, không đẩy bệ ra xa đường.

Ảnh tạo bằng ImageGen; các prompt nguyên văn được giữ kèm để tái tạo/chỉnh sửa. Các sprite cũ được tái sử dụng khi đúng nhận diện. Kiểm thử trình duyệt không thay thế đo FPS trực tiếp trên điện thoại thật.
