@echo off
REM Smart Canteen - Docker Helper Script for Windows

if "%1"=="" goto help
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="build" goto build
if "%1"=="clean" goto clean
if "%1"=="db-push" goto db-push
if "%1"=="db-seed" goto db-seed
goto help

:dev
echo Starting all services in development mode...
docker-compose up -d
docker-compose ps
echo.
echo Services started:
echo - CMS Admin: http://localhost:3000
echo - Client App: http://localhost:3001
echo - API: http://localhost:4000
echo.
echo View logs: docker-start.bat logs
goto end

:prod
echo Starting all services in production mode...
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml ps
goto end

:down
echo Stopping all services...
docker-compose down
docker-compose -f docker-compose.prod.yml down
goto end

:logs
docker-compose logs -f
goto end

:build
echo Building all Docker images...
docker-compose build --no-cache
goto end

:clean
echo WARNING: This will remove all containers, volumes, and images!
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    docker-compose down -v --rmi all
    docker-compose -f docker-compose.prod.yml down -v --rmi all
    echo Cleanup completed.
)
goto end

:db-push
echo Pushing database schema...
docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm prisma db push"
goto end

:db-seed
echo Seeding database...
docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm tsx prisma/seed.ts"
goto end

:help
echo Smart Canteen - Docker Helper
echo.
echo Usage: docker-start.bat [command]
echo.
echo Commands:
echo   dev       Start all services in development mode
echo   prod      Start all services in production mode
echo   down      Stop all services
echo   logs      View logs from all services
echo   build     Rebuild all Docker images
echo   clean     Remove all containers, volumes, and images
echo   db-push   Push database schema
echo   db-seed   Seed database with sample data
echo.
echo Examples:
echo   docker-start.bat dev      # Start development
echo   docker-start.bat logs     # View logs
echo   docker-start.bat down     # Stop services
goto end

:end
