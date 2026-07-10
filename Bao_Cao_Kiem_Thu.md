# CHƯƠNG 3. XÂY DỰNG HỆ THỐNG KIỂM THỬ TỰ ĐỘNG CHO ỨNG DỤNG QUẢN LÝ SALON

## 3.1. Kế hoạch kiểm thử phần mềm

Kế hoạch kiểm thử được xây dựng nhằm xác định phạm vi thực hiện, môi trường triển khai, dữ liệu sử dụng và tiêu chí đánh giá kết quả kiểm thử đối với hệ thống quản lý salon. Nội dung của kế hoạch là cơ sở để tổ chức quá trình kiểm thử một cách thống nhất, bảo đảm các trường hợp kiểm thử được thực hiện trong cùng điều kiện và có thể so sánh kết quả giữa nhiều lần chạy.

Do hệ thống gồm nhiều nhóm chức năng và nhiều vai trò người dùng, kế hoạch kiểm thử không tập trung kiểm tra toàn bộ hệ thống trong một giai đoạn mà ưu tiên các chức năng có mức độ ảnh hưởng lớn đến hoạt động của salon. Việc giới hạn phạm vi kiểm thử cho phép xây dựng bộ kiểm thử chi tiết hơn, đồng thời phù hợp với thời gian và nguồn lực thực hiện của đề tài. Các nội dung của kế hoạch kiểm thử được trình bày trong các mục dưới đây.

### 3.1.1. Mục tiêu và phạm vi kiểm thử

Mục tiêu của hoạt động kiểm thử là đánh giá mức độ chính xác của các chức năng quan trọng trong hệ thống quản lý salon trước khi đưa vào sử dụng. Quá trình kiểm thử tập trung xác minh khả năng xử lý nghiệp vụ, kiểm soát dữ liệu đầu vào và bảo đảm mỗi nhóm người dùng chỉ được thực hiện các chức năng đúng với quyền hạn được cấp. Kết quả kiểm thử là căn cứ để đánh giá mức độ ổn định của hệ thống và phát hiện các lỗi cần khắc phục.

Bên cạnh mục tiêu đánh giá chất lượng phần mềm, kế hoạch kiểm thử còn xác định rõ phạm vi thực hiện nhằm tránh dàn trải nguồn lực. Sáu nhóm chức năng được lựa chọn đều liên quan trực tiếp đến quá trình vận hành của salon, bao gồm đăng nhập, quản lý dịch vụ, quản lý khách hàng, quản lý lịch hẹn, quản lý voucher và phân quyền người dùng. Đây là các chức năng có tần suất sử dụng cao và có khả năng ảnh hưởng trực tiếp đến tính chính xác của dữ liệu cũng như trải nghiệm của người sử dụng.

Một số chức năng như thanh toán trực tuyến, gửi email hoặc SMS, kiểm thử tải và kiểm thử bảo mật chuyên sâu chưa được đưa vào phạm vi của đề tài. Những nội dung này yêu cầu hạ tầng hoặc dịch vụ bên ngoài nên sẽ được xem xét trong các giai đoạn phát triển tiếp theo.

**Bảng 3.1. Mục tiêu kiểm thử**

| STT | Mục tiêu | Ý nghĩa |
| :--- | :--- | :--- |
| 1 | Kiểm tra tính đúng đắn của chức năng | Đảm bảo chức năng hoạt động theo yêu cầu nghiệp vụ |
| 2 | Kiểm tra dữ liệu đầu vào | Phát hiện dữ liệu không hợp lệ và xử lý ngoại lệ |
| 3 | Kiểm tra quyền truy cập | Đảm bảo mỗi vai trò chỉ được sử dụng đúng chức năng |
| 4 | Kiểm tra tính ổn định | Đánh giá khả năng hoạt động sau nhiều lần thực hiện |
| 5 | Hỗ trợ kiểm thử hồi quy | Phát hiện lỗi sau khi hệ thống được cập nhật |

**Bảng 3.2. Phạm vi kiểm thử**

| Thuộc phạm vi | Ngoài phạm vi |
| :--- | :--- |
| Đăng nhập và xác thực | Thanh toán qua cổng trung gian bên thứ ba |
| Quản lý dịch vụ | Gửi tin nhắn SMS, Email thực tế |
| Quản lý khách hàng | Ứng dụng di động (Mobile App native) |
| Quản lý lịch hẹn | Kiểm thử tải lớn (Load / Stress testing) |
| Voucher và Khuyến mãi | Kiểm thử xâm nhập chuyên sâu (Penetration testing) |
| Phân quyền tài khoản (RBAC) | Các dịch vụ tích hợp bên thứ ba khác |

### 3.1.2. Môi trường và dữ liệu kiểm thử

Hoạt động kiểm thử được thực hiện trên môi trường phát triển của hệ thống nhằm bảo đảm các chức năng được đánh giá trong điều kiện tương tự quá trình phát triển phần mềm. Backend được xây dựng bằng Django và Django REST Framework, frontend sử dụng React kết hợp TypeScript, trong khi cơ sở dữ liệu sử dụng SQLite. Bộ kiểm thử được xây dựng bằng pytest và pytest-django để tự động hóa quá trình thực thi các test case.

