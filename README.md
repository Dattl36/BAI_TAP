# Salon Management Backend API

Dự án Backend cho hệ thống Quản lý Salon, được xây dựng bằng Django và Django REST Framework.

## 🚀 Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống
- Python 3.10+
- pip (Python package manager)

### Các bước thực hiện

**Bước 1: Clone dự án và di chuyển vào thư mục dự án** (Nếu chưa có)
```bash
cd d:\project\BAI_TAP
```

**Bước 2: Tạo và kích hoạt môi trường ảo (Virtual Environment)**
Tạo môi trường ảo (khuyên dùng để tránh xung đột thư viện):
```bash
python -m venv venv
```

Kích hoạt môi trường ảo:
- Trên **Windows**:
  ```bash
  venv\Scripts\activate
  ```
- Trên **macOS/Linux**:
  ```bash
  source venv/bin/activate
  ```

**Bước 3: Cài đặt các thư viện phụ thuộc**
```bash
pip install -r requirements.txt
```

**Bước 4: Chạy database migrations**
Cập nhật cấu trúc cơ sở dữ liệu:
```bash
python manage.py migrate
```

**Bước 5: Tạo Superuser (Tài khoản quản trị - Tuỳ chọn)**
Để truy cập vào trang Admin của Django:
```bash
python manage.py createsuperuser
```

**Bước 6: Chạy server khởi động dự án**
```bash
python manage.py runserver
```
Sau khi chạy thành công, server sẽ hoạt động tại: `http://127.0.0.1:8000/`

---

## 📋 Danh sách các APIs (Endpoints)

Dưới đây là các endpoints API có sẵn trong hệ thống (Tất cả bắt đầu với base URL `http://127.0.0.1:8000/`).

### 1. Xác thực (Authentication)
* `/api/auth/login/` - Đăng nhập
* `/api/auth/logout/` - Đăng xuất
* `/api/auth/me/` - Lấy thông tin user hiện tại
* `/api/auth/register/` - Đăng ký tài khoản mới

### 2. Quản lý Tài khoản (Accounts)
* `/api/accounts/` - Lấy danh sách hoặc tạo tài khoản
* `/api/accounts/<id>/` - Xem chi tiết, cập nhật hoặc xóa tài khoản
* `/api/accounts/<id>/deactivate/` - Vô hiệu hóa tài khoản

### 3. Quản lý Khách hàng (Customers)
* `/api/customers/` - Lấy danh sách hoặc tạo khách hàng
* `/api/customers/<id>/` - Xem chi tiết, cập nhật hoặc xóa khách hàng
* `/api/customers/<id>/history/` - Xem lịch sử của khách hàng

### 4. Quản lý Nhân viên (Employees)
* `/api/employees/` - Lấy danh sách hoặc tạo nhân viên
* `/api/employees/<id>/` - Xem chi tiết, cập nhật hoặc xóa nhân viên
* `/api/employees/<id>/availability/` - Lấy lịch rảnh của nhân viên
* `/api/employees/availability-blocks/` - Cấu hình khung giờ rảnh
* `/api/employees/availability-blocks/<id>/` - Cập nhật khung giờ rảnh

### 5. Quản lý Dịch vụ (Services)
* `/api/services/` - Lấy danh sách hoặc tạo dịch vụ
* `/api/services/<id>/` - Xem chi tiết, cập nhật hoặc xóa dịch vụ
* `/api/services/<id>/price-history/` - Lịch sử giá của dịch vụ

### 6. Quản lý Lịch hẹn (Appointments)
* `/api/appointments/` - Lấy danh sách hoặc tạo lịch hẹn
* `/api/appointments/<id>/` - Xem chi tiết, cập nhật hoặc xóa lịch hẹn
* `/api/appointments/<id>/arrive/` - Đánh dấu khách đã đến
* `/api/appointments/<id>/cancel/` - Hủy lịch hẹn
* `/api/appointments/<id>/confirm/` - Xác nhận lịch hẹn
* `/api/appointments/<id>/no-show/` - Đánh dấu khách không đến
* `/api/appointments/<id>/reschedule/` - Đổi lịch hẹn
* `/api/appointments/availability/` - Tra cứu thời gian còn trống

### 7. Thực hiện Dịch vụ (Service Executions)
* `/api/service-executions/` - Danh sách phiên dịch vụ
* `/api/service-executions/<id>/` - Chi tiết phiên dịch vụ
* `/api/service-executions/<appointment_id>/start/` - Bắt đầu thực hiện dịch vụ
* `/api/service-executions/<id>/complete/` - Hoàn thành dịch vụ
* `/api/service-executions/<id>/incidentals/` - Phụ phí phát sinh

### 8. Hóa đơn (Invoices)
* `/api/invoices/` - Danh sách hoặc tạo hóa đơn
* `/api/invoices/<id>/` - Chi tiết hóa đơn
* `/api/invoices/<id>/adjust/` - Điều chỉnh hóa đơn
* `/api/invoices/<id>/apply-voucher/` - Áp dụng mã giảm giá
* `/api/invoices/<id>/issue/` - Xuất hóa đơn
* `/api/invoices/<id>/use-reward-points/` - Sử dụng điểm thưởng
* `/api/invoices/from-appointment/<appointment_id>/` - Tạo hóa đơn từ lịch hẹn

