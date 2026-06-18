# API Backend Quản Lý Salon

Dự án backend cho hệ thống quản lý salon, được xây dựng bằng Django và Django REST Framework.

## Hướng Dẫn Cài Đặt Và Chạy Dự Án

### Yêu Cầu Hệ Thống
- Python 3.10 trở lên
- pip, trình quản lý gói Python

### Các Bước Thực Hiện

**Bước 1: Di chuyển vào thư mục dự án**
```bash
cd d:\project\BAI_TAP
```

**Bước 2: Tạo và kích hoạt môi trường ảo**
```bash
python -m venv venv
```

Trên Windows:
```bash
venv\Scripts\activate
```

Trên macOS hoặc Linux:
```bash
source venv/bin/activate
```

**Bước 3: Cài đặt thư viện phụ thuộc**
```bash
pip install -r requirements.txt
```

**Bước 4: Cập nhật cơ sở dữ liệu**
```bash
python manage.py migrate
```

**Bước 5: Tạo tài khoản quản trị nếu cần**
```bash
python manage.py createsuperuser
```

**Bước 6: Khởi động máy chủ phát triển**
```bash
python manage.py runserver
```

Sau khi chạy thành công, hệ thống hoạt động tại `http://127.0.0.1:8000/`.

## Danh Sách API

Tất cả điểm cuối bên dưới dùng URL gốc `http://127.0.0.1:8000/`.

### 1. Xác Thực
- `/api/auth/login/` - Đăng nhập
- `/api/auth/logout/` - Đăng xuất
- `/api/auth/me/` - Lấy thông tin người dùng hiện tại
- `/api/auth/register/` - Đăng ký tài khoản mới

### 2. Quản Lý Tài Khoản
- `/api/accounts/` - Lấy danh sách hoặc tạo tài khoản
- `/api/accounts/<id>/` - Xem chi tiết, cập nhật hoặc xóa tài khoản
- `/api/accounts/<id>/deactivate/` - Vô hiệu hóa tài khoản

### 3. Quản Lý Khách Hàng
- `/api/customers/` - Lấy danh sách hoặc tạo khách hàng
- `/api/customers/<id>/` - Xem chi tiết, cập nhật hoặc xóa khách hàng
- `/api/customers/<id>/history/` - Xem lịch sử của khách hàng

### 4. Quản Lý Nhân Viên
- `/api/employees/` - Lấy danh sách hoặc tạo nhân viên
- `/api/employees/<id>/` - Xem chi tiết, cập nhật hoặc xóa nhân viên
- `/api/employees/<id>/availability/` - Lấy lịch rảnh của nhân viên
- `/api/employees/availability-blocks/` - Cấu hình khung giờ rảnh
- `/api/employees/availability-blocks/<id>/` - Cập nhật khung giờ rảnh

### 5. Quản Lý Dịch Vụ
- `/api/services/` - Lấy danh sách hoặc tạo dịch vụ
- `/api/services/<id>/` - Xem chi tiết, cập nhật hoặc xóa dịch vụ
- `/api/services/<id>/price-history/` - Xem lịch sử giá của dịch vụ

### 6. Quản Lý Lịch Hẹn
- `/api/appointments/` - Lấy danh sách hoặc tạo lịch hẹn
- `/api/appointments/<id>/` - Xem chi tiết, cập nhật hoặc xóa lịch hẹn
- `/api/appointments/<id>/arrive/` - Đánh dấu khách đã đến
- `/api/appointments/<id>/cancel/` - Hủy lịch hẹn
- `/api/appointments/<id>/confirm/` - Xác nhận lịch hẹn
- `/api/appointments/<id>/no-show/` - Đánh dấu khách không đến
- `/api/appointments/<id>/reschedule/` - Đổi lịch hẹn
- `/api/appointments/availability/` - Tra cứu thời gian còn trống

### 7. Thực Hiện Dịch Vụ
- `/api/service-executions/` - Lấy danh sách phiên dịch vụ
- `/api/service-executions/<id>/` - Xem chi tiết phiên dịch vụ
- `/api/service-executions/<appointment_id>/start/` - Bắt đầu thực hiện dịch vụ
- `/api/service-executions/<id>/complete/` - Hoàn thành dịch vụ
- `/api/service-executions/<id>/incidentals/` - Ghi nhận phụ phí phát sinh

### 8. Hóa Đơn
- `/api/invoices/` - Lấy danh sách hoặc tạo hóa đơn
- `/api/invoices/<id>/` - Xem chi tiết hóa đơn
- `/api/invoices/<id>/adjust/` - Điều chỉnh hóa đơn
- `/api/invoices/<id>/apply-voucher/` - Áp dụng mã ưu đãi
- `/api/invoices/<id>/issue/` - Xuất hóa đơn
- `/api/invoices/<id>/use-reward-points/` - Sử dụng điểm thưởng
- `/api/invoices/from-appointment/<appointment_id>/` - Tạo hóa đơn từ lịch hẹn

