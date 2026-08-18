# How to test the system

The system is available for testing locally via Docker.<!-- TODO: add live demo URL when available -->

> ⚠️ The system is currently in alpha. Bugs and instability are expected.

---

## Local development

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and pnpm (for running the frontend outside Docker)

### Setup

```bash
git clone https://github.com/acd-research-repo/research-repository.git
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

The system uses your **Google Email** to determine what you see. By default, everyone is a **Student**. To test roles and capabilities:

1. Set `INITIAL_SUPER_ADMIN_EMAIL` in `backend/.env` to your email before first login. That user will be auto-assigned `SUPER_ADMIN`.
2. Log in with that Google account — you'll see the admin pages.
3. Use the `/super-admin/users` page (or `PUT /api/admin/users/{id}/role` API) to assign roles to other users.

> Once bootstrapped, role management is done entirely through the admin UI/API. See [Role Management](./specification.md#role-management) for details.

---

## Production (Docker Compose)

To run the full stack (including frontend) in Docker:

```bash
cp .env.example .env
make up ENV=prod
```

This builds and starts all four services (PostgreSQL, MinIO, backend, frontend). The frontend is served via nginx on port 80.

> If you encounter any issue please [open an issue](https://github.com/acd-research-repo/research-repository/issues).
