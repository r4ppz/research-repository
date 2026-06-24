# AGENTS.md - Research Repository

- Never commit, push, or create PRs unless explicitly asked.
- Read the actual file first. Don't assume you know what's in it.
- After making changes, run `make help` to discover available targets.

## Commands

All commands are run from the project root via `make`:

```bash
# Infrastructure (Docker Compose)
make up               # Start backend services (PostgreSQL, MinIO, app) in background
make up ENV=prod      # Start full stack (PostgreSQL, MinIO, backend, frontend) in background
make down             # Stop backend services
make restart          # Restart backend services
make reset            # Stop services and wipe volumes (database + storage)
make rebuild          # Rebuild Docker image and restart

# Frontend (via pnpm)
make front-install    # Install frontend dependencies
make front-dev        # Start Vite dev server (foreground)
make front-build      # Build frontend for production
make front-preview    # Preview production build

# Documentation (MkDocs)
make doc-install      # Create virtualenv and install docs dependencies
make doc-serve        # Start MkDocs dev server (foreground, auto-installs deps)
make doc-build        # Build static documentation site (auto-installs deps)
```

## Environment

Select compose file and `.env` via `ENV` variable:

| `ENV`  | Compose file                 | `.env` loaded  | Services                             |
| ------ | ---------------------------- | -------------- | ------------------------------------ |
| `dev`  | `backend/docker-compose.yml` | `backend/.env` | PostgreSQL, MinIO, app               |
| `prod` | `docker-compose.yml`         | `.env` (root)  | PostgreSQL, MinIO, backend, frontend |

```bash
cp backend/.env.example backend/.env     # Dev
cp .env.example .env                      # Prod (root)
cp frontend/.env.example frontend/.env    # Frontend
```

`.env` files contain secrets and are gitignored. Only `.env.example` templates are tracked.

## Tech Stack

- Backend: Java 21, Spring Boot 3.5, Maven, PostgreSQL, Flyway, MinIO, JWT, Google OAuth, Lombok, Spotless (Google Java Format)
- Frontend: React 19 + React Compiler, TypeScript strict, Vite 7, TanStack Query, React Router DOM 7, Radix UI, CSS Modules, ESLint, Stylelint, Prettier, Husky, Storybook 10, Vitest + Playwright, Cloudflare Pages
- Docs: MkDocs with Material theme (Python)
- Infrastructure: Docker Compose, nginx (serves production frontend)

## Architecture

```
research-repository/
├── backend/            # Java/Spring Boot application
│   ├── docker-compose.yml   # Dev compose (3 services)
│   ├── Dockerfile
│   ├── pom.xml
│   ├── src/main/java/com/acd/researchrepo/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── service/
│   │   ├── security/
│   │   ├── storage/
│   │   └── ...
│   └── src/main/resources/
│       ├── application.yml
│       ├── application-{dev,prod,test}.yml
│       └── db/              # Flyway migrations
├── frontend/           # React/TypeScript SPA
│   ├── src/
│   │   ├── api/
│   │   ├── components/     # {common/, layout/}
│   │   ├── features/       # {admin/, auth/, faculty/, library/, student/}
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── types/
│   │   └── util/
│   ├── Dockerfile          # Multi-stage: Vite build → nginx
│   ├── wrangler.jsonc      # Cloudflare Pages config
│   ├── vite.config.ts      # @/ alias, React Compiler, Cloudflare plugin
│   └── package.json
├── docs/               # MkDocs documentation site
├── docker-compose.yml  # Production compose (4 services)
├── .env.example        # Production env template
├── Makefile            # All targets defined here
└── CONTRIBUTING.md     # Setup, git workflow, env files
```
