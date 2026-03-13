# Smart Canteen CMS - Tài Liệu Dự Án

## 📋 Tổng Quan Dự Án

**Smart Canteen** là hệ thống quản lý căng tin thông minh dành cho trường học, bao gồm:

- **CMS Admin** (Port 3000): Quản lý sản phẩm, đơn hàng, người dùng, báo cáo
- **Client App** (Port 3001): Ứng dụng đặt hàng cho học sinh/phụ huynh
- **API Backend** (Port 4000): NestJS API (tùy chọn)
- **Database**: PostgreSQL (Port 5432)
- **Cache**: Redis (Port 6379)

---

## 🏗️ Kiến Trúc Hệ Thống

### Tech Stack

**Frontend:**

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS + shadcn/ui
- React Hook Form + Zod validation
- Recharts (biểu đồ báo cáo)
- Sonner (toast notifications)

**Backend:**

- Next.js API Routes (Server Actions)
- Prisma ORM
- PostgreSQL
- Redis (session, cache)
- Better-auth (authentication)

**Architecture Pattern:**

- Clean Architecture (Domain-Driven Design)
- Repository Pattern
- Use Case Pattern
- Layered Architecture

**Deployment:**

- Docker + Docker Compose
- Multi-container setup

---

## 📂 Cấu Trúc Thư Mục

```
apps/cms/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (auth)/                   # Auth routes group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/                # Protected dashboard
│   │   │   ├── page.tsx             # Dashboard overview
│   │   │   ├── products/            # Quản lý sản phẩm
│   │   │   ├── categories/          # Quản lý danh mục
│   │   │   ├── suppliers/           # Quản lý nhà cung cấp
│   │   │   ├── users/               # Quản lý người dùng
│   │   │   ├── students/            # Quản lý học sinh
│   │   │   ├── schools/             # Quản lý trường học
│   │   │   ├── orders/              # Quản lý đơn hàng
│   │   │   ├── wallets/             # Quản lý ví điện tử
│   │   │   ├── top-ups/             # Nạp tiền
│   │   │   ├── transactions/        # Lịch sử giao dịch
│   │   │   ├── vouchers/            # Quản lý voucher/mã giảm giá ✅
│   │   │   ├── inventory/           # Quản lý kho hàng ✅
│   │   │   │   ├── page.tsx        # Dashboard kho
│   │   │   │   └── history/        # Lịch sử nhập/xuất
│   │   │   └── reports/             # Báo cáo & thống kê ✅
│   │   │       ├── page.tsx        # Revenue dashboard
│   │   │       ├── top-products/   # Top sản phẩm bán chạy
│   │   │       ├── user-spending/  # Chi tiêu người dùng
│   │   │       └── peak-hours/     # Giờ cao điểm
│   │   └── api/                     # API routes
│   │       └── auth/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── admin/                   # Admin-specific components
│   │   ├── dashboard/               # Dashboard layout
│   │   └── reports/                 # Report charts ✅
│   ├── domain/                      # Domain Layer (Entities + Interfaces)
│   │   ├── entities/
│   │   └── repositories/
│   ├── application/                 # Application Layer (Use Cases)
│   │   └── use-cases/
│   ├── infrastructure/              # Infrastructure Layer (Implementations)
│   │   └── database/
│   │       └── repositories/
│   └── lib/                         # Shared utilities
│       ├── prisma.ts
│       ├── auth-client.ts
│       ├── with-auth.ts
│       └── format-date.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── package.json
```

---

## ✅ Chức Năng Đã Hoàn Thành

### 1. 🔐 Authentication & Authorization

**Status**: ✅ Hoàn thành

- Login/Logout với Better-auth
- Session management (Redis)
- Role-based access control (ADMIN, MANAGER, STAFF, STUDENT, PARENT)
- Protected routes với middleware
- `withRole` HOC cho server actions

### 2. 📦 Quản Lý Sản Phẩm (Products)

