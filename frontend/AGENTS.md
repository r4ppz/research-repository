# AGENTS.md - Frontend

- Never commit, push, or create PRs unless explicitly asked.
- Read the actual file first. Don't assume you know what's in it.
- After making changes, run `pnpm check` (lint:css + type-check + lint) and fix issues until passing. Optionally, also run `pnpm build` (tsc + vite build) for a full build check.

## Commands

```bash
pnpm dev              # Vite dev server
pnpm build            # tsc -b && vite build
pnpm preview          # build + vite preview (local preview)
pnpm lint             # ESLint on src/
pnpm lint:fix         # ESLint with auto-fix
pnpm lint:css         # Stylelint on src/**/*.css
pnpm lint:css:fix     # Stylelint with auto-fix
pnpm type-check       # tsc --noEmit
pnpm format           # Prettier (entire project)
pnpm check            # lint:css + type-check + lint
pnpm fix              # lint:fix + format + lint:css:fix
pnpm deploy           # build for production
pnpm storybook        # Storybook dev server (port 6006)
pnpm build-storybook  # Build Storybook static site
```

## Tech Stack

- Framework: React 19 + React Compiler (Babel plugin), React DOM 19
- Language: TypeScript strict (`typescript-eslint` strict + stylistic configs)
- Build: Vite 7 with `@vitejs/plugin-react`

- State/Data: TanStack React Query 5, TanStack React Table 8, Axios
- Routing: React Router DOM 7
- UI Components: Radix UI (AlertDialog, Dialog, Select, Tooltip, Icons), react-aria-components, Lucide React, react-icons
- Styling: CSS Modules, `clsx` for composition
- Format & Lint: ESLint 9, Stylelint (recess-order + standard), Prettier 3
- Git Hooks: Husky 9 + lint-staged (in dependencies, hooks not yet initialized)
- Testing: Vitest 4 + Playwright browser runner, Storybook 10 + addon-vitest
- CI/CD: semantic-release

## Architecture

```
frontend/src/
├── api/              # API client config and request functions (Axios)
│   └── admin/        # Admin API calls (papers, requests, users)
├── assets/           # Static assets (images, icons)
├── components/
│   ├── common/       # Shared UI primitives (wrappers around Radix/Aria)
│   └── layout/       # Page layout components (header, sidebar, etc.)
├── features/         # Domain logic organized by feature
│   ├── admin/        # Admin-only pages and components
│   ├── auth/         # Authentication (Google OAuth flow)
│   ├── faculty/      # Faculty-specific functionality
│   ├── library/      # Paper browsing/searching (all roles)
│   ├── my-requests/  # User's own document requests
│   └── student/      # Student-specific functionality
├── hooks/            # Shared React hooks
├── stories/          # Storybook stories
├── styles/           # Global styles, CSS variables, design tokens
├── types/            # Shared TypeScript types/interfaces
└── util/             # Utility/helper functions

frontend/
├── vite.config.ts    # @/ alias, React Compiler
├── tsconfig.json     # TypeScript config
├── eslint.config.js  # ESLint flat config
├── stylelint.config.mjs
├── .prettierrc.json
└── Dockerfile        # Multi-stage: Vite build → nginx (prod)
```

## Conventions

### Styling

- Use only CSS custom properties from `variables.css`.
- Follow existing patterns in `src/components/*/`.
- Accept and forward external `className` props for overrides.
- Use only semantic tokens from `variables.css`; no hardcoded values.
- Nesting in CSS Modules must mirror the component or document hierarchy (parent element nests children).
- Never use inline styles (except storybooks) or global element selectors.
- Style exclusively via CSS Modules, imported as `styles` and composed with `clsx`.

### Components

- react-aria-components primitives in local components under `src/components/common/`.
- Export component props as a named interface extending the underlying library's type.
- Accept and forward `className` prop for external overrides.
- Always scan and use existing components from `components/` first.
- Co-locate in `src/components/{category}/{ComponentName}/` — component, CSS module.
- Wrapping Aria components pattern: extend Aria props interface, add local variants/props, use explicit interface.
- Extract component props into a named interface extending the Aria type when adding local variants/props — keeps function signatures terse and consistent.

### Features

- Feature-specific components and logic live in `src/features/{domain}/`.
- Shared, domain-agnostic components go in `src/components/common/` or `src/components/layout/`.

### General

- Idiomatic, modular code is the top priority in this project, not a collection of hacks and workarounds.
- Named exports only — no default exports (not applicable to Next.js special files; this is a Vite SPA).
- PascalCase for components and types; camelCase for variables, functions, and file names.
- `@/` alias maps to `src/` — use `@/components/...` instead of relative imports.
- React Compiler is enabled via Babel plugin — ensure new components are compatible.
- No comments unless explaining a non-obvious decision.