### 9. Thanh toán (Payments)
* `/api/payments/` - Danh sách hoặc tạo thanh toán
* `/api/payments/<id>/` - Chi tiết thanh toán
* `/api/payments/<id>/history/` - Lịch sử thanh toán
* `/api/payments/<id>/mark-failed/` - Đánh dấu thanh toán thất bại
* `/api/payments/<id>/mark-success/` - Đánh dấu thanh toán thành công
* `/api/payments/<id>/refund/` - Hoàn tiền thanh toán

### 10. Khuyến mãi & Vouchers (Promotions & Vouchers)
* `/api/promotions/` - Danh sách hoặc tạo chương trình khuyến mãi
* `/api/promotions/<id>/` - Chi tiết khuyến mãi
* `/api/promotions/<id>/archive/` - Lưu trữ khuyến mãi
* `/api/vouchers/` - Danh sách hoặc tạo Vouchers
* `/api/vouchers/<id>/` - Chi tiết Voucher
* `/api/vouchers/<id>/cancel/` - Hủy Voucher

### 11. Điểm thưởng (Reward Ledger)
* `/api/reward-ledger/` - Danh sách tích điểm
* `/api/reward-ledger/<id>/` - Chi tiết điểm thưởng
* `/api/reward-ledger/adjust/` - Điều chỉnh điểm thưởng

### 12. Phản hồi & Khiếu nại (Feedback & Complaints)
* `/api/feedback/` - Danh sách hoặc tạo phản hồi
* `/api/feedback/<id>/` - Chi tiết phản hồi
* `/api/feedback/<id>/respond/` - Trả lời phản hồi
* `/api/feedback/<id>/close/` - Đóng phản hồi
* `/api/complaints/` - Danh sách hoặc tạo khiếu nại
* `/api/complaints/<id>/` - Chi tiết khiếu nại
* `/api/complaints/<id>/assign/` - Phân công giải quyết
* `/api/complaints/<id>/escalate/` - Leo thang khiếu nại
* `/api/complaints/<id>/resolve/` - Đánh dấu đã giải quyết
* `/api/complaints/<id>/close/` - Đóng khiếu nại
* `/api/complaints/<id>/history/` - Xem lịch sử khiếu nại

### 13. Thông báo (Notifications)
* `/api/notifications/` - Danh sách thông báo
* `/api/notifications/<id>/` - Chi tiết thông báo
* `/api/notifications/<id>/mark-read/` - Đánh dấu đã đọc
* `/api/notifications/mark-all-read/` - Đánh dấu đã đọc tất cả

### 14. Báo cáo (Reports)
* `/api/reports/appointments/` - Báo cáo lịch hẹn
* `/api/reports/customers/` - Báo cáo khách hàng
* `/api/reports/revenue/` - Báo cáo doanh thu
* `/api/reports/services/` - Báo cáo dịch vụ
* `/api/reports/staff-performance/` - Báo cáo hiệu suất nhân viên

---
*Lưu ý: Các API trên hầu hết đều nhận `GET` để lấy danh sách/chi tiết, `POST` để tạo mới, `PUT/PATCH` để cập nhật và `DELETE` để xóa (Tuỳ thuộc vào các quyền được cấu hình trong hệ thống).*

Dữ liệu mẫu đã được nạp vào Database:
1. Các tài khoản thử nghiệm (Mật khẩu mặc định: SalonPassword123!)
Manager (Quản lý):
Username: salon_manager
Email: manager@salon.com
Receptionist (Lễ tân):
Username: salon_receptionist
Email: receptionist@salon.com
Staff / Stylist (Thợ làm tóc):
Username: stylist_elena | Email: elena@salon.com
Username: stylist_marcus | Email: marcus@salon.com
Username: stylist_linh | Email: linh@salon.com
Customer (Khách hàng):
Username: customer_a | Email: customer_a@example.com
Username: customer_b | Email: customer_b@example.com
2. Dịch vụ Salon (Services)
Men's Haircut: 150.000 VND (30 phút)
Women's Haircut: 250.000 VND (60 phút)
Hair Wash & Massage: 100.000 VND (30 phút)
Premium Hair Coloring: 500.000 VND (90 phút)
Special Event Hair Styling: 120.000 VND (45 phút)
Keratin Repair Treatment: 350.000 VND (60 phút)
Beard Grooming & Trim: 80.000 VND (20 phút)
3. Mã giảm giá Voucher
NEWCUSTOMER10: Giảm giá 10% (cho hóa đơn từ 200.000 VND).
SUMMER20: Giảm giá 20% (cho hóa đơn từ 300.000 VND).
VIP30: Giảm trực tiếp 100.000 VND (cho hóa đơn từ 500.000 VND).
HAIRCUT15: Giảm giá 15% áp dụng riêng cho các dịch vụ cắt tóc (Men's Haircut, Women's Haircut).
Lệnh này hoàn toàn idempotent, nghĩa là bạn có thể chạy lại bao nhiêu lần tùy ý mà không sợ bị trùng lặp dữ liệu trong database.

