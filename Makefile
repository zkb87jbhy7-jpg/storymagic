.PHONY: up down dev dev-web dev-api build test lint type-check migrate seed clean install format

# --- Infrastructure ---
up:
	docker-compose up -d

down:
	docker-compose down

up-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# --- Development ---
dev:
	pnpm turbo dev

dev-web:
	pnpm --filter web dev

dev-api:
	cd apps/api && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# --- Build ---
build:
	pnpm turbo build

# --- Quality ---
lint:
	pnpm turbo lint

test:
	pnpm turbo test

type-check:
	pnpm turbo type-check

format:
	pnpm format

# --- Database ---
migrate:
	cd apps/api && alembic upgrade head

seed:
	psql $(DATABASE_SYNC_URL) -f supabase/seed.sql

# --- Cleanup ---
clean:
	pnpm turbo clean
	rm -rf node_modules/.cache
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true

# --- Setup ---
install:
	pnpm install

setup: install up migrate seed
	@echo "StoryMagic development environment ready!"
