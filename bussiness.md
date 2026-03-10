# Smart Canteen — Project Overview

## Project Name

**Smart Canteen**

---

## Overview

Smart Canteen is an intelligent school canteen solution that combines a dedicated payment card and a SmartCanteen web/mobile app to manage spending, pre-order breakfast, and monitor nutrition for students at school. The solution allows parents to top up balances, track purchase history, and helps ensure food safety and traceability.

**Core value:**

- Contactless payment at the counter (card or app)
- Pre-order meals (e.g. breakfast) to avoid running out of items and save time
- Expense tracking and purchase history for budget control
- Food safety and nutrition: clear origin and school-safe processing
- Security: purchase password to protect account and transactions

---

## System Architecture

### Architecture Model

- **Pattern:** Monorepo/Multi-service
- **Backend Services:**
  - **NestJS API** (optional/specialized): Heavy processing, real-time features, third-party integrations
  - **Next.js API Routes** (primary): Integrated with Prisma for direct DB access
- **Communication:** HTTPS REST API + WebSocket (real-time features)
- **Deployment:** Docker Compose (development) + Docker containers (production)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Environment                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   CMS Admin  │      │  Client App  │      │  NestJS   │ │
│  │   Next.js    │      │   Next.js    │      │  Backend  │ │
│  │  + Prisma    │      │  + Prisma    │      │ (Optional)│ │
│  │   (Port)     │      │   (Port)     │      │  (Port)   │ │
│  └──────┬───────┘      └──────┬───────┘      └─────┬─────┘ │
│         │                     │                     │       │
│         └─────────────────────┼─────────────────────┘       │
│                               │                             │
│                    ┌──────────▼──────────┐                  │
│                    │   PostgreSQL DB     │                  │
│                    │   (Primary Store)   │                  │
│                    └──────────┬──────────┘                  │
│                               │                             │
│                    ┌──────────▼──────────┐                  │
│                    │      Redis          │                  │
│                    │  (Cache, Sessions)  │                  │
│                    └─────────────────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture Layers

### Frontend Architecture (Next.js 14+ - App Router)

#### Layer Structure - CMS Admin & Client App

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /app (App Router - Pages & Layouts)                 │  │
│  │  - (auth)/login, /register                           │  │
│  │  - (dashboard)/products, /orders, /users             │  │
│  │  - layout.tsx, loading.tsx, error.tsx                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /components (React Components)                       │  │
│  │  - /ui (shadcn/ui components)                        │  │
│  │  - /features (domain-specific components)            │  │
│  │  - /common (shared components)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /server (Server Actions & API Routes)               │  │
│  │  - actions/                                           │  │
│  │    ├── products.ts (createProduct, updateProduct)    │  │
│  │    ├── orders.ts (createOrder, updateOrderStatus)    │  │
│  │    └── auth.ts (login, register, sendOTP)            │  │
│  │  - services/                                          │  │
│  │    ├── product.service.ts                            │  │
│  │    ├── order.service.ts                              │  │
│  │    └── wallet.service.ts                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /app/api (API Routes - when needed)                 │  │
│  │  - /api/products/route.ts                            │  │
│  │  - /api/orders/route.ts                              │  │
│  │  - /api/webhooks/payment/route.ts                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /lib (Utilities, Helpers, Business Logic)            │  │
│  │  - validations/                                       │  │
│  │    ├── product.schema.ts (Zod schemas)               │  │
│  │    ├── order.schema.ts                               │  │
│  │    └── user.schema.ts                                │  │
│  │  - utils/                                             │  │
│  │    ├── format.ts (date, currency formatting)         │  │
│  │    ├── auth.ts (session helpers)                     │  │
│  │    └── constants.ts                                  │  │
│  │  - hooks/                                             │  │
│  │    ├── useCart.ts                                    │  │
│  │    ├── useWallet.ts                                  │  │
│  │    └── useOrder.ts                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /prisma (Database Client & Schema)                   │  │
│  │  - schema.prisma                                      │  │
│  │  - migrations/                                        │  │
│  │  - client.ts (singleton Prisma instance)             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /lib/db (Database Helpers & Repositories)            │  │
│  │  - repositories/                                      │  │
│  │    ├── product.repository.ts                         │  │
│  │    ├── order.repository.ts                           │  │
│  │    └── user.repository.ts                            │  │
│  │  - queries/ (complex queries)                        │  │
│  │    ├── dashboard.queries.ts                          │  │
│  │    └── report.queries.ts                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Next.js Frontend - Directory Structure

