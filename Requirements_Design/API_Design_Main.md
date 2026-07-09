# HƯỚNG DẪN THIẾT KẾ REST API (API FIRST DESIGN) - MỤC LỤC CHÍNH (MASTER INDEX)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ BÁN VÉ VÀ KIỂM SOÁT RA VÀO (TICKETING & ACCESS CONTROL SYSTEM - GATEOS)

Tài liệu này được xây dựng dựa trên phương pháp tiếp cận **API First Design**, sử dụng đặc tả OpenAPI 3.1 để định nghĩa toàn bộ giao ước REST API (API Contract) trước khi tiến hành viết mã nguồn Spring Boot Backend.

---

# 1. QUY CHUẨN THIẾT KẾ REST API TOÀN CỤC (GLOBAL DESIGN STANDARDS)

### 1.1. Phiên bản hóa API (API Versioning)
Mọi API endpoint phải bắt đầu bằng tiền tố chỉ phiên bản để đảm bảo tính tương thích ngược:
* Định dạng: `/api/v1/`
* Ví dụ: `/api/v1/auth/login`, `/api/v1/venues`

### 1.2. Định dạng dữ liệu (Data Format)
* **Request & Response Body:** 100% sử dụng định dạng JSON.
* **Quy chuẩn đặt tên khóa (Keys):** Sử dụng định dạng `camelCase` (ví dụ: `ticketTypeId`, `orderCode`, `totalAmount`).
* **Quy chuẩn ngày tháng (Date/Time):** Sử dụng định dạng chuỗi ISO 8601 đầy đủ múi giờ UTC (ví dụ: `2026-07-07T11:15:30Z` hoặc `2026-07-07T18:15:30+07:00`).

### 1.3. Cơ chế xác thực & Phân quyền (Authentication & Authorization)
* **Xác thực:** JWT Bearer Token được đính kèm trong Header: `Authorization: Bearer <JWT_ACCESS_TOKEN>`.
* **Refresh Token:** Token có hiệu lực dài hạn (7 ngày), lưu trữ ở HttpOnly Cookie ở trình duyệt để tránh tấn công XSS.

### 1.4. Thiết kế mã lỗi chuẩn RFC 7807 (Problem Details)
Mọi phản hồi lỗi từ hệ thống (HTTP Status Codes 4xx, 5xx) phải tuân thủ đặc tả RFC 7807:
```json
{
  "type": "https://gateos.com/errors/invalid-parameters",
  "title": "Unprocessable Entity / Validation Failed",
  "status": 422,
  "detail": "The specified quantity exceeds the maximum allowable limit of 10 tickets.",
  "instance": "/api/v1/orders",
  "errorCode": "ERR-ORD-001",
  "timestamp": "2026-07-07T11:15:30Z",
  "errors": {
    "quantity": "Must be less than or equal to 10"
  }
}
```

### 1.5. Cơ chế Idempotency cho các giao dịch nhạy cảm
Để ngăn chặn các yêu cầu bị lặp do mạng chập chờn (ví dụ: Tạo hóa đơn, Thanh toán, Refund), các API thay đổi trạng thái nhạy cảm yêu cầu Header:
* Header: `Idempotency-Key: <UUID>`
* Redis sẽ lưu key này trong 24 giờ để tránh xử lý trùng.

### 1.6. Quy chuẩn phân trang, sắp xếp và tìm kiếm (Pagination, Sorting & Filtering)
* Các API lấy danh sách nhiều bản ghi (`GET`) phải hỗ trợ các query parameters mặc định:
  * `page`: Chỉ số trang, bắt đầu từ 0 (mặc định: `0`).
  * `size`: Kích thước trang (mặc định: `20`, giới hạn tối đa: `100`).
  * `sort`: Sắp xếp theo thuộc tính (ví dụ: `sort=createdAt,desc` hoặc `sort=price,asc`).
  * `search`: Tìm kiếm tương đối theo chuỗi ký tự.

---