### 9. Thanh Toán
- `/api/payments/` - Lấy danh sách hoặc tạo thanh toán
- `/api/payments/<id>/` - Xem chi tiết thanh toán
- `/api/payments/<id>/history/` - Xem lịch sử thanh toán
- `/api/payments/<id>/mark-failed/` - Đánh dấu thanh toán thất bại
- `/api/payments/<id>/mark-success/` - Đánh dấu thanh toán thành công
- `/api/payments/<id>/refund/` - Hoàn tiền thanh toán

### 10. Khuyến Mãi Và Mã Ưu Đãi
- `/api/promotions/` - Lấy danh sách hoặc tạo chương trình khuyến mãi
- `/api/promotions/<id>/` - Xem chi tiết khuyến mãi
- `/api/promotions/<id>/archive/` - Lưu trữ khuyến mãi
- `/api/vouchers/` - Lấy danh sách hoặc tạo mã ưu đãi
- `/api/vouchers/<id>/` - Xem chi tiết mã ưu đãi
- `/api/vouchers/<id>/cancel/` - Hủy mã ưu đãi

### 11. Điểm Thưởng
- `/api/reward-ledger/` - Lấy danh sách giao dịch điểm thưởng
- `/api/reward-ledger/<id>/` - Xem chi tiết điểm thưởng
- `/api/reward-ledger/adjust/` - Điều chỉnh điểm thưởng

### 12. Phản Hồi Và Khiếu Nại
- `/api/feedback/` - Lấy danh sách hoặc tạo phản hồi
- `/api/feedback/<id>/` - Xem chi tiết phản hồi
- `/api/feedback/<id>/respond/` - Trả lời phản hồi
- `/api/feedback/<id>/close/` - Đóng phản hồi
- `/api/complaints/` - Lấy danh sách hoặc tạo khiếu nại
- `/api/complaints/<id>/` - Xem chi tiết khiếu nại
- `/api/complaints/<id>/assign/` - Phân công giải quyết
- `/api/complaints/<id>/escalate/` - Chuyển cấp xử lý khiếu nại
- `/api/complaints/<id>/resolve/` - Đánh dấu đã giải quyết
- `/api/complaints/<id>/close/` - Đóng khiếu nại
- `/api/complaints/<id>/history/` - Xem lịch sử khiếu nại

### 13. Thông Báo
- `/api/notifications/` - Lấy danh sách thông báo
- `/api/notifications/<id>/` - Xem chi tiết thông báo
- `/api/notifications/<id>/mark-read/` - Đánh dấu đã đọc
- `/api/notifications/mark-all-read/` - Đánh dấu đã đọc tất cả

### 14. Báo Cáo
- `/api/reports/appointments/` - Báo cáo lịch hẹn
- `/api/reports/customers/` - Báo cáo khách hàng
- `/api/reports/revenue/` - Báo cáo doanh thu
- `/api/reports/services/` - Báo cáo dịch vụ
- `/api/reports/staff-performance/` - Báo cáo hiệu suất nhân viên

Các API hầu hết dùng `GET` để lấy dữ liệu, `POST` để tạo mới, `PUT/PATCH` để cập nhật và `DELETE` để xóa, tùy theo quyền được cấu hình trong hệ thống.

## Dữ Liệu Mẫu

Mật khẩu mặc định cho tài khoản thử nghiệm: `SalonPassword123!`

### Tài Khoản
- Quản lý: `salon_manager`, `manager@salon.com`
- Lễ tân: `salon_receptionist`, `receptionist@salon.com`
- Nhà tạo mẫu: `stylist_elena`, `elena@salon.com`
- Nhà tạo mẫu: `stylist_marcus`, `marcus@salon.com`
- Nhà tạo mẫu: `stylist_linh`, `linh@salon.com`
- Khách hàng: `customer_a`, `customer_a@example.com`
- Khách hàng: `customer_b`, `customer_b@example.com`

### Dịch Vụ
- Cắt tóc nam: 150.000 VND, 30 phút
- Cắt tóc nữ: 250.000 VND, 60 phút
- Gội đầu và massage: 100.000 VND, 30 phút
- Nhuộm tóc cao cấp: 500.000 VND, 90 phút
- Tạo kiểu tóc sự kiện: 120.000 VND, 45 phút
- Phục hồi Keratin: 350.000 VND, 60 phút
- Chăm sóc và tỉa râu: 80.000 VND, 20 phút

### Mã Ưu Đãi
- `NEWCUSTOMER10`: giảm 10% cho hóa đơn từ 200.000 VND
- `SUMMER20`: giảm 20% cho hóa đơn từ 300.000 VND
- `VIP30`: giảm trực tiếp 100.000 VND cho hóa đơn từ 500.000 VND
- `HAIRCUT15`: giảm 15% cho dịch vụ cắt tóc nam và cắt tóc nữ

Lệnh nạp dữ liệu mẫu có thể chạy lại nhiều lần mà không tạo dữ liệu trùng lặp.