**Status**: ✅ Hoàn thành

**Features:**

- CRUD sản phẩm (Create, Read, Update, Delete)
- Upload ảnh sản phẩm
- Quản lý thông tin dinh dưỡng (calories, protein, carbs, fat)
- Phân loại theo danh mục
- Gán nhà cung cấp
- Quản lý tồn kho (stock)
- Active/Inactive toggle
- Featured products
- Soft delete

**Components:**

- ProductDialog (form tạo/sửa)
- ProductsTable (DataTable với filters)
- ProductColumns (định nghĩa cột)

**Tech:**

- Server Actions pattern
- Prisma ORM
- Zod validation
- React Hook Form

### 3. 🏷️ Quản Lý Danh Mục (Categories)

**Status**: ✅ Hoàn thành

**Features:**

- CRUD danh mục
- Slug tự động
- Active/Inactive toggle
- Đếm số sản phẩm theo danh mục
- Soft delete

### 4. 🏢 Quản Lý Nhà Cung Cấp (Suppliers)

**Status**: ✅ Hoàn thành

**Features:**

- CRUD nhà cung cấp
- Thông tin liên hệ (email, phone, address)
- Active/Inactive toggle
- Đếm số sản phẩm từ nhà cung cấp
- Soft delete

### 5. 👥 Quản Lý Người Dùng (Users)

**Status**: ✅ Hoàn thành

**Features:**

- View danh sách users (pagination)
- Filter theo role (ADMIN, MANAGER, STAFF, STUDENT, PARENT)
- Search theo tên/email
- Thay đổi role
- Active/Inactive toggle
- View chi tiết user

**Roles:**

- ADMIN: Full permissions
- MANAGER: Quản lý sản phẩm, đơn hàng, báo cáo
- STAFF: Xử lý đơn hàng, xem sản phẩm
- STUDENT: Đặt hàng, xem lịch sử
- PARENT: Nạp tiền, theo dõi con

### 6. 🎓 Quản Lý Học Sinh (Students)

**Status**: ✅ Hoàn thành

**Features:**

- CRUD học sinh
- Liên kết với user account
- Thông tin trường/lớp
- Quản lý phụ huynh (parent references)
- Avatar upload

### 7. 🏫 Quản Lý Trường Học (Schools)

**Status**: ✅ Hoàn thành

**Features:**

- CRUD trường học
- Thông tin liên hệ
- Địa chỉ chi tiết
- Active/Inactive toggle
- Đếm số học sinh

### 8. 📝 Quản Lý Đơn Hàng (Orders)

**Status**: ✅ Hoàn thành

**Features:**

- View danh sách đơn hàng
- Filter theo status (PENDING, PROCESSING, COMPLETED, CANCELLED)
- Filter theo payment status (PENDING, PAID, REFUNDED)
- Chi tiết đơn hàng (items, pricing, customer)
- Thay đổi order status
- Thay đổi payment status
- Timeline tracking

**Order Lifecycle:**

```
PENDING → PROCESSING → COMPLETED
              ↓
          CANCELLED
```

### 9. 💰 Quản Lý Ví & Giao Dịch (Wallets & Transactions)

**Status**: ✅ Hoàn thành

**Features:**

**Wallets:**

- View tất cả ví users
- Tìm kiếm theo user
- Hiển thị balance
- Lock/Unlock wallet
- View transaction history

**Top-ups:**

- Approve/Reject nạp tiền
- Admin notes
- Status tracking (PENDING, APPROVED, REJECTED)
- Auto credit wallet on approval

**Transactions:**

- View lịch sử giao dịch
- Filter theo type (TOP_UP, ORDER, REFUND)
- Filter theo user
- Export data

### 10. 🎟️ Quản Lý Voucher (Vouchers)

**Status**: ✅ Hoàn thành (Recently Added)

**Features:**

