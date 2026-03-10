# 🐳 Docker Setup Guide

Hướng dẫn chạy toàn bộ hệ thống Smart Canteen với Docker.

## 📦 Yêu cầu

- Docker Desktop (Windows/Mac) hoặc Docker Engine (Linux)
- Docker Compose v2.0+
- Git

## 🚀 Chạy Development Mode

### Cách 1: Sử dụng Docker Compose

```bash
# 1. Build và start tất cả services
docker-compose up -d

# 2. Xem logs
docker-compose logs -f

# 3. Xem logs của service cụ thể
docker-compose logs -f cms
docker-compose logs -f client
docker-compose logs -f api
```

### Cách 2: Sử dụng Makefile (đơn giản hơn)

```bash
# Start all services
make dev

# View all logs
make logs

# View specific service logs
make logs-cms
make logs-client
make logs-api

# Stop all services
make down

# Restart all services
make restart
```

### Các Service đang chạy:

- **CMS Admin**: http://localhost:3000
- **Client App**: http://localhost:3001
- **API**: http://localhost:4000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔐 Login Credentials

### CMS Admin (http://localhost:3000)

```
Admin: admin@smartcanteen.com / Admin@123
Manager: manager@smartcanteen.com / Manager@123
Staff: staff@smartcanteen.com / Staff@123
```

### Client App (http://localhost:3001)

```
Parent: parent@example.com / Parent@123
```

## 📝 Common Commands

### Quản lý Services

```bash
# Start services
make dev                 # Start all in dev mode
make prod               # Start all in prod mode

# Stop services
make down               # Stop all services

# Restart services
make restart            # Restart all
make restart-cms        # Restart CMS only
make restart-client     # Restart Client only
make restart-api        # Restart API only

# View logs
make logs               # All services
make logs-cms           # CMS only
make logs-client        # Client only
make logs-api           # API only
make logs-db            # Database only
```

### Database Operations

```bash
# Push schema to database
make db-push

# Run migrations
make db-migrate

# Seed database with sample data
make db-seed

# Open Prisma Studio (Database GUI)
make db-studio

# Access PostgreSQL shell
make shell-db
```

### Build & Clean

```bash
# Rebuild all images
make build

# Rebuild specific service
make build-cms
make build-client
make build-api

# Clean everything (containers, volumes, images)
make clean
```

### Shell Access

```bash
# Access container shell
make shell-cms          # CMS container
make shell-client       # Client container
make shell-api          # API container

# View running containers
make ps

# View resource usage
make stats
```

## 🔧 Configuration

### Environment Variables

Services sử dụng environment variables được định nghĩa trong `docker-compose.yml`:

**CMS & Client:**

- `DATABASE_URL`: Connection string to PostgreSQL
- `REDIS_URL`: Connection string to Redis
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js

**API:**

- `DATABASE_URL`: Connection string to PostgreSQL
- `JWT_SECRET`: Secret key for JWT
- `JWT_EXPIRES_IN`: Token expiration time
- `CORS_ORIGINS`: Allowed origins for CORS

### Volumes (Hot Reload)

Development mode sử dụng volumes để mount source code vào containers, cho phép hot reload:

```yaml
volumes:
  - ./apps/cms:/app/apps/cms # CMS source code
  - ./apps/client:/app/apps/client # Client source code
  - ./apps/api:/app/apps/api # API source code
  - ./packages:/app/packages # Shared packages
```

Khi bạn sửa code trên host, thay đổi sẽ tự động apply trong container.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network                          │
│  (smart-canteen-network)                                    │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   CMS Admin  │    │  Client App  │    │  NestJS API  │ │
│  │  (Next.js)   │    │  (Next.js)   │    │              │ │
│  │  Port: 3000  │    │  Port: 3001  │    │  Port: 4000  │ │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘ │
│         │                   │                   │          │
│         └───────────────────┼───────────────────┘          │
│                             │                              │
│         ┌───────────────────┴───────────────────┐          │
│         │                                       │          │
│  ┌──────▼───────┐                      ┌───────▼──────┐   │
│  │  PostgreSQL  │                      │    Redis     │   │
│  │  Port: 5432  │                      │  Port: 6379  │   │
│  └──────────────┘                      └──────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Service không start được

```bash
# Xem logs chi tiết
docker-compose logs -f <service-name>

# Restart service
docker-compose restart <service-name>

# Rebuild và restart
docker-compose up -d --build <service-name>
```

### Database connection error

```bash
# Kiểm tra PostgreSQL đang chạy
docker-compose ps postgres

# Xem logs database
make logs-db

# Restart database
docker-compose restart postgres
```

### Port already in use

```bash
# Kiểm tra process đang dùng port
# Windows PowerShell:
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :3000

# Kill process hoặc đổi port trong docker-compose.yml
```

### Rebuild từ đầu

```bash
# Stop và xóa tất cả
make clean

# Build lại images
make build

# Start lại
make dev
```

### Hot reload không hoạt động

Trên Windows, bạn có thể cần enable polling:

**Next.js (CMS/Client):**
Sửa `package.json`:

```json
"dev": "next dev --turbo"
```

**NestJS (API):**
File đã có `--watch` flag trong Dockerfile.dev

## 🍃 Production Deployment

### Build Production Images

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production
make prod
```

### Production vs Development

**Development (docker-compose.yml):**

- Hot reload enabled
- Source code mounted as volumes
- Development dependencies included
- Debug logging enabled

**Production (docker-compose.prod.yml):**

- Optimized builds
- No source code mounting
- Only production dependencies
- Minimal image size
- Security hardened

### Environment Variables for Production

Tạo file `.env.production`:

```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=change_this_strong_password
POSTGRES_DB=smart_canteen
DATABASE_URL=postgresql://admin:change_this_strong_password@postgres:5432/smart_canteen

# Redis
REDIS_PASSWORD=change_this_redis_password

# CMS
NEXTAUTH_URL_CMS=https://cms.yourdomain.com
NEXTAUTH_SECRET_CMS=your_super_secret_key_here

# Client
NEXTAUTH_URL_CLIENT=https://app.yourdomain.com
NEXTAUTH_SECRET_CLIENT=your_super_secret_key_here

# API
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://cms.yourdomain.com,https://app.yourdomain.com
```

Start production với env file:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 📊 Monitoring

### View Container Status

```bash
# List running containers
make ps

# View resource usage
make stats

# Health check status
docker-compose ps
```

### View Application Logs

```bash
# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f cms
```

## 🔄 Updates & Maintenance

### Update Dependencies

```bash
# Stop services
make down

# Update package.json files
# ...

# Rebuild images
make build

# Start services
make dev
```

### Database Migrations

```bash
# Create migration
docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm prisma migrate dev --name migration_name"

# Apply migrations
make db-migrate

# Seed database
make db-seed
```

### Backup & Restore

**Backup Database:**

```bash
docker-compose exec postgres pg_dump -U admin smart_canteen > backup.sql
```

**Restore Database:**

```bash
cat backup.sql | docker-compose exec -T postgres psql -U admin smart_canteen
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [NestJS Docker Documentation](https://docs.nestjs.com/faq/serverless)

## ⚡ Quick Reference

```bash
# Start
make dev                # Development mode
make prod               # Production mode

# Stop
make down              # Stop all services

# Database
make db-push           # Push schema
make db-seed           # Seed data
make db-studio         # Open Prisma Studio

# Logs
make logs              # All logs
make logs-cms          # CMS logs only

# Clean
make clean             # Remove everything

# Help
make help              # Show all commands
```

---

🎉 **Hệ thống đã sẵn sàng chạy với Docker!**