```typescript
src/
├── app/                          // App Router
│   ├── (auth)/                   // Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/              // Dashboard route group
│   │   ├── layout.tsx            // Dashboard layout with sidebar
│   │   ├── page.tsx              // Dashboard home
│   │   ├── products/
│   │   │   ├── page.tsx          // List products
│   │   │   ├── [id]/             // Dynamic route
│   │   │   │   └── page.tsx      // Product detail
│   │   │   └── new/
│   │   │       └── page.tsx      // Create product
│   │   ├── orders/
│   │   ├── users/
│   │   └── settings/
│   ├── api/                      // API Routes (when needed)
│   │   ├── products/
│   │   │   └── route.ts
│   │   ├── webhooks/
│   │   │   └── payment/
│   │   │       └── route.ts
│   │   └── health/
│   │       └── route.ts
│   ├── layout.tsx                // Root layout
│   └── error.tsx                 // Error boundary
│
├── components/                   // React Components
│   ├── ui/                       // shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── features/                 // Feature-specific components
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductList.tsx
│   │   ├── orders/
│   │   │   ├── OrderTable.tsx
│   │   │   ├── OrderStatus.tsx
│   │   │   └── OrderDetail.tsx
│   │   └── wallet/
│   │       ├── WalletBalance.tsx
│   │       └── TopUpForm.tsx
│   └── common/                   // Shared components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── Footer.tsx
│       └── LoadingSpinner.tsx
│
├── server/                       // Server-side code
│   ├── actions/                  // Server Actions
│   │   ├── products.ts
│   │   │   ├── createProduct()
│   │   │   ├── updateProduct()
│   │   │   └── deleteProduct()
│   │   ├── orders.ts
│   │   │   ├── createOrder()
│   │   │   ├── updateOrderStatus()
│   │   │   └── cancelOrder()
│   │   └── wallet.ts
│   │       ├── topUpWallet()
│   │       └── deductBalance()
│   └── services/                 // Business logic services
│       ├── product.service.ts
│       ├── order.service.ts
│       ├── wallet.service.ts
│       └── notification.service.ts
│
├── lib/                          // Utilities & helpers
│   ├── db/                       // Database layer
│   │   ├── repositories/
│   │   │   ├── product.repository.ts
│   │   │   ├── order.repository.ts
│   │   │   └── user.repository.ts
│   │   └── queries/
│   │       ├── dashboard.queries.ts
│   │       └── report.queries.ts
│   ├── validations/              // Zod schemas
│   │   ├── product.schema.ts
│   │   ├── order.schema.ts
│   │   └── user.schema.ts
│   ├── utils/                    // Helper functions
│   │   ├── format.ts
│   │   ├── auth.ts
│   │   └── constants.ts
│   ├── hooks/                    // Custom React hooks
│   │   ├── useCart.ts
│   │   ├── useWallet.ts
│   │   └── useOrder.ts
│   └── auth.ts                   // NextAuth configuration
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/                       // Static files
│   ├── images/
│   └── icons/
│
└── types/                        // TypeScript types
    ├── index.ts
    ├── product.ts
    ├── order.ts
    └── user.ts
```

---

### Backend Architecture (NestJS)

