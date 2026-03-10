# Smart Canteen - Monorepo

Hệ thống quản lý căng-tin thông minh với CMS Admin, Client App và API Backend.

## 🏗️ Cấu trúc dự án

```
smart-canteen/
├── apps/
│   ├── cms/          # CMS Admin (Next.js - port 3000)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   │   │   │   ├── dashboard/                # Dashboard pages (protected)
│   │   │   │   ├── login/                    # Login page
│   │   │   │   └── unauthorized/             # Unauthorized page
│   │   │   ├── components/
│   │   │   │   ├── dashboard/                # Dashboard components
│   │   │   │   └── ui/                       # Shadcn/ui components
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts                   # NextAuth config
│   │   │   │   └── utils.ts                  # Utility functions
│   │   │   ├── types/                        # TypeScript types
│   │   │   └── middleware.ts                 # Auth middleware
│   │   └── package.json
│   ├── client/       # Client App (Next.js - port 3001)
│   │   └── (similar structure to CMS)
│   └── api/          # API Backend (NestJS - port 4000)
│       ├── src/
│       │   ├── auth/                         # Authentication module
│       │   │   ├── guards/                   # JWT & Roles guards
│       │   │   ├── strategies/               # Passport strategies
│       │   │   └── decorators/               # Custom decorators
│       │   ├── users/                        # Users module
│       │   ├── prisma/                       # Prisma service
│       │   ├── app.module.ts
│       │   └── main.ts
│       └── package.json
├── packages/
│   ├── prisma/       # Shared Prisma Schema
│   │   ├── prisma/
│   │   │   ├── schema.prisma                 # Database schema
│   │   │   └── seed.ts                       # Database seeder
│   │   └── index.ts
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
├── docker-compose.yml
├── docker-compose.prod.yml
├── docker-start.sh       # Helper script (Linux/Mac)
├── docker-start.bat      # Helper script (Windows)
├── Makefile
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 🐳 Quick Start với Docker (Khuyên dùng)

**Cách nhanh nhất để chạy toàn bộ hệ thống:**

### Windows:

```bash
# Start tất cả services
docker-start.bat dev

# Xem logs
docker-start.bat logs

# Stop services
docker-start.bat down
```

### Linux/Mac:

```bash
# Start tất cả services
./docker-start.sh dev

# Xem logs
./docker-start.sh logs

# Stop services
./docker-start.sh down
```

### Hoặc dùng Docker Compose trực tiếp:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Sau khi start, truy cập:**

- 🖥️ **CMS Admin**: http://localhost:3000 (admin@smartcanteen.com / Admin@123)
- 📱 **Client App**: http://localhost:3001 (parent@example.com / Parent@123)
- 🔌 **API**: http://localhost:4000

**Xem hướng dẫn chi tiết:** [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

## 🚀 Getting Started (Manual Setup)

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.0
- Docker & Docker Compose

### Installation

1. Clone the repository

2. Install dependencies:

```bash
pnpm install
```

3. Start PostgreSQL & Redis:

```bash
docker-compose up -d
```

4. Generate Prisma Client:

```bash
pnpm db:generate
```

5. Run database migrations:

```bash
pnpm db:push
```

6. Seed the database:

```bash
pnpm db:seed
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

Or run individually:

```bash
pnpm dev --filter=@smart-canteen/cms      # CMS on http://localhost:3000
pnpm dev --filter=@smart-canteen/client   # Client on http://localhost:3001
pnpm dev --filter=@smart-canteen/api      # API on http://localhost:4000
```

## 🔐 Authentication & Authorization

### CMS Admin (NextAuth.js)

- **Roles**: ADMIN, MANAGER, STAFF
- **Login**: Email + Password
- **Session**: JWT (30 days)
- **Protected Routes**: All dashboard pages require authentication
- **Middleware**: Automatic redirect to /login if not authenticated

### Client App (NextAuth.js)

- **Roles**: PARENT, STUDENT
- **Login**: Email + Password
- **Session**: JWT (30 days)
- **Protected Routes**: All pages except /login
- **Mobile-first Design**: Optimized for mobile devices

