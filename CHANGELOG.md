# Changelog

All notable changes to **LabCentral — LIMS** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
