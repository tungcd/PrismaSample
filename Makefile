# Smart Canteen - Docker Commands

.PHONY: help dev prod up down logs clean restart db-migrate db-seed build

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start all services in development mode
	docker-compose up -d

prod: ## Start all services in production mode
	docker-compose -f docker-compose.prod.yml up -d

up: dev ## Alias for 'dev'

down: ## Stop all services
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

logs: ## View logs from all services
	docker-compose logs -f

logs-cms: ## View CMS logs
	docker-compose logs -f cms

logs-client: ## View Client logs
	docker-compose logs -f client

logs-api: ## View API logs
	docker-compose logs -f api

logs-db: ## View Database logs
	docker-compose logs -f postgres

clean: ## Stop and remove all containers, volumes, and images
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.prod.yml down -v --rmi all

restart: ## Restart all services
	docker-compose restart

restart-cms: ## Restart CMS service
	docker-compose restart cms

restart-client: ## Restart Client service
	docker-compose restart client

restart-api: ## Restart API service
	docker-compose restart api

build: ## Rebuild all Docker images
	docker-compose build --no-cache

build-cms: ## Rebuild CMS image
	docker-compose build --no-cache cms

build-client: ## Rebuild Client image
	docker-compose build --no-cache client

build-api: ## Rebuild API image
	docker-compose build --no-cache api

db-migrate: ## Run database migrations
	docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm prisma migrate deploy"

db-seed: ## Seed the database
	docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm tsx prisma/seed.ts"

db-push: ## Push schema to database (development)
	docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm prisma db push"

db-studio: ## Open Prisma Studio
	docker-compose exec cms sh -c "cd /app/packages/prisma && pnpm prisma studio"

shell-cms: ## Open shell in CMS container
	docker-compose exec cms sh

shell-client: ## Open shell in Client container
	docker-compose exec client sh

shell-api: ## Open shell in API container
	docker-compose exec api sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U admin -d smart_canteen

ps: ## Show running containers
	docker-compose ps

stats: ## Show container resource usage
	docker stats
