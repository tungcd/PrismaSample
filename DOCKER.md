# Docker Development Environment

## 🚀 Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📦 Services

| Service    | URL                   | Port |
| ---------- | --------------------- | ---- |
| CMS Admin  | http://localhost:3000 | 3000 |
| Client App | http://localhost:3001 | 3001 |
| API        | http://localhost:4000 | 4000 |
| PostgreSQL | localhost:5432        | 5432 |
| Redis      | localhost:6379        | 6379 |

## ✅ Fixed Issues

### Prisma + Alpine Linux + OpenSSL 3.x

**Problem:** Prisma was trying to load OpenSSL 1.1.x binary on Alpine Linux which has OpenSSL 3.x

**Solution:**

1. Install `openssl` package (not just `openssl-dev`) for version detection
2. Set `PRISMA_QUERY_ENGINE_LIBRARY` environment variable to force use of OpenSSL 3.x binary
3. Use `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` in Prisma schema

### NPM Workspace Migration

Converted from `pnpm workspaces` to standalone npm projects because `workspace:*` protocol is not compatible with npm.

### Dev Mode Configuration

- `restart: "no"` - Don't auto-restart on crashes for easier debugging
- `WATCHPACK_POLLING=true` - Enable file watching in Docker containers
- `CHOKIDAR_USEPOLLING=true` - Alternative file watcher for Docker
- `NO_COLOR=true` - Clean logs without ANSI colors

## 🔧 Useful Commands

```bash
# Restart specific service
docker-compose restart api

# View logs for specific service
docker logs smart-canteen-api -f

# Execute command in container
docker exec smart-canteen-api sh -c "npm run migration"

# Rebuild after Dockerfile changes
docker-compose up -d --build

# Check container status
docker-compose ps

# Remove volumes (clean slate)
docker-compose down -v
```

## 🗄️ Database Management

### Initial Setup (First Time Only)

```bash
# 1. Run migrations to create database tables
docker exec smart-canteen-api sh -c "npx prisma migrate dev --name init"

# 2. Rebuild bcrypt (required for Alpine Linux)
docker exec smart-canteen-api sh -c "npm rebuild bcrypt --build-from-source"

# 3. Seed database with test data
docker exec smart-canteen-api sh -c "cd prisma && tsx seed.ts"
```

### Default Login Credentials

After seeding, you can login with:

**Admin (CMS - http://localhost:3000)**

- Email: `admin@smartcanteen.com`
- Password: `Admin@123`

**Manager (CMS)**

- Email: `manager@smartcanteen.com`
- Password: `Admin@123`

**Staff (CMS)**

- Email: `staff@smartcanteen.com`
- Password: `Staff@123`

**Parent (Client App - http://localhost:3001)**

- Email: `parent@example.com`
- Password: `Parent@123`
- Wallet Balance: 500,000 VND

### Seed Data Includes:

- ✅ 4 Users (Admin, Manager, Staff, Parent)
- ✅ 1 Wallet with 500,000 VND
- ✅ 2 Students (linked to parent)
- ✅ 4 Categories (Breakfast, Lunch, Snacks, Drinks)
- ✅ 11 Products across categories
- ✅ 1 Supplier
- ✅ 1 School

### Common Database Commands

```bash
# Access PostgreSQL CLI
docker exec -it smart-canteen-db psql -U admin -d smart_canteen

# Run new migrations
docker exec smart-canteen-api sh -c "npx prisma migrate dev"

# Reset database (WARNING: deletes all data)
docker exec smart-canteen-api sh -c "npx prisma migrate reset"

# Seed database again
docker exec smart-canteen-api sh -c "cd prisma && tsx seed.ts"

# Open Prisma Studio (database GUI)
docker exec -it smart-canteen-api sh -c "npx prisma studio"

# View all tables
docker exec smart-canteen-db psql -U admin -d smart_canteen -c "\dt"

# Count users
docker exec smart-canteen-db psql -U admin -d smart_canteen -c "SELECT COUNT(*) FROM \"User\";"

# Count products
docker exec smart-canteen-db psql -U admin -d smart_canteen -c "SELECT COUNT(*) FROM \"Product\";"
```

## 🐛 Troubleshooting

### Prisma OpenSSL Error

If you see "Error loading shared library libssl.so.1.1", ensure:

- `openssl` package is installed in container
- `PRISMA_QUERY_ENGINE_LIBRARY` env var is set correctly
- Schema has correct `binaryTargets`

### Hot Reload Not Working

- Check `WATCHPACK_POLLING` and `CHOKIDAR_USEPOLLING` are set
- Verify volumes are mounted correctly
- On Windows, ensure volumes use correct path separator

### Port Already in Use

```bash
# Windows - find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
ports:
  - "3002:3000"  # Map to different host port
```

### Bcrypt Segmentation Fault

If you get segfault errors when running seed or using bcrypt in Alpine Linux:

```bash
# Rebuild bcrypt from source in the container
docker exec smart-canteen-api sh -c "npm rebuild bcrypt --build-from-source"
```

This is already done during container startup, but may be needed after npm installs.

## 📝 Notes

- All containers use Alpine Linux for smaller image size
- Build tools (python3, make, g++) are needed for native modules like bcrypt
- Each app has its own Prisma schema copy (no shared packages)
- Node modules are volume-mounted to persist between rebuilds
