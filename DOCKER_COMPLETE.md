# ✅ Smart Canteen - Docker Đã Hoàn Tất!

Hệ thống Smart Canteen đã được Dockerized hoàn chỉnh! 🎉

## 📦 Đã tạo

### Docker Files

1. **Dockerfile.dev** (Development - Hot Reload)
   - ✅ `apps/cms/Dockerfile.dev` - CMS Admin
   - ✅ `apps/client/Dockerfile.dev` - Client App
   - ✅ `apps/api/Dockerfile.dev` - NestJS API

2. **Dockerfile** (Production - Optimized)
   - ✅ `apps/cms/Dockerfile` - Multi-stage build cho CMS
   - ✅ `apps/client/Dockerfile` - Multi-stage build cho Client
   - ✅ `apps/api/Dockerfile` - Multi-stage build cho API

3. **Docker Compose**
   - ✅ `docker-compose.yml` - Development configuration
   - ✅ `docker-compose.prod.yml` - Production configuration

4. **Helper Scripts**
   - ✅ `docker-start.bat` - Windows helper script
   - ✅ `docker-start.sh` - Linux/Mac helper script
   - ✅ `Makefile` - Make commands cho power users

5. **Configuration**
   - ✅ `.dockerignore` - Ignore files for Docker build
   - ✅ Updated `next.config.js` - Added `output: 'standalone'`

6. **Documentation**
   - ✅ `DOCKER_SETUP.md` - Complete Docker guide
   - ✅ `QUICKSTART.md` - Quick start guide
   - ✅ Updated `README.md` - Added Docker section

## 🚀 Cách sử dụng

### Khởi động siêu nhanh (Windows):

```bash
# 1. Start tất cả
docker-start.bat dev

# 2. Setup database (chỉ lần đầu)
docker-start.bat db-push
docker-start.bat db-seed

# 3. Truy cập
# - CMS: http://localhost:3000
# - Client: http://localhost:3001
# - API: http://localhost:4000
```

### Khởi động siêu nhanh (Linux/Mac):

```bash
# 1. Start tất cả
./docker-start.sh dev

# 2. Setup database (chỉ lần đầu)
./docker-start.sh db-push
./docker-start.sh db-seed

# 3. Truy cập
# - CMS: http://localhost:3000
# - Client: http://localhost:3001
# - API: http://localhost:4000
```

### Hoặc dùng Docker Compose:

```bash
# Start
docker-compose up -d

# Setup DB (lần đầu)
docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm prisma db push"
docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm tsx prisma/seed.ts"

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🔑 Login Credentials

### CMS Admin (http://localhost:3000)

```
Admin:   admin@smartcanteen.com   / Admin@123
Manager: manager@smartcanteen.com / Manager@123
Staff:   staff@smartcanteen.com   / Staff@123
```

### Client App (http://localhost:3001)

```
Parent: parent@example.com / Parent@123
```

## 🎯 Features

### Development Mode

- ✅ **Hot Reload**: Code changes tự động apply
- ✅ **Volume Mounting**: Source code được mount vào containers
- ✅ **Fast Restart**: Không cần rebuild khi sửa code
- ✅ **Full Logging**: Xem logs real-time

### Production Mode

- ✅ **Multi-stage Build**: Images siêu nhỏ gọn
- ✅ **Optimized**: Only production dependencies
- ✅ **Security**: Non-root users
- ✅ **Health Checks**: Auto restart if service fails

### Services

- ✅ **PostgreSQL 15**: Database với health check
- ✅ **Redis 7**: Cache & session storage
- ✅ **CMS Admin**: Next.js 14 với NextAuth
- ✅ **Client App**: Next.js 14 mobile-first
- ✅ **NestJS API**: REST API với JWT

## 📊 Architecture

```
┌─────────────────────────────────────────────┐
│         Docker Network (Bridge)             │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   CMS    │  │  Client  │  │   API    │ │
│  │ Port 3000│  │ Port 3001│  │ Port 4000│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │        │
│       └─────────────┼─────────────┘        │
│                     │                      │
│       ┌─────────────┴─────────────┐        │
│       │                           │        │
│  ┌────▼─────┐              ┌─────▼────┐   │
│  │PostgreSQL│              │  Redis   │   │
│  │Port 5432 │              │Port 6379 │   │
│  └──────────┘              └──────────┘   │
└─────────────────────────────────────────────┘
```

## 🛠️ Common Commands

### Helper Scripts (Đơn giản nhất)

**Windows:**

```bash
docker-start.bat dev      # Start development
docker-start.bat prod     # Start production
docker-start.bat logs     # View logs
docker-start.bat down     # Stop all
docker-start.bat build    # Rebuild images
docker-start.bat clean    # Remove all
docker-start.bat db-push  # Push schema
docker-start.bat db-seed  # Seed data
```

**Linux/Mac:**

```bash
./docker-start.sh dev      # Start development
./docker-start.sh prod     # Start production
./docker-start.sh logs     # View logs
./docker-start.sh down     # Stop all
./docker-start.sh build    # Rebuild images
./docker-start.sh clean    # Remove all
./docker-start.sh db-push  # Push schema
./docker-start.sh db-seed  # Seed data
```

### Makefile Commands (Power users)

```bash
make dev          # Start development
make prod         # Start production
make logs         # View all logs
make logs-cms     # View CMS logs
make logs-api     # View API logs
make down         # Stop all
make build        # Rebuild images
make clean        # Remove all
make db-push      # Push schema
make db-seed      # Seed data
make shell-cms    # Open CMS shell
make shell-api    # Open API shell
make help         # Show all commands
```

### Docker Compose (Manual)

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Rebuild
docker-compose build --no-cache

# View status
docker-compose ps

# Restart specific service
docker-compose restart cms
docker-compose restart client
docker-compose restart api
```

