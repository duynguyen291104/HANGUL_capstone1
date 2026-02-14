# Makefile for Korean TOPIK Learning App

.PHONY: help install dev build start docker-up docker-down docker-restart db-migrate db-seed db-reset db-studio test clean
.PHONY: setup split train demo test-model export backend check-dataset benchmark test-api create-80 train-50 clean-models check-camera camera-vocab start-camera test-detection

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

# ============================================================================
# AI DETECTION COMMANDS
# ============================================================================

setup-ai: ## Install AI dependencies
	@echo "$(GREEN)Installing AI/ML dependencies...$(NC)"
	pip install ultralytics opencv-python pillow numpy flask flask-cors
	@echo "$(GREEN)✓ AI dependencies installed$(NC)"

check-dataset: ## Check if datasets exist
	@echo "$(GREEN)Checking datasets...$(NC)"
	@if [ -d "coco128/images/train2017" ]; then \
		echo "$(GREEN)✓ COCO128 found: $$(ls coco128/images/train2017 | wc -l) images$(NC)"; \
	else \
		echo "$(RED)✗ COCO128 not found. Download from:$(NC)"; \
		echo "  https://github.com/ultralytics/assets/releases/download/v0.0.0/coco128.zip"; \
	fi
	@if [ -d "coco128_split/images/train" ]; then \
		echo "$(GREEN)✓ Split dataset found: train=$$(ls coco128_split/images/train | wc -l), val=$$(ls coco128_split/images/val | wc -l)$(NC)"; \
	else \
		echo "$(YELLOW)⚠ Split dataset not found. Run: make split$(NC)"; \
	fi

split: ## Split COCO128 into train/val
	@echo "$(GREEN)Splitting COCO128 dataset...$(NC)"
	python split_coco128.py
	@echo "$(GREEN)✓ Dataset split complete$(NC)"

create-80: ## Create 80-image subset
	@echo "$(GREEN)Creating COCO80 subset...$(NC)"
	python create_coco80.py
	@echo "$(GREEN)✓ COCO80 created$(NC)"

train: ## Train YOLO model (30 epochs)
	@echo "$(GREEN)Training YOLO model...$(NC)"
	python train_yolo_coco128.py --train
	@echo "$(GREEN)✓ Training complete$(NC)"

train-50: ## Train YOLO model (50 epochs)
	@echo "$(GREEN)Training YOLO model (50 epochs)...$(NC)"
	python train_yolo_coco128.py --train --epochs 50
	@echo "$(GREEN)✓ Training complete$(NC)"

export: ## Export model to ONNX
	@echo "$(GREEN)Exporting model...$(NC)"
	python train_yolo_coco128.py --export
	@echo "$(GREEN)✓ Model exported$(NC)"

test-model: ## Test trained model on webcam
	@echo "$(GREEN)Testing model...$(NC)"
	python train_yolo_coco128.py --test
	@echo "$(GREEN)Press 'q' to quit$(NC)"

demo: ## Run realtime detection demo
	@echo "$(GREEN)Starting realtime detection demo...$(NC)"
	@echo "$(YELLOW)Controls: ESC=quit, S=screenshot$(NC)"
	python realtime_ko.py

backend: ## Start Flask backend API
	@echo "$(GREEN)Starting Flask backend...$(NC)"
	cd ai-backend && python app.py

test-api: ## Test backend API endpoints
	@echo "$(GREEN)Testing API endpoints...$(NC)"
	@echo "$(YELLOW)Health check:$(NC)"
	@curl -s http://localhost:5001/health | python -m json.tool || echo "$(RED)Backend not running$(NC)"
	@echo ""
	@echo "$(YELLOW)Vocabulary list:$(NC)"
	@curl -s http://localhost:5001/vocab/list | python -m json.tool | head -20 || echo "$(RED)Backend not running$(NC)"

benchmark: ## Run performance benchmark
	@echo "$(GREEN)Running performance benchmark...$(NC)"
	@echo "$(YELLOW)This will measure FPS and latency...$(NC)"
	@echo "import cv2, time; cap = cv2.VideoCapture(0); start = time.time(); frames = 0; \
	[frames := frames + 1 for _ in range(100) if cap.read()[0]]; \
	fps = frames / (time.time() - start); cap.release(); print(f'FPS: {fps:.2f}')" | python

check-camera: ## Check if camera is accessible
	@echo "$(GREEN)Checking camera...$(NC)"
	@python -c "import cv2; cap = cv2.VideoCapture(0); \
		print('✓ Camera OK' if cap.isOpened() else '✗ Camera not found'); \
		cap.release()" || echo "$(RED)✗ Error checking camera$(NC)"

clean-models: ## Clean training outputs
	@echo "$(YELLOW)Cleaning model outputs...$(NC)"
	rm -rf runs/detect/train*
	@echo "$(GREEN)✓ Cleaned$(NC)"

clean-datasets: ## Clean generated datasets (keeps original coco128)
	@echo "$(YELLOW)Cleaning generated datasets...$(NC)"
	rm -rf coco128_split coco80
	@echo "$(GREEN)✓ Cleaned$(NC)"

# AI Help
ai-help: ## Show AI detection commands
	@echo "$(GREEN)AI Object Detection Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Setup:$(NC)"
	@echo "  make setup           - Install dependencies"
	@echo "  make check-dataset   - Check dataset status"
	@echo ""
	@echo "$(YELLOW)Dataset Preparation:$(NC)"
	@echo "  make split           - Split COCO128 train/val"
	@echo "  make create-80       - Create 80-image subset"
	@echo ""
	@echo "$(YELLOW)Training:$(NC)"
	@echo "  make train           - Train model (30 epochs)"
	@echo "  make train-50        - Train model (50 epochs)"
	@echo "  make export          - Export to ONNX"
	@echo ""
	@echo "$(YELLOW)Testing & Demo:$(NC)"
	@echo "  make demo            - Realtime detection demo"
	@echo "  make test-model      - Test trained model"
	@echo "  make benchmark       - Performance benchmark"
	@echo ""
	@echo "$(YELLOW)Backend:$(NC)"
	@echo "  make backend         - Start Flask API"
	@echo "  make test-api        - Test API endpoints"
	@echo ""
	@echo "$(YELLOW)Camera-to-Vocab:$(NC)"
	@echo "  make camera-vocab    - Start full Camera-to-Vocab system"
	@echo "  make start-camera    - Quick start (alias)"
	@echo "  make test-detection  - Test detection API"
	@echo ""
	@echo "$(YELLOW)Utilities:$(NC)"
	@echo "  make check-camera    - Check camera access"
	@echo "  make clean-models    - Clean training outputs"

# ============================================================================
# CAMERA-TO-VOCAB COMMANDS
# ============================================================================

camera-vocab: ## Start Camera-to-Vocab system (Backend + Frontend)
	@echo "$(GREEN)🚀 Starting Camera-to-Vocab System...$(NC)"
	./start_camera_vocab.sh

start-camera: camera-vocab ## Alias for camera-vocab

test-detection: ## Test detection API với ảnh mẫu
	@echo "$(GREEN)🧪 Testing detection API...$(NC)"
	python3 test_detection_api.py