#### Layer Structure - NestJS API

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers (HTTP Endpoints)                         │  │
│  │  - @Controller(), @Get(), @Post(), @Put(), @Delete() │  │
│  │  - Request validation (DTOs)                          │  │
│  │  - Response transformation                            │  │
│  │  - Exception handling                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Gateways (WebSocket)                                 │  │
│  │  - @WebSocketGateway()                                │  │
│  │  - Real-time order updates                            │  │
│  │  - Notification broadcasting                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Guards (Authentication & Authorization)              │  │
│  │  - JwtAuthGuard                                       │  │
│  │  - RolesGuard (RBAC)                                  │  │
│  │  - ThrottlerGuard (Rate limiting)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Interceptors & Pipes                                 │  │
│  │  - TransformInterceptor (response format)             │  │
│  │  - ValidationPipe (DTO validation)                    │  │
│  │  - LoggingInterceptor                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware                                            │  │
│  │  - LoggerMiddleware                                   │  │
│  │  - CorsMiddleware                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services (Business Logic)                            │  │
│  │  - @Injectable()                                      │  │
│  │  - Domain logic implementation                        │  │
│  │  - Transaction management                             │  │
│  │  - Business rules validation                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Use Cases / Application Services                     │  │
│  │  - Complex business workflows                         │  │
│  │  - Orchestrate multiple services                      │  │
│  │  - Handle side effects                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Prisma Service (Database Client)                     │  │
│  │  - PrismaService extends PrismaClient                 │  │
│  │  - Transaction support                                │  │
│  │  - Connection pooling                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Repositories (Optional - Data abstraction)           │  │
│  │  - Abstract database operations                       │  │
│  │  - Complex queries encapsulation                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  External Services                                     │  │
│  │  - SMS Provider (Twilio, ESMS) - Optional for OTP     │  │
│  │  - Email Service (SendGrid, Nodemailer)               │  │
│  │  - Cloud Storage (AWS S3, Cloudinary) - Optional      │  │
│  │  - Payment Gateway (Future: VNPay, MoMo)              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Queue & Jobs (Bull Queue)                            │  │
│  │  - Email/SMS sending queues                           │  │
│  │  - Report generation                                  │  │
│  │  - Data cleanup jobs                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cache Layer (Redis)                                  │  │
│  │  - Session management                                 │  │
│  │  - Query caching                                      │  │
│  │  - Rate limiting storage                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### NestJS Backend - Directory Structure

```typescript
src/
├── main.ts                       // Application entry point
├── app.module.ts                 // Root module
│
├── modules/                      // Feature modules
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts    // POST /auth/login, /register
│   │   ├── auth.service.ts       // Login, JWT generation
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts   // CRUD for users
│   │   ├── users.service.ts      // Business logic
│   │   ├── users.repository.ts   // Data access (optional)
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── dto/
│   │
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── orders.gateway.ts     // WebSocket for real-time updates
│   │   └── dto/
│   │
│   ├── wallet/
│   │   ├── wallet.module.ts
│   │   ├── wallet.controller.ts
│   │   ├── wallet.service.ts     // Top-up, deduct, transactions
│   │   └── dto/
│   │
│   ├── payments/
│   │   ├── payments.module.ts
│   │   ├── payments.controller.ts // Internal payment processing
│   │   ├── payments.service.ts    // Process wallet transactions
│   │   └── dto/
│   │       ├── create-payment.dto.ts
│   │       └── payment-response.dto.ts
│   │   # Future: Payment gateway providers
│   │   # ├── providers/
│   │   # │   ├── vnpay.provider.ts
│   │   # │   ├── momo.provider.ts
│   │   # │   └── zalopay.provider.ts
│   │
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   ├── notifications.gateway.ts  // WebSocket
│   │   ├── processors/               // Bull Queue processors
│   │   │   ├── email.processor.ts
│   │   │   └── sms.processor.ts
│   │   └── providers/
│   │       ├── email.provider.ts
│   │       └── sms.provider.ts
│   │
│   └── reports/
│       ├── reports.module.ts
│       ├── reports.controller.ts
│       ├── reports.service.ts    // Generate Excel/PDF
│       └── dto/
│
├── shared/                       // Shared modules
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts     // Prisma client singleton
│   │   └── prisma.types.ts
│   │
│   ├── redis/
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   │
│   ├── config/
│   │   ├── config.module.ts
│   │   └── configuration.ts      // Environment config
│   │
│   └── queue/
│       ├── queue.module.ts
│       └── queue.service.ts      // Bull Queue setup
│
├── common/                       // Common utilities
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   │
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── prisma-exception.filter.ts
│   │
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   └── logging.interceptor.ts
│   │
│   ├── pipes/
│   │   └── validation.pipe.ts
│   │
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── throttler.guard.ts
│   │
│   └── interfaces/
│       ├── response.interface.ts
│       └── pagination.interface.ts
│
├── database/
│   ├── migrations/               // Prisma migrations
│   ├── seeds/                    // Database seeders
│   │   ├── user.seed.ts
│   │   └── product.seed.ts
│   └── schema.prisma
│
└── types/                        // TypeScript type definitions
    ├── express.d.ts
    └── custom.d.ts
```

