# Smart Canteen - AI Reference Guide

**Last Updated:** March 11, 2026 | **Version:** 2.0.0

## Tech Stack

**Framework:** Next.js 14 (App Router), NestJS 10, TypeScript 5.3.3  
**Database:** PostgreSQL 15 + Prisma 5.22.0 (ORM)  
**Auth:** JWT (jose for middleware, jsonwebtoken for Server Actions/API)  
**UI:** Tailwind CSS + Shadcn/ui + React Hook Form + Zod  
**Monorepo:** Turborepo + pnpm  
**Apps:** CMS (3000), Client (3001), API (4000)

## Security & Authentication (March 2026)

**JWT-Based Authentication:**

- Backend (NestJS) generates JWT tokens on login
- Frontend stores token in cookie (httpOnly recommended in production)
- Middleware verifies JWT on every request
- **SOURCE OF TRUTH:** JWT token in cookies, NOT localStorage

**Authorization Layers:**

1. **Middleware** (`middleware.ts`): Verify JWT token using `jose` (Edge Runtime compatible), redirect if invalid
2. **Server Actions** (`withAuth`, `withRole`): Role-based access using `jsonwebtoken` before DB operations
3. **API Routes** (`requireAuth`, `requireRole`): Protect REST endpoints using `jsonwebtoken`

**⚠️ Edge Runtime Constraint:**

- Next.js middleware runs in Edge Runtime (V8 isolate) without Node.js APIs
- `jsonwebtoken` ❌ (uses Node.js crypto module - not available)
- `jose` ✅ (uses Web Crypto API - Edge Runtime compatible)
- Use `jose` for middleware, `jsonwebtoken` for Server Actions/API Routes

**Role Hierarchy:**

- `ADMIN`: Full access (create/update/delete users, students)
- `MANAGER`: Manage users, students (no user deletion)
- `STAFF`: Manage students only (no user management)
- `PARENT`: Client app access only (not CMS)

**Important Files:**

- `lib/auth-server.ts`: JWT verification, user extraction (server-side)
- `lib/with-auth.ts`: HOF wrappers for Server Actions
- `middleware.ts`: JWT verification on routes
- `.env.local`: `JWT_SECRET` must match backend

**Security Rules:**

- ✅ All Server Actions protected with `withAuth()` or `withRole()`
- ✅ All API routes protected with `requireAuth()` or `requireRole()`
- ✅ JWT verified in middleware before any page access
- ✅ Token expiration checked on every request
- ❌ NEVER trust localStorage for authorization (client can modify)
- ❌ NEVER trust client-side role checks for data access

**Code Examples:**

```typescript
// Middleware (Edge Runtime - use jose)
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret); // ✅ Edge Runtime compatible
    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

// Server Actions (Node.js runtime - use jsonwebtoken)
import jwt from "jsonwebtoken";

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = cookies().get("token")?.value;
  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET!); // ✅ Node.js runtime
  return { id: decoded.sub, email: decoded.email, role: decoded.role };
}

// Protect Server Action with role
export const deleteUserAction = withRole(
  ["ADMIN"], // Only ADMIN can delete
  async (authUser, id: number) => {
    await deleteUserUseCase.execute(id);
    revalidatePath("/dashboard/users");
    return { success: true };
  },
);
```

## Critical Database Changes (March 2026)

**ID Migration: CUID String → Auto-increment Integer**

- All 14 models changed from `id String @id @default(cuid())` to `id Int @id @default(autoincrement())`
- All TypeScript entities: `id: string` → `id: number`
- All foreign keys: String → Int (`parentId: number`, `userId: number`, etc.)
- Database fully seeded: 53 users, 120 students, 10 schools, 32 products

**Phone Number Formatting:**

- Vietnamese phones: +84 → 0 format (e.g., +84910000001 → 0910000001)
- Utility: `lib/utils.ts → formatPhoneNumber()`

**Schools from Database:**

- SCHOOLS constant removed, now fetched via `app/actions/get-schools.action.ts`
- `SchoolSelectEntity { id: number; name: string; }`

## Seed Data (Test Accounts)

```typescript
// Credentials
Admin:   admin@smartcanteen.com / Admin@123    (ID: 1)
Manager: manager@smartcanteen.com / Admin@123  (ID: 2)
Staff:   staff@smartcanteen.com / Staff@123    (ID: 3)
Parents: parent1-50@example.com / Parent@123   (IDs: 4-53)

// Data Volume
Users: 53 (3 staff + 50 parents)
Students: 120 (distributed across 10 schools, grades 6A-12D)
Schools: 10 (6 THCS middle schools + 4 THPT high schools)
Products: 32 (8 breakfast, 9 lunch, 7 snacks, 8 drinks)
Categories: 4 | Suppliers: 3 | Wallets: 50
```

