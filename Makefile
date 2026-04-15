.PHONY: dev frontend backend docs install-frontend install-docs

# Install dependencies
install-frontend:
	cd frontend && pnpm install

install-docs:
	cd docs && python -m venv .venv && \
	. .venv/bin/activate && pip install -r requirements.txt

# Run services
frontend:
	cd frontend && pnpm dev

backend:
	cd backend && docker-compose up -d

docs:
	cd docs && \
	[ -d .venv ] || python -m venv .venv; \
	. .venv/bin/activate && mkdocs serve

# Run everything
dev:
	+make -j3 frontend backend docs