- CRUD voucher
- Loại giảm giá: PERCENTAGE / FIXED_AMOUNT
- Giới hạn số lần dùng (usage limit)
- Điều kiện tối thiểu (min order amount)
- Giảm tối đa (max discount)
- Thời hạn (valid from/to)
- Active/Inactive toggle
- Tracking usage count

**Use Cases:**

- CreateVoucherUseCase
- UpdateVoucherUseCase
- DeleteVoucherUseCase
- GetAllVouchersUseCase
- ToggleVoucherActiveUseCase

**Architecture:**

- Domain Layer: voucher.entity.ts
- Infrastructure: voucher.repository.ts (Prisma)
- Application: use-cases/voucher/
- Presentation: app/dashboard/vouchers/

### 11. 📦 Quản Lý Kho Hàng (Inventory Management)

**Status**: ✅ Hoàn thành (Recently Added)

**Features:**

**Dashboard Kho:**

- Tổng số sản phẩm
- Sản phẩm sắp hết (stock 1-10)
- Sản phẩm hết hàng (stock 0)
- Giá trị tồn kho tổng
- Bảng sản phẩm sắp hết

**Lịch Sử Nhập/Xuất:**

- View tất cả giao dịch kho
- Filter theo:
  - Loại (IN: Nhập kho, OUT: Xuất kho, ADJUSTMENT: Điều chỉnh)
  - Sản phẩm
  - User thực hiện
  - Ngày
- Pagination
- DataTable với sorting

**Điều Chỉnh Kho:**

- Nhập kho (IN): Tăng stock
- Xuất kho (OUT): Giảm stock
- Điều chỉnh (ADJUSTMENT): Điều chỉnh bất kỳ
- Ghi chú lý do
- Validate stock không âm
- Auto log transaction
- Auto update product stock

**Database Schema:**

```prisma
model InventoryTransaction {
  id          Int           @id @default(autoincrement())
  productId   Int
  quantity    Int           // (+: IN/ADJUSTMENT, -: OUT)
  type        InventoryType // IN, OUT, ADJUSTMENT
  reason      String?
  performedBy Int
  createdAt   DateTime      @default(now())

  product Product @relation(...)
  user    User    @relation(...)
}

enum InventoryType {
  IN         // Nhập kho
  OUT        // Xuất kho
  ADJUSTMENT // Điều chỉnh
}
```

**Architecture:**

- Domain: inventory-transaction.entity.ts
- Infrastructure: inventory-transaction.repository.ts
- Application: use-cases/inventory/ (3 use cases)
- Presentation: app/dashboard/inventory/ (2 pages, 5 components)

**Access**: ADMIN + MANAGER roles

### 12. 📊 Báo Cáo & Thống Kê (Reports & Analytics)

**Status**: ✅ Hoàn thành (Recently Added)

**Features:**

#### 12.1 Revenue Dashboard (`/dashboard/reports`)

- Biểu đồ doanh thu theo thời gian (Line Chart)
- Filters: Daily, Weekly, Monthly, Yearly
- Date range picker
- Summary Cards:
  - Tổng doanh thu
  - Số đơn hàng
  - Sản phẩm đã bán
  - Giá trị đơn trung bình

#### 12.2 Top Products (`/dashboard/reports/top-products`)

- Sản phẩm bán chạy nhất
- Sắp xếp theo:
  - Doanh thu (revenue)
  - Số lượng bán (quantity)
- Filters: 7 days, 30 days, 90 days, All time
- DataTable với:
  - Tên sản phẩm
  - Danh mục
  - Doanh thu
  - Số lượng bán
  - Giá trung bình

#### 12.3 User Spending (`/dashboard/reports/user-spending`)

- Top người dùng chi tiêu nhiều nhất
- Filter theo role: STUDENT / PARENT
- Filters: 7d, 30d, 90d, All time
- Columns:
  - Tên người dùng
  - Role
  - Tổng chi tiêu
  - Số đơn hàng
  - Giá trị đơn TB
  - Lần mua cuối