Ngoài môi trường phần mềm, dữ liệu kiểm thử cũng được chuẩn bị riêng nhằm bảo đảm các trường hợp kiểm thử không ảnh hưởng đến dữ liệu sử dụng trong quá trình phát triển. Dữ liệu được xây dựng theo cả hai nhóm hợp lệ và không hợp lệ để đánh giá khả năng xử lý của hệ thống đối với nhiều tình huống khác nhau. Mỗi lần thực hiện kiểm thử đều sử dụng tập dữ liệu xác định trước để kết quả giữa các lần chạy có thể so sánh và đối chiếu.

Việc tách biệt môi trường và dữ liệu kiểm thử với môi trường sử dụng thông thường góp phần hạn chế ảnh hưởng của các thay đổi trong quá trình phát triển, đồng thời tạo điều kiện thuận lợi cho hoạt động kiểm thử hồi quy sau khi hệ thống được cập nhật.

**Bảng 3.3. Môi trường kiểm thử**

| Thành phần | Môi trường sử dụng |
| :--- | :--- |
| Hệ điều hành | Windows 11 Pro 64-bit |
| Backend | Python 3.14 + Django 5.2 + Django REST Framework 3.17 |
| Frontend | React 18.3 + TypeScript + Vite 5.4 |
| Cơ sở dữ liệu | SQLite 3 |
| Công cụ kiểm thử | pytest 8.4 + pytest-django 4.12 |
| Trình duyệt | Google Chrome v120.0 (hoặc mới hơn) |

**Bảng 3.4. Dữ liệu kiểm thử**

| Nhóm dữ liệu | Nội dung |
| :--- | :--- |
| Người dùng | Tài khoản quản lý (Manager), lễ tân (Receptionist), nhân viên kỹ thuật (Staff), và khách hàng (Customer) |
| Khách hàng | Thông tin khách hàng hợp lệ (tên, số điện thoại đúng định dạng) và không hợp lệ (số điện thoại chữ, thiếu trường) |
| Dịch vụ | Các gói dịch vụ salon hợp lệ, giá trị biên (giá quá thấp/cao, thời lượng âm), dữ liệu thiếu thông tin bắt buộc |
| Lịch hẹn | Lịch đặt hợp lệ, lịch trong quá khứ (không hợp lệ), các lịch trùng giờ làm việc của cùng một nhân viên |
| Voucher | Mã giảm giá còn hạn sử dụng, mã hết hạn, mã không đủ điều kiện (hóa đơn chưa đạt giá trị tối thiểu) |

### 3.1.3. Điều kiện và tiêu chí đánh giá kiểm thử

Quá trình kiểm thử chỉ được thực hiện khi môi trường phát triển đã được cấu hình đầy đủ và hệ thống có thể hoạt động ổn định. Backend phải khởi động thành công, cơ sở dữ liệu đã được khởi tạo và các API thuộc phạm vi kiểm thử có thể truy cập bình thường. Đồng thời, tài khoản của các nhóm người dùng và dữ liệu kiểm thử phải được chuẩn bị trước để bảo đảm mọi test case đều có đủ điều kiện thực hiện.

Hoạt động kiểm thử được xem là hoàn thành khi toàn bộ test case trong phạm vi đã được thực thi và kết quả được ghi nhận đầy đủ. Những lỗi phát hiện trong quá trình kiểm thử cần được phân loại theo mức độ ảnh hưởng và lưu lại để phục vụ quá trình sửa lỗi cũng như kiểm thử hồi quy. Kết quả cuối cùng được đánh giá thông qua số lượng test case đạt, không đạt và tỷ lệ hoàn thành của bộ kiểm thử.

Việc xác định rõ điều kiện bắt đầu, điều kiện kết thúc và tiêu chí đánh giá giúp bảo đảm quá trình kiểm thử được thực hiện nhất quán, đồng thời tạo cơ sở để đánh giá khách quan chất lượng của hệ thống sau khi hoàn thành kiểm thử.

**Bảng 3.5. Điều kiện bắt đầu và kết thúc kiểm thử**

| Điều kiện bắt đầu | Điều kiện kết thúc |
| :--- | :--- |
| Máy chủ Backend hoạt động ổn định | Toàn bộ 24 test case đã được thực thi |
| Cơ sở dữ liệu thử nghiệm được tạo lập đầy đủ | Không còn các lỗi nghiêm trọng (Blocker/Critical) |
| Các điểm cuối (API Endpoints) hoạt động bình thường | Mọi lỗi phát hiện đã được phân loại và ghi nhận đầy đủ |
| Có sẵn tập dữ liệu kiểm thử chuẩn | Đã thực hiện kiểm thử hồi quy thành công sau khi sửa lỗi |
| Có tài khoản phân quyền thử nghiệm | Đạt tỷ lệ Pass 100% đối với bộ kiểm thử tự động |

**Bảng 3.6. Tiêu chí đánh giá kết quả**

| Trạng thái | Ý nghĩa |
| :--- | :--- |
| **Pass** | Kết quả thực tế hoàn toàn trùng khớp với kết quả mong đợi của kịch bản |
| **Fail** | Kết quả thực tế có sự sai lệch so với mong đợi hoặc API trả về lỗi xử lý |
| **Blocked** | Kịch bản kiểm thử không thể thực hiện do lỗi ở một chức năng liên quan khác |
| **Not Run** | Kịch bản kiểm thử chưa được đưa vào hàng đợi để thực thi |

---

## 3.2. Thiết kế test case cho các chức năng chính

