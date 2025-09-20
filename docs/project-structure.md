# Research Repository

## **Role-based screaming architecture (Vite + React + TS)**

with **descriptions for every package/folder**:

---

# 📂 Project Structure (Vite)

```
src/
├── assets/                  # Static assets (non-code)
│   ├── fonts/               # Custom font files (.woff2, .ttf)
│   ├── images/              # PNG/JPG/WEBP used in app
│   └── icons/               # SVG icons (preferable for scalable UI)
│
├── components/              # Global, reusable UI building blocks
│   ├── common/              # Generic, shareable UI components
│   │   ├── Button/          # Example button with isolated CSS Module
│   │   ├── Input/           # Example input field
│   │   └── Modal/           # Example modal component
│   └── layouts/             # Page-level layouts (wrappers for content)
│       ├── MainLayout/      # For students/general users
│       ├── AdminLayout/     # For department admins
│       └── SuperAdminLayout/# For super admins
│
├── contexts/                # React Contexts for global state
│   ├── AuthContext.tsx      # Authentication state + role info
│   └── ThemeContext.tsx     # Dark/light mode or theming
│
├── features/                # Business logic, split by feature/domain
│   ├── auth/                # Authentication & user session
│   │   ├── api/             # Login, logout, token refresh requests
│   │   ├── LoginPage.tsx    # UI for login
│   │   ├── RegisterPage.tsx # (Optional) signup flow
│   │   └── useAuth.ts       # Hook to interact with AuthContext
│   │
│   ├── researchLibrary/     # Shared: accessible to all roles
│   │   ├── api/             # Research library endpoints
│   │   ├── components/      # Research-specific UI widgets
│   │   ├── hooks/           # Data-fetching + state hooks
│   │   └── HomePage.tsx     # Main entry page for research browsing
│   │
│   ├── student/             # Student-only functionality
│   │   ├── api/             # Student API endpoints (requests, profile)
│   │   ├── hooks/           # Hooks specific to student workflows
│   │   └── MyRequestsPage.tsx # Students track research requests
│   │
│   ├── admin/               # Department Admin functionality
│   │   ├── api/             # Admin API endpoints (approvals, stats)
│   │   ├── components/      # Admin-only UI widgets
│   │   ├── AdminDashboard.tsx   # Landing page for admins
│   │   └── ManageRequestsPage.tsx # Admin research requests view
│   │
│   └── superAdmin/          # Super Admin functionality
│       ├── api/             # Super admin API endpoints
│       ├── ManageResearchesPage.tsx # Manage all research data
│       └── SystemUsersPage.tsx      # Manage accounts/roles
│
├── lib/                     # Third-party libs, configs, wrappers
│   └── axios.ts             # Axios instance w/ interceptors (auth headers)
│
├── pages/                   # Application entry points / routing
│   ├── App.tsx              # Defines app routes + role-based guards
│   └── main.tsx             # Vite entrypoint (ReactDOM.createRoot)
│
├── styles/                  # Global CSS (non-module, project-wide)
│   ├── variables.css        # CSS variables (colors, spacing, etc.)
│   └── globals.css          # Reset, global rules, typography
│
├── types/                   # TypeScript types & interfaces
│   ├── api.ts               # API response/request types
│   └── user.ts              # User + role types (student/admin/superAdmin)
│
└── utils/                   # Pure utility functions (no React)
    └── helpers.ts           # Example: dateFormat(), string utils, etc.
```

---

# 📝 Folder/Package Descriptions

### 1. **`assets/`**

- **Purpose:** Pure static assets. No logic.
- **Usage:** Import directly inside React components.

  ```ts
  import logo from "@/assets/images/school-logo.png";
  ```

---

### 2. **`components/`**

- **Purpose:** Reusable UI building blocks and layouts.
- **Rule:** No business logic here.
- Examples:
  - `common/` → `Button`, `Input`, `Modal`
  - `layouts/` → `MainLayout`, `AdminLayout`, `SuperAdminLayout`

---

### 3. **`contexts/`**

- **Purpose:** App-wide state using React Context.
- `AuthContext.tsx` → exposes `{ user, role, login(), logout() }`
- `ThemeContext.tsx` → handles light/dark mode

---

### 4. **`features/`**

- **Purpose:** Each folder = a **self-contained business domain**.
- Contains its **API, hooks, components, and pages**.

**Sub-features:**

- `auth/` → login/logout/session handling
- `researchLibrary/` → browsing/searching research
- `student/` → requests, submissions, student-only workflows
- `admin/` → dashboard, approvals, analytics
- `superAdmin/` → system-wide management (users, research)

---

### 5. **`lib/`**

- **Purpose:** Wrappers for external libs.
- Example: `axios.ts` = Axios instance with base URL + token interceptors.

---

### 6. **`pages/`**

- **Purpose:** Application entry + routing.
- `main.tsx` → Vite entrypoint, renders `<App />`.
- `App.tsx` → configures React Router + guards based on `role`.

---

### 7. **`styles/`**

- **Purpose:** Global CSS, variables, resets.
- Rule: Localized component styles should use `.module.css`.

---

### 8. **`types/`**

- **Purpose:** Centralized TypeScript definitions.
- Example:

  ```ts
  export type UserRole = "student" | "admin" | "superAdmin";
  export interface User {
    id: string;
    name: string;
    role: UserRole;
    token: string;
  }
  ```

---

### 9. **`utils/`**

- **Purpose:** Pure helper functions.
- Rule: No React, no side effects.

---

✅ **Blunt takeaway:**

- Vite’s real entrypoint = `main.tsx`.
- `App.tsx` = app shell + router.
- Everything else grows inside `features/`.
- Global/shared stuff stays in `components/`, `contexts/`, `types/`, `utils/`.

---

Do you want me to also draft a **starter `main.tsx` + `App.tsx` (with role-based routing + guards)** so your team has a working base right away?
