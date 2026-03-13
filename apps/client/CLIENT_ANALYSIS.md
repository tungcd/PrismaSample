# CLIENT APP - PHÂN TÍCH ROUTER & TÍNH NĂNG

## 📊 TỔNG QUAN

**Framework**: Next.js 14 (App Router)  
**UI Library**: React 18 + Tailwind CSS + shadcn/ui  
**State Management**: React Hooks (useState, useEffect)  
**Authentication**: JWT + localStorage + cookies  
**Port**: 3001

## 🗂️ CẤU TRÚC THỦ MỤC

```
apps/client/src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (nếu có)
│   ├── login/
│   │   └── page.tsx              # ✅ Trang đăng nhập
│   ├── unauthorized/
│   │   └── page.tsx              # ✅ Trang không có quyền
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # ✅ Trang chủ (dashboard)
│   ├── error.tsx                 # Error boundary
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── providers.tsx             # Context providers
│   └── client-logout-button.tsx
├── lib/
│   ├── auth-client.ts            # ✅ Auth utilities
│   ├── api-client.ts             # ✅ API fetch wrapper
│   ├── prisma.ts                 # Prisma client (nếu dùng)
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript types
└── middleware.ts                 # ✅ Auth middleware
```

---

## 🛣️ ROUTES HIỆN TẠI (ĐÃ IMPLEMENTED)

### 1. `/login` - Trang đăng nhập ✅

**File**: `src/app/login/page.tsx`

**Tính năng**:

- Form đăng nhập (email + password)
- Call API `POST /auth/login`
- Lưu token vào localStorage + cookie
- Lưu user info vào localStorage
- Redirect về trang được yêu cầu (callbackUrl)
- Error handling

**Design**: Card với gradient background

**API call**:

```typescript
POST http://localhost:4000/api/v1/auth/login
Body: { email, password }
Response: { access_token, user }
```

---

### 2. `/` - Trang chủ (Dashboard) ✅

**File**: `src/app/page.tsx`

**Tính năng hiện tại**:

- ✅ Header với tên user và nút logout
- ✅ Card hiển thị số dư (hiện đang hardcode = 0)
- ✅ Nút "Nạp tiền" (link tới `/topup` - chưa tồn tại)
- ✅ 2 Quick actions:
  - Đặt món → `/menu` (chưa tồn tại)
  - Đơn hàng → `/orders` (chưa tồn tại)
- ✅ Card "Danh sách học sinh" (placeholder)

**Trạng thái**: Giao diện cơ bản đã có, nhưng chức năng chưa được implement

**Links tới routes chưa có**:

- `/topup` - Nạp tiền
- `/menu` - Xem thực đơn
- `/orders` - Lịch sử đơn hàng

---

### 3. `/unauthorized` - Trang không có quyền ✅

**File**: `src/app/unauthorized/page.tsx`

**Tính năng**:

- Hiển thị thông báo không có quyền truy cập
- Chỉ dành cho Parent & Student
- Nút quay lại login

**Use case**: Admin/Staff/Manager không được phép truy cập client app

---

## 🔐 AUTHENTICATION & MIDDLEWARE

### Middleware (`src/middleware.ts`)

**Chức năng**:

- ✅ Redirect chưa login → `/login`
- ✅ Allow public route: `/login`
- ✅ Kiểm tra cookie `token`
- ✅ Bảo vệ tất cả routes khác

**Matcher**: Bảo vệ tất cả trừ `/api`, `/_next`, static files

### Auth Client (`src/lib/auth-client.ts`)

**Functions**:

```typescript
getToken(): string | null          // Lấy JWT từ localStorage
getUser(): User | null             // Lấy user info từ localStorage
logout(): void                     // Xóa token, redirect → /login
isAuthenticated(): boolean         // Check có token không
```

**User Interface**:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string; // PARENT, STUDENT
  phone: string | null;
  avatar: string | null;
}
```

### API Client (`src/lib/api-client.ts`)

**Function**:

```typescript
fetchAPI(endpoint: string, options?: FetchOptions): Promise<any>
```

**Tính năng**:

- ✅ Auto thêm Authorization Bearer token
- ✅ Auto handle 401 → logout + redirect login
- ✅ Base URL: `http://localhost:4000/api/v1`
- ✅ JSON content-type mặc định

---

