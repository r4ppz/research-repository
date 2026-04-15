# Research Repository System

I am in the middle of a migration, so it is not guaranteed to work yet.

This is a monorepo migrated from independent repos: [front](https://github.com/r4ppz/research-repository-frontend),
[back](https://github.com/r4ppz/research-repository-backend), and [docs](https://github.com/r4ppz/research-repo-docs).
It became difficult to manage three separate repositories at the same time, so this setup is used instead.

## Run the project:

```bash
git clone https://github.com/r4ppz/research-repository.git
cd research-repository

# Install local deps
make install-frontend
make install-docs

# Run the application
make dev
```

Then navigate to:

- Frontend (React): [http://localhost:5173](http://localhost:5173)
- Documentation (MDDocs): [http://localhost:8000](http://localhost:8000)
- Backend (Spring Boot): [http://localhost:8080](http://localhost:8080)