#### 12.4 Peak Hours Analysis (`/dashboard/reports/peak-hours`)

- Phân tích giờ cao điểm
- Bar Chart kết hợp:
  - Số đơn hàng theo giờ (0-23h)
  - Doanh thu theo giờ
- Dual Y-axis chart
- Giúp lập kế hoạch nhân sự

**Tech Stack:**

- Recharts (LineChart, BarChart, ComposedChart)
- Server Actions with aggregation queries
- Date range filtering
- Export-ready data (future: CSV/PDF)

**Architecture:**

- Actions: app/dashboard/reports/actions.ts
- Pages: 4 report pages
- Components: components/reports/ (4 chart components)
- No repository layer (direct Prisma queries for analytics)

**Access**: ADMIN + MANAGER roles only

**Performance:**

- Aggregation queries optimized với Prisma
- ISR caching (revalidate: 300s cho reports)
- Pagination cho large datasets

---

## 🎨 UI/UX Features

### Design System

- **shadcn/ui**: Component library
- **TailwindCSS**: Utility-first styling
- **Lucide Icons**: Icon set
- **Dark mode ready**: Theme support

### Common Components

- DataTable với:
  - Pagination
  - Column sorting
  - Column filtering
  - Row selection
  - Custom cell rendering
- Dialog forms (Create/Edit)
- Confirmation dialogs
- Toast notifications (Sonner)
- Loading states
- Error boundaries

### Dashboard Layout

- Responsive sidebar
- Breadcrumb navigation
- Search functionality
- User profile menu
- Role badges

---

## 🔧 Technical Implementation

### Clean Architecture Layers

#### 1. Domain Layer (`src/domain/`)

**Entities:**

- product.entity.ts
- category.entity.ts
- supplier.entity.ts
- order.entity.ts
- user.entity.ts
- student.entity.ts
- school.entity.ts
- wallet.entity.ts
- transaction.entity.ts
- voucher.entity.ts ✅
- inventory-transaction.entity.ts ✅

**Repository Interfaces:**

- Định nghĩa contracts cho data access
- Không phụ thuộc vào implementation cụ thể

#### 2. Infrastructure Layer (`src/infrastructure/`)

**Repositories:**

- Implement interfaces từ domain
- Prisma ORM integration
- Database queries
- Error handling

**Example:**

```typescript
export class PrismaProductRepository implements IProductRepository {
  async findMany(params: FindProductsParams): Promise<ProductEntity[]> {
    const products = await prisma.product.findMany({...});
    return products.map(mapToEntity);
  }
}
```

#### 3. Application Layer (`src/application/use-cases/`)

**Use Cases:**

- Business logic
- Orchestrate repository calls
- Validation
- Single responsibility

**Example:**

```typescript
export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: CreateProductDTO): Promise<ProductEntity> {
    // Validation
    // Business rules
    return await this.productRepository.create(data);
  }
}
```

#### 4. Presentation Layer (`src/app/` + `src/components/`)

**Server Actions:**

```typescript
export const createProductAction = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, data) => {
    const result = await createProductUseCase.execute(data);
    revalidatePath("/dashboard/products");
    return result;
  },
);
```

**Components:**

- React Server Components (RSC)
- Client Components với "use client"
- Form handling với React Hook Form
- Validation với Zod schemas

### Data Flow

```
User Action
    ↓
Component (Presentation)
    ↓
Server Action (Presentation)
    ↓
Use Case (Application)
    ↓
Repository (Infrastructure)
    ↓
Prisma (ORM)
    ↓
PostgreSQL Database
```

---

## 🔐 Security

### Authentication

- Better-auth integration
- Session-based auth (Redis)
- HttpOnly cookies
- CSRF protection

### Authorization

- Role-based access control (RBAC)
- `withRole` HOC for server actions
- Middleware protection for routes
- Frontend + Backend validation

