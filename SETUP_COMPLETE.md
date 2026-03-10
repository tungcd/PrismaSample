# 🎉 Smart Canteen - Setup Complete!

Dự án Smart Canteen đã được tạo thành công với đầy đủ authentication/authorization cho tất cả ứng dụng!

## ✅ Đã hoàn thành

### 1. Monorepo Structure

- ✅ Root package.json với pnpm workspaces + Turborepo
- ✅ Turbo configuration cho parallel builds
- ✅ Environment variables setup (.env)

### 2. Database & Schema

- ✅ Docker Compose (PostgreSQL + Redis)
- ✅ Complete Prisma schema (15+ models)
  - User (5 roles: ADMIN, MANAGER, STAFF, PARENT, STUDENT)
  - Authentication (Session, VerificationToken)
  - Wallet system (Wallet, Transaction, TopUpRequest)
  - Products (Category, Supplier, Product)
  - Orders (Order, OrderItem)
  - School, Notification, Voucher
- ✅ Database migrations applied
- ✅ Seed data populated

### 3. CMS Admin App (Next.js - Port 3000)

- ✅ Next.js 14 with App Router
- ✅ NextAuth.js authentication (Credentials)
- ✅ Role-based access control (ADMIN, MANAGER, STAFF)
- ✅ Dashboard layout with sidebar navigation
- ✅ Login page with form validation
- ✅ Protected routes with middleware
- ✅ Shadcn/ui components (Button, Input, Card, Label)
- ✅ Tailwind CSS styling

**Features:**

- 📊 Dashboard Overview with statistics
- 👥 User management (role-based access)
- 🎓 Student management
- 🛒 Order management
- 📦 Product management
- 💰 Top-up request approval
- 🏫 School management
- ⚙️ Settings

### 4. Client App (Next.js - Port 3001)

- ✅ Next.js 14 with App Router
- ✅ NextAuth.js authentication (Credentials)
- ✅ Role-based access control (PARENT, STUDENT)
- ✅ Mobile-first responsive design
- ✅ Home page with wallet balance
- ✅ Student list with balances
- ✅ Login page
- ✅ Logout functionality

**Features:**

- 💳 Wallet balance display
- 💰 Top-up request
- 🍽️ Menu browsing (placeholder)
- 🛒 Order history (placeholder)
- 👨‍👩‍👧‍👦 Student management

### 5. NestJS API (Port 4000)

- ✅ NestJS 10 with TypeScript
- ✅ Prisma integration
- ✅ JWT Authentication (Passport)
- ✅ Role-based guards
- ✅ Auth module (login, verify token)
- ✅ Users module (profile, list users)
- ✅ Custom decorators (@CurrentUser, @Roles)
- ✅ Rate limiting (100 req/min)
- ✅ CORS configuration
- ✅ Class-validator for DTOs

**API Endpoints:**

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/verify` - Verify JWT
- `GET /api/v1/users/me` - Get current user (protected)
- `GET /api/v1/users` - Get all users (ADMIN/MANAGER only)

## 🚀 How to Run

### 1. Start All Services

```bash
# Start Docker (PostgreSQL + Redis)
docker-compose up -d

# Start all apps in development mode
pnpm dev
```

This will start:

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
```

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