## 📁 File Structure

```
smart-canteen/
├── apps/
│   ├── cms/
│   │   ├── Dockerfile          # Production build
│   │   ├── Dockerfile.dev      # Development build
│   │   └── ...
│   ├── client/
│   │   ├── Dockerfile
│   │   ├── Dockerfile.dev
│   │   └── ...
│   └── api/
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       └── ...
├── docker-compose.yml          # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── docker-start.bat            # Windows helper
├── docker-start.sh             # Linux/Mac helper
├── Makefile                    # Make commands
├── .dockerignore               # Docker ignore patterns
├── DOCKER_SETUP.md             # Complete Docker guide
├── QUICKSTART.md               # Quick start guide
└── README.md                   # Main documentation
```

## 🎓 Learning Resources

1. **[QUICKSTART.md](QUICKSTART.md)** - Bắt đầu nhanh nhất
2. **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Hướng dẫn Docker đầy đủ
3. **[README.md](README.md)** - Documentation chính
4. **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Setup guide

## 💡 Tips & Best Practices

### Development

1. **Hot Reload**: Code changes tự động apply, không cần restart
2. **Logs**: Dùng `docker-compose logs -f` để xem logs real-time
3. **Shell Access**: Dùng `make shell-cms` hoặc `make shell-api` để vào container
4. **Database GUI**: Chạy `make db-studio` để mở Prisma Studio

### Production

1. **Environment Variables**: Luôn dùng file `.env.production`
2. **Secrets**: Đổi tất cả secret keys thành strong passwords
3. **Volumes**: Backup volumes thường xuyên
4. **Monitoring**: Setup monitoring cho containers
5. **Updates**: Rebuild images khi có changes

### Troubleshooting

```bash
# Container không start
docker-compose logs -f <service-name>

# Port bị chiếm
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Database connection error
docker-compose restart postgres

# Rebuild từ đầu
make clean
make build
make dev
```

## 🔄 Update Workflow

Khi có thay đổi code:

**Development Mode:**

1. Sửa code → Save
2. Hot reload tự động apply ✅
3. Không cần làm gì thêm!

**Khi thêm dependencies:**

1. Stop services: `docker-compose down`
2. Rebuild images: `docker-compose build`
3. Start lại: `docker-compose up -d`

**Production Deployment:**

1. Build images: `docker-compose -f docker-compose.prod.yml build`
2. Push to registry (optional)
3. Deploy: `docker-compose -f docker-compose.prod.yml up -d`

## ✨ Advantages

### So với manual setup:

✅ **Một lệnh start tất cả** - Không cần mở 3-4 terminal
✅ **Consistent environment** - Giống nhau trên mọi máy
✅ **Không cần install Node.js** - Mọi thứ trong Docker
✅ **Easy cleanup** - Xóa sạch với `make clean`
✅ **Production ready** - Deploy trực tiếp
✅ **Team collaboration** - Dễ onboard members mới

### Development Features:

✅ **Hot reload** - Code changes tự động apply
✅ **Volume mounting** - Source code được mount
✅ **Fast restart** - Không cần rebuild
✅ **Isolated services** - Mỗi service riêng biệt
✅ **Network isolation** - Services communicate qua Docker network

## 🎯 Next Steps

Hệ thống đã sẵn sàng! Bạn có thể:

1. ✅ **Start development** với `docker-start.bat dev` hoặc `./docker-start.sh dev`
2. ✅ **Viết code mới** - Hot reload tự động hoạt động
3. ✅ **Test features** - Tất cả đã được setup
4. ✅ **Deploy production** - Dùng `docker-compose.prod.yml`

## 🎉 Kết luận

Hệ thống Smart Canteen đã được Dockerized hoàn chỉnh với:

- ✅ Development mode (hot reload)
- ✅ Production mode (optimized)
- ✅ Helper scripts (Windows + Linux/Mac)
- ✅ Makefile commands
- ✅ Complete documentation

**Chỉ cần 1 lệnh untuk start tất cả! 🚀**

```bash
# Windows
docker-start.bat dev

# Linux/Mac
./docker-start.sh dev
```

---

**Happy Dockering! 🐳**
