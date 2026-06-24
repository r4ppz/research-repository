# AGENTS.md - Frontend

- Never commit, push, or create PRs unless explicitly asked.
- Read the actual file first. Don't assume you know what's in it.
- After making changes, run `pnpm check` (lint:css + type-check + lint) and fix issues until passing. Optionally, also run `pnpm build` (tsc + vite build) for a full build check.

## Commands

```bash
pnpm dev              # Vite dev server
pnpm build            # tsc -b && vite build
pnpm preview          # build + wrangler dev (local Cloudflare preview)
pnpm lint             # ESLint on src/
pnpm lint:fix         # ESLint with auto-fix
pnpm lint:css         # Stylelint on src/**/*.css
pnpm lint:css:fix     # Stylelint with auto-fix
pnpm type-check       # tsc --noEmit
pnpm format           # Prettier (entire project)
pnpm check            # lint:css + type-check + lint
pnpm fix              # lint:fix + format + lint:css:fix
pnpm deploy           # build + wrangler deploy (Cloudflare Pages)
pnpm storybook        # Storybook dev server (port 6006)
pnpm build-storybook  # Build Storybook static site
```

## Tech Stack

- Framework: React 19 + React Compiler (Babel plugin), React DOM 19
- Language: TypeScript strict (`typescript-eslint` strict + stylistic configs)
- Build: Vite 7 with `@vitejs/plugin-react`
- Cloudflare: `@cloudflare/vite-plugin`, Wrangler, deployed to Cloudflare Pages
- State/Data: TanStack React Query 5, TanStack React Table 8, Axios
- Routing: React Router DOM 7
- UI Components: Radix UI (AlertDialog, Dialog, Select, Tooltip, Icons), react-aria-components, Lucide React, react-icons
- Styling: CSS Modules, `clsx` for composition
- Format & Lint: ESLint 9, Stylelint (recess-order + standard), Prettier 3
- Git Hooks: Husky 9 + lint-staged
- Testing: Vitest 4 + Playwright browser runner, Storybook 10 + addon-vitest
- CI/CD: semantic-release

## Architecture

```
frontend/src/
├── api/              # API client config and request functions (Axios)
├── components/
│   ├── common/       # Shared UI primitives (wrappers around Radix/Aria)
│   └── layout/       # Page layout components (header, sidebar, etc.)
├── features/         # Domain logic organized by feature
│   ├── admin/        # Admin-only pages and components
│   ├── auth/         # Authentication (Google OAuth flow)
│   ├── faculty/      # Faculty-specific functionality
│   ├── library/      # Paper browsing/searching (student view)
│   └── student/      # Student-specific functionality
├── hooks/            # Shared React hooks
├── styles/           # Global styles, CSS variables, design tokens
├── types/            # Shared TypeScript types/interfaces
└── util/             # Utility/helper functions

frontend/
├── vite.config.ts    # @/ alias, React Compiler, Cloudflare plugin
├── wrangler.jsonc    # Cloudflare Pages deployment config
├── tsconfig.json     # TypeScript config
├── eslint.config.js  # ESLint flat config
├── stylelint.config.mjs
├── .prettierrc.json
└── Dockerfile        # Multi-stage: Vite build → nginx (prod)
```

## Conventions

### Styling

- Use CSS Modules for all component styles — never inline styles.
- Compose classes with `clsx` utility.
- Follow existing patterns in `src/components/*/`.

### Components

- Wrap Radix UI / react-aria-components primitives in local components under `src/components/common/`.
- Export component props as a named interface extending the underlying library's type.
- Accept and forward `className` prop for external overrides.

### Features

- Feature-specific components and logic live in `src/features/{domain}/`.
- Shared, domain-agnostic components go in `src/components/common/` or `src/components/layout/`.

### General

- Named exports only — no default exports (not applicable to Next.js special files; this is a Vite SPA).
- PascalCase for components and types; camelCase for variables, functions, and file names.
- `@/` alias maps to `src/` — use `@/components/...` instead of relative imports.
- React Compiler is enabled via Babel plugin — ensure new components are compatible.
- No comments unless explaining a non-obvious decision.
- Husky pre-commit runs lint-staged (Prettier + ESLint on staged files).
