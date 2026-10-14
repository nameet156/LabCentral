# Changelog

All notable changes to **LabCentral — LIMS** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-10-14

### 🎨 UI Redesign & Modern Design System

- **Bespoke UI Component Primitives** (`client/src/components/ui/primitives.tsx`):
  - **`MagneticButton`**: Physics-based cursor attraction button with spring motion (`useSpring`, stiffness: 260, damping: 18) and reduced-motion fallback.
  - **`SpotlightCard`**: Interactive cursor-following radial spotlight illumination (`--spot-x`, `--spot-y`) with smooth elevation transitions.
  - **Core Primitives**: Reusable, accessible `Card`, `Button` (primary, secondary, ghost, danger), `Input`, `Select`, `Badge` (neutral, blue, cyan, success, warning, danger), `Modal` with focus and escape key management, and `Skeleton` loaders.
- **Ambient Cursor Interaction** (`CursorGlow.tsx`):
  - Fluid, spring-damped ambient cursor glow tracking pointer movement, disabled automatically for touch devices and users preferring reduced motion.
- **Dark & Light Mode Theming**:
  - Full dual-theme architecture powered by CSS custom properties and Tailwind CSS v4 color tokens with persistent `localStorage` (`lims_theme`) synchronization.
  - Interactive theme toggle with Sun/Moon icons in the topbar.
- **Collapsible Navigation & Workspace**:
  - Desktop sidebar supports smooth animated width toggling (256px expanded / 76px collapsed) with icon tooltips and spring layout transitions.
  - Floating pill-shaped topbar featuring active route breadcrumbs, theme switcher, and user avatar chip.
  - Full-screen responsive mobile navigation drawer with backdrop blur.