## Clean Architecture (apps/cms/src/)

```
domain/                    # Business logic (framework-agnostic)
├── entities/              # Pure models: user.entity.ts, student.entity.ts
│   └── *.entity.ts        # { id: number; ... } - ALWAYS use number for IDs
└── repositories/          # Interfaces: *.repository.interface.ts
    └── *.interface.ts     # findById(id: number), update(id: number, data)

infrastructure/            # External implementations
└── database/repositories/ # Prisma implementations
    └── *.repository.ts    # implements IRepository, uses PrismaClient

application/               # Business workflows
└── use-cases/            # Single-responsibility operations
    └── */                # get-all, create, update, delete, toggle-active

app/                      # Presentation layer
├── dashboard/*/          # Feature modules (users, students, products)
│   ├── page.tsx          # Server Component (data fetching)
│   ├── actions.ts        # Server Actions ("use server")
│   └── _components/      # Client Components (tables, dialogs, forms)
└── actions/              # Global actions (get-parents, get-schools)
```

**Dependency Rule:** Domain → Application → Infrastructure ← Presentation

## Key Conventions

**Routing Pattern:**

- List: `/dashboard/users` → `page.tsx` (Server Component)
- Actions: `actions.ts` with revalidatePath() after mutations
- Components: `_components/` folder (users-table.tsx, user-dialog.tsx)

**Type Definitions:**

- Entities: `*.entity.ts` (UserEntity, StudentEntity)
- DTOs: `Create*DTO`, `Update*DTO` in repository interfaces
- Always use `id: number` (not string) after March 2026 migration

**Data Flow:**

1. Server Component → Use Case → Repository → Prisma
2. Client Component → Server Action → Use Case → Repository → Prisma
3. API Route → Use Case → Repository → Prisma

**Validation:**

- Frontend: React Hook Form + Zod (lib/validations/\*.schema.ts)
- Backend: NestJS class-validator DTOs
- Student cardNumber: uppercase + numbers only, school from DB dropdown

**Error Handling:**

- Repositories: throw errors (P2002, P2025, etc.)
- Actions: try-catch, return `{ success, data?, error? }`
- UI: Toast notifications (sonner)

## Prisma Commands

```bash
# Generate client (after schema changes)
cd packages/prisma && pnpm exec prisma generate

# Push schema to DB (dev only)
export DATABASE_URL="postgresql://admin:secure_password@localhost:5432/smart_canteen"
pnpm exec prisma db push

# Seed database
pnpm exec tsx packages/prisma/prisma/seed.ts

# Reset DB (CAUTION: deletes all data)
pnpm exec prisma migrate reset --force
```

## Important Files

**Schema:** `packages/prisma/schema.prisma` (source of truth)  
**Seed:** `packages/prisma/prisma/seed.ts` (import from "@prisma/client")  
**DB URL:** `DATABASE_URL="postgresql://admin:secure_password@localhost:5432/smart_canteen"`  
**Auth:** `apps/cms/src/app/api/auth/[...nextauth]/auth.config.ts`

## Feature Development Workflow

1. **Prisma Schema:** Add model in `packages/prisma/schema.prisma`
2. **Generate:** `pnpm exec prisma generate && pnpm exec prisma db push`
3. **Domain:** Create entity + repository interface (id: number)
4. **Infrastructure:** Implement repository with Prisma
5. **Application:** Create use cases (get-all, create, update, delete, toggle-active)
6. **Presentation:** Server Component (page.tsx) + Client Components + Server Actions
7. **Instance:** Singleton repository instance in `infrastructure/database/repositories/instances/`

## Common Pitfalls

- ❌ Using `id: string` instead of `id: number` (outdated after March 2026)
- ❌ Importing from `"../generated/client"` instead of `"@prisma/client"`
- ❌ Forgetting `revalidatePath()` after mutations in Server Actions
- ❌ Not handling Prisma errors (P2002 unique constraint, P2025 not found)
- ❌ Using CUID in new features (use auto-increment integers)
- ❌ Hardcoding SCHOOLS constant (fetch from database via get-schools.action.ts)
- ❌ **SECURITY:** Not protecting Server Actions with `withAuth()` or `withRole()`
- ❌ **SECURITY:** Trusting localStorage for authorization (use JWT token from cookies)
- ❌ **SECURITY:** Not verifying JWT token before database operations

## Database Models (14 tables, all with Int IDs)

User, Session, Student, Wallet, Transaction, TopUpRequest, Category, Supplier, Product, Order, OrderItem, Notification, Voucher, School

**Relationships:**

- Student.parentId → User.id (Int)
- Product.categoryId → Category.id (Int)
- Order.userId → User.id (Int), Order.studentId → Student.id (Int | null)
- All use soft delete: `deletedAt: DateTime?`

## Code Examples