Hệ thống kiểm thử tự động được thiết kế tổng thể bao gồm **85 kịch bản kiểm thử (Test Cases)**, trong đó chọn lọc **45 kịch bản tiêu biểu** để trình bày chi tiết và cài đặt tự động hóa thông qua 6 tệp mã nguồn tương ứng.

**Bảng 3.15. Tổng hợp bộ test case đã thiết kế**

| STT | Nhóm chức năng | Test case thiết kế | Test case trình bày | File kiểm thử |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Đăng nhập | 12 | 6 | `test_login.py` |
| 2 | Quản lý dịch vụ | 15 | 8 | `test_service.py` |
| 3 | Quản lý khách hàng | 16 | 8 | `test_customer.py` |
| 4 | Quản lý lịch hẹn | 18 | 8 | `test_booking.py` |
| 5 | Voucher | 14 | 8 | `test_voucher.py` |
| 6 | Phân quyền | 10 | 7 | `test_permission.py` |
| | **Tổng cộng** | **85** | **45** | **6 file** |

Dưới đây là chi tiết thiết kế kịch bản kiểm thử trình bày cho từng nhóm chức năng của hệ thống:

**Bảng 3.16. Bảng thiết kế chi tiết 45 kịch bản kiểm thử trình bày**

| STT | Mã Test Case | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | **LOGIN_01** | Đăng nhập | Đăng ký tài khoản khách hàng mới thành công | username, password, email, phone, full_name hợp lệ | HTTP 201 Created, tạo hồ sơ khách hàng thành công |
| 2 | **LOGIN_02** | Đăng nhập | Đăng ký thất bại do trùng tên đăng nhập hoặc email | username hoặc email đã tồn tại trong hệ thống | HTTP 400 Bad Request, trả về thông báo lỗi trùng lặp |
| 3 | **LOGIN_03** | Đăng nhập | Đăng nhập tài khoản thành công lấy JWT Token | username, password chính xác của tài khoản đã kích hoạt | HTTP 200 OK, trả về access token và refresh token |
| 4 | **LOGIN_04** | Đăng nhập | Đăng nhập thất bại khi nhập sai mật khẩu | username đúng, password sai | HTTP 400 Bad Request, báo lỗi tài khoản/mật khẩu |
| 5 | **LOGIN_05** | Đăng nhập | Lấy thông tin cá nhân của tài khoản đang đăng nhập | JWT token hợp lệ trong header | HTTP 200 OK, đúng thông tin tài khoản hiện tại |
| 6 | **LOGIN_06** | Đăng nhập | Cập nhật thông tin cá nhân người dùng thành công | full_name mới, phone mới | HTTP 200 OK, dữ liệu được cập nhật trong DB |
| 7 | **SERVICE_01** | Quản lý dịch vụ | Quản lý tạo dịch vụ salon mới thành công | name, base_price, duration_minutes hợp lệ | HTTP 201 Created, dịch vụ mới lưu vào hệ thống |
| 8 | **SERVICE_02** | Quản lý dịch vụ | Tạo dịch vụ thất bại do thiếu thông tin bắt buộc | Để trống tên dịch vụ hoặc giá cơ bản | HTTP 400 Bad Request |
| 9 | **SERVICE_03** | Quản lý dịch vụ | Cập nhật giá dịch vụ và lưu lịch sử thay đổi giá | Dịch vụ ID, base_price mới, reason cập nhật | HTTP 200 OK, tạo bản ghi thay đổi trong PriceHistory |
| 10 | **SERVICE_04** | Quản lý dịch vụ | Xem lịch sử biến động giá của một dịch vụ | Dịch vụ ID hợp lệ | HTTP 200 OK, hiển thị danh sách PriceHistory |
| 11 | **SERVICE_05** | Quản lý dịch vụ | Xóa mềm dịch vụ thành công (Archive) | Dịch vụ ID | HTTP 204 No Content, trạng thái chuyển sang "archived" |
| 12 | **SERVICE_06** | Quản lý dịch vụ | Tìm kiếm dịch vụ theo danh mục | Category cần tìm | HTTP 200 OK, lọc đúng danh sách dịch vụ |
| 13 | **SERVICE_07** | Quản lý dịch vụ | Lấy thông tin chi tiết một dịch vụ đang hoạt động | Dịch vụ ID đang hoạt động | HTTP 200 OK |
| 14 | **SERVICE_08** | Quản lý dịch vụ | Khách hàng sửa đổi thông tin dịch vụ bị từ chối | Tài khoản Customer, API PATCH dịch vụ | HTTP 403 Forbidden |
| 15 | **CUSTOMER_01** | Quản lý khách hàng | Cập nhật hồ sơ thông tin cá nhân khách hàng | full_name, gender, address mới | HTTP 200 OK, thông tin cập nhật trong Profile |
| 16 | **CUSTOMER_02** | Quản lý khách hàng | Khách hàng nạp tiền vào ví điện tử thành công | ID khách hàng, amount > 0 | HTTP 200 OK, số dư ví tăng lên đúng số tiền |
| 17 | **CUSTOMER_03** | Quản lý khách hàng | Nạp tiền ví thất bại do số tiền không hợp lệ | amount âm hoặc định dạng chữ | HTTP 400 Bad Request |
| 18 | **CUSTOMER_04** | Quản lý khách hàng | Lấy lịch sử giao dịch ví của khách hàng | ID khách hàng hợp lệ | HTTP 200 OK, danh sách giao dịch ví |
| 19 | **CUSTOMER_05** | Quản lý khách hàng | Xem lịch sử sử dụng dịch vụ và đặt lịch | ID khách hàng | HTTP 200 OK, trả về danh sách chi tiết |
| 20 | **CUSTOMER_06** | Quản lý khách hàng | Quản lý lấy danh sách toàn bộ khách hàng | Tài khoản Manager, API GET customers | HTTP 200 OK |
| 21 | **CUSTOMER_07** | Quản lý khách hàng | Khách hàng chỉ xem được hồ sơ của chính mình | Tài khoản Customer, ID khách hàng khác | HTTP 403 Forbidden hoặc lọc rỗng theo scope |
| 22 | **CUSTOMER_08** | Quản lý khách hàng | Xóa mềm hồ sơ khách hàng bởi Quản lý | Tài khoản Manager, ID khách hàng | HTTP 204 No Content, trạng thái archived |
| 23 | **BOOKING_01** | Quản lý lịch hẹn | Đặt lịch hẹn mới thành công | Customer ID, Staff ID, thời gian tương lai, dịch vụ | HTTP 201 Created, trạng thái "requested" |
| 24 | **BOOKING_02** | Quản lý lịch hẹn | Đặt lịch hẹn thất bại khi thời gian ở quá khứ | scheduled_start trong quá khứ | HTTP 400 Bad Request |
| 25 | **BOOKING_03** | Quản lý lịch hẹn | Đặt lịch hẹn thất bại do trùng lịch nhân viên | Trùng thời gian bận của Staff | HTTP 409 Conflict |
| 26 | **BOOKING_04** | Quản lý lịch hẹn | Lễ tân xác nhận lịch hẹn thành công | Lịch hẹn ID, gọi API `/confirm/` | HTTP 200 OK, trạng thái chuyển sang "confirmed" |
| 27 | **BOOKING_05** | Quản lý lịch hẹn | Lễ tân chuyển trạng thái sang khách đã đến | Lịch hẹn ID, gọi API `/arrive/` | HTTP 200 OK, trạng thái "arrived" |
| 28 | **BOOKING_06** | Quản lý lịch hẹn | Hủy lịch hẹn thành công kèm theo lý do hủy | Lịch hẹn ID, lý do hủy | HTTP 200 OK, trạng thái "cancelled" |
| 29 | **BOOKING_07** | Quản lý lịch hẹn | Đổi thời gian/nhân viên lịch hẹn (Reschedule) | Lịch hẹn ID, giờ hẹn mới, nhân viên mới | HTTP 200 OK, cập nhật thời gian mới |
| 30 | **BOOKING_08** | Quản lý lịch hẹn | Khách hàng tự đổi lịch thất bại sau giới hạn 1h | Lịch hẹn ID đã đặt hơn 1 tiếng trước | HTTP 403 Forbidden |
| 31 | **VOUCHER_01** | Voucher | Tạo hóa đơn tự động từ thông tin lịch hẹn | Lịch hẹn ID hợp lệ | HTTP 201 Created, subtotal đúng giá dịch vụ đã đặt |
| 32 | **VOUCHER_02** | Voucher | Phát hành hóa đơn thành công (Issue) | Hóa đơn ID | HTTP 200 OK, trạng thái đổi sang "issued" |
| 33 | **VOUCHER_03** | Voucher | Áp dụng mã ưu đãi giảm giá theo số tiền cố định | Hóa đơn ID, mã giảm tiền cố định | HTTP 200 OK, giảm trừ trực tiếp vào total_due |
| 34 | **VOUCHER_04** | Voucher | Áp dụng mã ưu đãi giảm giá theo phần trăm | Hóa đơn ID, mã giảm giá % | HTTP 200 OK, tính đúng tiền giảm dựa trên subtotal |
| 35 | **VOUCHER_05** | Voucher | Áp dụng voucher thất bại do không đủ giá trị tối thiểu| Hóa đơn ID có subtotal < min_invoice | HTTP 400 Bad Request |
| 36 | **VOUCHER_06** | Voucher | Tích lũy điểm thưởng sau khi thanh toán hóa đơn | Hóa đơn ID thanh toán thành công | Điểm thưởng cộng vào ví khách hàng tỉ lệ 1:1 |
| 37 | **VOUCHER_07** | Voucher | Sử dụng điểm thưởng loyalty để giảm giá hóa đơn | Hóa đơn ID, số điểm quy đổi | HTTP 200 OK, giảm total_due, trừ điểm tương ứng |
| 38 | **VOUCHER_08** | Voucher | Điều chỉnh tăng/giảm số tiền hóa đơn (phụ phí) | Hóa đơn ID, số tiền điều chỉnh, lý do | HTTP 200 OK, trạng thái "adjusted" |
| 39 | **AUTH_01** | Phân quyền | Quản lý truy cập danh sách toàn bộ tài khoản thành công| Tài khoản Manager, GET `/api/accounts/` | HTTP 200 OK |
| 40 | **AUTH_02** | Phân quyền | Khách hàng truy cập danh sách tài khoản bị từ chối | Tài khoản Customer, GET `/api/accounts/` | HTTP 403 Forbidden |
| 41 | **AUTH_03** | Phân quyền | Quản lý thực hiện vô hiệu hóa tài khoản nhân viên | Tài khoản Manager, ID nhân viên cần deactive | HTTP 200 OK, is_active thành False |
| 42 | **AUTH_04** | Phân quyền | Khách hàng vô hiệu hóa tài khoản nhân viên bị chặn | Tài khoản Customer, ID nhân viên | HTTP 403 Forbidden |
| 43 | **AUTH_05** | Phân quyền | Lễ tân xem danh sách toàn bộ lịch hẹn | Tài khoản Receptionist, GET `/api/appointments/` | HTTP 200 OK |
| 44 | **AUTH_06** | Phân quyền | Nhân viên kỹ thuật chỉ xem lịch hẹn được phân công | Tài khoản Staff, GET `/api/appointments/` | HTTP 200 OK, chỉ chứa lịch hẹn của staff đó |
| 45 | **AUTH_07** | Phân quyền | Truy cập API khi chưa đăng nhập bị chặn | Không gửi token trong Header | HTTP 401 Unauthorized |