---

### Data Flow Examples

#### Example 1: Create Order (Next.js Direct)

```
User Action (Client)
  → Server Action: createOrder() in /server/actions/orders.ts
    → Order Service: /server/services/order.service.ts
      → Prisma Client: prisma.order.create()
        → PostgreSQL Database
      → Return Order object
    → Return formatted response
  → UI Update (Optimistic or Revalidation)
```

#### Example 2: Process Internal Payment (Next.js or NestJS)

```
User Checkout with Wallet Balance
  → Server Action/Controller: processOrderPayment()
    → Wallet Service: checkBalance() and deductAmount()
      → Prisma Transaction: $transaction([
          wallet.update({ balance: balance - amount }),
          transaction.create({ type: 'PURCHASE', ... }),
          order.update({ status: 'CONFIRMED', paymentStatus: 'PAID' })
        ])
      → On Success:
        → Notification: Send order confirmation
        → Return order details
      → On Failure (Insufficient balance):
        → Rollback transaction
        → Return error message
    → Return payment result
```

#### Example 2b: Top-up Request (Manual Approval)

```
Parent Requests Top-up
  → Client: Submit top-up request (amount, proof of transfer)
    → Create TopUpRequest record (status: PENDING)
    → Notify admin via dashboard

Admin Approves Top-up
  → CMS Admin: Approve/Reject top-up request
    → If Approved:
      → Wallet Service: addBalance()
        → Prisma Transaction: $transaction([
            wallet.update({ balance: balance + amount }),
            transaction.create({ type: 'TOP_UP', ... }),
            topUpRequest.update({ status: 'APPROVED' })
          ])
      → Notification: Notify parent of successful top-up
    → If Rejected:
      → Update request status to REJECTED
      → Notification: Notify parent with reason
```

#### Example 3: Real-time Order Update (WebSocket)

```
POS Staff Updates Order Status
  → NestJS Controller: OrderController.updateStatus()
    → Order Service: updateOrderStatus()
      → Prisma: order.update()
      → WebSocket Gateway: broadcast order update
        → All connected clients receive event
          → Next.js Client: Update UI in real-time
    → Return success response
```

---

## Project Components

| Component       | Technology                 | Description                                  | Port |
| --------------- | -------------------------- | -------------------------------------------- | ---- |
| **CMS Admin**   | Next.js 14+ + Prisma       | Admin dashboard, management system (SSR/SSG) | 3000 |
| **Client App**  | Next.js 14+ + Prisma       | Customer-facing app (parents/students)       | 3001 |
| **Backend API** | NestJS + Prisma (optional) | Specialized APIs, webhooks, heavy processing | 4000 |
| **Database**    | PostgreSQL 15+             | Primary relational database                  | 5432 |
| **Cache**       | Redis 7+                   | Session store, caching layer                 | 6379 |

### Service Responsibilities

#### 1. CMS Admin (Next.js + Prisma)

- **Framework:** Next.js 14+ (App Router)
- **ORM:** Prisma Client
- **Features:**
  - Product, category, supplier management
  - Order and payment management
  - User/role management (Admin, Manager, Staff)
  - Dashboard and reports
  - Direct Prisma queries for CRUD operations
- **Auth:** NextAuth.js (email + password)
- **UI:** Tailwind CSS + shadcn/ui or similar

