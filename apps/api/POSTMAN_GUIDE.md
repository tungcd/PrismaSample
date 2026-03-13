# Smart Canteen API - Postman Collection

## Giới thiệu

Collection Postman hoàn chỉnh để test toàn bộ API của hệ thống Smart Canteen, bao gồm:

- ✅ **Authentication** - Login, refresh token, logout, password reset
- ✅ **Users** - Profile, password management, notification settings
- ✅ **Students** - CRUD, card management, orders, spending summary
- ✅ **Categories & Products** - Danh mục và sản phẩm
- ✅ **Cart** - Quản lý giỏ hàng
- ✅ **Orders** - Tạo đơn, theo dõi, voucher, hoàn tiền
- ✅ **Wallet** - Ví và lịch sử giao dịch
- ✅ **Top-up Requests** - Yêu cầu nạp tiền
- ✅ **Vouchers** - Mã giảm giá
- ✅ **Notifications** - Thông báo
- ✅ **Reports** - Báo cáo chi tiêu, dinh dưỡng

## Import vào Postman

### Cách 1: Import từ file

1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn file `Smart_Canteen_API.postman_collection.json`
4. Click **Import**

### Cách 2: Import từ link

Nếu file được host online, có thể import trực tiếp bằng URL.

## Cấu hình

### Variables (Biến môi trường)

Collection đã được cấu hình sẵn các biến:

| Biến | Giá trị mặc định | Mô tả |
|------|------------------|-------|
| `baseUrl` | `http://localhost:3001/api/v1` | URL gốc của API |
| `accessToken` | _(auto-saved)_ | JWT token (tự động lưu sau login) |
| `studentId` | `1` | ID học sinh để test |
| `productId` | `1` | ID sản phẩm để test |
| `orderId` | _(auto-saved)_ | ID đơn hàng (tự động lưu sau tạo order) |

### Thay đổi base URL

Để test với môi trường khác:

1. Click vào collection **Smart Canteen API**
2. Tab **Variables**
3. Thay đổi `baseUrl`:
   - Local: `http://localhost:3001/api/v1`
   - Docker: `http://localhost:3001/api/v1`
   - Production: `https://your-domain.com/api/v1`

## Hướng dẫn sử dụng

### 1. Login và lấy token

**Bước 1:** Mở request **Authentication > Login**

**Bước 2:** Sửa body với tài khoản của bạn:

```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Bước 3:** Click **Send**

**Kết quả:** Token sẽ tự động lưu vào biến `accessToken` và được dùng cho các request khác.

### 2. Test flow hoàn chỉnh

#### Luồng đặt hàng (Order Flow)

1. **Login** → Lấy access token
2. **Products > Get All Products** → Xem danh sách sản phẩm
3. **Cart > Add Item to Cart** → Thêm sản phẩm vào giỏ
4. **Cart > Get Cart** → Xem giỏ hàng
5. **Orders > Create Order** → Tạo đơn hàng (order ID tự động lưu)
6. **Orders > Get Order by ID** → Xem chi tiết đơn
7. **Orders > Apply Voucher** → Áp dụng mã giảm giá
8. **Orders > Get Order Tracking** → Theo dõi đơn hàng

#### Luồng quản lý học sinh (Student Management)

1. **Login** (với tài khoản Parent hoặc Admin)
2. **Students > Get All Students** → Xem danh sách học sinh
3. **Students > Get Student by ID** → Xem chi tiết học sinh
4. **Students > Link Card to Student** → Liên kết thẻ RFID
5. **Students > Get Student Orders** → Xem lịch sử mua hàng
6. **Students > Get Student Spending Summary** → Xem báo cáo chi tiêu

#### Luồng nạp tiền (Top-up Flow)

1. **Login** (với tài khoản Parent)
2. **Wallet > Get Wallet** → Xem số dư ví
3. **Top-up Requests > Create Top-up Request** → Tạo yêu cầu nạp tiền
4. **Login** (đổi sang tài khoản Staff/Admin)
5. **Top-up Requests > Approve Top-up Request** → Duyệt yêu cầu
6. **Wallet > Get Wallet** → Kiểm tra số dư đã tăng

### 3. Các loại tài khoản (Roles)

Collection hỗ trợ test với nhiều role:

| Role | Quyền hạn |
|------|-----------|
| **ADMIN** | Toàn quyền, xem tất cả dữ liệu, quản lý users |
| **MANAGER** | Quản lý vận hành, xem báo cáo |
| **STAFF** | Duyệt top-up, xử lý orders |
| **PARENT** | Xem con của mình, tạo top-up request |
| **STUDENT** | Đặt hàng, xem lịch sử của mình |

Để test role khác nhau, login với tài khoản tương ứng.

## Các request quan trọng

### Authentication

- **Login** ⭐ - Luôn chạy đầu tiên để lấy token
- **Refresh Token** - Làm mới token khi hết hạn
- **Logout** - Đăng xuất

### Students (Tính năng mới)

- **Delete Student** 🆕 - Xóa học sinh (soft delete)
- **Link Card to Student** 🆕 - Liên kết thẻ RFID
- **Unlink Card** 🆕 - Hủy liên kết thẻ
- **Get Student Orders** 🆕 - Lịch sử đơn hàng
- **Get Spending Summary** 🆕 - Báo cáo chi tiêu theo tháng/trạng thái

### Orders (Đã cải tiến)

- **Get All Orders** - Có thêm filter `fromDate`, `toDate`
- **Apply Voucher** - Áp dụng mã giảm giá
- **Remove Voucher** - Xóa voucher
- **Cancel Order** - Hủy đơn và hoàn tiền

### Cart (Đã chuẩn hóa)

- Các endpoint sử dụng `:itemId` thay vì `:productId`
- **Update Cart Item** - Cập nhật số lượng theo `itemId`
- **Remove Item** - Xóa item theo `itemId`

## Auto-save Variables

Collection tự động lưu một số biến khi test:

### Login Request
```javascript
// Auto-save accessToken
pm.collectionVariables.set('accessToken', response.access_token);
```

### Create Order Request
```javascript
// Auto-save orderId
pm.collectionVariables.set('orderId', response.id);
```

## Query Parameters

Nhiều endpoint hỗ trợ filter và pagination:

### Pagination
```
?page=1&limit=10
```

### Date Range
```
?fromDate=2026-01-01&toDate=2026-12-31
```

### Status Filter
```
?status=PENDING        # Orders
?status=APPROVED       # Top-up Requests
?isRead=false         # Notifications
```

### Multiple Filters
```
?page=1&limit=10&status=COMPLETED&fromDate=2026-01-01&studentId=1
```

## Response Examples

### Login Success (201)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "phone": "0123456789"
  }
}
```

