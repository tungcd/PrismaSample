#!/bin/bash
# Smart Canteen - Docker Helper Script for Linux/Mac

set -e

show_help() {
    cat << EOF
Smart Canteen - Docker Helper

Usage: ./docker-start.sh [command]

Commands:
  dev       Start all services in development mode
  prod      Start all services in production mode
  down      Stop all services
  logs      View logs from all services
  build     Rebuild all Docker images
  clean     Remove all containers, volumes, and images
  db-push   Push database schema
  db-seed   Seed database with sample data
  status    Show status of all services
  restart   Restart all services

Examples:
  ./docker-start.sh dev      # Start development
  ./docker-start.sh logs     # View logs
  ./docker-start.sh down     # Stop services
EOF
}

case "$1" in
    dev)
        echo "Starting all services in development mode..."
        docker-compose up -d
        docker-compose ps
        echo ""
        echo "Services started:"
        echo "- CMS Admin: http://localhost:3000"
        echo "- Client App: http://localhost:3001"
        echo "- API: http://localhost:4000"
        echo ""
        echo "View logs: ./docker-start.sh logs"
        ;;
    prod)
        echo "Starting all services in production mode..."
        docker-compose -f docker-compose.prod.yml up -d
        docker-compose -f docker-compose.prod.yml ps
        ;;
    down)
        echo "Stopping all services..."
        docker-compose down
        docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
        ;;
    logs)
        docker-compose logs -f
        ;;
    build)
        echo "Building all Docker images..."
        docker-compose build --no-cache
        ;;
    clean)
        echo "WARNING: This will remove all containers, volumes, and images!"
        read -p "Are you sure? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            docker-compose down -v --rmi all
            docker-compose -f docker-compose.prod.yml down -v --rmi all 2>/dev/null || true
            echo "Cleanup completed."
        fi
        ;;
    db-push)
        echo "Pushing database schema..."
        docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm prisma db push"
        ;;
    db-seed)
        echo "Seeding database..."
        docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm tsx prisma/seed.ts"
        ;;
    status)
        docker-compose ps
        ;;
    restart)
        echo "Restarting all services..."
        docker-compose restart
        ;;
    *)
        show_help
        exit 1
        ;;
esac