### Entity (Domain Layer)

```typescript
// apps/cms/src/domain/entities/user.entity.ts
export interface UserEntity {
  id: number; // ✅ Always number after March 2026
  email: string;
  name: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}
```

### Repository Interface (Domain Layer)

```typescript
// apps/cms/src/domain/repositories/user.repository.interface.ts
export interface IUserRepository {
  findAll(): Promise<UserEntity[]>;
  findById(id: number): Promise<UserEntity | null>; // ✅ id: number
  create(data: CreateUserDTO): Promise<UserEntity>;
  update(id: number, data: UpdateUserDTO): Promise<UserEntity>; // ✅ id: number
  delete(id: number): Promise<void>; // ✅ id: number
}

export interface CreateUserDTO {
  email: string;
  name: string;
  role: string;
  phone?: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}
```

### Repository Implementation (Infrastructure Layer)

```typescript
// apps/cms/src/infrastructure/database/repositories/user.repository.ts
import { PrismaClient } from "@prisma/client"; // ✅ Use @prisma/client
import {
  IUserRepository,
  CreateUserDTO,
} from "@/domain/repositories/user.repository.interface";
import { UserEntity } from "@/domain/entities/user.entity";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export class UserRepository implements IUserRepository {
  async findAll(): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => ({
      id: user.id, // Prisma returns number
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }));
  }

  async findById(id: number): Promise<UserEntity | null> {
    // ✅ id: number
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async create(data: CreateUserDTO): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role as any,
        phone: data.phone,
        passwordHash: hashedPassword,
        isActive: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async update(id: number, data: UpdateUserDTO): Promise<UserEntity> {
    // ✅ id: number
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role as any,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async delete(id: number): Promise<void> {
    // ✅ id: number
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

// Singleton instance
export const userRepository = new UserRepository();
```

### Use Case (Application Layer)

```typescript
// apps/cms/src/application/use-cases/user/get-user-by-id.use-case.ts
import { IUserRepository } from "@/domain/repositories/user.repository.interface";
import { UserEntity } from "@/domain/entities/user.entity";

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: number): Promise<UserEntity | null> {
    // ✅ id: number
    return this.userRepository.findById(id);
  }
}

// Singleton instance
import { userRepository } from "@/infrastructure/database/repositories/user.repository";
export const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
```

### Server Action (Presentation Layer)

```typescript
// apps/cms/src/app/dashboard/users/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createUserUseCase } from "@/application/use-cases/user/create-user.use-case";
import { updateUserUseCase } from "@/application/use-cases/user/update-user.use-case";
import { deleteUserUseCase } from "@/application/use-cases/user/delete-user.use-case";
import {
  CreateUserDTO,
  UpdateUserDTO,
} from "@/domain/repositories/user.repository.interface";

export async function createUserAction(data: CreateUserDTO) {
  try {
    const user = await createUserUseCase.execute(data);
    revalidatePath("/dashboard/users"); // ✅ Revalidate after mutation
    return { success: true, data: user };
  } catch (error: any) {
    // Handle Prisma errors
    if (error.code === "P2002") {
      return { success: false, error: "Email or phone already exists" };
    }
    return { success: false, error: error.message };
  }
}

export async function updateUserAction(id: number, data: UpdateUserDTO) {
  // ✅ id: number
  try {
    const user = await updateUserUseCase.execute(id, data);
    revalidatePath("/dashboard/users");
    return { success: true, data: user };
  } catch (error: any) {
    if (error.code === "P2025") {
      return { success: false, error: "User not found" };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(id: number) {
  // ✅ id: number
  try {
    await deleteUserUseCase.execute(id);
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### Server Component (Presentation Layer)

```typescript
// apps/cms/src/app/dashboard/users/page.tsx
import { getAllUsersUseCase } from "@/application/use-cases/user/get-all-users.use-case";
import { UsersTable } from "./_components/users-table";

export default async function UsersPage() {
  const users = await getAllUsersUseCase.execute();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UsersTable data={users} />
    </div>
  );
}
```

### Client Component (Presentation Layer)

```typescript
// apps/cms/src/app/dashboard/users/_components/users-table.tsx
"use client";

import { useState } from "react";
import { UserEntity } from "@/domain/entities/user.entity";
import { createUserAction, updateUserAction, deleteUserAction } from "../actions";
import { toast } from "sonner";