#### 2. Client App (Next.js + Prisma)

- **Framework:** Next.js 14+ (App Router)
- **ORM:** Prisma Client
- **Features:**
  - Product catalog, cart, checkout
  - Wallet management, top-up
  - Order placement and history
  - Parent-student linking
  - Profile and settings
- **Auth:** NextAuth.js (email/phone + password, optional OTP)
- **UI:** Tailwind CSS + mobile-responsive design
- **PWA:** Can be installed as Progressive Web App
- **Payment:** Internal wallet system only (no external gateways)

#### 3. Backend API (NestJS) — Optional/On-Demand

- **Framework:** NestJS + Prisma
- **Use Cases:**
  - Complex business logic (e.g., wallet transaction processing)
  - Real-time features (WebSocket/Socket.io for order updates)
  - Third-party integrations (SMS for OTP, email notifications)
  - Background jobs (Bull Queue + Redis for async tasks)
  - Future: External payment gateway webhooks receiver
- **Note:** Only used when Next.js API routes are insufficient

---

## Tech Stack

| Layer          | Technology                  | Notes                                  |
| -------------- | --------------------------- | -------------------------------------- |
| **Frontend**   | Next.js 14+, TypeScript     | App Router, SSR/SSG/ISR                |
| **Backend**    | Next.js API Routes + NestJS | Prisma ORM, layered architecture       |
| **Database**   | PostgreSQL 15+              | Relational data with Prisma migrations |
| **Cache**      | Redis 7+                    | Session storage, caching               |
| **Auth**       | NextAuth.js                 | JWT + session-based auth               |
| **ORM**        | Prisma 5+                   | Type-safe database client              |
| **Validation** | Zod                         | Schema validation                      |
| **Deployment** | Docker + Docker Compose     | Containerized services                 |
| **Monitoring** | Sentry (optional)           | Error tracking                         |

---

## Database Schema (PostgreSQL + Prisma)

### Core Entities

