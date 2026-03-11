# Smart Canteen - Complete Setup & Documentation

**Version:** 2.0  
**Last Updated:** March 11, 2026  
**Project:** Smart Canteen Management System  
**Architecture:** Clean Architecture + Monorepo (Turborepo + pnpm)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Generic DataTable System](#generic-datatable-system)
4. [Database Schema](#database-schema)
5. [Setup & Installation](#setup--installation)
6. [Development Guide](#development-guide)
7. [API Documentation](#api-documentation)
8. [Conventions & Best Practices](#conventions--best-practices)
9. [Roadmap](#roadmap)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

Smart Canteen là hệ thống quản lý căn tin thông minh cho trường học, bao gồm:

- **CMS (Content Management System)**: Admin dashboard cho nhân viên quản lý
- **Client App**: Ứng dụng cho phụ huynh đặt hàng
- **API Service**: RESTful API backend (NestJS)
- **Shared Packages**: Prisma, UI components, utilities

### **Tech Stack**

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: NestJS, Prisma ORM
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **UI**: Tailwind CSS, Shadcn/ui
- **Monorepo**: Turborepo, pnpm
- **Authentication**: NextAuth.js, JWT

---

## 🏗️ Architecture

### **Clean Architecture Layers**

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  (UI Components, Pages, Server Actions)                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Application Layer                       │
│  (Use Cases - Business Logic)                            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Domain Layer                          │
│  (Entities, Repository Interfaces)                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                Infrastructure Layer                      │
│  (Prisma Repositories, External Services)                │
└─────────────────────────────────────────────────────────┘
```

### **Project Structure**

```
apps/
├── cms/                          # Admin Dashboard (Next.js)
│   └── src/
│       ├── app/                  # App Router pages
│       │   ├── dashboard/
│       │   │   ├── users/       # User management
│       │   │   └── students/    # Student management
│       │   └── api/             # API routes
│       ├── components/          # React components
│       │   └── ui/
│       │       └── data-table/  # Generic DataTable system ⭐
│       ├── domain/              # Domain entities & interfaces
│       │   ├── entities/
│       │   └── repositories/
│       ├── application/          # Use cases (business logic)
│       │   └── use-cases/
│       ├── infrastructure/       # External implementations
│       │   └── database/
│       │       └── repositories/
│       └── types/               # TypeScript types
│
├── client/                      # Parent App (Next.js)
├── api/                         # Backend API (NestJS)
└── packages/
    ├── prisma/                  # Database schema & migrations
    ├── ui/                      # Shared UI components
    └── typescript-config/       # Shared TS configs
```

---

## ⚡ Generic DataTable System

### **Overview**

Hệ thống DataTable tái sử dụng cho tất cả màn hình list/table với đầy đủ:

- ✅ Server-side filtering (debounce 500ms)
- ✅ Server-side sorting
- ✅ Server-side pagination
- ✅ URL-based filters
- ✅ Type-safe generic TypeScript

### **Key Files**

```
src/
├── types/data-table.types.ts                    # Type definitions
├── components/ui/data-table/
│   ├── data-table.tsx                           # Main component
│   ├── data-table-column-header.tsx             # Sortable header
│   ├── data-table-pagination.tsx                # Pagination controls
│   ├── README.md                                # Full documentation
│   └── index.ts
```

### **Usage Pattern**

#### 1. Backend (Use Case + Repository)

```typescript
// use-case interface
export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  email?: string;
  role?: string;
  sortBy?: "email" | "name" | "role";
  sortOrder?: "asc" | "desc";
}

export interface GetUsersResult {
  users: UserEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// use-case implementation
export class GetAllUsersUseCase {
  async execute(params: GetUsersParams = {}): Promise<GetUsersResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const { users, total } = await this.userRepository.findMany(params);

    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

// repository implementation
async findMany(params: GetUsersParams = {}): Promise<{ users: UserEntity[]; total: number }> {
  const where: any = { deletedAt: null };
  if (params.email) where.email = { contains: params.email, mode: "insensitive" };
  if (params.role && params.role !== "all") where.role = params.role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [params.sortBy || "createdAt"]: params.sortOrder || "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}
```

#### 2. Server Component (Page)

```typescript
// app/dashboard/users/page.tsx
interface UsersPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    email?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = {
    page: parseInt(searchParams.page || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    email: searchParams.email,
    role: searchParams.role,
    sortBy: searchParams.sortBy as any,
    sortOrder: searchParams.sortOrder as any,
  };

  const result = await getAllUsersUseCase.execute(params);

  return <UsersTable data={result} />;
}
```

#### 3. Client Component (Table)

```typescript
"use client";

import { DataTable } from "@/components/ui/data-table";
import type { DataTableConfig, PaginatedResult } from "@/types/data-table.types";

export function UsersTable({ data }: { data: GetUsersResult }) {
  const router = useRouter();

  // Transform to PaginatedResult
  const result: PaginatedResult<UserEntity> = {
    data: data.users,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
  };

  // Configure table
  const tableConfig: DataTableConfig<UserEntity> = {
    entityName: "người dùng",
    addButtonLabel: "Thêm người dùng",
    onAdd: handleCreate,
    columns: [
      {
        key: "email",
        label: "Email",
        sortable: true,
        filterable: true,
        filter: {
          type: "text",
          placeholder: "Tìm email...",
        },
      },
      {
        key: "role",
        label: "Vai trò",
        sortable: true,
        filterable: true,
        filter: {
          type: "select",
          options: [
            { value: "ADMIN", label: "Admin" },
            { value: "PARENT", label: "Phụ huynh" },
          ],
        },
        render: (user) => <Badge>{user.role}</Badge>,
      },
    ],
    rowActions: [
      {
        label: "Sửa",
        icon: <Pencil className="h-4 w-4" />,
        onClick: handleEdit,
      },
      {
        label: "Xóa",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDelete,
        variant: "destructive",
      },
    ],
  };

  return <DataTable result={result} config={tableConfig} />;
}
```

### **Column Configuration Options**

```typescript
{
  key: "email",                    // Field key
  label: "Email",                  // Display header
  sortable: true,                  // Enable sorting
  filterable: true,                // Enable filtering
  filter: {
    type: "text",                  // "text" | "select"
    placeholder: "Tìm email...",   // Optional
    debounce: true,                // Auto debounce 500ms (default true for text)
    options: [...],                // For select type
  },
  render: (item) => <Custom />,    // Custom cell render
  className: "font-medium",        // Cell CSS class
  headerClassName: "w-[200px]",   // Header CSS class
}
```

### **Benefits**

- **Code giảm 55%**: Users table từ 450 dòng → 200 dòng
- **Tái sử dụng 100%**: Chỉ config columns, không code lại
- **Type-safe**: Generic TypeScript
- **Consistent UX**: Tất cả table đồng nhất
- **URL-based**: Bookmark/share được URL với filters
- **Performance**: Debounce + server-side query

### **Implemented Tables**

| Table    | Status      | Lines of Code | Features                                                            |
| -------- | ----------- | ------------- | ------------------------------------------------------------------- |
| Users    | ✅ Complete | 200 (từ 450)  | Email, Name, Role, Phone, Status filters + Sort + Pagination        |
| Students | ✅ Complete | 220 (từ 480)  | CardNumber, Name, Grade, School, Status filters + Sort + Pagination |
| Products | ⏳ Pending  | -             | To be implemented                                                   |
| Orders   | ⏳ Pending  | -             | To be implemented                                                   |

---

## 🗄️ Database Schema

### **Core Models**

#### **User**

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  phone        String?   @unique
  passwordHash String?
  role         Role      @default(PARENT)
  name         String
  avatar       String?
  isActive     Boolean   @default(true)
  isVerified   Boolean   @default(false)

  // Relations
  wallet          Wallet?
  students        Student[]
  orders          Order[]
  topUpRequests   TopUpRequest[]
  sessions        Session[]
  notifications   Notification[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // Soft delete
}

enum Role {
  ADMIN
  MANAGER
  STAFF
  PARENT
}
```

#### **Student**

```prisma
model Student {
  id         String   @id @default(cuid())
  name       String
  grade      String
  school     String
  cardNumber String   @unique
  parentId   String
  parent     User     @relation(fields: [parentId], references: [id])
  isActive   Boolean  @default(true)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?
}
```

#### **Product**

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Int      // In VND
  stock       Int      @default(0)
  image       String?

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  supplierId  String
  supplier    Supplier @relation(fields: [supplierId], references: [id])

  // Nutrition info
  calories    Int?
  protein     Int?
  carbs       Int?
  fat         Int?

  isActive    Boolean  @default(true)
  isFeatured  Boolean  @default(false)

  orderItems  OrderItem[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}
```

#### **Order**

```prisma
model Order {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])

  totalAmount   Int      // Total price
  status        String   @default("PENDING")  // PENDING, PREPARING, READY, COMPLETED, CANCELLED
  paymentMethod String   // WALLET, CASH, CARD
  paymentStatus String   @default("PENDING")  // PENDING, PAID, REFUNDED

  items         OrderItem[]
  transactions  Transaction[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])

  productId String
  product   Product @relation(fields: [productId], references: [id])

  quantity  Int
  price     Int     // Price at time of order

  createdAt DateTime @default(now())
}
```

#### **Wallet & Transaction**

```prisma
model Wallet {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])

  balance   Int      @default(0)  // Current balance

  transactions Transaction[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Transaction {
  id          String   @id @default(cuid())
  walletId    String
  wallet      Wallet   @relation(fields: [walletId], references: [id])

  orderId     String?
  order       Order?   @relation(fields: [orderId], references: [id])

  amount      Int      // Positive for credit, negative for debit
  type        String   // TOPUP, PURCHASE, REFUND
  description String?

  balanceBefore Int    // Balance before transaction
  balanceAfter  Int    // Balance after transaction

  createdAt   DateTime @default(now())
}
```

### **Seed Data**

```bash
pnpm db:seed
```

**Generated:**

- 53 users (3 staff + 50 parents)
- 120 students (SC000001 - SC000120)
- 32 products (8 breakfast, 9 lunch, 7 snacks, 8 drinks)
- 4 schools
- 3 suppliers
- 4 categories

---

## 🚀 Setup & Installation

### **Prerequisites**

```bash
# Node.js 18+
node --version  # v18.20.8 or higher

# pnpm
pnpm --version  # 8.0.0 or higher

# Docker
docker --version
docker-compose --version
```

### **Initial Setup**

```bash
# 1. Clone repository
git clone <repository-url>
cd smart-canteen

# 2. Install dependencies
pnpm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Start Docker services
docker-compose up -d

# 5. Initialize database
pnpm db:push      # Push schema to database
pnpm db:seed      # Seed initial data

# 6. Start development servers
pnpm dev          # Starts all apps
```

### **Development Commands**

```bash
# Start all applications
pnpm dev

# Start specific app
pnpm --filter=@smart-canteen/cms dev
pnpm --filter=@smart-canteen/client dev
pnpm --filter=@smart-canteen/api dev

# Database commands
pnpm db:studio    # Open Prisma Studio (GUI)
pnpm db:generate  # Generate Prisma Client
pnpm db:push      # Push schema changes
pnpm db:migrate   # Create migration
pnpm db:seed      # Seed data
pnpm db:reset     # Reset database (CAUTION!)

# Build for production
pnpm build        # Build all apps
pnpm start        # Run production build
```

### **Environment Variables**

#### **Root `.env`**

```env
DATABASE_URL="postgresql://admin:secure_password@localhost:5432/smart_canteen?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

#### **CMS `.env.local`**

```env
DATABASE_URL="postgresql://admin:secure_password@localhost:5432/smart_canteen?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

---

## 💻 Development Guide

### **Quy Trình Phát Triển Feature Mới**

#### **Example: Product Management**

**Step 1: Domain Layer**

```typescript
// src/domain/entities/product.entity.ts
export interface ProductEntity {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// src/domain/repositories/product.repository.interface.ts
export interface CreateProductDTO {
  name: string;
  slug: string;
  price: number;
  stock: number;
  categoryId: string;
}

export interface IProductRepository {
  findMany(
    params: GetProductsParams,
  ): Promise<{ products: ProductEntity[]; total: number }>;
  findById(id: string): Promise<ProductEntity | null>;
  create(data: CreateProductDTO): Promise<ProductEntity>;
  update(id: string, data: UpdateProductDTO): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
}
```

**Step 2: Infrastructure Layer**

```typescript
// src/infrastructure/database/repositories/product.repository.ts
export class PrismaProductRepository implements IProductRepository {
  async findMany(params: GetProductsParams = {}) {
    const where: any = { deletedAt: null };

    if (params.name) {
      where.name = { contains: params.name, mode: "insensitive" };
    }
    if (params.categoryId && params.categoryId !== "all") {
      where.categoryId = params.categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, supplier: true },
        orderBy: { [params.sortBy || "createdAt"]: params.sortOrder || "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  // ... other methods
}

export const productRepository = new PrismaProductRepository();
```

**Step 3: Application Layer**

```typescript
// src/application/use-cases/product/get-all-products.use-case.ts
export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  name?: string;
  categoryId?: string;
  sortBy?: "name" | "price" | "stock";
  sortOrder?: "asc" | "desc";
}

export interface GetProductsResult {
  products: ProductEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class GetAllProductsUseCase {
  async execute(params: GetProductsParams = {}): Promise<GetProductsResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const { products, total } = await productRepository.findMany(params);

    return {
      products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export const getAllProductsUseCase = new GetAllProductsUseCase();
```

**Step 4: Server Component (Page)**

```typescript
// src/app/dashboard/products/page.tsx
export default async function ProductsPage({ searchParams }) {
  const params = {
    page: parseInt(searchParams.page || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    name: searchParams.name,
    categoryId: searchParams.categoryId,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
  };

  const result = await getAllProductsUseCase.execute(params);

  return <ProductsTable data={result} />;
}
```

**Step 5: Client Component (Table) with Generic DataTable**

```typescript
// src/app/dashboard/products/_components/products-table.tsx
"use client";

import { DataTable } from "@/components/ui/data-table";

export function ProductsTable({ data }: { data: GetProductsResult }) {
  const tableConfig: DataTableConfig<ProductEntity> = {
    entityName: "sản phẩm",
    addButtonLabel: "Thêm sản phẩm",
    onAdd: handleCreate,
    columns: [
      {
        key: "name",
        label: "Tên sản phẩm",
        sortable: true,
        filterable: true,
        filter: { type: "text", placeholder: "Tìm tên..." },
      },
      {
        key: "price",
        label: "Giá",
        sortable: true,
        render: (product) => formatCurrency(product.price),
      },
      {
        key: "stock",
        label: "Tồn kho",
        sortable: true,
        render: (product) => (
          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
            {product.stock}
          </Badge>
        ),
      },
    ],
    rowActions: [
      { label: "Sửa", icon: <Pencil />, onClick: handleEdit },
      { label: "Xóa", icon: <Trash2 />, onClick: handleDelete, variant: "destructive" },
    ],
  };

  return <DataTable result={result} config={tableConfig} />;
}
```

**Step 6: Server Actions (Mutations)**

```typescript
// src/app/dashboard/products/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createProductAction(data: CreateProductDTO) {
  try {
    const product = await createProductUseCase.execute(data);
    revalidatePath("/dashboard/products");
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await deleteProductUseCase.execute(id);
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Có lỗi xảy ra" };
  }
}
```

---

## 📜 Conventions & Best Practices

### **Naming Conventions**

```
✅ kebab-case for files:      user-dialog.tsx
✅ kebab-case for folders:    use-cases/
✅ PascalCase for components: UserDialog
✅ camelCase for functions:   getUserById
✅ UPPER_CASE for constants:  MAX_PAGE_SIZE
```

### **Import Order**

```typescript
// 1. External libraries
import { useState } from "react";
import { toast } from "sonner";

// 2. Internal absolute imports
import { UserEntity } from "@/domain/entities/user.entity";
import { userRepository } from "@/infrastructure/database/repositories/user.repository";

// 3. Relative imports
import { UserDialog } from "./user-dialog";
```

### **Error Handling**

```typescript
// Client-side
try {
  const result = await createUserAction(data);
  if (result.success) {
    toast.success("Tạo người dùng thành công");
  } else {
    toast.error(result.error || "Có lỗi xảy ra");
  }
} catch (error) {
  toast.error("Có lỗi xảy ra");
}

// Server Actions
("use server");

export async function createUserAction(data: CreateUserDTO) {
  try {
    const user = await createUserUseCase.execute(data);
    revalidatePath("/dashboard/users");
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}
```

---

## 🎯 Roadmap

### **✅ Phase 1: Foundation (COMPLETED)**

- [x] Monorepo setup (Turborepo + pnpm)
- [x] Database schema (Prisma)
- [x] Authentication (NextAuth + JWT)
- [x] Clean Architecture structure
- [x] **Generic DataTable System**
- [x] **User Management** (CRUD + server-side filter/sort/pagination)
- [x] **Student Management** (CRUD + server-side filter/sort/pagination)
- [x] Form validation (react-hook-form + zod)
- [x] Error handling (parseDbError)
- [x] Rich seed data (53 users, 120 students, 32 products)

### **🔄 Phase 2: Product & Order Management (NEXT)**

- [ ] **Product Management**
  - [ ] Apply DataTable pattern
  - [ ] Image upload
  - [ ] Stock management
  - [ ] Category filter
- [ ] **Category Management**
- [ ] **Supplier Management**

### **📅 Phase 3: Order System**

- [ ] Shopping Cart
- [ ] Order Placement
- [ ] Payment integration (VNPay, Momo)
- [ ] Order Management (CMS)

### **📅 Phase 4: Wallet & Top-up**

- [ ] Top-up Request (Client)
- [ ] Top-up Approval (CMS)
- [ ] Transaction history

### **📅 Phase 5: Advanced Features**

- [ ] Real-time notifications
- [ ] QR Code system
- [ ] Reports & Analytics
- [ ] Multi-school support
- [ ] Voucher system

---

## 🔑 Login Credentials

### **CMS Admin** (http://localhost:3000)

```
Admin:
  Email: admin@smartcanteen.com
  Password: Admin@123

Manager:
  Email: manager@smartcanteen.com
  Password: Admin@123

Staff:
  Email: staff@smartcanteen.com
  Password: Staff@123
```

### **Client App** (http://localhost:3001)

```
Parent (50 test accounts):
  Email: parent1@example.com to parent50@example.com
  Password: Parent@123
```

---

## 🆘 Troubleshooting

### **Docker Issues**

```bash
# Port already in use
docker-compose down
lsof -ti:5432 | xargs kill -9  # Kill PostgreSQL

# Database connection refused
docker-compose ps                # Check services
docker-compose logs postgres     # Check logs
```

### **Prisma Issues**

```bash
# Prisma Client out of sync
pnpm db:generate

# Migration issues
pnpm db:push --force-reset
```

### **Build Errors**

```bash
# Clear cache
pnpm clean
rm -rf node_modules .next
pnpm install
pnpm db:generate
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- **DataTable README**: `apps/cms/src/components/ui/data-table/README.md`

---

**Maintainers:** Smart Canteen Development Team  
**License:** Private  
**Last Updated:** March 11, 2026
