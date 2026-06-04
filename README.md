# Research Repository System

> This is a monorepo migrated from independent repos: [front](https://github.com/r4ppz/research-repository-frontend),
> [back](https://github.com/r4ppz/research-repository-backend), and [docs](https://github.com/r4ppz/research-repo-docs).

> It became difficult to manage three separate repositories at the same time, so this setup is used instead.

## Requirements (local development)

- Git
- Node.js (v18 or newer) and pnpm — used by the frontend (Vite + React + TypeScript)
- Java JDK 21 — the backend is built with Java 21, but local development runs the backend in Docker (see notes below).
- Docker and Docker Compose — used to run the backend service and a local PostgreSQL instance.
- Python 3.8+ — used for the docs site (mkdocs).

## Run the project locally:

> Before running, copy `.env.example` to `.env` in each component (`backend/`, `frontend/`) and fill in the required values.

```bash
git clone https://github.com/r4ppz/research-repository.git
cd research-repository
```

To run the application, you will need to open separate terminal windows for each service:

**1. Backend**

```bash
cd backend
docker-compose up -d
```

**2. Frontend**

```bash
cd frontend
pnpm install
pnpm dev
```

**3. Documentation**

```bash
cd docs
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
mkdocs serve
```

You can access each service at:

- Frontend (React): [http://localhost:5173](http://localhost:5173)
- Documentation (MkDocs): [http://localhost:8000](http://localhost:8000)
- Backend (Spring Boot): [http://localhost:8080](http://localhost:8080)

To stop the backend services:

```bash
cd backend
docker-compose down
```

## Demo

- [https://research-repository.r4ppz.dev/](https://research-repository.r4ppz.dev/)

> There is no server yet so it will not work :(

Read our docs for more info (_outdated_)

- [https://research-repo.docs.r4ppz.dev/](https://research-repo.docs.r4ppz.dev/)

_This project is still in alpha._