```prisma
// User Management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?   @unique
  passwordHash  String?
  role          Role      @default(PARENT)
  name          String
  avatar        String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  wallet        Wallet?
  students      Student[]
  orders        Order[]
  notifications Notification[]
  topUpRequests TopUpRequest[]
  approvedTopUps TopUpRequest[] @relation("TopUpApprover")
}

enum Role {
  ADMIN
  MANAGER
  STAFF
  PARENT
  STUDENT
}

// Student & Card
model Student {
  id          String   @id @default(cuid())
  name        String
  grade       String
  school      String
  cardNumber  String?  @unique
  parentId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  parent      User     @relation(fields: [parentId], references: [id])
  orders      Order[]
}

// Wallet
model Wallet {
  id          String   @id @default(cuid())
  userId      String   @unique
  balance     Decimal  @default(0) @db.Decimal(10, 2)
  isLocked    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
  transactions Transaction[]
}

// Products & Categories
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  image       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  products    Product[]
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  images      String[]
  categoryId  String
  supplierId  String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category    Category @relation(fields: [categoryId], references: [id])
  supplier    Supplier? @relation(fields: [supplierId], references: [id])
  orderItems  OrderItem[]
}

// Orders
model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique
  userId      String
  studentId   String?
  status      OrderStatus @default(PENDING)
  total       Decimal     @db.Decimal(10, 2)
  paymentMethod String
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  user        User        @relation(fields: [userId], references: [id])
  student     Student?    @relation(fields: [studentId], references: [id])
  items       OrderItem[]
  payment     Payment?
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  COMPLETED
  CANCELLED
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   String
  quantity    Int
  price       Decimal  @db.Decimal(10, 2)

  order       Order    @relation(fields: [orderId], references: [id])
  product     Product  @relation(fields: [productId], references: [id])
}

// Payment & Transactions
model Transaction {
  id          String          @id @default(cuid())
  walletId    String
  type        TransactionType
  amount      Decimal         @db.Decimal(10, 2)
  balanceBefore Decimal       @db.Decimal(10, 2)
  balanceAfter  Decimal       @db.Decimal(10, 2)
  description String?
  metadata    Json?
  createdAt   DateTime        @default(now())

  wallet      Wallet          @relation(fields: [walletId], references: [id])
}

enum TransactionType {
  TOP_UP
  PURCHASE
  REFUND
  ADJUSTMENT
}

// Top-up Requests (Manual Approval)
model TopUpRequest {
  id            String            @id @default(cuid())
  userId        String
  amount        Decimal           @db.Decimal(10, 2)
  status        TopUpStatus       @default(PENDING)
  proofImage    String?           // Upload proof of bank transfer
  notes         String?           // User notes
  adminNotes    String?           // Admin rejection reason
  approvedBy    String?           // Admin user ID
  processedAt   DateTime?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  user          User              @relation(fields: [userId], references: [id])
  approver      User?             @relation("TopUpApprover", fields: [approvedBy], references: [id])
}

enum TopUpStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## Authentication & Authorization

### Authentication Flow

#### CMS Admin (NextAuth.js)

- **Method:** Email + Password
- **Strategy:** Credentials provider
- **Session:** JWT-based (HttpOnly cookies)
- **Roles:** ADMIN, MANAGER, STAFF
- **Features:**
  - Email verification on registration
  - Password reset via email
  - Session timeout (8 hours)
  - Remember me option (30 days)

#### Client App (NextAuth.js)

- **Method:** Email/Phone + Password
- **Alternative:** Phone + OTP (optional for passwordless)
- **Strategy:** Credentials provider
- **Session:** JWT-based (HttpOnly cookies)
- **Roles:** PARENT, STUDENT
- **Features:**
  - Email/phone verification
  - Password reset
  - Optional OTP login (via SMS service)
  - Biometric login support (future)

### Authorization (RBAC)

- **Role-based Access Control** with hierarchical permissions
- **Permission levels:**
  - ADMIN: Full access to all resources
  - MANAGER: Read/write access to operational data
  - STAFF: Limited access to POS and orders
  - PARENT: Access to own data and children
  - STUDENT: Read-only access to own data

### API Security

- All API routes protected with NextAuth session check
- Role-based access control (RBAC) middleware
- Rate limiting (Redis-based): 100 req/min per IP
- CSRF protection enabled
- XSS prevention (Content Security Policy)
- SQL injection prevention (Prisma ORM parameterized queries)

---

## Docker Deployment

### Docker Compose Structure

```yaml
version: "3.9"

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: smart-canteen-db
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: smart_canteen
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: smart-canteen-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # CMS Admin (Next.js)
  cms:
    build:
      context: ./apps/cms
      dockerfile: Dockerfile
    container_name: smart-canteen-cms
    environment:
      - DATABASE_URL=postgresql://admin:secure_password@postgres:5432/smart_canteen
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  # Client App (Next.js)
  client:
    build:
      context: ./apps/client
      dockerfile: Dockerfile
    container_name: smart-canteen-client
    environment:
      - DATABASE_URL=postgresql://admin:secure_password@postgres:5432/smart_canteen
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3001
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    ports:
      - "3001:3000"
    depends_on:
      - postgres
      - redis

  # NestJS Backend (Optional)
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: smart-canteen-api
    environment:
      - DATABASE_URL=postgresql://admin:secure_password@postgres:5432/smart_canteen
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

---

## Project Structure