### Data Protection

- Password hashing (bcrypt)
- SQL injection prevention (Prisma)
- XSS protection (React escaping)
- Input validation (Zod)
- Soft delete pattern

---

## 🚀 Setup & Deployment

### Development

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start Docker services
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Docker Services

```yaml
services:
  cms: # Port 3000
  client: # Port 3001
  api: # Port 4000 (optional)
  db: # PostgreSQL 5432
  redis: # Redis 6379
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/smart_canteen"
REDIS_URL="redis://localhost:6379"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## 📊 Database Schema Highlights

### Core Models

**User** → Wallet → Transaction  
**User** → Student  
**Product** → Category  
**Product** → Supplier  
**Order** → OrderItem → Product  
**Voucher** ✅  
**InventoryTransaction** → Product, User ✅

### Key Relationships

```
User (1) ─── (1) Wallet
User (1) ─── (*) Transaction
User (1) ─── (*) Order
User (1) ─── (*) Student (as parent)
User (1) ─── (*) TopUpRequest
User (1) ─── (*) InventoryTransaction (performed by) ✅

Product (*) ─── (1) Category
Product (*) ─── (1) Supplier
Product (1) ─── (*) OrderItem
Product (1) ─── (*) InventoryTransaction ✅

Order (1) ─── (*) OrderItem
Order (*) ─── (1) User (customer)
```

---

## 📈 Performance Optimizations

### Frontend

- React Server Components (RSC)
- Incremental Static Regeneration (ISR)
- Image optimization (next/image)
- Code splitting
- Lazy loading

### Backend

- Prisma query optimization
- Redis caching for sessions
- Pagination for large datasets
- Database indexing
- Connection pooling

### Database Indexes

```prisma
@@index([email])        // User lookup
@@index([slug])         // Product/Category lookup
@@index([status])       // Order filtering
@@index([createdAt])    // Time-based queries
@@index([productId])    // Inventory filtering ✅
@@index([type])         // Transaction type filtering ✅
```

---

## 🧪 Testing Strategy

### Implemented

- TypeScript type checking
- Zod schema validation
- Prisma migration testing
- Manual integration testing

### Recommended (Future)

- Unit tests (Vitest)
- Integration tests (Playwright)
- E2E tests
- Load testing

---

## 📝 API Documentation

### Server Actions Pattern

All actions follow this structure:

```typescript
"use server";

