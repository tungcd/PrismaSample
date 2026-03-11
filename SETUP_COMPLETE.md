# 🎉 Smart Canteen - Hệ Thống Quản Lý Căng Tin Thông Minh

> **Last Updated:** March 11, 2026  
> **Version:** 2.0.0  
> **Architecture:** Clean Architecture + Monorepo

---

## 📖 Mục Lục

1. [Tổng Quan Dự Án](#-tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
3. [Clean Architecture](#-clean-architecture)
4. [Quy Trình Phát Triển Feature](#-quy-trình-phát-triển-feature)
5. [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
6. [Database Schema](#-database-schema)
7. [API Documentation](#-api-documentation)
8. [Setup & Deploy](#-setup--deploy)
9. [Conventions & Best Practices](#-conventions--best-practices)
10. [Roadmap](#-roadmap)

---

## 🎯 Tổng Quan Dự Án

Smart Canteen là hệ thống quản lý căng tin trường học toàn diện với 3 ứng dụng chính:

### 📱 **Ứng dụng đã triển khai**

| Ứng dụng        | Mô tả                          | Port | Tech Stack              |
| --------------- | ------------------------------ | ---- | ----------------------- |
| **CMS Admin**   | Quản trị viên quản lý hệ thống | 3000 | Next.js 14 (App Router) |
| **Client App**  | Phụ huynh/học sinh đặt món     | 3001 | Next.js 14 (App Router) |
| **API Backend** | RESTful API backend            | 4000 | NestJS 10 + Prisma      |

### 🎨 **Features Đã Hoàn Thành**

#### CMS Admin (Port 3000)

- ✅ **Authentication & Authorization**
  - NextAuth.js với JWT
  - Role-based access (ADMIN, MANAGER, STAFF)
  - Protected routes với middleware
- ✅ **User Management** (CRUD + Validation)
  - Danh sách users với pagination (10/20/50 items/page)
  - Search theo tên, email, phone, role
  - Sort theo các cột (Email, Name, Role, Status, Last Login)
  - Create/Edit với react-hook-form + zod validation
  - Toggle active/inactive status
  - Soft delete (deletedAt)
- ✅ **Student Management** (CRUD + Validation)
  - Danh sách students với pagination
  - Search theo tên, lớp, trường, số thẻ, phụ huynh
  - Sort theo Name, Grade, School, Card Number, Status
  - Form validation: cardNumber (uppercase + numbers only)
  - Parent relationship management
- ✅ **UI/UX Components**
  - Shadcn/ui components (Table, Dialog, Select, Badge, etc.)
  - Toast notifications (Sonner)
  - Responsive design
  - Loading states & error handling

#### Database

- ✅ **Rich Seed Data** (Cập nhật mới)
  - 53 users (3 staff + 50 parents)
  - 120 students với parent ngẫu nhiên
  - 32 products (8 breakfast, 9 lunch, 7 snacks, 8 drinks)
  - 4 schools, 3 suppliers, 4 categories
  - Perfect cho test pagination & filtering

---

## 🏗️ Kiến Trúc Hệ Thống

### Monorepo Structure

```
smart-canteen/
├── apps/                         # Các ứng dụng độc lập
│   ├── cms/                      # Admin CMS (Next.js)
│   ├── client/                   # Client App (Next.js)
│   └── api/                      # Backend API (NestJS)
├── packages/                     # Shared packages
│   └── prisma/                   # Prisma schema & client
├── docker-compose.yml            # PostgreSQL + Redis
└── turbo.json                    # Turborepo config
```

### Tech Stack

**Frontend:**

- Next.js 14 (App Router, Server Components)
- React 18 with TypeScript
- Tailwind CSS + Shadcn/ui
- React Hook Form + Zod (validation)
- NextAuth.js (authentication)

**Backend:**

- NestJS 10 with TypeScript
- Prisma ORM (PostgreSQL)
- Passport JWT (authentication)
- Class-validator (DTOs)

**Database:**

- PostgreSQL 15
- Redis (sessions & caching)

**DevOps:**

- Docker & Docker Compose
- Turborepo (monorepo build)
- pnpm (package manager)

---

## 🧱 Clean Architecture

### Layered Architecture (CMS App)

```
apps/cms/src/
├── domain/                       # 🔵 Domain Layer (Business Logic)
│   ├── entities/                 # Domain entities (pure models)
│   │   ├── user.entity.ts
│   │   └── student.entity.ts
│   └── repositories/             # Repository interfaces
│       ├── user.repository.interface.ts
│       └── student.repository.interface.ts
│
├── infrastructure/               # 🟢 Infrastructure Layer (External)
│   └── database/
│       └── repositories/         # Repository implementations
│           ├── user.repository.ts
│           └── student.repository.ts
│
├── application/                  # 🟡 Application Layer (Use Cases)
│   └── use-cases/
│       ├── user/
│       │   ├── get-all-users.use-case.ts
│       │   ├── create-user.use-case.ts
│       │   ├── update-user.use-case.ts
│       │   ├── delete-user.use-case.ts
│       │   └── toggle-user-active.use-case.ts
│       └── student/
│           ├── get-all-students.use-case.ts
│           └── ...
│
└── app/                          # 🔴 Presentation Layer (UI)
    ├── dashboard/
    │   ├── users/
    │   │   ├── page.tsx          # Server Component
    │   │   ├── actions.ts        # Server Actions
    │   │   └── _components/
    │   │       ├── users-table.tsx    # Client Component
    │   │       └── user-dialog.tsx    # Form Dialog
    │   └── students/
    │       └── ...
    └── api/                      # API Routes
        └── parents/
            └── route.ts
```

### Layer Responsibilities

#### 1. **Domain Layer** (Core Business Logic)

- **Entities**: Pure business models (POJO)

  ```typescript
  export interface UserEntity {
    id: string;
    email: string;
    name: string;
    role: string;
    phone: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
  }
  ```

- **Repository Interfaces**: Data access contracts
  ```typescript
  export interface IUserRepository {
    findAll(): Promise<UserEntity[]>;
    findById(id: string): Promise<UserEntity | null>;
    create(data: CreateUserDTO): Promise<UserEntity>;
    update(id: string, data: UpdateUserDTO): Promise<UserEntity>;
    delete(id: string): Promise<void>;
  }
  ```

#### 2. **Infrastructure Layer** (Framework & External Services)

- **Repository Implementations**: Prisma database access

  ```typescript
  export class UserRepository implements IUserRepository {
    async findAll(): Promise<UserEntity[]> {
      return prisma.user.findMany(...);
    }

    async create(data: CreateUserDTO): Promise<UserEntity> {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      return prisma.user.create({
        data: { ...data, passwordHash: hashedPassword }
      });
    }
  }
  ```

#### 3. **Application Layer** (Use Cases / Business Workflows)

- **Use Cases**: Single responsibility business operations

  ```typescript
  export class GetAllUsersUseCase {
    constructor(private userRepository: IUserRepository) {}

    async execute(): Promise<UserEntity[]> {
      return this.userRepository.findAll();
    }
  }

  // Singleton export
  export const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
  ```

#### 4. **Presentation Layer** (UI Components & API)

- **Server Components**: Data fetching

  ```typescript
  // page.tsx - Server Component
  export default async function UsersPage() {
    const users = await getAllUsersUseCase.execute();
    return <UsersTable data={users} />;
  }
  ```

- **Client Components**: Interactivity

  ```typescript
  // users-table.tsx - Client Component
  "use client";
  export function UsersTable({ data }) {
    const [users, setUsers] = useState(data);
    // Filter, sort, pagination logic
  }
  ```

- **Server Actions**: Mutations
  ```typescript
  // actions.ts
  "use server";
  export async function createUserAction(data: CreateUserDTO) {
    try {
      const user = await createUserUseCase.execute(data);
      revalidatePath("/dashboard/users");
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: parseDbError(error) };
    }
  }
  ```

### Dependency Flow

````
┌─────────────────────┐
│  Presentation       │  (UI, Controllers, API Routes)
│  ────────────────   │
│  - React Components │
│  - Server Actions   │
│  - API Handlers     │
└──────────┬──────────┘
           │ depends on
           ▼
┌─────────────────────┐
│  Application        │  (Use Cases, Business Workflows)
│  ────────────────   │
│  - CreateUser       │
│  - GetAllUsers      │
│  - UpdateUser       │
└──────────┬──────────┘
           │ depends on
           ▼
┌─────────────────────┐
│  Domain             │  (Business Logic, Entities)
│  ────────────────   │
│  - UserEntity       │
│  - IUserRepository  │
│  - Business Rules   │
└──────────┬──────────┘
           │ implemented by
           ▼
┌─────────────────────┐
│  Infrastructure     │  (Framework, Database, External APIs)
│  ────────────────   │
│  - UserRepository   │
│  - Prisma Client    │
│  - bcrypt, etc.     │
└─────────────────────┘
```

**Nguyên tắc quan trọng:**
- ❌ Domain không phụ thuộc vào Infrastructure
- ❌ Domain không phụ thuộc vào Framework (Next.js, Prisma)
- ✅ Infrastructure implements Domain interfaces
- ✅ Dễ dàng thay đổi database/framework mà không ảnh hưởng business logic

---

## 🔄 Quy Trình Phát Triển Feature

### **Workflow: Thêm Feature Mới (Ví dụ: Product Management)**

#### **Bước 1: Domain Layer**
```typescript
// 1.1. Tạo Entity
// apps/cms/src/domain/entities/product.entity.ts
export interface ProductEntity {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: CategoryEntity;
  isActive: boolean;
  createdAt: Date;
}

// 1.2. Tạo Repository Interface
// apps/cms/src/domain/repositories/product.repository.interface.ts
export interface IProductRepository {
  findAll(): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
  create(data: CreateProductDTO): Promise<ProductEntity>;
  update(id: string, data: UpdateProductDTO): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
}

export interface CreateProductDTO {
  name: string;
  slug: string;
  price: number;
  stock: number;
  categoryId: string;
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
}
```

#### **Bước 2: Infrastructure Layer**
```typescript
// 2. Implement Repository
// apps/cms/src/infrastructure/database/repositories/product.repository.ts
import { PrismaClient } from "@prisma/client";
import { IProductRepository, CreateProductDTO } from "@/domain/repositories/product.repository.interface";
import { ProductEntity } from "@/domain/entities/product.entity";

const prisma = new PrismaClient();

export class ProductRepository implements IProductRepository {
  async findAll(): Promise<ProductEntity[]> {
    return await prisma.product.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: { category: true },
    });
  }

  async create(data: CreateProductDTO): Promise<ProductEntity> {
    return await prisma.product.create({
      data: {
        ...data,
        isActive: true,
      },
      include: { category: true },
    });
  }

  async update(id: string, data: UpdateProductDTO): Promise<ProductEntity> {
    return await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const productRepository = new ProductRepository();
```

#### **Bước 3: Application Layer (Use Cases)**
```typescript
// 3.1. GetAllProductsUseCase
// apps/cms/src/application/use-cases/product/get-all-products.use-case.ts
import { IProductRepository } from "@/domain/repositories/product.repository.interface";
import { ProductEntity } from "@/domain/entities/product.entity";
import { productRepository } from "@/infrastructure/database/repositories/product.repository";

export class GetAllProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(): Promise<ProductEntity[]> {
    return await this.productRepository.findAll();
  }
}

export const getAllProductsUseCase = new GetAllProductsUseCase(productRepository);

// 3.2. CreateProductUseCase
// apps/cms/src/application/use-cases/product/create-product.use-case.ts
import { CreateProductDTO } from "@/domain/repositories/product.repository.interface";
import { ProductEntity } from "@/domain/entities/product.entity";
import { productRepository } from "@/infrastructure/database/repositories/product.repository";

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: CreateProductDTO): Promise<ProductEntity> {
    // Business validation here if needed
    if (data.price < 0) {
      throw new Error("Price cannot be negative");
    }

    return await this.productRepository.create(data);
  }
}

export const createProductUseCase = new CreateProductUseCase(productRepository);
```

#### **Bước 4: Validation Layer**
```typescript
// 4. Create Validation Schema
// apps/cms/src/lib/validations/product.schema.ts
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug là bắt buộc"),
  price: z.number().min(0, "Giá không được âm"),
  stock: z.number().int().min(0, "Số lượng không được âm"),
  categoryId: z.string().min(1, "Danh mục là bắt buộc"),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
```

#### **Bước 5: Presentation Layer**
```typescript
// 5.1. Server Component (Data Fetching)
// apps/cms/src/app/dashboard/products/page.tsx
import { getAllProductsUseCase } from "@/application/use-cases/product/get-all-products.use-case";
import { ProductsTable } from "./_components/products-table";

export default async function ProductsPage() {
  const products = await getAllProductsUseCase.execute();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý sản phẩm</h1>
      <ProductsTable data={products} />
    </div>
  );
}

// 5.2. Client Component (UI + Interactions)
// apps/cms/src/app/dashboard/products/_components/products-table.tsx
"use client";

import { useState } from "react";
import { ProductEntity } from "@/domain/entities/product.entity";
import { Button } from "@/components/ui/button";
import { createProductAction } from "../actions";
import { ProductDialog } from "./product-dialog";

export function ProductsTable({ data }: { data: ProductEntity[] }) {
  const [products, setProducts] = useState(data);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter, sort, pagination logic here...

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>Thêm sản phẩm</Button>
      {/* Table implementation */}
      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

// 5.3. Form Dialog
// apps/cms/src/app/dashboard/products/_components/product-dialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductInput } from "@/lib/validations/product.schema";
import { createProductAction } from "../actions";
import { toast } from "sonner";

export function ProductDialog({ open, onOpenChange }) {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
  });

  const onSubmit = async (data: CreateProductInput) => {
    const result = await createProductAction(data);
    if (result.success) {
      toast.success("Tạo sản phẩm thành công");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Dialog>
  );
}

// 5.4. Server Actions (Mutations)
// apps/cms/src/app/dashboard/products/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createProductUseCase } from "@/application/use-cases/product/create-product.use-case";
import { parseDbError } from "@/lib/utils/error-handler";
import { CreateProductDTO } from "@/domain/repositories/product.repository.interface";

export async function createProductAction(data: CreateProductDTO) {
  try {
    const product = await createProductUseCase.execute(data);
    revalidatePath("/dashboard/products");
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: parseDbError(error) };
  }
}
```

### **Checklist Khi Thêm Feature Mới**

- [ ] **Domain Layer**
  - [ ] Tạo Entity interface
  - [ ] Tạo Repository interface
  - [ ] Định nghĩa DTOs (CreateDTO, UpdateDTO)

- [ ] **Infrastructure Layer**
  - [ ] Implement Repository với Prisma
  - [ ] Export singleton instance

- [ ] **Application Layer**
  - [ ] Tạo các Use Cases (get-all, create, update, delete)
  - [ ] Export singleton instances

- [ ] **Validation**
  - [ ] Tạo Zod schemas (create & update)
  - [ ] Export types từ schemas

- [ ] **Presentation Layer**
  - [ ] Tạo Server Component (page.tsx)
  - [ ] Tạo Client Component (table, dialog)
  - [ ] Tạo Server Actions (actions.ts)
  - [ ] Implement filter/sort/pagination

- [ ] **Error Handling**
  - [ ] Sử dụng parseDbError cho Prisma errors
  - [ ] Toast notifications
  - [ ] Loading states

---

## 📁 Cấu Trúc Dự Án Chi Tiết

```
smart-canteen/
├── apps/
│   ├── cms/                              # CMS Admin Application
│   │   ├── public/                       # Static assets
│   │   ├── src/
│   │   │   ├── app/                      # Next.js App Router
│   │   │   │   ├── (auth)/
│   │   │   │   │   └── login/
│   │   │   │   │       └── page.tsx      # Login page
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── layout.tsx        # Dashboard layout
│   │   │   │   │   ├── page.tsx          # Dashboard home
│   │   │   │   │   ├── users/
│   │   │   │   │   │   ├── page.tsx      # Server Component
│   │   │   │   │   │   ├── actions.ts    # Server Actions
│   │   │   │   │   │   └── _components/
│   │   │   │   │   │       ├── users-table.tsx
│   │   │   │   │   │       └── user-dialog.tsx
│   │   │   │   │   ├── students/
│   │   │   │   │   │   └── ...           # Same structure
│   │   │   │   │   ├── products/         # TODO
│   │   │   │   │   ├── orders/           # TODO
│   │   │   │   │   └── settings/
│   │   │   │   └── api/
│   │   │   │       └── parents/
│   │   │   │           └── route.ts      # API Route
│   │   │   │
│   │   │   ├── domain/                   # 🔵 DOMAIN LAYER
│   │   │   │   ├── entities/
│   │   │   │   │   ├── user.entity.ts
│   │   │   │   │   ├── student.entity.ts
│   │   │   │   │   ├── product.entity.ts
│   │   │   │   │   └── order.entity.ts
│   │   │   │   └── repositories/
│   │   │   │       ├── user.repository.interface.ts
│   │   │   │       ├── student.repository.interface.ts
│   │   │   │       ├── product.repository.interface.ts
│   │   │   │       └── order.repository.interface.ts
│   │   │   │
│   │   │   ├── infrastructure/           # 🟢 INFRASTRUCTURE LAYER
│   │   │   │   └── database/
│   │   │   │       └── repositories/
│   │   │   │           ├── user.repository.ts
│   │   │   │           ├── student.repository.ts
│   │   │   │           ├── product.repository.ts
│   │   │   │           └── order.repository.ts
│   │   │   │
│   │   │   ├── application/              # 🟡 APPLICATION LAYER
│   │   │   │   └── use-cases/
│   │   │   │       ├── user/
│   │   │   │       │   ├── get-all-users.use-case.ts
│   │   │   │       │   ├── get-user-by-id.use-case.ts
│   │   │   │       │   ├── create-user.use-case.ts
│   │   │   │       │   ├── update-user.use-case.ts
│   │   │   │       │   ├── delete-user.use-case.ts
│   │   │   │       │   └── toggle-user-active.use-case.ts
│   │   │   │       ├── student/
│   │   │   │       │   └── ...           # Same structure
│   │   │   │       ├── product/          # TODO
│   │   │   │       └── order/            # TODO
│   │   │   │
│   │   │   ├── components/               # Shared components
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── shell.tsx         # Layout shell
│   │   │   │   │   └── nav.tsx           # Navigation
│   │   │   │   └── ui/                   # Shadcn/ui components
│   │   │   │       ├── button.tsx
│   │   │   │       ├── input.tsx
│   │   │   │       ├── dialog.tsx
│   │   │   │       ├── table.tsx
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── lib/                      # Utilities
│   │   │   │   ├── auth.ts               # NextAuth config
│   │   │   │   ├── utils.ts              # Helper functions
│   │   │   │   ├── validations/
│   │   │   │   │   ├── user.schema.ts    # Zod schema
│   │   │   │   │   └── student.schema.ts
│   │   │   │   └── utils/
│   │   │   │       └── error-handler.ts  # DB error parser
│   │   │   │
│   │   │   ├── types/                    # TypeScript types
│   │   │   │   └── next-auth.d.ts
│   │   │   │
│   │   │   └── middleware.ts             # Auth middleware
│   │   │
│   │   ├── .env.local                    # Environment variables
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   ├── client/                           # Client Application
│   │   └── ...                           # Similar structure to CMS
│   │
│   └── api/                              # NestJS Backend
│       ├── src/
│       │   ├── auth/
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.module.ts
│       │   │   ├── dto/
│       │   │   ├── guards/
│       │   │   └── strategies/
│       │   ├── users/
│       │   │   └── ...
│       │   ├── prisma/
│       │   │   ├── prisma.service.ts
│       │   │   └── prisma.module.ts
│       │   └── main.ts
│       ├── .env
│       └── nest-cli.json
│
├── packages/
│   └── prisma/                           # Shared Prisma Package
│       ├── generated/                    # Generated Prisma Client
│       ├── migrations/                   # Database migrations
│       ├── prisma/
│       │   ├── schema.prisma             # Prisma schema
│       │   └── seed.ts                   # Database seeder
│       ├── index.ts                      # Export Prisma client
│       └── package.json
│
├── docker-compose.yml                    # Docker services
├── .env                                  # Root environment
├── package.json                          # Root package.json
├── pnpm-workspace.yaml                   # pnpm workspaces
├── turbo.json                            # Turborepo config
├── SETUP_COMPLETE.md                     # This file
├── bussiness.md                          # Business requirements
└── README.md                             # Project README
```

---

## 🗄️ Database Schema

### **Core Models**

- **CMS Admin**: http://localhost:3000
- **Client App**: http://localhost:3001
- **NestJS API**: http://localhost:4000

### 2. Or Run Individually

```bash
# CMS Admin only
pnpm --filter=@smart-canteen/cms dev

# Client App only
pnpm --filter=@smart-canteen/client dev

# API only
pnpm --filter=@smart-canteen/api dev
````

## 🔑 Login Credentials

### CMS Admin (http://localhost:3000)

```
Admin:
  Email: admin@smartcanteen.com
  Password: Admin@123

Manager:
  Email: manager@smartcanteen.com
  Password: Manager@123

Staff:
  Email: staff@smartcanteen.com
  Password: Staff@123
```

### Client App (http://localhost:3001)

```
Parent:
  Email: parent@example.com
  Password: Parent@123
  Wallet: 500,000 VND
  Children: 2 students
```

### API Testing (http://localhost:4000/api/v1)

```bash
# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartcanteen.com","password":"Admin@123"}'

# Get profile (replace TOKEN with access_token from login)
curl http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer TOKEN"
```

## 📝 Database Tools

```bash
# Open Prisma Studio (Database GUI)
pnpm db:studio

# Generate Prisma Client (after schema changes)
pnpm db:generate

# Push schema changes (development)
pnpm db:push

# Reset database
pnpm db:reset

# Re-seed database
pnpm db:seed
```

## 🗄️ Database Schema Highlights

### Users & Authentication

- **5 Roles**: ADMIN, MANAGER, STAFF, PARENT, STUDENT
- NextAuth Session & VerificationToken tables
- Soft delete support (deletedAt)
- Last login tracking

### Wallet System

- **Wallet**: One per student, tracks balance
- **Transaction**: History of all wallet operations
- **TopUpRequest**: Manual approval workflow (PENDING/APPROVED/REJECTED)

### Products

- **Category**: Food categories (Breakfast, Lunch, Snacks, Drinks)
- **Supplier**: Product suppliers
- **Product**: Menu items with nutritional information (calories, protein, etc.)

### Orders

- **Order**: Customer orders with payment status
- **OrderItem**: Individual items in an order

## 🎨 UI Components (Shadcn/ui)

Available in both CMS and Client apps:

- ✅ Button (variants: default, destructive, outline, ghost, link)
- ✅ Input (text, email, password)
- ✅ Label
- ✅ Card (with Header, Title, Description, Content, Footer)

## 🔐 Authentication Flow

### CMS Admin & Client App (NextAuth.js)

1. User enters email + password
2. NextAuth validates credentials against database
3. Password verified with bcrypt
4. JWT token created (30 days expiry)
5. Middleware protects routes
6. Role-based access control per page

### NestJS API (Passport JWT)

1. POST to /api/v1/auth/login with credentials
2. Returns JWT access_token
3. Include token in Authorization header
4. JwtAuthGuard validates token
5. RolesGuard checks user role
6. @CurrentUser() decorator provides user data

## 📂 Project Structure

```
smart-canteen/
├── apps/
│   ├── cms/                      # Admin CMS (Next.js)
│   │   ├── src/
│   │   │   ├── app/              # App Router pages
│   │   │   ├── components/       # React components
│   │   │   ├── lib/              # Utilities (auth, utils)
│   │   │   └── middleware.ts     # Auth middleware
│   │   └── .env.local
│   │
│   ├── client/                   # Client App (Next.js)
│   │   ├── src/                  # Same structure as CMS
│   │   └── .env.local
│   │
│   └── api/                      # Backend API (NestJS)
│       ├── src/
│       │   ├── auth/             # Auth module
│       │   ├── users/            # Users module
│       │   ├── prisma/           # Prisma service
│       │   └── main.ts
│       └── .env
│
├── packages/
│   └── prisma/                   # Shared Prisma schema
│       ├── schema.prisma         # Database schema
│       ├── prisma/seed.ts        # Seeder
│       └── index.ts              # Prisma client export
│
├── docker-compose.yml            # PostgreSQL + Redis
├── .env                          # Root environment variables
└── README.md                     # Full documentation
```

## 🎯 Next Steps

Đã hoàn thành **Step 1: Base Project + Authentication/Authorization**!

Các bước tiếp theo có thể phát triển:

1. **Product Management**
   - CRUD operations for products
   - Image upload functionality
   - Category management

2. **Order System**
   - Shopping cart
   - Order placement
   - Order status tracking
   - Payment processing

3. **Wallet & Top-up**
   - Top-up request UI
   - Admin approval workflow
   - Transaction history UI

4. **Notifications**
   - Real-time notifications (Socket.io)
   - Push notifications
   - Email/SMS notifications

5. **Reports & Analytics**
   - Sales reports
   - Popular products
   - User activity
   - Revenue analytics

6. **Advanced Features**
   - QR code scanning
   - PWA support for mobile
   - Multi-school support
   - Voucher/discount system

## 📚 Documentation

- [Full README](README.md) - Complete project documentation
- [Business Requirements](bussiness.md) - System architecture
- [Prisma Schema](packages/prisma/schema.prisma) - Database models

## 🐛 Troubleshooting

### Docker not running

```bash
docker-compose up -d
```

### Database connection error

```bash
# Check Docker containers are running
docker ps

# Restart containers
docker-compose restart
```

### Prisma Client not generated

```bash
cd packages/prisma
pnpm prisma generate
```

### Port already in use

```bash
# Change ports in .env files
# CMS: NEXTAUTH_URL=http://localhost:PORT
# Client: NEXTAUTH_URL=http://localhost:PORT
# API: PORT=YOUR_PORT in apps/api/.env
```

---

**🎉 Congratulations! Your Smart Canteen system is ready for development!**

Happy coding! 🚀