## 🎯 ROUTES CẦN IMPLEMENT (THEO ROADMAP)

Dựa trên `CLIENT_API_DEFINITION.md` và code hiện tại, cần implement:

### **PRIORITY 1: Core Features**

#### 1. `/menu` - Thực đơn & đặt món 🔴

**Tính năng cần có**:

- [ ] Hiển thị danh sách sản phẩm theo category
- [ ] Filter: category, search, price range
- [ ] Product card với hình, tên, giá, mô tả
- [ ] Thêm vào giỏ hàng
- [ ] Badge stock (còn hàng/hết hàng)
- [ ] Featured products
- [ ] Pagination

**API cần dùng**:

- `GET /categories` - List categories
- `GET /products` - List products với filters
- `GET /products/:id` - Product detail
- `POST /cart/items` - Add to cart

---

#### 2. `/cart` - Giỏ hàng 🔴

**Tính năng cần có**:

- [ ] Danh sách sản phẩm trong giỏ
- [ ] Update số lượng
- [ ] Xóa sản phẩm
- [ ] Tính tổng tiền
- [ ] Áp dụng voucher
- [ ] Button checkout → tạo order

**API cần dùng**:

- `GET /cart` - Get cart
- `PATCH /cart/items/:itemId` - Update quantity
- `DELETE /cart/items/:itemId` - Remove item
- `DELETE /cart` - Clear cart
- `POST /cart/validate` - Validate trước checkout

---

#### 3. `/checkout` - Thanh toán 🔴

**Tính năng cần có**:

- [ ] Review order
- [ ] Chọn student (nếu là Parent)
- [ ] Nhập ghi chú
- [ ] Hiển thị tổng tiền, discount
- [ ] Confirm & create order

**API cần dùng**:

- `POST /orders` - Create order

---

#### 4. `/orders` - Lịch sử đơn hàng 🔴

**Tính năng cần có**:

- [ ] List đơn hàng với status
- [ ] Filter by status, date range, student
- [ ] Order card: ID, date, items, total, status
- [ ] Click → order detail
- [ ] Pagination

**API cần dùng**:

- `GET /orders` - List orders với filters

---

#### 5. `/orders/[orderId]` - Chi tiết đơn hàng 🔴

**Tính năng cần có**:

- [ ] Order info: ID, date, status
- [ ] Student info
- [ ] Items list
- [ ] Payment details (total, voucher, final)
- [ ] Tracking timeline
- [ ] Cancel button (nếu PENDING)
- [ ] Reorder button

**API cần dùng**:

- `GET /orders/:orderId` - Order detail
- `GET /orders/:orderId/tracking` - Tracking info
- `PATCH /orders/:orderId/cancel` - Cancel order
- `POST /orders/:orderId/reorder` - Reorder

---

### **PRIORITY 2: Wallet & Top-up**

#### 6. `/wallet` - Ví điện tử 🟡

**Tính năng cần có**:

- [ ] Hiển thị số dư (cho từng student)
- [ ] Lịch sử giao dịch
- [ ] Filter by type, date range
- [ ] Button nạp tiền → `/topup`

**API cần dùng**:

- `GET /wallet?studentId=X` - Get balance
- `GET /wallet/transactions` - Transaction history

---

#### 7. `/topup` - Nạp tiền 🟡

**Tính năng cần có**:

- [ ] Chọn student
- [ ] Nhập số tiền
- [ ] Chọn phương thức thanh toán
- [ ] Upload ảnh biên lai (optional)
- [ ] Tạo yêu cầu nạp tiền
- [ ] Xem danh sách yêu cầu đang chờ

**API cần dùng**:

- `POST /top-up-requests` - Create request
- `GET /top-up-requests` - List requests
- `POST /top-up-requests/:id/cancel` - Cancel request

---

### **PRIORITY 3: Student & Account Management**

#### 8. `/students` - Quản lý học sinh (Parent) 🟡

**Tính năng cần có**:

- [ ] List students của parent
- [ ] Student card với avatar, tên, lớp, số dư
- [ ] Click → student detail
- [ ] Add student button
- [ ] Link card button

**API cần dùng**:

- `GET /students` - List students

---

#### 9. `/students/[studentId]` - Chi tiết học sinh 🟡

**Tính năng cần có**:

- [ ] Student info: tên, lớp, card ID
- [ ] Số dư ví
- [ ] Spending summary (charts)
- [ ] Recent orders
- [ ] Nutrition report
- [ ] Edit info button
- [ ] Link/unlink card

**API cần dùng**:

- `GET /students/:studentId` - Student detail
- `GET /students/:studentId/orders` - Student orders
- `GET /students/:studentId/spending-summary` - Spending
- `GET /reports/nutrition?studentId=X` - Nutrition
- `POST /students/:studentId/link-card` - Link card
- `DELETE /students/:studentId/link-card` - Unlink card

---

#### 10. `/profile` - Thông tin tài khoản 🟢

**Tính năng cần có**:

- [ ] Display user info
- [ ] Edit name, phone, avatar
- [ ] Change password
- [ ] Notification settings

**API cần dùng**:

- `GET /users/me` - Get profile (hoặc dùng localStorage)
- `PATCH /users/me` - Update profile
- `PATCH /users/me/password` - Change password
- `GET /users/me/notifications/settings` - Get settings
- `PATCH /users/me/notifications/settings` - Update settings

---

#### 11. `/notifications` - Thông báo 🟢

**Tính năng cần có**:

- [ ] List notifications
- [ ] Badge unread count
- [ ] Mark as read
- [ ] Filter by type
- [ ] Delete notification

**API cần dùng**:

- `GET /notifications` - List notifications
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all read
- `DELETE /notifications/:id` - Delete

---

### **PRIORITY 4: Additional Features**

#### 12. `/vouchers` - Mã giảm giá 🟢

**Tính năng cần có**:

- [ ] List available vouchers
- [ ] Voucher card với code, discount, expiry
- [ ] Copy code button
- [ ] Filter by category, discount type

**API cần dùng**:

- `GET /vouchers?available=true` - Available vouchers
- `GET /vouchers/code/:code` - Get voucher by code
- `POST /vouchers/validate` - Validate voucher

---

#### 13. `/promotions` - Khuyến mãi 🟢

**Tính năng cần có**:

- [ ] Banner promotions
- [ ] Detail modal
- [ ] Link to products

**API cần dùng**:

- `GET /promotions` - List active promotions

---

## 📦 COMPONENTS CẦN TẠO

### Layout Components

- [ ] `Header` - Nav bar với user menu, notifications badge
- [ ] `Sidebar` - Navigation (Parent: students, orders, wallet)
- [ ] `BottomNav` - Mobile navigation
- [ ] `Container` - Page container wrapper

### Feature Components

- [ ] `ProductCard` - Hiển thị sản phẩm
- [ ] `ProductGrid` - Grid layout cho products
- [ ] `CategoryFilter` - Filter by category
- [ ] `SearchBar` - Search products
- [ ] `CartItem` - Item trong giỏ hàng
- [ ] `OrderCard` - Card hiển thị order
- [ ] `OrderStatus` - Badge hiển thị status
- [ ] `StudentCard` - Card hiển thị student info
- [ ] `WalletCard` - Card hiển thị số dư
- [ ] `TransactionList` - Danh sách giao dịch
- [ ] `VoucherCard` - Card hiển thị voucher
- [ ] `NotificationItem` - Item thông báo
- [ ] `SpendingChart` - Chart chi tiêu (react-chartjs-2 hoặc recharts)

### Form Components

- [ ] `LoginForm` - ✅ Đã có
- [ ] `CheckoutForm` - Form checkout
- [ ] `TopUpForm` - Form nạp tiền
- [ ] `ProfileForm` - Form edit profile
- [ ] `PasswordForm` - Form change password
- [ ] `StudentForm` - Form add/edit student
- [ ] `LinkCardForm` - Form link card

### UI Components (từ shadcn/ui)

- [x] `Button` - ✅ Đã có
- [x] `Card` - ✅ Đã có
- [x] `Input` - ✅ Đã có
- [x] `Label` - ✅ Đã có
- [ ] `Select` - Dropdown
- [ ] `Badge` - Status badges
- [ ] `Dialog` - Modals
- [ ] `Tabs` - Tab navigation
- [ ] `Table` - Data table
- [ ] `Skeleton` - Loading state
- [ ] `Alert` - Alert messages
- [ ] `Avatar` - User/Student avatar
- [ ] `ScrollArea` - Scrollable area
- [ ] `Separator` - Divider
- [ ] `Sheet` - Side drawer

---