# 2. DANH MỤC TOÀN BỘ ENDPOINTS HỆ THỐNG (API REGISTRY)

| STT | Phương thức | Endpoint | Mô tả chức năng | Module |
|:---:|:---:|:---|:---|:---|
| **1** | `POST` | `/api/v1/auth/login` | Đăng nhập hệ thống (Lấy JWT) | Authentication |
| **2** | `POST` | `/api/v1/auth/logout` | Đăng xuất, thu hồi Token | Authentication |
| **3** | `POST` | `/api/v1/auth/refresh-token` | Làm mới JWT Access Token | Authentication |
| **4** | `POST` | `/api/v1/auth/forgot-password` | Yêu cầu khôi phục mật khẩu | Authentication |
| **5** | `POST` | `/api/v1/auth/reset-password` | Đặt lại mật khẩu mới | Authentication |
| **6** | `GET` | `/api/v1/auth/me` | Lấy thông tin tài khoản hiện tại | Authentication |
| **7** | `GET` | `/api/v1/venues` | Lấy danh sách địa điểm (Phân trang) | Venue |
| **8** | `GET` | `/api/v1/venues/{id}` | Lấy chi tiết một địa điểm | Venue |
| **9** | `POST` | `/api/v1/venues` | Tạo mới địa điểm (Multi-venue) | Venue |
| **10** | `PUT` | `/api/v1/venues/{id}` | Cập nhật thông tin địa điểm | Venue |
| **11** | `DELETE`| `/api/v1/venues/{id}` | Xóa mềm địa điểm (Inactive) | Venue |
| **12** | `GET` | `/api/v1/attractions` | Lấy danh sách trò chơi | Attraction |
| **13** | `GET` | `/api/v1/attractions/{id}` | Lấy chi tiết trò chơi | Attraction |
| **14** | `POST` | `/api/v1/attractions` | Tạo mới trò chơi | Attraction |
| **15** | `PUT` | `/api/v1/attractions/{id}` | Cập nhật trò chơi | Attraction |
| **16** | `DELETE`| `/api/v1/attractions/{id}` | Xóa mềm trò chơi | Attraction |
| **17** | `GET` | `/api/v1/venues/{id}/attractions` | Lấy danh sách trò chơi của Venue | Attraction |
| **18** | `GET` | `/api/v1/ticket-types` | Lấy danh sách loại vé (Phân trang) | Ticket Type |
| **19** | `GET` | `/api/v1/ticket-types/{id}` | Lấy chi tiết loại vé | Ticket Type |
| **20** | `POST` | `/api/v1/ticket-types` | Tạo mới loại vé | Ticket Type |
| **21** | `PUT` | `/api/v1/ticket-types/{id}` | Cập nhật thông tin loại vé | Ticket Type |
| **22** | `DELETE`| `/api/v1/ticket-types/{id}` | Xóa mềm loại vé | Ticket Type |
| **23** | `GET` | `/api/v1/venues/{id}/ticket-types`| Lấy danh sách loại vé của Venue | Ticket Type |
| **24** | `POST` | `/api/v1/orders` | Đặt vé mới (PENDING order) | Ticketing |
| **25** | `GET` | `/api/v1/orders/{id}` | Lấy chi tiết hóa đơn đặt vé | Ticketing |
| **26** | `GET` | `/api/v1/orders` | Danh sách hóa đơn (Admin/Manager) | Ticketing |
| **27** | `PUT` | `/api/v1/orders/{id}` | Điều chỉnh hóa đơn (nếu có) | Ticketing |
| **28** | `DELETE`| `/api/v1/orders/{id}` | Hủy hóa đơn vật lý | Ticketing |
| **29** | `POST` | `/api/v1/orders/{id}/cancel` | Hủy đặt vé của khách | Ticketing |
| **30** | `POST` | `/api/v1/payments/create` | Khởi tạo liên kết thanh toán QR | Payment |
| **31** | `POST` | `/api/v1/payments/momo-webhook`| Nhận thông báo IPN ví MoMo | Payment |
| **32** | `POST` | `/api/v1/payments/vnpay-webhook`| Nhận thông báo IPN cổng VNPay | Payment |
| **33** | `GET` | `/api/v1/payments/status/{orderId}`| Kiểm tra trạng thái thanh toán | Payment |
| **34** | `POST` | `/api/v1/payments/refund` | Hoàn tiền đơn hàng | Payment |
| **35** | `GET` | `/api/v1/customers/me/tickets` | Xem kho vé của khách hàng hiện tại | Customer Wallet |
| **36** | `GET` | `/api/v1/tickets/{id}` | Lấy chi tiết vé điện tử | Customer Wallet |
| **37** | `GET` | `/api/v1/tickets/{id}/qr` | Lấy luồng ảnh QR động bảo mật | Customer Wallet |
| **38** | `POST` | `/api/v1/tickets/{id}/resend-email`| Gửi lại email chứa vé QR | Customer Wallet |
| **39** | `POST` | `/api/v1/check-in/scan` | Quét QR check-in tại cổng xoay | Access Control |
| **40** | `POST` | `/api/v1/devices/heartbeat` | Nhận tin báo hiệu trạng thái Turnstile | Access Control |
| **41** | `GET` | `/api/v1/check-in/history` | Xem lịch sử check-in | Access Control |
| **42** | `POST` | `/api/v1/check-in/manual` | Check-in thủ công (Override) | Access Control |
| **43** | `GET` | `/api/v1/dashboard/revenue` | Báo cáo doanh thu thực tế | Dashboard |
| **44** | `GET` | `/api/v1/dashboard/check-in` | Biểu đồ lưu lượng khách ra vào | Dashboard |
| **45** | `GET` | `/api/v1/dashboard/tickets` | Thống kê số lượng vé bán | Dashboard |
| **46** | `GET` | `/api/v1/dashboard/analytics` | Phân tích sâu (Top attraction, v.v.) | Dashboard |
| **47** | `GET` | `/api/v1/dashboard/realtime` | Kênh WebSocket truyền thông số live | Dashboard |
| **48** | `POST` | `/api/v1/ai/chat` | Tương tác hội thoại với Chatbot | AI Chatbot |
| **49** | `POST` | `/api/v1/ai/question` | Gửi câu hỏi nhanh | AI Chatbot |
| **50** | `GET` | `/api/v1/ai/history` | Lấy lịch sử hội thoại AI | AI Chatbot |
| **51** | `GET` | `/api/v1/ai/forecast/revenue` | Dự báo doanh số (Tháng/Quý tới) | AI Forecast |
| **52** | `GET` | `/api/v1/ai/forecast/customer` | Dự báo lượng khách đến địa điểm | AI Forecast |
| **53** | `GET` | `/api/v1/ai/forecast/traffic` | Dự báo giờ cao điểm (Peak hours) | AI Forecast |
| **54** | `GET` | `/api/v1/ai/recommendation/tickets`| Đề xuất loại vé phù hợp cho khách | AI Recs |
| **55** | `GET` | `/api/v1/ai/recommendation/combo` | Đề xuất Combo dịch vụ tối ưu | AI Recs |
| **56** | `GET` | `/api/v1/ai/recommendation/attractions`| Đề xuất trò chơi nên trải nghiệm | AI Recs |
| **57** | `POST` | `/api/v1/emails/send-ticket` | Gửi email hóa đơn & QR tự động | Email |
| **58** | `POST` | `/api/v1/emails/resend` | Gửi lại email xác nhận thủ công | Email |
| **59** | `GET` | `/api/v1/notifications` | Danh sách thông báo in-app | Notification |
| **60** | `POST` | `/api/v1/notifications/read` | Đánh dấu đã đọc thông báo | Notification |

---
*(Xem chi tiết đặc tả các Module đầu tiên tại [Phần 1](file:///media/nguyen-son-minh/p5/workspace-gateos/Requirements_Design/API_Design_Part1_Auth_Venue_Attraction.md))*
