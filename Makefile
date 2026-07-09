ENV ?= dev

ifeq ($(ENV),prod)
  COMPOSE := docker compose -f docker-compose.yml
else
  COMPOSE := docker compose -f backend/docker-compose.yml
endif

.DEFAULT_GOAL := help

.PHONY: up down restart reset rebuild
up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart: down up

reset:
	$(COMPOSE) down -v

rebuild: down
	$(COMPOSE) build
	$(COMPOSE) up -d

.PHONY: trace
trace:
	$(COMPOSE) logs backend | grep "$(id)"

.PHONY: front-install front-dev front-build front-preview
front-install:
	pnpm --dir frontend install

front-dev:
	pnpm --dir frontend dev

front-build:
	pnpm --dir frontend build

front-preview:
	pnpm --dir frontend preview

docs/.venv/bin/activate: docs/requirements.txt
	python3 -m venv docs/.venv
	docs/.venv/bin/pip install -r docs/requirements.txt
	@touch docs/.venv/bin/activate

.PHONY: doc-install doc-serve doc-build
doc-install:
	python3 -m venv docs/.venv
	docs/.venv/bin/pip install -r docs/requirements.txt

doc-serve: docs/.venv/bin/activate
	docs/.venv/bin/mkdocs serve -f docs/mkdocs.yml

doc-build: docs/.venv/bin/activate
	docs/.venv/bin/mkdocs build -f docs/mkdocs.yml

.PHONY: help
help:
	@echo "Usage: make <target> [ENV=<dev|prod>]"
	@echo ""
	@echo "Infrastructure (Docker Compose):"
	@echo "  up                  Start backend services (PostgreSQL, MinIO, app)"
	@echo "  down                Stop backend services"
	@echo "  restart             Restart backend services"
	@echo "  reset               Stop services and remove volumes (wipes data)"
	@echo "  rebuild             Rebuild Docker image and restart"
	@echo ""
	@echo "Front (pnpm):"
	@echo "  front-install       Install dependencies"
	@echo "  front-dev           Start Vite development server"
	@echo "  front-build         Build for production"
	@echo "  front-preview       Preview production build"
	@echo ""
	@echo "Doc (MkDocs):"
	@echo "  doc-install         Create virtualenv and install dependencies"
	@echo "  doc-serve           Start development server (auto-installs deps)"
	@echo "  doc-build           Build static site (auto-installs deps)"
	@echo ""
	@echo "Debug:"
	@echo "  trace id=<id>       Search app logs by traceId"
	@echo ""
	@echo "Configuration:"
	@echo '  ENV=<dev|prod>      Select environment (default: dev)'
	@echo '                      dev:  backend/docker-compose.yml  ←  backend/.env'
	@echo '                      prod: docker-compose.yml          ←  .env (root)'
	@echo ""
	@echo "Examples:"
	@echo "  make up"
	@echo "  make up ENV=prod"
	@echo "  make front-dev"