---

## 3.3. Kết quả kiểm thử phần mềm

Toàn bộ **85 kịch bản kiểm thử thiết kế** đã được cài đặt tự động hóa đầy đủ 100% bằng mã nguồn python trên bộ công cụ `pytest`. Tất cả đều đã vượt qua với kết quả hoàn hảo.

**Bảng 3.17. Tổng hợp kết quả kiểm thử tự động trên các file kiểm thử**

| File kiểm thử | Số lượng ca kiểm thử cài đặt | Đạt (Pass) | Thất bại (Fail) | Bị chặn (Blocked) | Tỷ lệ thành công |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `test_login.py` | 12 | 12 | 0 | 0 | 100% |
| `test_service.py` | 15 | 15 | 0 | 0 | 100% |
| `test_customer.py` | 16 | 16 | 0 | 0 | 100% |
| `test_booking.py` | 18 | 18 | 0 | 0 | 100% |
| `test_voucher.py` | 14 | 14 | 0 | 0 | 100% |
| `test_permission.py` | 10 | 10 | 0 | 0 | 100% |
| **Tổng cộng** | **85** | **85** | **0** | **0** | **100%** |

### Chi tiết log chạy kiểm thử tự động từ Pytest:

```bash
============================= test session starts =============================
platform win32 -- Python 3.14.2, pytest-8.4.2, pluggy-1.6.0 -- D:\BAI_TAP\.venv\Scripts\python.exe
cachedir: .pytest_cache
django: version: 5.2.15, settings: salon_backend.settings (from ini)
rootdir: D:\BAI_TAP
configfile: pytest.ini
plugins: django-4.12.0
collecting ... collected 85 items

tests/test_booking.py::test_create_appointment_success PASSED            [  1%]
tests/test_booking.py::test_create_appointment_past_fails PASSED         [  2%]
tests/test_booking.py::test_create_appointment_conflict_fails PASSED     [  3%]
tests/test_booking.py::test_create_appointment_missing_services PASSED   [  4%]
tests/test_booking.py::test_appointment_confirm PASSED                   [  5%]
tests/test_booking.py::test_appointment_confirm_by_customer_fails PASSED [  7%]
tests/test_booking.py::test_appointment_arrive PASSED                    [  8%]
tests/test_booking.py::test_appointment_arrive_by_customer_fails PASSED  [  9%]
tests/test_booking.py::test_appointment_cancel PASSED                    [ 10%]
tests/test_booking.py::test_appointment_cancel_unauthorized PASSED       [ 11%]
tests/test_booking.py::test_appointment_reschedule PASSED                [ 12%]
tests/test_booking.py::test_appointment_reschedule_by_customer_success PASSED [ 14%]
tests/test_booking.py::test_appointment_reschedule_limit_fails PASSED    [ 15%]
tests/test_booking.py::test_appointment_list_filter_status PASSED        [ 16%]
tests/test_booking.py::test_appointment_list_filter_customer PASSED      [ 17%]
tests/test_booking.py::test_appointment_list_filter_staff PASSED         [ 18%]
tests/test_booking.py::test_appointment_detail_not_found PASSED          [ 20%]
tests/test_booking.py::test_appointment_delete_not_allowed PASSED        [ 21%]
tests/test_customer.py::test_update_customer_profile PASSED              [ 22%]
tests/test_customer.py::test_customer_wallet_topup PASSED                [ 23%]
tests/test_customer.py::test_customer_wallet_topup_invalid_amount PASSED [ 24%]
tests/test_customer.py::test_customer_wallet_history PASSED              [ 25%]
tests/test_customer.py::test_customer_history PASSED                     [ 27%]
tests/test_customer.py::test_manager_get_all_customers PASSED            [ 28%]
tests/test_customer.py::test_customer_cannot_view_other_profile PASSED   [ 29%]
tests/test_customer.py::test_manager_archive_customer PASSED             [ 30%]
tests/test_customer.py::test_customer_profile_creation_on_user_create PASSED [ 31%]
tests/test_customer.py::test_customer_profile_uniqueness PASSED          [ 32%]
tests/test_customer.py::test_customer_wallet_balance_cannot_be_negative PASSED [ 34%]
tests/test_customer.py::test_customer_history_empty PASSED               [ 35%]
tests/test_customer.py::test_customer_view_own_wallet_transactions PASSED [ 36%]
tests/test_customer.py::test_receptionist_can_view_all_customers PASSED  [ 37%]
tests/test_customer.py::test_customer_cannot_delete_themselves PASSED    [ 38%]
tests/test_customer.py::test_unauthenticated_user_cannot_view_customers PASSED [ 40%]
tests/test_login.py::test_user_registration_success PASSED               [ 41%]
tests/test_login.py::test_user_registration_failed_duplicate PASSED      [ 42%]
tests/test_login.py::test_user_registration_invalid_email PASSED         [ 43%]
tests/test_login.py::test_user_registration_missing_password PASSED      [ 44%]
tests/test_login.py::test_user_registration_short_password PASSED        [ 45%]
tests/test_login.py::test_user_login_success PASSED                      [ 47%]
tests/test_login.py::test_user_login_failed PASSED                       [ 48%]
tests/test_login.py::test_user_login_empty_fields PASSED                 [ 49%]
tests/test_login.py::test_refresh_token PASSED                           [ 50%]
tests/test_login.py::test_get_current_user_profile PASSED                [ 51%]
tests/test_login.py::test_get_current_user_profile_unauthorized PASSED   [ 52%]
tests/test_login.py::test_update_current_user_profile PASSED             [ 54%]
tests/test_permission.py::test_manager_can_access_accounts_api PASSED    [ 55%]
tests/test_permission.py::test_customer_cannot_access_accounts_api PASSED [ 56%]
tests/test_permission.py::test_receptionist_cannot_access_accounts_api PASSED [ 57%]
tests/test_permission.py::test_stylist_cannot_access_accounts_api PASSED [ 58%]
tests/test_permission.py::test_manager_can_deactivate_user PASSED        [ 60%]
tests/test_permission.py::test_customer_cannot_deactivate_user PASSED    [ 61%]
tests/test_permission.py::test_receptionist_can_view_all_appointments PASSED [ 62%]
tests/test_permission.py::test_stylist_only_views_assigned_appointments PASSED [ 63%]
tests/test_permission.py::test_anonymous_user_blocked PASSED             [ 64%]
tests/test_permission.py::test_anonymous_user_blocked_accounts PASSED    [ 65%]
tests/test_service.py::test_create_service PASSED                        [ 67%]
tests/test_service.py::test_create_service_failed_missing_fields PASSED  [ 68%]
tests/test_service.py::test_create_service_negative_price PASSED         [ 69%]
tests/test_service.py::test_create_service_negative_duration PASSED      [ 70%]
tests/test_service.py::test_update_service_price_history PASSED          [ 71%]
tests/test_service.py::test_view_service_price_history PASSED            [ 72%]
tests/test_service.py::test_archive_service PASSED                       [ 74%]
tests/test_service.py::test_update_service_status_archived PASSED        [ 75%]
tests/test_service.py::test_search_filter_services_by_category PASSED    [ 76%]
tests/test_service.py::test_get_service_detail PASSED                    [ 77%]
tests/test_service.py::test_get_service_detail_not_found PASSED          [ 78%]
tests/test_service.py::test_list_active_services PASSED                  [ 80%]
tests/test_service.py::test_manager_cannot_create_service_without_name PASSED [ 81%]
tests/test_service.py::test_unauthenticated_user_cannot_create_service PASSED [ 82%]
tests/test_service.py::test_customer_cannot_update_service PASSED        [ 83%]
tests/test_voucher.py::test_create_invoice_from_appointment PASSED       [ 84%]
tests/test_voucher.py::test_issue_invoice PASSED                         [ 85%]
tests/test_voucher.py::test_apply_voucher_discount_amount PASSED         [ 87%]
tests/test_voucher.py::test_apply_voucher_discount_percent PASSED        [ 88%]
tests/test_voucher.py::test_apply_voucher_discount_min_invoice_fails PASSED [ 89%]
tests/test_voucher.py::test_apply_voucher_expired_fails PASSED           [ 90%]
tests/test_voucher.py::test_apply_voucher_not_started_fails PASSED       [ 91%]
tests/test_voucher.py::test_apply_voucher_usage_limit_fails PASSED       [ 92%]
tests/test_voucher.py::test_apply_voucher_other_customer_fails PASSED    [ 94%]
tests/test_voucher.py::test_earn_loyalty_points PASSED                   [ 95%]
tests/test_voucher.py::test_refund_loyalty_point_reversal PASSED         [ 96%]
tests/test_voucher.py::test_redeem_loyalty_points PASSED                 [ 97%]
tests/test_voucher.py::test_use_reward_points_insufficient_fails PASSED  [ 98%]
tests/test_voucher.py::test_adjust_invoice_amount PASSED                 [100%]

====================== 85 passed, 85 warnings in 61.93s (0:01:01) =======================
```