## 🎨 UI/UX PATTERNS ĐANG DÙNG

### Design System

- **Colors**: Primary (green), Secondary (blue), Gradient backgrounds
- **Font**: Inter (latin + vietnamese)
- **Icons**: Lucide React
- **Spacing**: Tailwind utilities
- **Breakpoints**: Mobile-first

### Patterns

- **Cards**: Rounded corners, shadow, hover effects
- **Forms**: Label + Input + Error message
- **Loading**: isLoading state với disabled inputs
- **Error**: Error message dưới form/API call
- **Success**: Redirect hoặc toast notification

---

## 🔄 STATE MANAGEMENT

### Current Approach: Local State

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

### Suggestions:

- **React Query / TanStack Query**: Cache API responses, auto-refetch
- **Zustand / Jotai**: Global state cho cart, user
- **Context API**: Cho shared data (user, auth)

---

## 🚀 KẾ HOẠCH TRIỂN KHAI

### Phase 1: Core Shop Experience (1-2 tuần)

1. ✅ Setup project structure
2. ✅ Auth & middleware
3. ✅ Home page skeleton
4. 🔴 Menu page + product listing
5. 🔴 Cart page
6. 🔴 Checkout flow
7. 🔴 Order history

### Phase 2: Wallet & Management (1 tuần)

8. 🟡 Wallet page
9. 🟡 Top-up requests
10. 🟡 Student management (Parent)

### Phase 3: Profile & Extras (1 tuần)

11. 🟢 Profile page
12. 🟢 Notifications
13. 🟢 Vouchers page
14. 🟢 Reports/Charts

### Phase 4: Polish & Optimize

15. Mobile responsive
16. Performance optimization
17. Error handling improvements
18. Loading states
19. Toast notifications
20. PWA features (optional)

---

## 📱 RESPONSIVE DESIGN

### Breakpoints Tailwind

- **sm**: 640px (Mobile landscape)
- **md**: 768px (Tablet)
- **lg**: 1024px (Desktop)
- **xl**: 1280px (Large desktop)

### Mobile-first Strategy

- Bottom navigation for mobile
- Side navigation for desktop
- Card grids: 1 col (mobile) → 2 cols (tablet) → 3-4 cols (desktop)

---

## 🔧 THÊM DEPENDENCIES CẦN THIẾT

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x", // API caching
    "recharts": "^2.x", // Charts
    "react-hot-toast": "^2.x", // Toast notifications
    "zustand": "^4.x", // State management
    "react-dropzone": "^14.x", // File upload (top-up image)
    "date-fns": "^3.x" // ✅ Đã có - Date formatting
  }
}
```

---

## 📝 NOTES

### API Base URL

- Dev: `http://localhost:4000/api/v1`
- Env variable: `NEXT_PUBLIC_API_URL`

### Role-based Features

- **PARENT**: Xem tất cả students của mình, nạp tiền, xem reports
- **STUDENT**: Chỉ xem data của mình, đặt món

### Token Expiry

- Cần implement refresh token logic
- Hiện tại chỉ có logout khi 401

### PWA (Optional)

- Next.js có thể config làm PWA
- Manifest.json đã có reference
- Service worker cho offline

---

## ✅ CHECKLIST HOÀN THÀNH

### Đã có ✅

- [x] Project setup Next.js 14
- [x] Tailwind CSS + shadcn/ui
- [x] Auth middleware
- [x] Login page
- [x] Home page skeleton
- [x] API client wrapper
- [x] Auth utilities
- [x] Basic UI components (Button, Card, Input, Label)

### Cần làm tiếp 🔴

- [ ] Menu/Products page
- [ ] Cart page
- [ ] Checkout flow
- [ ] Orders page
- [ ] Wallet page
- [ ] Top-up page
- [ ] Students management
- [ ] Profile page
- [ ] Notifications
- [ ] Vouchers page
- [ ] State management setup
- [ ] API integration hoàn chỉnh
- [ ] Error handling cải thiện
- [ ] Loading states
- [ ] Mobile responsive
- [ ] Testing

---

**Trạng thái hiện tại**: Có foundation cơ bản, cần implement tất cả functional pages.

**Ưu tiên cao nhất**: Menu → Cart → Checkout → Orders (luồng đặt món hoàn chỉnh)

**Tech debt**: Cần refactor state management, API error handling, loading states