```
smart-canteen/
├── apps/
│   ├── cms/                    # Next.js Admin CMS
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities
│   │   │   └── server/        # Server actions
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── client/                 # Next.js Client App
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── server/
│   │   ├── prisma/
│   │   │   └── schema.prisma  (shared schema)
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── api/                    # NestJS Backend (optional)
│       ├── src/
│       │   ├── modules/
│       │   ├── shared/
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma  (shared schema)
│       ├── Dockerfile
│       └── package.json
│
├── packages/                   # Shared packages (optional)
│   ├── prisma/                # Shared Prisma schema
│   ├── types/                 # Shared TypeScript types
│   └── ui/                    # Shared UI components
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## User Roles & Features

| Role        | Access                   | Features                                              |
| ----------- | ------------------------ | ----------------------------------------------------- |
| **ADMIN**   | Full system access (CMS) | All management features, system config, reports       |
| **MANAGER** | Oversight access (CMS)   | View reports, manage products, orders, staff          |
| **STAFF**   | Operations access (CMS)  | Process orders, manage POS (can be separate app)      |
| **PARENT**  | Client app               | Top-up wallet, pre-order, view history, link students |
| **STUDENT** | Client app (limited)     | View menu, track own orders (card-linked)             |

---

## Feature Breakdown

### Client App (Next.js)

1. **Authentication**
   - Email + Password login
   - Phone + Password login (optional)
   - Email/Phone + OTP passwordless login (optional)
2. **Home & Browse**
   - Product catalog with filters
   - Search functionality
   - Category navigation
3. **Shopping**
   - Product details
   - Add to cart
   - Checkout flow
4. **Wallet & Payments**
   - View wallet balance
   - Top-up wallet (admin-approved manual top-up)
   - Transaction history (deposits, purchases, refunds)
   - Payment via wallet balance only (no external gateway)
   - Request top-up (send request to admin)
5. **Orders**
   - Pre-order meals
   - Order history
   - Order tracking (real-time)
6. **Student Management**
   - Link student cards
   - Order for children
   - Monitor child's purchases
7. **Profile**
   - Edit profile
   - Manage addresses
   - Notifications settings
   - Vouchers & promotions

### CMS Admin (Next.js)

1. **Dashboard**
   - Sales overview
   - Order statistics
   - Revenue charts
2. **Product Management**
   - Categories CRUD
   - Products CRUD
   - Stock management
   - Price adjustments
3. **Order Management**
   - View all orders
   - Update order status
   - Process refunds
   - Kitchen display system
4. **User Management**
   - Accounts (parents, students, staff)
   - Student-card linking
   - Role assignments
5. **Financial**
   - Wallet management (view all user wallets)
   - Manual top-up approval/rejection
   - Transaction logs (all wallet activities)
   - Payment reconciliation
   - Balance adjustments (with audit log)
   - Financial reports export (Excel/PDF)
6. **Settings**
   - School/POS locations
   - Suppliers
   - Vouchers/promotions
   - Notifications
   - System configuration

### Backend API (NestJS) - Optional

1. **Internal Payment Processing**
   - Wallet transaction processing (ACID transactions)
   - Top-up request handling
   - Payment validation and authorization
   - Transaction rollback on failure

   _Note: External payment gateways (VNPay, MoMo, ZaloPay) reserved for future implementation_

2. **Real-time Features**
   - WebSocket for order updates
   - Live notifications
3. **Background Jobs**
   - Email/SMS sending
   - Report generation
   - Data cleanup
4. **Third-party Integrations**
   - SMS OTP (Twilio, ESMS)
   - Push notifications (FCM)
   - Analytics

---

## Development Workflow

### 1. Initial Setup

```bash
# Clone repo
git clone <repo-url>
cd smart-canteen

# Install dependencies (if using pnpm workspace)
pnpm install

# Setup environment variables
cp .env.example .env

# Run Prisma migrations
cd apps/cms
npx prisma migrate dev
npx prisma generate

# Start Docker services
docker-compose up -d
```

### 2. Development Mode

```bash
# Run all services
docker-compose -f docker-compose.dev.yml up

# Or run individually
cd apps/cms && npm run dev      # Port 3000
cd apps/client && npm run dev   # Port 3001
cd apps/api && npm run start:dev # Port 4000
```

### 3. Production Deployment

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker exec -it smart-canteen-cms npx prisma migrate deploy
```

---

## Key Implementation Notes

### 1. Prisma Schema Sharing

- Maintain **one source of truth** for Prisma schema
- Option A: Monorepo with shared `packages/prisma`
- Option B: Duplicate schema but sync manually
- Use `prisma generate` to create client in each app

### 2. Next.js API Routes

- **Prefer API Routes** for simple CRUD operations
- Direct Prisma Client usage in Server Components
- Use Server Actions for mutations
- Only delegate to NestJS for complex logic

