.PHONY: help dev dev-backend dev-frontend build up down logs test lint clean

COMPOSE = docker compose
BACKEND_DIR = backend
FRONTEND_DIR = frontend

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Local dev (no Docker) ────────────────────────────────────────────────────

dev: ## Start backend and frontend dev servers concurrently (requires tmux or a terminal that can fork)
	@echo "Starting backend on :8000 and frontend on :5173"
	@$(MAKE) -j2 dev-backend dev-frontend

dev-backend: ## Start the FastAPI dev server (auto-reload)
	@cd $(BACKEND_DIR) && \
		[ -d venv ] || python3.9 -m venv venv && \
		. venv/bin/activate && \
		pip install -q -r requirements.txt && \
		uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start the Vite dev server
	@cd $(FRONTEND_DIR) && \
		[ -d node_modules ] || npm ci && \
		npm run dev

# ── Docker Compose ───────────────────────────────────────────────────────────

build: ## Build all Docker images
	$(COMPOSE) build

up: ## Start all services in detached mode
	$(COMPOSE) up -d

down: ## Stop and remove containers (volumes preserved)
	$(COMPOSE) down

logs: ## Tail logs from all services
	$(COMPOSE) logs -f

# ── Tests & linting ──────────────────────────────────────────────────────────

test: ## Run backend pytest suite
	@cd $(BACKEND_DIR) && \
		[ -d venv ] || python3.9 -m venv venv && \
		. venv/bin/activate && \
		pip install -q -r requirements.txt && \
		pytest tests/ -v

lint: ## Run ESLint on frontend and ruff/flake8 on backend (if available)
	@echo "--- frontend ---"
	@cd $(FRONTEND_DIR) && npm run lint
	@echo "--- backend ---"
	@cd $(BACKEND_DIR) && \
		[ -d venv ] || python3.9 -m venv venv && \
		. venv/bin/activate && \
		(ruff check app/ 2>/dev/null || echo "(ruff not installed; skipping)")

# ── Cleanup ──────────────────────────────────────────────────────────────────

clean: ## Remove build artifacts, caches, venv, node_modules
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	rm -rf $(BACKEND_DIR)/venv
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/dist
	rm -rf .pytest_cache $(BACKEND_DIR)/.pytest_cache