### Order Created (201)
```json
{
  "id": 123,
  "studentId": 1,
  "status": "PENDING",
  "totalAmount": 50000,
  "note": "Extra sauce please",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 25000
    }
  ]
}
```

### Student Spending Summary (200)
```json
{
  "totalAmount": 500000,
  "orderCount": 25,
  "byMonth": [
    {
      "month": "2026-01",
      "amount": 150000,
      "count": 8
    }
  ],
  "byStatus": {
    "COMPLETED": 450000,
    "CANCELLED": 50000
  }
}
```

## Error Handling

API trả về các status code chuẩn:

| Code | Nghĩa | Ví dụ |
|------|-------|-------|
| 200 | OK | GET request thành công |
| 201 | Created | POST/CREATE thành công |
| 400 | Bad Request | Validation error, thiếu field |
| 401 | Unauthorized | Chưa login hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Resource không tồn tại |
| 500 | Server Error | Lỗi server |

### Error Response Example
```json
{
  "statusCode": 400,
  "message": "Insufficient wallet balance",
  "error": "Bad Request"
}
```

## Testing Scenarios

### Scenario 1: Complete Order Flow
1. Login as STUDENT
2. Add 2 products to cart
3. View cart
4. Create order → Wallet deducted
5. Apply voucher → Discount applied
6. View order tracking
7. Cancel order → Refund issued

### Scenario 2: Parent Monitoring
1. Login as PARENT
2. Get all my students
3. Get student orders history
4. Get spending summary (monthly breakdown)
5. Check wallet balance
6. View transactions

### Scenario 3: Staff Operations
1. Login as STAFF
2. View pending top-up requests
3. Approve/reject requests
4. View all pending orders
5. Generate reports

## Tips & Tricks

### 1. Sử dụng Environments

Tạo nhiều environments cho các môi trường khác nhau:
- **Local** - http://localhost:3001
- **Docker** - http://localhost:3001
- **Staging** - https://staging.example.com
- **Production** - https://api.example.com

### 2. Tests/Assertions

Thêm tests vào tab **Tests** để tự động validate response:

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has access_token", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('access_token');
});
```

### 3. Pre-request Scripts

Thêm logic trước khi gửi request:

```javascript
// Generate random email
pm.collectionVariables.set("randomEmail", 
    "test_" + Math.random().toString(36).substring(7) + "@example.com"
);
```

### 4. Run Collection

Chạy toàn bộ collection tự động:
1. Click **Runner** (góc trên)
2. Chọn **Smart Canteen API**
3. Click **Run Smart Canteen API**

## Troubleshooting

### Token hết hạn (401)
→ Chạy lại **Login** request để lấy token mới

### Không có quyền (403)
→ Kiểm tra role của tài khoản đang login

### Student not found (404)
→ Cập nhật biến `studentId` với ID hợp lệ

### Insufficient balance (400)
→ Tạo top-up request và approve để nạp tiền vào ví

## API Documentation

Chi tiết về endpoints và business logic:

- [TEST_COVERAGE_SUMMARY.md](./TEST_COVERAGE_SUMMARY.md) - Test coverage report
- [PROJECT_OVERVIEW.md](../../PROJECT_OVERVIEW.md) - Tổng quan dự án
- Source code: [apps/api/src](./src)

## Support

Nếu gặp vấn đề với collection:

1. Kiểm tra API server đang chạy: `http://localhost:3001/api/v1/health`
2. Xem logs server để debug
3. Kiểm tra biến `baseUrl` và `accessToken`
4. Đảm bảo database đã được seed data

## Version History

### v1.0.0 (2026-03-13)
- ✅ 90+ endpoints đầy đủ
- ✅ Auto-save tokens
- ✅ Đầy đủ query parameters
- ✅ Hỗ trợ tất cả roles
- ✅ Examples và documentation
- ✅ Tính năng mới: Students endpoints (delete, link-card, orders, spending-summary)
- ✅ Cải tiến: Orders date filters, Cart standardization

---

**Happy Testing! 🚀**