*Nhận xét:* Tất cả 85 kịch bản tự động hóa đều chạy thành công trên 6 tệp mã nguồn kiểm thử nằm trong thư mục `tests/` ở cấp gốc dự án, phản ánh chính xác kết quả tích hợp và khả năng phản hồi dữ liệu nhất quán của Backend ứng dụng quản lý Salon.


---

## 3.4. Các lỗi phát hiện trong quá trình kiểm thử

Nhờ việc xây dựng hệ thống kiểm thử tự động bằng `pytest`, đội phát triển đã phát hiện và khắc phục kịp thời **4 lỗi nghiệp vụ/logic dữ liệu nghiêm trọng** trong mã nguồn Backend:

1. **Lỗi truy vấn sai kiểu dữ liệu (ValueError) khi khách hàng truy xuất lịch sử/hồ sơ**:
   - *Chi tiết lỗi:* Khi tài khoản có vai trò `customer` truy vấn API xem lịch sử giao dịch cá nhân tại `CustomerViewSet`, hàm giới hạn vùng dữ liệu tự động `scope_queryset` trong `scopes.py` cố gắng lọc theo biểu thức `queryset.filter(user=customer)` (trong đó `customer` là đối tượng `CustomerProfile` đã lấy từ `user.customer_profile`). Tuy nhiên, do trường `user` trong bảng `CustomerProfile` là khóa ngoại trỏ tới bảng `User` chứ không phải tự liên kết, Django đã báo lỗi nghiêm trọng `ValueError: Cannot query "John Doe": Must be "User" instance`.
   - *Giải pháp khắc phục:* Điều chỉnh hàm `scope_queryset` để kiểm tra: nếu model của truy vấn hiện tại chính là `CustomerProfile` hoặc `EmployeeProfile`, hệ thống sẽ sử dụng trực tiếp trường khóa chính `pk=customer.pk` để lọc, tránh nhầm lẫn kiểu dữ liệu.

