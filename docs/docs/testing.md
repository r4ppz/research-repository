# How to test the system

The system is available for testing either [live](https://research-repository.r4ppz.dev/) or locally via Docker.

> ⚠️ The system is currently in alpha. Bugs and instability are expected.

---

## Local development

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and pnpm (for running the frontend outside Docker)

### Setup

```bash
git clone https://github.com/r4ppz/research-repository.git
cd research-repository
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
make front-install
make doc-install
```

### Running

Open three terminals:

```bash
# Terminal 1 — Backend (Docker)
make up

# Terminal 2 — Frontend
make front-dev

# Terminal 3 — Docs (optional)
make doc-serve
```

| Service       | URL                                            |
| ------------- | ---------------------------------------------- |
| Frontend      | [http://localhost:5173](http://localhost:5173) |
| Backend API   | [http://localhost:8080](http://localhost:8080) |
| Documentation | [http://localhost:8000](http://localhost:8000) |

### Managing services

```bash
make down       # Stop backend services
make restart    # Restart backend services
make reset      # Stop and wipe volumes (clean slate)
make rebuild    # Rebuild Docker image and restart
```

---

## Managing User Roles (Admin/Faculty/Student)

The system uses your **Google Email** to determine what you see. By default, everyone is a **Student**. To test roles and capabilities you must edit the config file:

1. Open `backend/privileged-users.yaml` in a text editor.
2. Add your email under the desired category.

After editing, apply changes:

```bash
make restart
```

<!-- prettier-ignore-start -->
!!! warning "For more info about this"
    Please read [Manual Role Assignment](./specification.md#manual-role-assignment)
    and [Roles & Capabilities](./specification.md#roles-capabilities-authz).
<!-- prettier-ignore-end -->

---

## Production (Docker Compose)

To run the full stack (including frontend) in Docker:

```bash
cp .env.example .env
make up ENV=prod
```

This builds and starts all four services (PostgreSQL, MinIO, backend, frontend). The frontend is served via nginx on port 80.

> If you encounter any issue please [open an issue](https://github.com/r4ppz/research-repository/issues).