export function UsersTable({ data }: { data: UserEntity[] }) {
  const [users, setUsers] = useState(data);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = async (formData: any) => {
    const result = await createUserAction(formData);

    if (result.success) {
      toast.success("User created successfully");
      setIsDialogOpen(false);
      // Data will refresh via revalidatePath
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdate = async (id: number, formData: any) => {  // ✅ id: number
    const result = await updateUserAction(id, formData);

    if (result.success) {
      toast.success("User updated successfully");
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: number) => {  // ✅ id: number
    if (!confirm("Are you sure?")) return;

    const result = await deleteUserAction(id);

    if (result.success) {
      toast.success("User deleted successfully");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      {/* Table implementation */}
    </div>
  );
}
```

## Validation Schema Example

```typescript
// apps/cms/src/lib/validations/student.schema.ts
import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  grade: z.string().min(1, "Grade is required"),
  school: z.string().min(1, "School is required"),
  cardNumber: z
    .string()
    .min(8, "Card number must be at least 8 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Card number must contain only uppercase letters and numbers",
    )
    .transform((val) => val.toUpperCase()),
  parentId: z.union([z.string(), z.number()]).transform((val) => {
    // ✅ Handle both string (from form) and number (programmatic)
    if (typeof val === "string") {
      const parsed = parseInt(val);
      if (isNaN(parsed)) throw new Error("Invalid parent ID");
      return parsed;
    }
    return val;
  }),
});

export type StudentInput = z.infer<typeof studentSchema>;
```

## Authentication & Authorization Examples (March 2026)

### Protected Server Action with Role Check

```typescript
// apps/cms/src/app/dashboard/users/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { withRole } from "@/lib/with-auth";
import { deleteUserUseCase } from "@/application/use-cases/user/delete-user.use-case";

/**
 * Delete user - Only ADMIN can delete
 * ✅ JWT token verified from cookies (server-side)
 * ✅ Role checked before DB access
 * ❌ Cannot be bypassed by modifying localStorage
 */
export const deleteUserAction = withRole(
  ["ADMIN"], // Only ADMIN allowed
  async (authUser, id: number) => {
    // authUser is guaranteed to be authenticated and have ADMIN role
    try {
      await deleteUserUseCase.execute(id);
      revalidatePath("/dashboard/users");
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
);
```

### Protected API Route

```typescript
// apps/cms/src/app/api/parents/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getAllUsersUseCase } from "@/application/use-cases/user/get-all-users.use-case";

/**
 * GET /api/parents
 * ✅ Requires authentication (any logged-in user)
 * ✅ JWT verified from cookies
 */
export async function GET() {
  try {
    // Verify JWT token from cookies
    const authUser = await requireAuth();

    const users = await getAllUsersUseCase.execute();
    const parents = users.filter((user) => user.role === "PARENT");
    return NextResponse.json(parents);
  } catch (error: any) {
    if (error.message?.startsWith("UNAUTHORIZED")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 },
    );
  }
}
```

### Middleware with JWT Verification

```typescript
// apps/cms/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  if (pathname === "/login") return NextResponse.next();

  // Get token from cookie
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Verify JWT token (not just check existence)
  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    // Invalid/expired token - redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}
```

### Auth Helper Usage

```typescript
// apps/cms/src/lib/auth-server.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: number;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "PARENT";
}

/**
 * Get authenticated user from JWT token (server-side only)
 * ✅ SOURCE OF TRUTH for authentication
 * ❌ DO NOT trust localStorage
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication - throw if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new Error("UNAUTHORIZED: Authentication required");
  return user;
}

/**
 * Require specific role - throw if insufficient permission
 */
export async function requireRole(
  allowedRoles: AuthUser["role"][],
): Promise<AuthUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `FORBIDDEN: Required ${allowedRoles.join(" or ")}, got ${user.role}`,
    );
  }
  return user;
}
```

### Security Flow Diagram

```
┌──────────────────────────────────────────────────┐
│  1. User Login (NestJS Backend)                 │
│     - Verify credentials                         │
│     - Generate JWT token                         │
│     - Return token to frontend                   │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  2. Frontend Stores Token                        │
│     - Cookie: token=<jwt> (for server access)    │
│     - localStorage: user info (UI display only)  │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  3. Request to Protected Route/Action            │
│     - Cookie automatically sent with request     │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  4. Middleware (middleware.ts)                   │
│     ✅ Verify JWT token from cookie              │
│     ✅ Check token expiration                    │
│     ❌ Reject if invalid/expired                 │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  5. Server Action/API Route                      │
│     ✅ withRole() verifies JWT again             │
│     ✅ Check user has required role              │
│     ❌ Return 403 if insufficient permission     │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  6. Database Access (Use Case → Repository)      │
│     ✅ User authenticated & authorized           │
│     ✅ Safe to query/modify data                 │
└──────────────────────────────────────────────────┘
```

**Key Points:**

- JWT token in cookie = SOURCE OF TRUTH (server-side, secure)
- localStorage = UI display only (client can modify, never trust for auth)
- Every Server Action/API Route must verify auth before DB access
- Middleware protects routes, withRole() protects operations

---

**Need more details?** Check SETUP_COMPLETE.backup.md (full 1000-line documentation)