### NestJS API (JWT)

- **Strategy**: Passport JWT
- **Guards**: JwtAuthGuard, RolesGuard
- **Decorators**: @CurrentUser(), @Roles()
- **Endpoints**:
  - `POST /api/v1/auth/login` - Login with email/password
  - `POST /api/v1/auth/verify` - Verify JWT token
  - `GET /api/v1/users/me` - Get current user profile (protected)
  - `GET /api/v1/users` - Get all users (ADMIN, MANAGER only)

## 📦 Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Auth**: NextAuth.js v4
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend

- **Framework**: NestJS 10
- **Language**: TypeScript
- **Auth**: Passport JWT + Local
- **Validation**: class-validator
- **Rate Limiting**: @nestjs/throttler

### Database

- **Database**: PostgreSQL 15
- **ORM**: Prisma 5
- **Cache**: Redis 7

### DevOps

- **Monorepo**: pnpm workspaces + Turborepo
- **Containerization**: Docker + Docker Compose

## 🔑 Default Credentials

### CMS Admin (http://localhost:3000)

- **Admin**: `admin@smartcanteen.com` / `Admin@123`
- **Manager**: `manager@smartcanteen.com` / `Manager@123`
- **Staff**: `staff@smartcanteen.com` / `Staff@123`

### Client App (http://localhost:3001)

- **Parent**: `parent@example.com` / `Parent@123`

### API Testing

Use the same credentials with `POST http://localhost:4000/api/v1/auth/login`

## 📝 Available Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm start` - Start all apps in production mode
- `pnpm lint` - Lint all apps

### Database

- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push database schema (development)
- `pnpm db:migrate` - Run migrations (production)
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Prisma Studio (database GUI)
- `pnpm db:reset` - Reset database

### Per-App

```bash
# CMS Admin
pnpm --filter=@smart-canteen/cms dev
pnpm --filter=@smart-canteen/cms build

# Client App
pnpm --filter=@smart-canteen/client dev
pnpm --filter=@smart-canteen/client build

# API
pnpm --filter=@smart-canteen/api dev
pnpm --filter=@smart-canteen/api build
```

## 🐳 Docker Services

- **PostgreSQL**: `localhost:5432`
  - Username: `admin`
  - Password: `secure_password`
  - Database: `smart_canteen`

- **Redis**: `localhost:6379`

To stop services:

```bash
docker-compose down
```

To view logs:

```bash
docker-compose logs -f
```

## 🗄️ Database Schema

Key models:

- **User**: Authentication & user management (5 roles)
- **Student**: Student information linked to parent
- **Wallet**: Internal wallet for each student
- **Transaction**: Wallet transaction history
- **TopUpRequest**: Manual top-up approval workflow
- **Product**: Food menu items with nutritional info
- **Order**: Food orders with payment status
- **Category**: Product categories
- **Supplier**: Product suppliers
- **School**: School information
- **Voucher**: Discount vouchers
- **Notification**: Push notifications

See [packages/prisma/schema.prisma](packages/prisma/schema.prisma) for full schema.

## 🧪 Testing

Seed data includes:

- 4 users (1 admin, 1 manager, 1 staff, 1 parent)
- 2 students
- 1 wallet with 500,000 VND
- 4 categories
- 11 products (Vietnamese food items)
- 1 school

## 📚 Additional Resources

- [Business Requirements](bussiness.md) - Detailed system architecture
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [NextAuth.js Documentation](https://next-auth.js.org)

## 🎯 Next Steps (Future Development)

- [ ] Implement product management CRUD
- [ ] Implement order management system
- [ ] Implement top-up request approval workflow
- [ ] Add real-time notifications (Socket.io)
- [ ] Add SMS/Email notifications
- [ ] Implement voucher system
- [ ] Add analytics dashboard
- [ ] Implement report generation
- [ ] Add PWA support for client app
- [ ] Setup CI/CD pipeline

## 📄 License

Private project - All rights reserved

---

## 📖 Additional Documentation

- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Complete Docker setup guide
- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Setup completion guide
- **[bussiness.md](bussiness.md)** - Business requirements and architecture
