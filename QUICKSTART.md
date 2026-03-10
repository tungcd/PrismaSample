# 🚀 Quick Start Guide - Smart Canteen

Chọn một trong hai cách để chạy hệ thống:

## ⚡ Phương pháp 1: Docker (Khuyên dùng - Đơn giản nhất)

### Windows

```bash
# 1. Start tất cả services
docker-start.bat dev

# Chờ vài giây để services khởi động
# Sau đó truy cập:
# - CMS Admin: http://localhost:3000
# - Client App: http://localhost:3001
# - API: http://localhost:4000

# 2. Seed database (chỉ lần đầu)
docker-start.bat db-push
docker-start.bat db-seed

# 3. Xem logs
docker-start.bat logs

# 4. Stop services
docker-start.bat down
```

### Linux/Mac

```bash
# 1. Start tất cả services
./docker-start.sh dev

# 2. Seed database (chỉ lần đầu)
./docker-start.sh db-push
./docker-start.sh db-seed

# 3. Xem logs
./docker-start.sh logs

# 4. Stop services
./docker-start.sh down
```

### Login Credentials

**CMS Admin (http://localhost:3000):**

- Admin: `admin@smartcanteen.com` / `Admin@123`
- Manager: `manager@smartcanteen.com` / `Manager@123`

**Client App (http://localhost:3001):**

- Parent: `parent@example.com` / `Parent@123`

---

## 🔧 Phương pháp 2: Manual Setup (Cho developers)

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.0
- Docker (chỉ cần cho PostgreSQL + Redis)

### Bước 1: Install Dependencies

```bash
pnpm install
```

### Bước 2: Start Database Services

```bash
# Start PostgreSQL + Redis
docker-compose up postgres redis -d
```

### Bước 3: Setup Database

```bash
# Generate Prisma Client
cd packages/prisma
pnpm prisma generate

# Push schema to database
DATABASE_URL="postgresql://admin:secure_password@localhost:5432/smart_canteen?schema=public" pnpm prisma db push

# Seed database
DATABASE_URL="postgresql://admin:secure_password@localhost:5432/smart_canteen?schema=public" pnpm tsx prisma/seed.ts

cd ../..
```

### Bước 4: Start Applications

Mở 3 terminal riêng biệt:

**Terminal 1 - CMS Admin:**

```bash
cd apps/cms
pnpm dev
# Chạy trên http://localhost:3000
```

**Terminal 2 - Client App:**

```bash
cd apps/client
pnpm dev
# Chạy trên http://localhost:3001
```

**Terminal 3 - API:**

```bash
cd apps/api
pnpm dev
# Chạy trên http://localhost:4000
```

---

## 📊 So sánh

| Feature                   | Docker      | Manual          |
| ------------------------- | ----------- | --------------- |
| **Dễ setup**              | ⭐⭐⭐⭐⭐  | ⭐⭐⭐          |
| **Một lệnh start tất cả** | ✅          | ❌              |
| **Hot reload**            | ✅          | ✅              |
| **Cần install Node.js**   | ❌          | ✅              |
| **Tốc độ hot reload**     | Bình thường | Nhanh hơn       |
| **Dễ quản lý**            | ⭐⭐⭐⭐⭐  | ⭐⭐⭐          |
| **Production ready**      | ✅          | Cần config thêm |

## 🎯 Khuyến nghị

- **Cho developers mới/testing**: Dùng Docker
- **Cho development chuyên sâu**: Manual setup sẽ có hot reload nhanh hơn
- **Cho production**: Dùng Docker

## 🐛 Troubleshooting

### Port đã được sử dụng

```bash
# Kiểm tra port nào đang chạy
# Windows:
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :3000

# Giải pháp: Stop process đó hoặc đổi port
```

### Docker không start được

```bash
# Xem logs chi tiết
docker-compose logs -f

# Rebuild images
docker-compose build --no-cache

# Start lại
docker-compose up -d
```

### Database connection error

```bash
# Kiểm tra PostgreSQL
docker-compose ps postgres

# Restart database
docker-compose restart postgres
```

## 📚 Tài liệu chi tiết

- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Hướng dẫn Docker đầy đủ
- [README.md](README.md) - Documentation chính
- [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - Setup guide

---

**Happy Coding! 🎉**
