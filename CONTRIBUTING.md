## Requirements (local development)

- Git
- Node.js (v18 or newer) and pnpm — used by the frontend (Vite + React + TypeScript)
- Java JDK 21 — the backend is built with Java 21, but local development runs the backend in Docker (see notes below).
- Docker and Docker Compose — used to run the backend service and a local PostgreSQL instance.
- Python 3.8+ — used for the docs site (mkdocs).

## Run the project locally

> Before running, copy `.env.example` to `.env` in each component (`backend/`, `frontend/`) and fill in the required values.

```bash
git clone https://github.com/acd-research-repo/research-repository.git
cd research-repository
```

All commands are run from the project root via `make`:

```bash
make up               # Start backend services (PostgreSQL, MinIO, app)
make front-dev        # Start frontend dev server
make doc-serve        # Start documentation server
```

Open separate terminals for each — `make up` runs in the background, `make front-dev` and `make doc-serve` run in the foreground.

| Service                | URL                                            |
| ---------------------- | ---------------------------------------------- |
| Frontend (Vite)        | [http://localhost:5173](http://localhost:5173) |
| Backend (Spring Boot)  | [http://localhost:8080](http://localhost:8080) |
| Documentation (MkDocs) | [http://localhost:8000](http://localhost:8000) |

### First-time setup

```bash
make front-install    # Install frontend dependencies
make doc-install      # Set up MkDocs virtualenv
```

### Managing services

```bash
make down       # Stop backend services
make restart    # Restart backend services
make reset      # Stop backend services and wipe database/storage volumes
make rebuild    # Rebuild Docker image and restart
```

### Environment files

Each compose file loads `.env` from its own directory automatically:

| File            | Used by             | Purpose                     |
| --------------- | ------------------- | --------------------------- |
| `backend/.env`  | `make up` (default) | Backend + database + MinIO  |
| `.env` (root)   | `make up ENV=prod`  | Full stack (all 4 services) |
| `frontend/.env` | `make front-dev`    | Vite dev server             |

```bash
cp backend/.env.example backend/.env     # Dev environment
cp .env.example .env                      # Prod environment (root)
cp frontend/.env.example frontend/.env    # Frontend
```

> `.env` files contain secrets and are gitignored. Only `.env.example` templates are tracked.

### Available targets

```text
make help  # List all available targets
```
