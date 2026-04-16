# Research Repository System

This is a monorepo migrated from independent repos: [front](https://github.com/r4ppz/research-repository-frontend),
[back](https://github.com/r4ppz/research-repository-backend), and [docs](https://github.com/r4ppz/research-repo-docs).

It became difficult to manage three separate repositories at the same time, so this setup is used instead.

## Requirements

Before running this project, make sure the following tools are installed on your system:

- Git
- Node
- Pnpm
- Make
- Java
- Python
- Docker

## Run the project locally:

> Before running Copy `.env.example` to `.env` in each component (`backend/`, `frontend/`) and fill in the required values.

```bash
git clone https://github.com/r4ppz/research-repository.git
cd research-repository

# Install local deps
make install-frontend
make install-docs

# Run the application
make dev
```

You can access each services:

- Frontend (React): [http://localhost:5173](http://localhost:5173)
- Documentation (MDDocs): [http://localhost:8000](http://localhost:8000)
- Backend (Spring Boot): [http://localhost:8080](http://localhost:8080)

## Demo

- [https://research-repository.r4ppz.dev/](https://research-repository.r4ppz.dev/)

> There is no server yet so it will not work :(

Read our docs for more info (kinda outdated)

- [https://research-repo.docs.r4ppz.dev/](https://research-repo.docs.r4ppz.dev/)

_still migrating..._

_This project is still in alpha._