### 3. Authentication Strategy

- **NextAuth.js** handles all auth in Next.js apps
- **Simple credential-based authentication:**
  - CMS: Email + Password
  - Client: Email/Phone + Password
  - Optional: Phone + OTP for passwordless login
- Share JWT secret between services
- Redis stores sessions for consistency
- **No social login providers** (future consideration)

### 4. Real-time Updates

- **Option A:** Next.js with Server-Sent Events (SSE)
- **Option B:** NestJS WebSocket Gateway
- Use Redis Pub/Sub for cross-service events

### 5. Database Transactions (Critical for Wallet Operations)

- Use Prisma `$transaction` for all wallet operations
- **Example: Order Payment**
  ```typescript
  await prisma.$transaction([
    prisma.wallet.update({ where: { userId }, data: { balance: { decrement: amount } } }),
    prisma.transaction.create({ data: { walletId, type: 'PURCHASE', amount, ... } }),
    prisma.order.update({ where: { orderId }, data: { status: 'CONFIRMED' } })
  ]);
  ```
- Implement optimistic locking for critical updates
- Log all financial transactions in `Transaction` model with audit trail
- **Wallet balance validation:**
  - Always check sufficient balance before deduction
  - Use database-level constraints to prevent negative balance
  - Rollback entire transaction on any failure

### 6. File Storage

- **Static files:** Store in `public/` or cloud storage (S3, Cloudinary)
- **Uploads:** Handle via Next.js API routes
- Store URLs in PostgreSQL

---

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use Docker secrets in production
2. **Database**
   - Enable SSL for PostgreSQL in production
   - Regular backups (pg_dump)
   - Use connection pooling (PgBouncer)
3. **API**
   - Rate limiting per user/IP
   - Input validation with Zod
   - SQL injection prevention (Prisma ORM)
4. **Authentication**
   - Secure password hashing (bcrypt with salt rounds 10-12)
   - Session timeout: 8 hours (CMS), 24 hours (Client)
   - OTP expiration: 5 minutes (if used)
   - Account lockout after 5 failed login attempts
5. **Internal Wallet & Payments**
   - **Manual top-up approval workflow** (prevents fraud)
   - Transaction idempotency (prevent double-spending)
   - Atomic database transactions (ACID compliance)
   - Audit logging: Record all balance changes with before/after amounts
   - **Balance constraints:** Database check to prevent negative balance
   - Admin-only access to balance adjustments
   - Two-factor approval for large transactions (optional)

   **Future (External Payment Gateway):**
   - Webhook signature verification
   - Payment reconciliation with bank statements
   - PCI-DSS compliance considerations

---

## Summary

Smart Canteen is rebuilt as a **modern full-stack application** using:

- **Next.js 14+ (App Router)** for both CMS and Client (unified TypeScript/React)
- **Prisma ORM** with **PostgreSQL** for type-safe database access
- **NestJS** as optional backend for specialized features
- **Docker** for containerized deployment
- **NextAuth.js** for simple credential-based authentication (no social login)
- **Redis** for caching and sessions
- **Internal wallet system** with manual top-up approval (no external payment gateway integration)

This architecture provides:
✅ **Type safety** across the stack (TypeScript + Prisma)  
✅ **Developer experience** (hot reload, shared types)  
✅ **Scalability** (containerized, stateless services)  
✅ **Maintainability** (unified codebase, single language)  
✅ **Performance** (SSR/SSG, caching, connection pooling)  
✅ **Security** (RBAC, audit logs, ACID transactions for wallet operations)  
✅ **Simplicity** (no complex OAuth flows, no external payment gateway complexity)

### Payment System Approach

**Phase 1 (Current):** Internal wallet with manual top-up approval

- Parents request top-up by submitting transfer proof
- Admin reviews and approves/rejects
- All purchases deducted from wallet balance
- Simple, secure, no external dependencies

**Phase 2 (Future):** Integrate external payment gateways

- VNPay, MoMo, ZaloPay for automated top-up
- Webhook handling in NestJS backend
- Payment reconciliation and reporting