2. **Lỗi không đồng bộ Instance trong bộ nhớ khi cập nhật Dịch vụ (Service Update Response)**:
   - *Chi tiết lỗi:* Trong hàm `perform_update` của `ServiceViewSet`, mã nguồn ban đầu lấy thực thể cập nhật bằng cách gọi `self.get_object()`, thực hiện cập nhật qua hàm nghiệp vụ `update_service_catalog` và lưu xuống database. Tuy nhiên, đối tượng serializer của Django REST Framework vẫn giữ tham chiếu đến thực thể cũ ban đầu trong bộ nhớ (`serializer.instance`). Kết quả là dữ liệu JSON trả về cho Client sau khi cập nhật thành công vẫn hiển thị giá trị cũ của dịch vụ, gây hiểu lầm cho người dùng.
   - *Giải pháp khắc phục:* Thay thế việc gọi `self.get_object()` thành sử dụng trực tiếp `serializer.instance` trong hàm `perform_update` giúp các thay đổi được ghi nhận trực tiếp trên instance của serializer và phản hồi đồng bộ dữ liệu mới nhất.

3. **Lỗi bỏ qua tham số Lý do thay đổi giá (Reason) khi cập nhật dịch vụ**:
   - *Chi tiết lỗi:* Khi cập nhật dịch vụ qua API của Manager, trường `reason` (lý do tăng/giảm giá) được gửi lên để lưu vào lịch sử giá dịch vụ (`ServicePriceHistory`). Tuy nhiên, vì `reason` không phải là một cột trường trong bảng cơ sở dữ liệu `Service`, `ServiceSerializer` đã tự động lọc bỏ trường này ra khỏi dữ liệu hợp lệ (`validated_data`), dẫn đến lịch sử lưu trữ ghi nhận lý do thay đổi luôn là một chuỗi rỗng (`''`).
   - *Giải pháp khắc phục:* Cấu hình lại hàm `perform_update` trong viewset để trích xuất trực tiếp trường `reason` từ request gốc (`self.request.data.get("reason")`) và truyền tham số tường minh vào hàm xử lý nghiệp vụ `update_service_catalog`.