- **Accessibility & Motion Hardening**:
  - Wrapped root in `<MotionConfig reducedMotion="user">` to automatically disable intense transforms and spring animations for users with vestibular sensitivities.
  - Upgraded focus rings, ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-label`), and contrast ratios across all states.
- **View Modernization**:
  - Refactored `DashboardPage`, `KanbanBoard`, `SampleDetailPage`, `ReportsPage`, `UsersPage`, `LoginPage`, and `RegisterPage` to adopt the new primitives and design language.

---

## [1.0.4] — 2026-08-24

### ✨ Added

- **Sample Assignment & Reassignment Workflow**:
  - **Assignable Staff API**: Added `GET /api/users/assignable` accessible to all authenticated technicians and administrators to retrieve active laboratory personnel.
  - **Assignment on Sample Creation**: Added an "Assigned To" staff selection menu in `CreateSampleForm` defaulting to the current user with options to delegate to any laboratory staff member or place in the unassigned triage queue.
  - **Dynamic Sample Reassignment**: Added interactive reassignment controls directly on the `SampleDetailPage` (`PATCH /api/samples/:id/assign`), allowing technicians and admins to transfer sample ownership and testing responsibilities in real-time.

---

## [1.0.3] — 2026-08-24

### ✨ Added

- **Admin User Management Dashboard** (`/users`) — A dedicated management suite exclusively accessible to administrators:
  - Overview metrics for total registered personnel, active administrators, bench technicians, and read-only viewers.
  - Interactive search and filter controls to quickly find users by name, email, or role tier.
  - **Role & Profile Editing Modal**: Instant ability to promote or reassign staff roles between Admin, Technician, and Viewer with contextual permission descriptions.
  - **Account Deletion with Safeguards**: Permanent user removal with safety confirmation modals, self-deletion prevention (admins cannot delete their own active account), and last-administrator protection.
- **Role-Gated Navigation** — The **Users** tab automatically renders in the Sidebar and mobile drawer navigation for administrators while remaining hidden from technicians and viewers.
- **Admin REST API** — Added `GET /api/users`, `PATCH /api/users/:id`, and `DELETE /api/users/:id` endpoints protected by JWT authentication and role-based authorization middleware.

---

## [1.0.2] — 2026-08-17

### 🐛 Fixed

- **"Assigned To: Unassigned" Clarification & Fix** — When creating a sample, it is now automatically assigned to the authenticated user creating it, eliminating the confusing "Unassigned" placeholder.
- **Cleared Sample Data** — Started with an empty database instance ready for fresh live demo use.
- **SPA Fallback Routing** — Added Express 5 compatible SPA static asset serving so deep links (e.g. `/reports`, `/samples/:id`) work seamlessly when hosting.

### 🚀 Added

- **Unified Production Build & Hosting Readiness** — Added root `package.json` with `npm run build` and `npm start` commands. The backend Express server now serves the built Vite React frontend (`client/dist`), enabling zero-cost, single-service deployment on platforms like Render or Railway.

---

## [1.0.1] — 2026-08-16

### 🎨 Changed

- **Rebranded** the application from "LIMS" to **LabCentral — LIMS** across
  all surfaces: sidebar, topbar, login, register, HTML title, and package.json.
- **Logo icon** updated from FlaskConical to Activity pulse icon for a more
  modern, recognisable brand identity.

### 🐛 Fixed

- **Light mode unreadable UI** — Inverted the surface colour scale via CSS
  custom properties so all Tailwind classes (`bg-surface-900`, `text-surface-100`,
  etc.) automatically resolve correctly in both dark and light themes. Added
  targeted overrides for inputs, sidebar, topbar, toasts, and skeleton loaders.
- **"Validation failed" on create sample** — The "Assign To" field asked for a
  raw MongoDB ObjectId that users wouldn't know. Removed the field; samples are
  now created without explicit assignment. The Sample Type selector was
  redesigned with visual icon cards (Water/Food/Soil) for better UX.
- **Infinite fetch loop on dashboard** — The `useToast` context value was
  recreated every render, causing `useCallback` dependencies to invalidate
  endlessly. Fixed by memoising the context value with `useMemo`.
- **Limit 200 exceeding server max** — Dashboard requested `limit=200` but the
  Zod validator caps at 100. Reduced to `limit=100`.

### ✨ Added

- **CHANGELOG.md** — This file; tracks all releases going forward.
- **Design polish** — Added CSS utility classes: `.pattern-dots` (subtle dot
  grid), `.glow-primary` (soft indigo glow), `.shimmer` (skeleton animation),
  and enhanced `.glass-card` shadows in light mode.
- **Create Sample UX** — Type selector now uses interactive icon cards instead
  of a plain dropdown; character counter on notes field; subtitle explaining
  the form's purpose.

---

## [1.0.0] — 2026-08-08

### ✨ Features

- **Authentication** — JWT-based auth with bcrypt hashing, login/register flows,
  role-based access control (admin, technician, viewer).
- **Sample CRUD** — Create, list (with filtering & pagination), and view samples.
  Auto-generated sequential sample codes (e.g. `SMP-000042`).
- **State Machine** — Server-enforced status transitions:
  `received → in_progress → qc_review → completed / rejected`.
  Invalid transitions return `400 Bad Request`.
- **Optimistic Concurrency** — `PATCH /status` requires a `version` field
  matching `__v`. Stale writes return `409 Conflict`.
- **Atomic Audit Logging** — Every status change and sample creation is logged
  via MongoDB transactions (audit log + sample update in one commit).
- **Notes** — Add timestamped, author-attributed notes to any sample.
- **Reports** — Aggregation pipeline returning `byStatus` and `byType` counts.
- **Kanban Dashboard** — Drag-and-drop board powered by `@hello-pangea/dnd`
  with optimistic updates, 5 status columns, loading skeletons, and empty state.
- **Sample Detail Page** — Full sample view with status transition buttons,
  audit timeline, notes section, and info grid.
- **Reports Page** — Animated stat cards with count-up, Recharts bar chart
  (by status) and donut chart (by type), responsive grid layout.
- **Toast Notifications** — Context-based system with success/error/info types,
  stacking, auto-dismiss, and slide-in animations.
- **Seed Script** — API-based seeder creating 3 demo users and 30 samples
  across all workflow stages, with realistic audit trails and notes.
- **Dark Mode** — Full dark theme as default with theme toggle.
- **Responsive** — Mobile sidebar overlay, adaptive grid layouts.

### 🏗 Architecture

- **Backend**: Node.js + Express → Controller → Service → Model layering.
  In-memory MongoDB replica set via `mongodb-memory-server` for zero-config dev.
- **Frontend**: React 19 (Vite), Tailwind CSS v4, Framer Motion, Axios, React
  Router v7. Path aliases via `@/`.
