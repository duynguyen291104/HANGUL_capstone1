# Makefile for Korean TOPIK Learning App

.PHONY: help install dev build start docker-up docker-down docker-restart db-migrate db-seed db-reset db-studio test clean

# Colors for terminal output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)Korean TOPIK Learning App - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

dev: docker-up ## Start development server
	@echo "$(GREEN)Starting development server...$(NC)"
	npm run dev

build: ## Build for production
	@echo "$(GREEN)Building application...$(NC)"
	npm run build

start: ## Start production server
	@echo "$(GREEN)Starting production server...$(NC)"
	npm start

# Docker commands
docker-up: ## Start Docker containers (PostgreSQL + PgAdmin)
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✓ PostgreSQL running on localhost:5432$(NC)"
	@echo "$(GREEN)✓ PgAdmin running on http://localhost:5050$(NC)"

docker-down: ## Stop Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	docker compose down

docker-restart: docker-down docker-up ## Restart Docker containers

docker-reset: ## Reset Docker containers and volumes (⚠️  deletes all data)
	@echo "$(RED)⚠️  WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		echo "$(GREEN)✓ Docker reset complete$(NC)"; \
	fi

docker-logs: ## Show Docker logs
	docker compose logs -f

# Database commands
db-migrate: ## Run database migrations
	@echo "$(GREEN)Running migrations...$(NC)"
	npx prisma migrate dev
	@echo "$(GREEN)✓ Migrations complete$(NC)"

db-migrate-prod: ## Deploy migrations to production
	@echo "$(GREEN)Deploying migrations...$(NC)"
	npx prisma migrate deploy

db-seed: ## Seed database with sample data
	@echo "$(GREEN)Seeding database...$(NC)"
	npm run prisma:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-reset: ## Reset database (⚠️  deletes all data)
	@echo "$(RED)⚠️  WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		npm run db:reset; \
		echo "$(GREEN)✓ Database reset complete$(NC)"; \
	fi

db-studio: ## Open Prisma Studio (database GUI)
	@echo "$(GREEN)Opening Prisma Studio...$(NC)"
	npm run prisma:studio

db-push: ## Push schema changes (development only)
	@echo "$(GREEN)Pushing schema changes...$(NC)"
	npm run db:push

db-test: ## Test database connection
	@echo "$(GREEN)Testing database connection...$(NC)"
	@bash test-db.sh

# Prisma commands
prisma-generate: ## Generate Prisma Client
	@echo "$(GREEN)Generating Prisma Client...$(NC)"
	npx prisma generate

prisma-validate: ## Validate Prisma schema
	@echo "$(GREEN)Validating Prisma schema...$(NC)"
	npx prisma validate

# Setup commands
setup: install docker-up db-migrate db-seed prisma-generate ## Full project setup (install, docker, migrate, seed)
	@echo ""
	@echo "$(GREEN)╔════════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║  🎉 Setup Complete!                            ║$(NC)"
	@echo "$(GREEN)╠════════════════════════════════════════════════╣$(NC)"
	@echo "$(GREEN)║  Run 'make dev' to start development server   ║$(NC)"
	@echo "$(GREEN)║  Visit http://localhost:3000                   ║$(NC)"
	@echo "$(GREEN)║  PgAdmin: http://localhost:5050                ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════════════╝$(NC)"

# Testing
test: db-test ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"

# Cleanup
clean: ## Clean build artifacts and node_modules
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf .next node_modules .turbo
	@echo "$(GREEN)✓ Clean complete$(NC)"

# Linting
lint: ## Run ESLint
	@echo "$(GREEN)Running ESLint...$(NC)"
	npm run lint

lint-fix: ## Fix ESLint errors
	@echo "$(GREEN)Fixing ESLint errors...$(NC)"
	npm run lint -- --fix

# Git helpers
git-status: ## Show git status
	git status

git-check: ## Check for uncommitted changes
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo "$(YELLOW)⚠️  You have uncommitted changes$(NC)"; \
		git status --short; \
	else \
		echo "$(GREEN)✓ Working directory clean$(NC)"; \
	fi