4. **Lỗi sai tên Model trong cấu hình cơ sở dữ liệu feedback (OperationalError)**:
   - *Chi tiết lỗi:* File migration đầu tiên (`0001_initial.py`) của module `feedback` khởi tạo bảng dữ liệu với tên model là tiếng Việt có dấu (`name='Phản hồi'`), tạo ra bảng vật lý `feedback_phảnhồi` trong SQLite. Tuy nhiên, lớp Model trong mã nguồn Python lại định nghĩa là `class Feedback(SoftDeleteModel)`. Khi chạy kiểm thử tự động, Django cố gắng truy vấn bảng mặc định tiếng Anh `feedback_feedback` và phát sinh lỗi nghiêm trọng: `sqlite3.OperationalError: no such table: feedback_feedback`.
   - *Giải pháp khắc phục:* Tạo file migration mới `0002_rename_phản_hồi_feedback.py` thực hiện tác vụ `RenameModel` để đổi tên bảng lưu trữ trong cơ sở dữ liệu từ `Phản hồi` sang `Feedback` theo chuẩn tiếng Anh để hệ thống đồng bộ hoàn toàn.

---

## 3.5. Đánh giá chung về chất lượng phần mềm

Dựa trên quá trình kiểm thử tự động và phân tích hoạt động nghiệp vụ thực tế, chất lượng của phần mềm Quản lý Salon được đánh giá tổng quan như sau:

### 3.5.1. Ưu điểm
* **Giao diện dễ sử dụng và hiện đại:** Phần Frontend (React + Ant Design) hiển thị thông tin trực quan, thao tác đặt lịch hẹn và xem báo cáo dễ dàng, bố cục thân thiện với người dùng.
* **Các chức năng chính hoạt động ổn định:** Các luồng nghiệp vụ quan trọng từ đăng ký lịch, xuất hóa đơn, ghi nhận thanh toán đến áp dụng mã giảm giá và tính điểm thưởng đều hoạt động chính xác 100% trong bộ test.
* **Dữ liệu được xử lý tương đối chính xác:** Cơ chế tính toán tiền bạc, số dư ví khách hàng và giảm trừ voucher tự động được thiết kế mạch lạc, giảm thiểu sai sót thủ công.
* **Hệ thống phân quyền (RBAC) chặt chẽ:** Phân chia rõ ràng vai trò Quản lý, Lễ tân, Nhân viên và Khách hàng. Các API quản trị được bảo vệ bằng quyền truy cập Manager chuyên biệt kết hợp cơ chế tự động lọc dữ liệu theo phạm vi người dùng (`scope_queryset`).
* **Khả năng mở rộng tốt:** Cấu trúc dự án chia theo các module ứng dụng (apps) riêng biệt, giúp dễ dàng tích hợp thêm các tính năng mới trong tương lai như quản lý kho sản phẩm, chấm công nhân viên.

### 3.5.2. Hạn chế
* **Một số thông báo lỗi chưa rõ ràng:** Khi phát sinh lỗi nghiệp vụ biên (ví dụ: đặt lịch hẹn trùng giờ), thông báo lỗi trả về từ API thỉnh thoảng còn mang tính kỹ thuật, chưa thực sự thân thiện với khách hàng đại chúng.
* **Giao diện di động (Mobile Web) chưa được tối ưu hóa hoàn hảo:** Một số bảng biểu lớn ở trang báo cáo doanh thu và lịch hẹn tuần hiển thị chưa thực sự tối ưu trên màn hình nhỏ của điện thoại thông minh.
* **Chưa có kiểm thử tự động cho Frontend:** Dự án hiện tại chỉ tập trung xây dựng bộ kiểm thử tự động cho hệ thống API Backend, phần giao diện Frontend vẫn phụ thuộc nhiều vào kiểm thử thủ công (manual test).
* **Thiếu tài liệu kỹ thuật & Hướng dẫn sử dụng:** Hệ thống chưa tích hợp sẵn tài liệu tương tác API tự động (như Swagger/ReDoc) cho lập trình viên và tài liệu hướng dẫn vận hành chi tiết cho quản lý salon.
* **Chưa thực hiện kiểm thử sâu về bảo mật và hiệu năng tải:** Chưa đánh giá khả năng chịu tải của hệ thống khi có hàng nghìn khách hàng cùng truy cập đặt lịch vào các khung giờ cao điểm hoặc thực hiện tấn công xâm nhập thử nghiệm.

---

## 3.6. Đề xuất cải thiện chất lượng phần mềm

Để nâng cao chất lượng phần mềm và chuẩn bị cho giai đoạn vận hành thực tế tại các salon, nhóm phát triển đề xuất các phương án cải tiến sau:

1. **Hoàn thiện và tối ưu hóa giao diện người dùng:**
   - Tái thiết kế responsive cho các trang Admin Dashboard, đặc biệt là trang Quản lý lịch đặt và Báo cáo doanh thu để có trải nghiệm mượt mà nhất trên thiết bị di động và máy tính bảng.
2. **Cải thiện thông báo lỗi hệ thống:**
   - Xây dựng bộ chuẩn hóa mã lỗi trả về từ Backend. Việt hóa toàn bộ các thông báo ngoại lệ nghiệp vụ thành các câu thông báo rõ ràng, dễ hiểu cho người dùng cuối (ví dụ thay "Appointment conflict" thành "Nhân viên đã có lịch hẹn khác trong khung giờ này, vui lòng chọn giờ khác").
3. **Bổ sung kiểm tra và làm sạch dữ liệu đầu vào:**
   - Tăng cường kiểm tra tính hợp lệ của dữ liệu đầu vào ở cả Frontend và Backend (sử dụng thư viện Validate như Zod/Yup ở Frontend và nâng cao kiểm tra của Serializer ở Backend) để phòng tránh lỗi tràn dữ liệu hoặc lỗi ép kiểu.
4. **Tích hợp cổng thanh toán thực tế và hệ thống thông báo:**
   - Thay thế việc ghi nhận thanh toán mô phỏng bằng việc kết nối với các cổng thanh toán phổ biến như Momo, VNPAY hoặc ngân hàng qua mã QR động.
   - Bổ sung gửi email xác nhận đặt lịch hẹn và SMS/Zalo ZNS nhắc lịch tự động cho khách hàng.
5. **Xây dựng bộ kiểm thử tự động toàn diện:**
   - Áp dụng kiểm thử tự động cho Frontend bằng các công cụ End-to-End (E2E) như **Playwright** hoặc **Cypress** để kiểm tra tính đúng đắn của luồng giao diện người dùng.
   - Tăng cường viết thêm các kịch bản kiểm thử API biên nâng cao để đạt độ phủ mã nguồn (code coverage) tối đa.
6. **Bổ sung tài liệu hướng dẫn và tài liệu kỹ thuật:**
   - Cấu hình thư viện `drf-spectacular` để tự động tạo tài liệu API Swagger UI trực quan, giúp các lập trình viên frontend hoặc bên thứ ba dễ dàng tra cứu và tích hợp.
   - Biên soạn tài liệu hướng dẫn sử dụng chi tiết có hình ảnh minh họa cho các vai trò Lễ tân và Quản lý salon.
