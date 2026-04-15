# Research Repository System

I am in the middle of a migration, so it is not guaranteed to work yet.

This is a monorepo migrated from independent repos: [front](https://github.com/r4ppz/research-repository-frontend),
[back](https://github.com/r4ppz/research-repository-backend), and [docs](https://github.com/r4ppz/research-repo-docs).
It became difficult to manage three separate repositories at the same time, so this setup is used instead.

## Run the project:

```bash
git clone https://github.com/r4ppz/research-repository.git
cd research-repository

cd frontend
pnpm install
pnpm dev

cd ../backend
docker compose up -d

cd ../docs
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```