export const actionName = withRole(
  ["ADMIN", "MANAGER"],
  async (authUser, params) => {
    try {
      // Validation
      // Business logic
      // Database operations
      revalidatePath("/path");
      return result;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("User-friendly message");
    }
  },
);
```

### Common Actions

**Products:**

- `getAllProductsAction(params)`
- `createProductAction(data)`
- `updateProductAction(id, data)`
- `deleteProductAction(id)`
- `toggleProductActiveAction(id)`

**Orders:**

- `getOrdersAction(params)`
- `getOrderByIdAction(id)`
- `updateOrderStatusAction(id, status)`
- `updatePaymentStatusAction(id, status)`

**Wallets:**

- `getAllWalletsAction(params)`
- `toggleWalletLockAction(id)`

**Top-ups:**

- `getAllTopUpRequestsAction(params)`
- `approveTopUpAction(id, data)`
- `rejectTopUpAction(id, message)`

**Vouchers:** ✅

- `getAllVouchersAction(params)`
- `createVoucherAction(data)`
- `updateVoucherAction(id, data)`
- `deleteVoucherAction(id)`
- `toggleVoucherActiveAction(id)`

**Inventory:** ✅

- `getInventoryStatsAction()`
- `getInventoryHistoryAction(params)`
- `createInventoryTransactionAction(data)`

**Reports:** ✅

- `getRevenueStatsAction(params)`
- `getTopProductsAction(params)`
- `getUserSpendingAction(params)`
- `getPeakHoursAction(params)`
- `getDashboardStatsAction()`

---

## 🎯 Feature Roadmap

### ✅ Completed (Phase 1)

- Authentication & Authorization
- Products Management
- Categories Management
- Suppliers Management
- Users Management
- Students Management
- Schools Management
- Orders Management
- Wallets & Transactions
- Top-ups Management
- **Vouchers Management** ✅
- **Inventory Management** ✅
- **Reports & Analytics** ✅

### 🔄 In Progress (Phase 2)

- None currently

### 📋 Planned (Phase 3)

- **Notifications Management**
  - Templates CRUD
  - Send notifications
  - WebSocket real-time delivery
  - Auto-triggers
- **Client Mobile App**
  - Student ordering interface
  - Parent monitoring
  - QR code scanning
- **Advanced Features**
  - Email notifications
  - SMS notifications
  - Export reports (CSV/PDF)
  - Backup/Restore
  - Multi-language support

---

## 👥 User Roles & Permissions

### ADMIN (Full Access)

- ✅ All CRUD operations
- ✅ User management
- ✅ Role assignment
- ✅ Financial operations
- ✅ System settings
- ✅ Reports & Analytics
- ✅ Inventory Management

### MANAGER (Business Operations)

- ✅ Products CRUD
- ✅ Orders management
- ✅ Inventory management
- ✅ Reports viewing
- ✅ Vouchers management
- ❌ User role changes
- ❌ System settings

### STAFF (Operational)

- ✅ View products
- ✅ Process orders
- ✅ View inventory
- ❌ Financial operations
- ❌ User management
- ❌ Reports

### STUDENT (Customer)

- ✅ Browse products
- ✅ Place orders
- ✅ View order history
- ✅ Check wallet balance

### PARENT (Guardian)

- ✅ Top-up wallet
- ✅ Monitor student spending
- ✅ View transaction history
- ✅ Set spending limits

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. No real-time notifications yet (planned Phase 3)
2. Export functionality not implemented (CSV/PDF)
3. Email notifications not configured
4. Mobile app not started

### Bug Fixes Applied

1. ✅ Fixed inventory repository Prisma client initialization
2. ✅ Fixed withRole import paths in report actions
3. ✅ Fixed TypeScript chart formatter types
4. ✅ Fixed foreign key constraint for inventory transactions

---

## 📞 Support & Contribution

### Development Team

- Backend: Clean Architecture implementation
- Frontend: Next.js 14 + React Server Components
- Database: Prisma + PostgreSQL
- DevOps: Docker containerization

### Getting Help

1. Check this documentation
2. Review code comments
3. Check Prisma schema
4. Review server action implementations

---

## 📚 Resources

### Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better-auth Docs](https://better-auth.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)

### Project Structure

```
/apps/cms/          # CMS Admin application
/apps/client/       # Client application (future)
/apps/api/          # NestJS API (optional)
/packages/          # Shared packages
/docker-compose.yml # Docker configuration
```

---

## 🎉 Summary

**Smart Canteen CMS** là hệ thống quản lý căng tin hoàn chỉnh với:

- ✅ **15+ modules** đã hoàn thành
- ✅ **Clean Architecture** pattern
- ✅ **Type-safe** với TypeScript
- ✅ **Modern UI** với Next.js 14 + shadcn/ui
- ✅ **Secure** authentication & authorization
- ✅ **Scalable** containerized deployment
- ✅ **Production-ready** features

**Recent Additions:**

- 🎟️ Voucher Management System
- 📦 Inventory Management with transaction history
- 📊 Comprehensive Reports & Analytics dashboard

**Next Steps:**

- 🔔 Implement Notifications Management
- 📱 Build Client Mobile App
- 📧 Setup Email/SMS notifications

---

**Version**: 1.0.0  
**Last Updated**: March 12, 2026  
**Status**: Production Ready (Phase 1 Complete)
