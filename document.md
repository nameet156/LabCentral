# LabCentral (LIMS) — Comprehensive System Documentation

---

## Document: What You Must Understand

This document provides a complete, authoritative, and code-grounded deep dive into **LabCentral**, a full-stack Laboratory Information Management System (LIMS). 

Before reading, understand the core premise:
1. **Domain**: LabCentral manages physical laboratory samples (water, food, soil) across their testing lifecycle.
2. **Core Invariant**: Every state transition in the system is governed by a deterministic finite state machine, enforced server-side, and recorded in an immutable, append-only audit trail within an atomic database transaction.
3. **Data Integrity Under Concurrency**: Concurrent modifications to the same sample are detected and prevented using Optimistic Concurrency Control (OCC) through document version keys (`__v`), eliminating lost updates without expensive pessimistic locks.
4. **Clean Layered Architecture**: The backend strictly separates concerns: `Routes -> Middleware -> Controllers -> Services -> Models -> Database`. Business logic never leaks into controllers or routes.

---

## 00 — Project Overview

### The Real-World Problem
In analytical, clinical, and environmental testing laboratories, hundreds of physical test samples arrive daily. Laboratories must comply with rigorous quality standards (e.g., ISO/IEC 17025, Good Laboratory Practice). Manual tracking via spreadsheets or physical paper logs introduces critical failure modes:
- **State Confusion**: Analysts test samples that have not been formally accessioned or are already archived.
- **Lost Audit History**: In spreadsheets, edits overwrite prior values, destroying the chain of custody required by regulatory inspectors.
- **Race Conditions**: Two technicians simultaneously update results or status for the same specimen, silently clobbering each other's work.
- **Unauthorized Actions**: Non-certified personnel modify testing phases or approve results without credential checks.

### How LabCentral Works
LabCentral eliminates these risks through an automated, full-stack workflow tracking platform:
- **Specimen Ingestion & Triage**: Technicians create samples (selecting matrix type: water, food, or soil) with optional staff assignment. The system automatically generates a formatted, unique, year-scoped sample identifier (e.g., `SMP-2026-00001`).
- **Dynamic Sample Assignment & Delegation**: Staff ownership can be assigned during intake or dynamically reassigned on the sample detail view (`PATCH /api/samples/:id/assign`), powered by an active personnel directory API (`GET /api/users/assignable`).
- **Interactive Visual Kanban Board**: Samples appear as draggable cards organized across 5 distinct workflow columns (`received`, `in_progress`, `qc_review`, `completed`, `rejected`).
- **State Machine Enforcement**: Dragging or advancing a card executes server-side validation against a strict transition graph. Terminal states (`completed`, `rejected`) can never transition again.
- **Atomic Audit Trail**: The status transition and an immutable audit log entry are written together inside a MongoDB multi-document ACID transaction. If either operation fails, the entire transaction rolls back.
- **Optimistic Concurrency Control (OCC)**: The client provides the document's version number (`__v`). If another operator updated the sample in the interim, the server detects the version mismatch and rejects the operation with an HTTP `409 Conflict`, reverting the frontend UI.
- **Role-Based Access Control (RBAC)**: Users hold one of three roles (`admin`, `technician`, `viewer`). Route-level authorization blocks unauthorized actions (e.g., viewers cannot change status or create samples; only admins can access `/users` and manage accounts).
- **Bespoke Design System & Micro-Interactions**: Built with custom UI primitives (`primitives.tsx`), spring-damped magnetic buttons, cursor-following spotlight illumination, ambient glow physics (`CursorGlow.tsx`), and full dual-theme dark/light mode with CSS custom property tokens.
- **Executive Analytics**: An aggregation dashboard executes `$facet` pipelines in a single database round-trip to compute sample distributions by status and matrix type.

---

## 01 — Tech Stack

### Frontend Ecosystem
| Technology | Version | Purpose in LabCentral |
|---|---|---|
| **React** | `^19.2.18` | Declarative UI component library utilizing functional components, custom hooks, and modern primitives |
| **TypeScript** | `~6.0.2` | Compile-time type checking and interfaces for domain entities, component props, and API contracts |
| **Vite** | `^8.2.0` | Next-generation frontend build tool and hot-module-replacement (HMR) development server |
| **Tailwind CSS** | `^4.3.3` | Utility-first styling engine with custom dark-mode and light-mode CSS design tokens and surfaces |
| **@tailwindcss/vite** | `^4.3.3` | Native Vite integration plugin for Tailwind v4 engine |
| **@hello-pangea/dnd** | `^18.0.1` | Accessible drag-and-drop toolkit powering the 5-column Kanban board |
| **Framer Motion** | `^13.0.0` | Physics-based animation library: spring-damped magnetic buttons, cursor glows, layout transitions, and `<MotionConfig reducedMotion="user">` |
| **React Router DOM** | `^7.18.2` | Client-side routing, nested layouts, and route guards (`ProtectedRoute`, `AdminRoute`, `PublicRoute`) |
| **Axios** | `^1.19.0` | Promise-based HTTP client configured with request/response interceptors for JWT injection and 401 handling |
| **Recharts** | `^3.10.1` | Composable charting library rendering responsive status bar charts and matrix pie charts |
| **Lucide React** | `^1.30.0` | Comprehensive icon library for workflow, matrix, layout, and action icons |
| **clsx & tailwind-merge** | `^2.1.1` / `^3.6.0` | Conditional class name resolution and CSS conflict deduplication (`cn` helper) |

### Backend Ecosystem
| Technology | Version | Purpose in LabCentral |
|---|---|---|
| **Node.js** | `>= 18.0.0` | Asynchronous JavaScript runtime environment |
| **Express** | `^5.2.1` | Minimalist web application framework providing routing, middleware chaining, and HTTP dispatch |
| **MongoDB** | `>= 6.0` | Distributed document-oriented NoSQL database providing document collections and multi-document transactions |
| **Mongoose** | `^9.9.1` | Object-Document Mapper (ODM) enforcing schemas, type casting, validation, and lifecycle hooks |
| **mongodb-memory-server** | `^11.2.0` | In-memory MongoDB replica set engine enabling zero-dependency local development and transaction support |
| **Zod** | `^4.4.3` | TypeScript-first schema declaration and runtime input validation/coercion library |
| **jsonwebtoken (JWT)** | `^9.0.3` | Cryptographic signing and verification of HMAC-SHA256 bearer tokens |
| **bcryptjs** | `^3.0.3` | Adaptive password hashing function with configurable salt rounds ($2^{12}$ iterations) |
| **cors** | `^2.8.6` | Cross-Origin Resource Sharing middleware enabling browser communication across local ports |
| **dotenv** | `^17.4.2` | Environment configuration manager loading `.env` variables into `process.env` |

---

## 02 — Repository Map

```
lims/
├── package.json                         # Root monorepo scripts (dev, install, build)
├── README.md                            # High-level architecture documentation
├── CHANGELOG.md                         # Project version history and feature roadmap
├── document.md                          # Exhaustive system architectural documentation
│
├── client/                              # FRONTEND ROOT (React 19 + TypeScript + Vite)
│   ├── index.html                       # HTML5 template containing #root injection mount
│   ├── package.json                     # Frontend dependencies, scripts (dev, build, preview)
│   ├── tsconfig.json                    # TypeScript compiler configuration (DOM, ESNext, paths)
│   ├── vite.config.ts                   # Vite config: plugins, path alias (@ -> src), /api proxy
│   └── src/
│       ├── main.tsx                     # React root: mounts BrowserRouter, AuthProvider, ToastProvider
│       ├── App.tsx                      # Route switchboard: MotionConfig, public/protected/admin route guards
│       ├── index.css                    # Tailwind CSS v4 imports, CSS custom properties, dark/light themes
│       ├── vite-env.d.ts                # Vite client type declarations
│       ├── api/                         # Network Layer
│       │   ├── axios.ts                 # Axios instance with request/response interceptors
│       │   ├── auth.api.ts              # register, login, getMe HTTP calls
│       │   ├── samples.api.ts           # list, getById, create, updateStatus, assign, addNote, getAuditLog
│       │   ├── users.api.ts             # listUsers, listAssignable, updateUser, deleteUser
│       │   └── reports.api.ts           # getSummary reporting endpoint
│       ├── context/
│       │   └── AuthContext.tsx          # Global auth state: user, token, boot verification, login, logout
│       ├── lib/
│       │   └── utils.ts                 # cn() utility merging clsx and tailwind-merge
│       ├── pages/                       # Application Views
│       │   ├── LoginPage.tsx            # Login form with spotlight card, demo auto-fill, and validation
│       │   ├── RegisterPage.tsx         # Account registration form with role selection
│       │   ├── DashboardPage.tsx        # Main view: Kanban board, optimistic UI state, New Sample modal
│       │   ├── SampleDetailPage.tsx     # Single sample overview, status transition buttons, staff assignment, notes
│       │   ├── ReportsPage.tsx          # Metric cards, status distribution bar chart, matrix pie chart
│       │   └── UsersPage.tsx            # Admin user management: role updates, deletion, account safety
│       └── components/                  # Component Library
│           ├── layout/
│           │   ├── AppLayout.tsx        # Shell wrapping collapsible Sidebar, Topbar, and dynamic page content
│           │   ├── Sidebar.tsx          # Collapsible navigation rail (256px / 76px) with spring active layouts
│           │   └── Topbar.tsx           # Floating glassmorphic header with breadcrumb, theme toggle, user badge
│           ├── kanban/
│           │   ├── KanbanBoard.tsx      # DragDropContext wrapper mapping status columns
│           │   ├── KanbanColumn.tsx     # Droppable column container with status indicator badge and counts
│           │   └── SampleCard.tsx       # Draggable card displaying code, matrix tag, assignee, timestamp
│           ├── samples/
│           │   ├── CreateSampleForm.tsx # Modal dialog for sample accessioning (type, staff assignment, note)
│           │   ├── AuditTimeline.tsx    # Chronological visual vertical timeline of sample mutations
│           │   └── NotesSection.tsx     # Embedded commentary thread with relative time formatting
│           ├── reports/
│           │   ├── StatCard.tsx         # Metric overview card displaying numerical aggregates
│           │   └── Charts.tsx           # Responsive Recharts wrappers (StatusBarChart, TypePieChart)
│           └── ui/
│               ├── CursorGlow.tsx       # Ambient mouse-following glow with physics-damped spring motion
│               ├── primitives.tsx       # MagneticButton, SpotlightCard, Card, Button, Input, Select, Badge, Modal, Skeleton
│               └── Toast.tsx            # Context-driven toast notification system (success, error, info)
    ├── server.js                        # Server entry point: connects DB then calls app.listen()
    ├── seed.js                          # Standalone seeding script (3 users, 30 realistic samples)
    ├── package.json                     # Backend dependencies and scripts (start, dev, seed)
    ├── .env.example                     # Environment template showing required variables
    └── src/
        ├── app.js                       # Express app assembly: global middleware, routes, static SPA, 404, error handler
        ├── config/
        │   ├── db.js                    # Database connection manager (real MongoDB or in-memory replica set)
        │   └── env.js                   # Environment variable loader with fallback defaults
        ├── models/
        │   ├── User.js                  # User schema: name, email, passwordHash, role, toJSON scrubber
        │   ├── Sample.js                # Sample schema: sampleCode, type, status, assignedTo, notes[], __v
        │   └── AuditLog.js              # AuditLog schema: sampleId, action, previousStatus, newStatus, performedBy
        ├── middleware/
        │   ├── auth.js                  # JWT verification middleware: decodes token and sets req.user
        │   ├── authorize.js             # RBAC middleware factory: enforces role permissions
        │   ├── validate.js              # Zod validation middleware factory for body or query
        │   └── errorHandler.js          # Global error handler: formats Mongoose, duplicate key, CastError, and app errors
        ├── routes/
        │   ├── auth.routes.js           # /api/auth endpoints (register, login, me)
        │   ├── sample.routes.js         # /api/samples endpoints (CRUD, status, assign, notes, audit)
        │   ├── user.routes.js           # /api/users endpoints (assignable, list, update, delete)
        │   └── report.routes.js         # /api/reports endpoints (summary aggregation)
        ├── controllers/
        │   ├── auth.controller.js       # HTTP handling for authentication actions
        │   ├── sample.controller.js     # HTTP handling for sample operations
        │   ├── user.controller.js       # HTTP handling for user administration
        │   └── report.controller.js     # HTTP handling for summary aggregation
        ├── services/
        │   ├── auth.service.js          # Auth business logic: bcrypt hashing, credential check, JWT signing
        │   ├── sample.service.js        # Sample business logic: transactions, OCC, code generation, audit logging
        │   └── user.service.js          # User business logic: self-deletion and last-admin guards
        ├── validators/
        │   ├── auth.validator.js        # Zod schemas: registerSchema, loginSchema
        │   ├── sample.validator.js      # Zod schemas: createSampleSchema, updateStatusSchema, listSamplesQuerySchema
        │   └── user.validator.js        # Zod schemas: updateUserSchema
        └── utils/
            ├── stateMachine.js          # Pure function transition table and validator
            └── sampleCode.js            # Year-based incrementing sample code generator
```

---

## 03 — System Architecture

### Component Interaction Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BROWSER RUNTIME                                 │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         React 19 Frontend                           │   │
│   │                                                                     │   │
│   │   Pages: DashboardPage  |  SampleDetailPage  |  ReportsPage          │   │
│   │   Components: KanbanBoard  |  AuditTimeline  |  NotesSection        │   │
│   │   State: React Context (AuthContext) + Component State (useState)   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                       Axios HTTP Client Layer                       │   │
│   │   - Request Interceptor: Injects Authorization: Bearer <token>      │   │
│   │   - Response Interceptor: Catches 401 Unauthorized -> /login        │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │ HTTP / JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS 5 API SERVER                              │
│                                                                             │
│   Middleware Pipeline:                                                      │
│   ┌────────────┐     ┌──────────────┐     ┌───────────┐     ┌───────────┐   │
│   │   cors()   │ ──► │express.json()│ ──► │  auth.js  │ ──► │authorize()│   │
│   └────────────┘     └──────────────┘     └─────┬─────┘     └─────┬─────┘   │
│                                                 │                 │         │
│                                                 ▼                 ▼         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Route Dispatchers & Input Validation:                              │   │
│   │  /api/auth   |   /api/samples   |   /api/users   |   /api/reports   │   │
│   │  validate(zodSchema) intercepts request body & query                │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ Clean, Validated Domain DTO          │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Controllers: auth.controller | sample.controller | user.controller │   │
│   │  (Transforms HTTP request parameters -> Invokes Service Layer)       │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Services: auth.service | sample.service | user.service             │   │
│   │  (Business Rules, OCC Version Checks, State Machine, Transactions)  │   │
│   │                                                                     │   │
│   │  Pure Utilities:                                                    │   │
│   │  - stateMachine.js (Validates transitions: received -> in_progress) │   │
│   │  - sampleCode.js   (Generates auto-incrementing SMP-2026-00001)     │   │
│   └───────────────────┬───────────────────────────────┬─────────────────┘   │
│                       │ Mongoose Query Session        │                     │
│                       ▼                               ▼                     │
│   ┌───────────────────────────────────┐   ┌─────────────────────────────┐   │
│   │   Mongoose Schemas & Models       │   │ Global Error Handler        │   │
│   │   User.js | Sample.js | AuditLog  │   │ (errorHandler.js)           │   │
│   └───────────────────┬───────────────┘   │ Normalizes 400/404/409/500  │   │
│                       │                   └─────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────────────────────┘
                        │ Wire Protocol (Sessions, Multi-Doc Transactions)
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATABASE LAYER                                  │
│                                                                             │
│   MongoDB Instance (or MongoMemoryReplSet during development)               │
│   Storage Engine: WiredTiger (Supports ACID multi-document transactions)    │
│                                                                             │
│   Collections:                                                              │
│   ├── [ users ]      Unique index: email                                    │
│   ├── [ samples ]    Unique: sampleCode; Compound: {status:1, type:1}       │
│   └── [ auditlogs ]  Compound index: {sampleId:1, timestamp:1}              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 04 — Data Flow

### Primary Lifecycle Trace: Updating a Sample Status

```
[ USER (Browser) ]
      │  Drags a sample card from "Received" column to "In Progress"
      ▼
[ CLIENT: KanbanBoard.tsx ]
      │  handleDragEnd(result) captures draggableId and destination column
      ▼
[ CLIENT: DashboardPage.tsx ]
      │  handleStatusChange(sampleId, 'in_progress', version)
      │  1. Optimistic Update: Local React state updates immediately
      │  2. Calls samplesApi.updateStatus(sampleId, { status: 'in_progress', version })
      ▼
[ CLIENT: axios.ts (Request Interceptor) ]
      │  Reads localStorage('lims_token')
      │  Injects header: Authorization: Bearer <jwt_token>
      ▼
[ NETWORK: HTTP PATCH /api/samples/:id/status ]
      ▼
[ SERVER: app.js ]
      │  cors() handles headers; express.json() parses body
      ▼
[ SERVER: sample.routes.js ]
      │  Route matched: PATCH /:id/status
      │
      ├──► Middleware 1: auth.js
      │     - Extracts Bearer token
      │     - jwt.verify(token, JWT_SECRET)
      │     - User.findById(decoded.userId) ensures user still exists
      │     - Attaches req.user and req.userId
      │
      ├──► Middleware 2: authorize('admin', 'technician')
      │     - Evaluates req.user.role in ['admin', 'technician'] -> PASS
      │
      └──► Middleware 3: validate(updateStatusSchema)
            - Zod safeParse ensures status is valid enum and version is an integer
      ▼
[ SERVER: sample.controller.js ]
      │  updateSampleStatus() extracts id, status, version, userId
      ▼
[ SERVER: sample.service.js ]
      │  updateSampleStatus()
      │  1. const session = await mongoose.startSession();
      │  2. session.startTransaction();
      │  3. Sample.findOne({ _id: sampleId, __v: version }).session(session)
      │     [If __v mismatch: checks if doc exists; throws 409 Conflict]
      │  4. stateMachine.validateTransition('received', 'in_progress') -> Valid
      │  5. sample.status = 'in_progress'
      │  6. sample.increment()  [Explicitly bumps __v from 0 to 1]
      │  7. await sample.save({ session })
      │  8. await AuditLog.create([{
      │        sampleId: sample._id,
      │        action: 'STATUS_CHANGE',
      │        previousStatus: 'received',
      │        newStatus: 'in_progress',
      │        performedBy: userId
      │     }], { session })
      │  9. await session.commitTransaction();
      │ 10. await sample.populate(['createdBy', 'assignedTo', 'notes.author'])
      │ 11. session.endSession();
      ▼
[ SERVER: sample.controller.js ]
      │  res.json({ sample })
      ▼
[ NETWORK: HTTP 200 OK Response ]
      ▼
[ CLIENT: DashboardPage.tsx ]
      │  Receives server response with new __v: 1
      │  Replaces optimistic sample card with authoritative server entity
      │  Toast displays: "Status updated successfully"
```

### Secondary Lifecycle Trace: Assigning or Delegating a Sample

```
[ USER (Browser) ]
      │  Selects a staff member from the "Assigned To" select dropdown on SampleDetailPage
      ▼
[ CLIENT: SampleDetailPage.tsx ]
      │  handleAssignChange(newAssigneeId)
      │  Calls samplesApi.assign(sampleId, newAssigneeId || null)
      ▼
[ CLIENT: axios.ts (Request Interceptor) ]
      │  Reads localStorage('lims_token')
      │  Injects header: Authorization: Bearer <jwt_token>
      ▼
[ NETWORK: HTTP PATCH /api/samples/:id/assign ]
      │  Body: { "assignedTo": "67b84f2e9d1a2b3c4d5e6f7a" }
      ▼
[ SERVER: sample.routes.js ]
      │  Route matched: PATCH /:id/assign
      │  Middleware 1: auth.js (verifies token, loads user)
      │  Middleware 2: authorize('admin', 'technician') (guards role)
      │  Middleware 3: validate(assignSampleSchema) (validates 24-char hex ObjectId or null)
      ▼
[ SERVER: sample.controller.js ]
      │  assignSample() extracts sampleId and assignedTo
      ▼
[ SERVER: sample.service.js ]
      │  assignSample()
      │  1. Queries: Sample.findById(sampleId)
      │  2. If assignedTo is non-null: verifies target User exists in database
      │  3. sample.assignedTo = assignedTo || null
      │  4. await sample.save()
      │  5. await sample.populate(['createdBy', 'assignedTo', 'notes.author'])
      ▼
[ SERVER: sample.controller.js ]
      │  res.json({ sample })
      ▼
[ CLIENT: SampleDetailPage.tsx ]
      │  Updates local state with populated assignee object
      │  Toast displays: "Assigned to <Staff Name>" (or "Assigned to Unassigned")
```

---

## 05 — Frontend

### Architecture and Component Hierarchy
The frontend is a single-page application built on React 19, Vite, and React Router DOM v7, wrapped in a top-level Framer Motion configuration to respect system-level reduced motion preferences:

```
<MotionConfig reducedMotion="user">
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <App>
          <Routes>
            <PublicRoute>   -> /login (LoginPage)
            <PublicRoute>   -> /register (RegisterPage)
            <ProtectedRoute> -> <AppLayout>
                                  ├── <Sidebar />  (Collapsible: 256px / 76px)
                                  ├── <Topbar />   (Floating Glassmorphic Header)
                                  ├── <CursorGlow /> (Ambient Pointer Physics)
                                  └── <Outlet />
                                        ├── / (DashboardPage)
                                        ├── /samples/:id (SampleDetailPage)
                                        ├── /reports (ReportsPage)
                                        └── <AdminRoute> -> /users (UsersPage)
          </Routes>
        </App>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
</MotionConfig>
```

### Bespoke Design System & UI Primitives (`client/src/components/ui/primitives.tsx`)
Rather than relying on bloated external UI suites, LabCentral implements a custom, accessible, micro-interaction-driven component library:
1. **`MagneticButton`**:
   - Computes pointer offset relative to button center (`clientX - bounds.left - width/2`).
   - Translates cursor pull into physical displacement using Framer Motion springs (`useSpring`, stiffness: 260, damping: 18, mass: 0.3).
   - Bounds maximum pull to $\pm 6\text{px}$.
   - Automatically disables motion when `useReducedMotion()` is active, when the button is disabled, or when triggered by touch/coarse pointers.
2. **`SpotlightCard` & `Card`**:
   - Tracks cursor coordinates dynamically across the card surface, injecting CSS custom properties `--spot-x` and `--spot-y`.
   - Renders a subtle radial gradient highlight following the user's cursor:
     ```css
     background: radial-gradient(420px circle at var(--spot-x) var(--spot-y), rgba(45, 91, 255, 0.08), transparent 70%);
     ```
   - Includes micro-elevation on hover (`y: -3px`) with smooth spring return.
3. **`Button`**:
   - Variant-driven abstraction: `primary` (renders `MagneticButton`), `secondary`, `ghost`, and `danger`.
4. **`Input` & `Select`**:
   - Standardized form controls with dark/light mode surface tokens, glassmorphism backdrop blur, and accessible focus-visible rings (`--focus-ring`).
5. **`Badge`**:
   - Tone-driven status and matrix tags (`neutral`, `blue`, `cyan`, `success`, `warning`, `danger`) with semi-transparent tinted backgrounds.
6. **`Modal`**:
   - Accessible dialog overlay with backdrop blur, `AnimatePresence` scale-in/out transitions, keyboard `Escape` dismissal listener, and `role="dialog"` `aria-modal="true"`.
7. **`Skeleton`**:
   - Shimmer pulse placeholders mimicking content shapes during asynchronous data fetches.

### Ambient Physics & Cursor Interactions (`client/src/components/ui/CursorGlow.tsx`)
- Renders a floating, ambient radial glow layer in the background that smoothly tracks the pointer.
- Uses independent `x` and `y` motion values smoothed by Framer Motion springs (`stiffness: 78`, `damping: 24`, `mass: 0.9`).
- **Accessibility & Battery Conservation**: Automatically returns `null` if the user has requested reduced motion (`useReducedMotion()`) or if the client operates on a touch screen (`window.matchMedia('(pointer: coarse)').matches`).

### Dual-Theme Dark & Light Architecture
- Configured in [`client/src/index.css`](file:///Users/nameet/156/Projects/lims/client/src/index.css) using Tailwind CSS v4 `@theme` and CSS custom variables.
- Defaults to a high-contrast dark palette (`surface-950`, `surface-900`, `surface-800`, `primary-500`, `accent-blue`, `accent-cyan`).
- **Light Theme (`html.light`)**: Inverts surfaces (`--color-surface-900: #ffffff`, `--color-surface-800: #f1f3f8`, `--app-border: rgba(15, 23, 42, 0.08)`), preserving readability and full contrast.
- **Persistence**: Toggling the theme in `Topbar.tsx` dynamically toggles the `.light` class on `document.documentElement` and persists the selection in `localStorage` under key `'lims_theme'`.

### Collapsible Navigation & Layout System (`AppLayout.tsx`, `Sidebar.tsx`, `Topbar.tsx`)
- **Collapsible Sidebar**:
  - Animated sidebar width toggling between 256px (expanded) and 76px (collapsed) via Framer Motion.
  - Active route tabs render an animated gradient indicator pill via `layoutId="sidebar-active"`.
  - In collapsed mode, labels smoothly fade out while icons remain centered with accessible tooltips.
  - Fully responsive: folds into a mobile overlay drawer on screens `< 768px`.
- **Floating Topbar**:
  - Positioned as a floating pill-shaped header (`sticky top-3`) with translucent backdrop blur (`backdrop-blur-2xl`).
  - Displays dynamic breadcrumb title and icon based on the active route.
  - Houses the interactive dark/light mode toggle, user identity badge with role color tagging, and quick logout button.

### State Management Strategy
The application deliberately avoids external state stores (Redux, Zustand) in favor of React's native primitives:
- **Global Auth State (`AuthContext.tsx`)**:
  - `user`: Holds authenticated user metadata (`_id`, `name`, `email`, `role`).
  - `token`: Persisted in `localStorage` as `'lims_token'`.
  - `isLoading`: Protects against route flicker during initial boot verification.
  - On mount: If a token exists, calls `GET /api/auth/me`. If valid, hydrates user state; if invalid or expired, purges token and routes to `/login`.
- **Server Cache & Local UI State**:
  - Pages fetch domain entities via encapsulated API modules (`samplesApi`, `usersApi`, `reportsApi`).
  - States are stored in local page state (`useState`) and refetched following mutations.

### Kanban Drag-and-Drop Implementation
- Built on `@hello-pangea/dnd` inside [`KanbanBoard.tsx`](file:///Users/nameet/156/Projects/lims/client/src/components/kanban/KanbanBoard.tsx).
- Columns represent the 5 status states (`received`, `in_progress`, `qc_review`, `completed`, `rejected`).
- When a card drops across columns:
  1. `handleDragEnd` checks `source.droppableId !== destination.droppableId`.
  2. `DashboardPage` executes an **Optimistic UI Update**: updates local React state immediately, eliminating interface lag.
  3. `samplesApi.updateStatus(id, { status, version })` dispatches in the background.
  4. On network or business logic rejection (e.g., HTTP 400 invalid state transition or HTTP 409 concurrency conflict), the card snaps back to its original column, and an error toast notification alerts the user.

### Typed Network Layer (`client/src/api/`)
- Centered on an Axios singleton in [`axios.ts`](file:///Users/nameet/156/Projects/lims/client/src/api/axios.ts).
- **Request Interceptor**: Extracts `'lims_token'` from `localStorage` and injects `Authorization: Bearer <token>`.
- **Response Interceptor**: Intercepts HTTP 401 responses, clears stale authentication keys from `localStorage`, and forces a window redirect to `/login`.

---

## 06 — Backend

### Layered Separation of Concerns
The backend adheres to a strict 5-layer pipeline:

```
[ HTTP Request ]
       │
       ▼
1. Routes (`routes/*.routes.js`)
   - Binds HTTP verbs and URI paths
   - Attaches route-specific middleware chains
       │
       ▼
2. Middleware (`middleware/*.js`)
   - auth.js: JWT verification and identity binding
   - authorize.js: Role permission enforcement
   - validate.js: Zod request sanitization
       │
       ▼
3. Controllers (`controllers/*.controller.js`)
   - Extracts params (body, query, params, req.userId)
   - Invokes target service method
   - Formats HTTP status response (200, 201)
   - Catches uncaught exceptions -> next(error)
       │
       ▼
4. Services (`services/*.service.js`)
   - Houses 100% of domain business logic
   - Coordinates MongoDB multi-document transactions
   - Performs OCC version checks and state machine validation
   - Coordinates utilities (sampleCode.js, stateMachine.js)
       │
       ▼
5. Models (`models/*.js`)
   - Schema field constraints, indexes, and toJSON transformation
       │
       ▼
[ MongoDB Database ]
```

### Express Application Pipeline (`server/src/app.js`)
Middleware is mounted in strict sequence:
1. `cors()`: Cross-Origin Resource Sharing.
2. `express.json({ limit: '1mb' })`: Parses incoming JSON request payloads (capped at 1MB to prevent memory exhaustion attacks).
3. `GET /api/health`: Unauthenticated health check returning server timestamp.
4. Route registration:
   - `/api/auth` -> `authRoutes`
   - `/api/samples` -> `sampleRoutes`
   - `/api/reports` -> `reportRoutes`
   - `/api/users` -> `userRoutes`
5. Static Asset Hosting: Serves built SPA assets from `client/dist`.
6. SPA Fallback: Regex `/^(?!\/api).*/` serves `index.html` for non-API routes, supporting client-side routing.
7. 404 Route Catcher: Catches unmatched routes returning `{ error: "Route not found" }`.
8. `errorHandler`: The terminal 4-parameter Express error-handling middleware.

---

## 07 — API Documentation

### Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register`
- **Description**: Registers a new user account.
- **Authentication**: None (Public).
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "technician"
  }
  ```
- **Validation**: Name (2-100 chars), Email (valid email format), Password (6-128 chars), Role (`admin` | `technician` | `viewer`, default: `viewer`).
- **Success Response (`201 Created`)**:
  ```json
  {
    "user": {
      "_id": "67b84f2e9d1a2b3c4d5e6f7a",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "technician",
      "createdAt": "2026-02-21T10:00:00.000Z",
      "updatedAt": "2026-02-21T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Errors**: `400 Bad Request` (Validation failure), `409 Conflict` (Email already registered).

#### `POST /api/auth/login`
- **Description**: Authenticates user credentials and issues a JWT.
- **Authentication**: None (Public).
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "user": {
      "_id": "67b84f2e9d1a2b3c4d5e6f7a",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "technician"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Errors**: `400 Bad Request` (Malformed input), `401 Unauthorized` (Invalid email or password).

#### `GET /api/auth/me`
- **Description**: Returns authenticated user profile for session hydration.
- **Authentication**: Required (`Bearer <token>`).
- **Success Response (`200 OK`)**:
  ```json
  {
    "user": {
      "_id": "67b84f2e9d1a2b3c4d5e6f7a",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "technician"
    }
  }
  ```
- **Errors**: `401 Unauthorized` (Invalid, expired, or revoked token).

---

### Sample Endpoints (`/api/samples`)

#### `GET /api/samples`
- **Description**: Lists samples with pagination and filtering.
- **Authentication**: Required (All roles).
- **Query Parameters**:
  - `status` (`received` | `in_progress` | `qc_review` | `completed` | `rejected`)
  - `type` (`water` | `food` | `soil`)
  - `from` (ISO 8601 Date string)
  - `to` (ISO 8601 Date string)
  - `page` (Integer, default: 1)
  - `limit` (Integer, min: 1, max: 100, default: 20)
- **Success Response (`200 OK`)**:
  ```json
  {
    "samples": [
      {
        "_id": "67b850019d1a2b3c4d5e6f80",
        "sampleCode": "SMP-2026-00001",
        "type": "water",
        "status": "in_progress",
        "assignedTo": {
          "_id": "67b84f2e9d1a2b3c4d5e6f7a",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "role": "technician"
        },
        "createdBy": {
          "_id": "67b84e119d1a2b3c4d5e6f70",
          "name": "Admin User",
          "email": "admin@lims.dev",
          "role": "admin"
        },
        "notes": [],
        "__v": 1,
        "createdAt": "2026-02-21T10:15:00.000Z",
        "updatedAt": "2026-02-21T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### `GET /api/samples/:id`
- **Description**: Returns sample details and full chronological audit trail.
- **Authentication**: Required (All roles).
- **Success Response (`200 OK`)**:
  ```json
  {
    "sample": {
      "_id": "67b850019d1a2b3c4d5e6f80",
      "sampleCode": "SMP-2026-00001",
      "type": "water",
      "status": "in_progress",
      "__v": 1,
      "notes": [
        {
          "_id": "67b850559d1a2b3c4d5e6f99",
          "text": "Turbidity test completed within spec.",
          "author": {
            "_id": "67b84f2e9d1a2b3c4d5e6f7a",
            "name": "Jane Doe",
            "email": "jane@example.com"
          },
          "createdAt": "2026-02-21T10:35:00.000Z"
        }
      ]
    },
    "auditLog": [
      {
        "_id": "67b850019d1a2b3c4d5e6f81",
        "sampleId": "67b850019d1a2b3c4d5e6f80",
        "action": "CREATED",
        "previousStatus": null,
        "newStatus": "received",
        "performedBy": {
          "name": "Admin User",
          "email": "admin@lims.dev"
        },
        "timestamp": "2026-02-21T10:15:00.000Z"
      },
      {
        "_id": "67b850229d1a2b3c4d5e6f85",
        "sampleId": "67b850019d1a2b3c4d5e6f80",
        "action": "STATUS_CHANGE",
        "previousStatus": "received",
        "newStatus": "in_progress",
        "performedBy": {
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "timestamp": "2026-02-21T10:30:00.000Z"
      }
    ]
  }
  ```
- **Errors**: `404 Not Found` (Sample not found).

#### `POST /api/samples`
- **Description**: Creates a new sample with atomic CREATED audit entry.
- **Authentication**: Required (`admin`, `technician`).
- **Request Body**:
  ```json
  {
    "type": "water",
    "assignedTo": "67b84f2e9d1a2b3c4d5e6f7a",
    "notes": "Initial intake observation."
  }
  ```
- **Success Response (`201 Created`)**: Returns `{ sample: { ... } }`.
- **Errors**: `400 Bad Request` (Invalid type or malformed assignedTo ID), `403 Forbidden` (Role is `viewer`).

#### `PATCH /api/samples/:id/status`
- **Description**: Transitions workflow state under transaction and OCC version checks.
- **Authentication**: Required (`admin`, `technician`).
- **Request Body**:
  ```json
  {
    "status": "in_progress",
    "version": 0
  }
  ```
- **Success Response (`200 OK`)**: Returns updated `{ sample: { ... } }` with bumped `__v`.
- **Errors**:
  - `400 Bad Request`: Illegal state machine transition.
  - `403 Forbidden`: Role is `viewer`.
  - `404 Not Found`: Sample does not exist.
  - `409 Conflict`: OCC version mismatch (`sample.__v !== req.body.version`).

#### `PATCH /api/samples/:id/assign`
- **Description**: Assigns or reassigns sample to a staff member.
- **Authentication**: Required (`admin`, `technician`).
- **Request Body**: `{ "assignedTo": "67b84f2e9d1a2b3c4d5e6f7a" }` (or `null` to unassign).
- **Success Response (`200 OK`)**: Returns `{ sample: { ... } }`.

#### `POST /api/samples/:id/notes`
- **Description**: Appends a commentary note sub-document to a sample.
- **Authentication**: Required (All authenticated users).
- **Request Body**: `{ "text": "Specimen integrity verified." }`
- **Success Response (`200 OK`)**: Returns `{ sample: { ... } }`.

---

### User Management Endpoints (`/api/users`)

#### `GET /api/users/assignable`
- **Description**: Returns brief user list (`_id`, `name`, `email`, `role`) for assignment selectors.
- **Authentication**: Required (All authenticated roles).

#### `GET /api/users`
- **Description**: Lists all registered users (excluding password hashes).
- **Authentication**: Required (`admin` only).

#### `PATCH /api/users/:id`
- **Description**: Modifies user name or role. Blocks demoting the sole administrator.
- **Authentication**: Required (`admin` only).
- **Request Body**: `{ "name": "Jane Admin", "role": "admin" }`

#### `DELETE /api/users/:id`
- **Description**: Deletes a user account. Blocks self-deletion and deleting the sole administrator.
- **Authentication**: Required (`admin` only).

---

### Analytics Endpoints (`/api/reports`)

#### `GET /api/reports/summary`
- **Description**: Returns sample distribution metrics grouped by status and type.
- **Authentication**: Required (All authenticated roles).
- **Success Response (`200 OK`)**:
  ```json
  {
    "summary": {
      "total": 30,
      "byStatus": [
        { "status": "completed", "count": 12 },
        { "status": "in_progress", "count": 6 },
        { "status": "qc_review", "count": 4 },
        { "status": "received", "count": 5 },
        { "status": "rejected", "count": 3 }
      ],
      "byType": [
        { "type": "food", "count": 10 },
        { "type": "soil", "count": 8 },
        { "type": "water", "count": 12 }
      ]
    }
  }
  ```

---

## 08 — Database Design

### Collections & Entity Relationship Diagram

```
       ┌────────────────────────┐
       │         User           │
       ├────────────────────────┤
       │ _id: ObjectId [PK]     │
       │ name: String           │
       │ email: String [UQ]     │
       │ passwordHash: String   │
       │ role: String           │
       │ createdAt: Date        │
       │ updatedAt: Date        │
       └───────────┬────────────┘
                   │
         ┌─────────┴─────────┐
         │ 1                 │ 1
         │ createdBy         │ assignedTo
         │                   │
         ▼ *                 ▼ *
┌────────────────────────────────────────┐
│                Sample                  │
├────────────────────────────────────────┤
│ _id: ObjectId [PK]                     │
│ sampleCode: String [UQ, Index]         │
│ type: String (enum)                    │
│ status: String (enum)                  │
│ createdBy: ObjectId -> User            │
│ assignedTo: ObjectId -> User (null)    │
│ __v: Number (OCC Version)              │
│ createdAt: Date [Index]                │
│ updatedAt: Date                        │
│                                        │
│ notes: [ (Embedded Sub-document)       │
│   {                                    │
│     _id: ObjectId [PK],                │
│     text: String,                      │
│     author: ObjectId -> User,          │
│     createdAt: Date                    │
│   }                                    │
│ ]                                      │
└──────────────────┬─────────────────────┘
                   │ 1
                   │
                   ▼ *
┌────────────────────────────────────────┐
│               AuditLog                 │
├────────────────────────────────────────┤
│ _id: ObjectId [PK]                     │
│ sampleId: ObjectId -> Sample [Index]   │
│ action: String (enum)                  │
│ previousStatus: String (nullable)      │
│ newStatus: String (nullable)           │
│ performedBy: ObjectId -> User          │
│ timestamp: Date [Index]                │
└────────────────────────────────────────┘
```

### Schemas and Index Analysis

#### 1. `users` Collection ([`User.js`](file:///Users/nameet/156/Projects/lims/server/src/models/User.js))
- **Schema**:
  - `name`: `String`, required, trim, min: 2, max: 100.
  - `email`: `String`, required, unique, trim, lowercase.
  - `passwordHash`: `String`, required.
  - `role`: `String`, enum: `['admin', 'technician', 'viewer']`, default: `'viewer'`.
  - Timestamps enabled (`createdAt`, `updatedAt`).
- **Indexes**:
  - `email`: Single-field unique index (automatically created by Mongoose `unique: true`).
- **Scrubbing Hook (`toJSON`)**:
  ```javascript
  userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.passwordHash;
    delete user.__v;
    return user;
  };
  ```

#### 2. `samples` Collection ([`Sample.js`](file:///Users/nameet/156/Projects/lims/server/src/models/Sample.js))
- **Schema**:
  - `sampleCode`: `String`, required, unique, indexed (format: `SMP-YYYY-NNNNN`).
  - `type`: `String`, enum: `['water', 'food', 'soil']`, required.
  - `status`: `String`, enum: `['received', 'in_progress', 'qc_review', 'completed', 'rejected']`, default: `'received'`.
  - `assignedTo`: `ObjectId`, ref: `'User'`, default: `null`.
  - `createdBy`: `ObjectId`, ref: `'User'`, required.
  - `notes`: Embedded array of sub-documents (`text`, `author: ObjectId -> User`, `createdAt`).
  - `__v`: Explicitly tracked Mongoose version key used for OCC.
- **Indexes**:
  - `{ sampleCode: 1 }`: Unique index ensuring no duplicate IDs are generated under race conditions.
  - `{ status: 1, type: 1 }`: Compound index optimizing dashboard filtering by status and sample matrix.
  - `{ createdAt: -1 }`: Sort index ensuring fast chronological query execution.

#### 3. `auditlogs` Collection ([`AuditLog.js`](file:///Users/nameet/156/Projects/lims/server/src/models/AuditLog.js))
- **Schema**:
  - `sampleId`: `ObjectId`, ref: `'Sample'`, required, indexed.
  - `action`: `String`, enum: `['CREATED', 'STATUS_CHANGE', 'NOTE_ADDED']`, required.
  - `previousStatus`: `String`, default: `null`.
  - `newStatus`: `String`, default: `null`.
  - `performedBy`: `ObjectId`, ref: `'User'`, required.
  - `timestamp`: `Date`, default: `Date.now`.
  - Version key explicitly disabled (`versionKey: false`) because audit records are immutable and append-only.
- **Indexes**:
  - `{ sampleId: 1, timestamp: 1 }`: Compound index optimizing chronological audit trail lookups for a given sample.

---

## 09 — Authentication and Security

### Authentication Architecture (JWT + bcrypt)
1. **Password Hashing**:
   - Implemented via `bcryptjs` with `SALT_ROUNDS = 12` ($2^{12} = 4096$ hashing rounds).
   - Generates unique cryptographic salts per password, rendering precomputed rainbow table attacks ineffective.
   - Plaintext passwords never persist to storage or logs.
2. **Bearer Token Issuance**:
   - On valid credentials, `auth.service.js` issues an HMAC-SHA256 JWT signed with `env.JWT_SECRET`.
   - Payload contains `{ userId }`.
   - Configured with an expiration TTL (default: `7d`).
3. **Session Verification (`auth.js`)**:
   - Intercepts incoming `Authorization: Bearer <token>` header.
   - Executes `jwt.verify(token, env.JWT_SECRET)`.
   - Performs a database lookup (`User.findById(decoded.userId)`) to guarantee the account has not been deleted or suspended since token issuance.
   - Attaches `req.user` and `req.userId` to the request context.

### Role-Based Access Control (RBAC Matrix)

| Operation | Route | `viewer` | `technician` | `admin` | Enforcement Location |
|---|---|:---:|:---:|:---:|---|
| **Login / Register** | `/api/auth/*` | ✅ | ✅ | ✅ | Public |
| **View Samples / Audit** | `GET /api/samples/*` | ✅ | ✅ | ✅ | `auth` |
| **Add Sample Note** | `POST /api/samples/:id/notes` | ✅ | ✅ | ✅ | `auth` |
| **Create Sample** | `POST /api/samples` | ❌ | ✅ | ✅ | `authorize('admin', 'technician')` |
| **Change Sample Status**| `PATCH /api/samples/:id/status`| ❌ | ✅ | ✅ | `authorize('admin', 'technician')` |
| **Assign Sample Staff** | `PATCH /api/samples/:id/assign`| ❌ | ✅ | ✅ | `authorize('admin', 'technician')` |
| **View Analytics** | `GET /api/reports/summary` | ✅ | ✅ | ✅ | `auth` |
| **List Assignable Staff**| `GET /api/users/assignable` | ✅ | ✅ | ✅ | `auth` |
| **Manage Users** | `GET/PATCH/DELETE /api/users` | ❌ | ❌ | ✅ | `authorize('admin')` |

### Security Mechanisms and Defenses
- **NoSQL Injection Defense**: Zod schemas strictly parse request bodies. If an attacker passes MongoDB operator objects like `{"email": {"$gt": ""}}`, Zod fails validation at the gateway with `400 Bad Request`.
- **Credential Leak Prevention**: Mongoose `User.toJSON()` prototype override automatically deletes `passwordHash` and `__v` prior to serialization, preventing accidental password exposure across all endpoints.
- **Privilege Escalation Defense**: Self-registration defaults to role `viewer`. Role mutation is strictly guarded by `authorize('admin')`.
- **System Lockout Defense**: `user.service.js` prevents administrators from deleting their own accounts or demoting/deleting the last active administrator in the database.

---

## 10 — Business Logic

### 1. Workflow State Machine ([`stateMachine.js`](file:///Users/nameet/156/Projects/lims/server/src/utils/stateMachine.js))
Sample lifecycles are modeled as a Directed Acyclic Graph (DAG) using a declarative transition table:

```javascript
const TRANSITIONS = {
  received:    ['in_progress', 'rejected'],
  in_progress: ['qc_review',   'rejected'],
  qc_review:   ['completed',   'rejected'],
  completed:   [],   // Terminal state
  rejected:    [],   // Terminal state
};
```

```
       ┌───────────┐
       │ received  │
       └─────┬─────┘
             │
             ├──► rejected [Terminal]
             ▼
       ┌───────────┐
       │in_progress│
       └─────┬─────┘
             │
             ├──► rejected [Terminal]
             ▼
       ┌───────────┐
       │ qc_review │
       └─────┬─────┘
             │
             ├──► rejected [Terminal]
             ▼
       ┌───────────┐
       │ completed │ [Terminal]
       └───────────┘
```

**Rules**:
- Forward testing progression is strictly linear: `received` -> `in_progress` -> `qc_review` -> `completed`.
- A sample may be aborted to `rejected` from any active phase.
- Once a sample reaches `completed` or `rejected`, no further transitions are allowed.
- Attempts to execute illegal transitions (e.g. `completed` -> `in_progress` or `received` -> `qc_review`) are rejected with `400 Bad Request`.

### 2. Multi-Document ACID Transactions
Implemented in [`sample.service.js`](file:///Users/nameet/156/Projects/lims/server/src/services/sample.service.js) via Mongoose ClientSessions.
- Both `createSample` and `updateSampleStatus` wrap document mutations and audit log insertions in `session.startTransaction()`.
- Guarantees **Atomicity** (either both the sample status and the audit record persist, or neither does) and **Consistency** (the audit log is an exact reflection of sample history).
- If an exception occurs, `session.abortTransaction()` reverts all writes, and `session.endSession()` safely releases the connection pool resource in a `finally` block.

### 3. Optimistic Concurrency Control (OCC)
- Solves the classic "Lost Update" anomaly where Operator A and Operator B view a record simultaneously and make conflicting writes.
- When Operator A reads a sample, its version `__v` is `0`.
- Operator A sends `PATCH /api/samples/:id/status` with `{ status: "in_progress", version: 0 }`.
- The database query asserts: `Sample.findOne({ _id: sampleId, __v: version })`.
- On success, `sample.increment()` bumps `__v` to `1`.
- When Operator B attempts to submit based on their stale read (`version: 0`), `findOne` returns `null`. The service detects the version mismatch and aborts with `409 Conflict`.

### 4. Sample Code Generation Algorithm ([`sampleCode.js`](file:///Users/nameet/156/Projects/lims/server/src/utils/sampleCode.js))
- Formats codes as `SMP-YYYY-NNNNN` (e.g., `SMP-2026-00001`).
- Queries the database for the highest alphanumeric code matching the prefix `^SMP-<current_year>-`:
  ```javascript
  const latest = await Sample.findOne(
    { sampleCode: { $regex: `^${prefix}` } },
    { sampleCode: 1 },
    { sort: { sampleCode: -1 } }
  );
  ```
- Extracts the numeric suffix, increments by 1, and zero-pads to 5 digits.
- The unique database index on `sampleCode` acts as the final guard against duplicate generation.

---

## 11 — Error Handling

### Normalized Error Response Format
All application errors are normalized by [`errorHandler.js`](file:///Users/nameet/156/Projects/lims/server/src/middleware/errorHandler.js) into a predictable JSON structure:

```json
{
  "error": "Human-readable failure message.",
  "details": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

### Handled Error Categories

```
Exception Thrown
       │
       ▼
errorHandler.js (Express terminal error handler)
       │
       ├──► err.name === 'ValidationError' (Mongoose schema validation)
       │     └─► HTTP 400 Bad Request + field-level details array
       │
       ├──► err.code === 11000 (MongoDB Duplicate Key violation)
       │     └─► HTTP 409 Conflict: "Duplicate value for field: <field>"
       │
       ├──► err.name === 'CastError' (Malformed MongoDB ObjectId)
       │     └─► HTTP 400 Bad Request: "Invalid value for <path>"
       │
       ├──► err.statusCode is defined (Custom app domain exceptions)
       │     └─► HTTP <err.statusCode> + err.message
       │
       └──► Fallback (Uncaught exceptions / internal bugs)
             ├─► Logs stack trace to stderr: console.error(err)
             └─► HTTP 500 Internal Server Error: "Internal server error."
```

---

## 12 — Testing

### Current Project Testing State
- **Automated Test Suites**: Currently, the repository contains no automated unit or integration test runners (e.g., Jest, Vitest, Supertest).
- **Manual Verification & Seeding**: Verification is performed against live development instances using [`server/seed.js`](file:///Users/nameet/156/Projects/lims/server/seed.js).

### The Seed Script Architecture (`server/seed.js`)
The seed script demonstrates automated data population and verification:
- Connects to MongoDB via [`config/db.js`](file:///Users/nameet/156/Projects/lims/server/src/config/db.js).
- Wipes existing collections (`User`, `Sample`, `AuditLog`).
- Provisions 3 authenticated test accounts using `bcrypt.hash()`:
  - `admin@lims.dev` (`admin123`) -> Role: `admin`
  - `tech@lims.dev` (`tech1234`) -> Role: `technician`
  - `viewer@lims.dev` (`view1234`) -> Role: `viewer`
- Seeds 30 realistic samples across all 5 workflow statuses and 3 matrix types.
- Populates embedded notes and corresponding `AuditLog` records for every sample.

### Recommended Automated Testing Roadmap
For enterprise production readiness, the following test structure should be implemented:
1. **Unit Tests (Vitest / Jest)**:
   - `stateMachine.test.js`: Test all legal and illegal transitions against `validateTransition()`.
   - `sampleCode.test.js`: Test sequence incrementation and zero-padding logic.
2. **Integration API Tests (Supertest + MongoMemoryReplSet)**:
   - `auth.test.js`: Test registration, password hashing verification, JWT generation, and login rejections.
   - `sample.test.js`: Test RBAC route guards (`viewer` rejected with 403 on create/status change).
   - `concurrency.test.js`: Dispatch 10 parallel HTTP requests for the same sample with `version: 0`. Assert exactly 1 succeeds (200) and 9 fail with `409 Conflict`.

---

## 13 — Deployment

### Local Development Workflow
The system features zero-friction local onboarding:
```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Seed database (creates demo users & 30 samples)
cd ../server && npm run seed

# 3. Start backend (Terminal 1)
npm run dev # Starts server on http://localhost:5000 using in-memory MongoDB

# 4. Start frontend (Terminal 2)
cd ../client && npm run dev # Starts Vite server on http://localhost:5173
```

### Production Single-Service Deployment
The backend Express application in [`app.js`](file:///Users/nameet/156/Projects/lims/server/src/app.js) is pre-configured to host the frontend single-page application directly:
1. **Frontend Compilation**:
   ```bash
   cd client && npm run build
   ```
   Compiles TypeScript and bundles optimized static assets into `client/dist`.
2. **Static Asset Middleware**:
   ```javascript
   const clientDistPath = path.join(__dirname, '../../client/dist');
   app.use(express.static(clientDistPath));
   ```
3. **Single-Port Production Execution**:
   ```bash
   cd server && npm start
   ```
   Express serves API traffic on `/api/*` and streams `client/dist/index.html` for all browser navigation, allowing full containerized deployment on platforms like Render, Railway, AWS ECS, or Google Cloud Run as a single container.

### Production Environment Configuration
Production environments require setting real environment variables in `.env`:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/lims?retryWrites=true&w=majority
JWT_SECRET=super_secret_high_entropy_256bit_production_key_here
JWT_EXPIRES_IN=7d
```
> **CRITICAL**: In production, `MONGODB_URI` must point to a real MongoDB replica set (such as MongoDB Atlas) because standalone instances do not support multi-document transactions.

---

## 14 — Dependencies

### Backend Dependencies (`server/package.json`)

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.9.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "mongodb-memory-server": "^11.2.0"
  }
}
```

| Package | Version | Justification & Criticality | Impact If Removed |
|---|---|---|---|
| `express` | `^5.2.1` | Application web server framework | Complete application failure |
| `mongoose` | `^9.9.1` | ODM for schemas, validation, transactions, and population | Database access and transactional integrity fail |
| `zod` | `^4.4.3` | Runtime input validation and data type coercion | Request payloads unvalidated; exposed to NoSQL injection |
| `jsonwebtoken` | `^9.0.3` | HMAC-SHA256 bearer token signing and validation | Stateless user authentication breaks |
| `bcryptjs` | `^3.0.3` | Adaptive password hashing | Passwords stored insecurely in plaintext |
| `cors` | `^2.8.6` | Enables cross-origin requests during dev | Browser blocks API calls from port 5173 |
| `dotenv` | `^17.4.2` | Injects `.env` keys into `process.env` | Falls back to default configurations |
| `mongodb-memory-server` | `^11.2.0` | In-memory MongoDB replica set | Development requires manual local MongoDB installation |

### Frontend Dependencies (`client/package.json`)

```json
{
  "dependencies": {
    "@hello-pangea/dnd": "^18.0.1",
    "@tailwindcss/vite": "^4.3.3",
    "axios": "^1.19.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^13.0.0",
    "lucide-react": "^1.30.0",
    "react-router-dom": "^7.18.2",
    "recharts": "^3.10.1",
    "tailwind-merge": "^3.6.0",
    "tailwindcss": "^4.3.3"
  }
}
```

| Package | Version | Justification & Criticality | Impact If Removed |
|---|---|---|---|
| `@hello-pangea/dnd` | `^18.0.1` | Maintained fork of react-beautiful-dnd for Kanban drag-and-drop | Kanban board interactions break |
| `react-router-dom` | `^7.18.2` | Declarative client-side routing and protected route guards | Multi-page routing breaks |
| `axios` | `^1.19.0` | HTTP client with global interceptors | All network communication fails |
| `framer-motion` | `^13.0.0` | Declarative UI animations | UI transitions and card motion break |
| `recharts` | `^3.10.1` | Data visualization charts on Reports page | Analytical reporting charts fail to render |
| `tailwindcss` | `^4.3.3` | Utility-first styling framework | Application renders unstyled raw HTML |

---

## 15 — Design Decisions

### 1. Unique Compound Indexes vs. Redis Locks for Concurrency
- **Decision**: Use Mongoose document versioning (`__v`) and atomic updates rather than distributed locks (Redis / Redlock).
- **Rationale**: Adding Redis introduces an additional infrastructure failure domain. MongoDB's native version key provides atomic, storage-engine-level conflict detection without external operational dependencies.

### 2. Multi-Document Transactions vs. Eventual Consistency
- **Decision**: Execute sample updates and audit log writes within an ACID multi-document transaction.
- **Rationale**: In regulatory laboratory environments (GLP/ISO), an update without an audit log entry represents an unacceptable compliance violation. Eventual consistency risks lost audit trails during server crashes.

### 3. In-Memory Replica Set for Development
- **Decision**: Use `mongodb-memory-server` to spin up an in-process WiredTiger replica set automatically.
- **Rationale**: MongoDB transactions require a replica set. Asking developers to configure a multi-node replica set locally causes high onboarding friction. The in-memory replica set allows `npm run dev` to work immediately out of the box.

### 4. Embedded Notes vs. Separate Notes Collection
- **Decision**: Embed notes directly inside the `Sample` document as an array of sub-documents.
- **Rationale**: Notes are strictly owned by a single sample and are never queried across samples independently. Embedding enables retrieving the sample and its entire discussion thread in a single indexed read.

### 5. Zod Middleware vs. Controller-Level Validation
- **Decision**: Enforce schema validation via a reusable middleware factory (`validate(schema)`).
- **Rationale**: Keeps controllers thin and focused purely on HTTP request/response orchestration. Malformed payloads are rejected at the application boundary before any controller or database logic executes.

---

## 16 — Known Limitations

1. **Token Storage in `localStorage`**:
   - *Limitation*: The JWT is stored in browser `localStorage`.
   - *Vulnerability*: Susceptible to Cross-Site Scripting (XSS) token exfiltration.
   - *Remediation*: Transition to `httpOnly`, `Secure`, `SameSite=Strict` cookies.
2. **Missing `NOTE_ADDED` Audit Trail**:
   - *Limitation*: While the `AuditLog` model supports action `'NOTE_ADDED'`, `sampleService.addNote()` does not currently create an audit log entry when a note is appended.
   - *Remediation*: Wrap `addNote()` in a transaction that appends the note and writes an `AuditLog` entry with `action: 'NOTE_ADDED'`.
3. **State Machine Duplication**:
   - *Limitation*: Valid status transitions are defined in both [`server/src/utils/stateMachine.js`](file:///Users/nameet/156/Projects/lims/server/src/utils/stateMachine.js) and [`client/src/pages/SampleDetailPage.tsx`](file:///Users/nameet/156/Projects/lims/client/src/pages/SampleDetailPage.tsx).
   - *Remediation*: Consolidate into a shared npm package or expose `GET /api/samples/transitions` from the API.
4. **Permissive CORS Configuration**:
   - *Limitation*: `app.use(cors())` runs with open defaults (`*`).
   - *Remediation*: Lock down allowed origins: `cors({ origin: process.env.CLIENT_URL, credentials: true })`.
5. **Fallback Secrets in Configuration**:
   - *Limitation*: [`config/env.js`](file:///Users/nameet/156/Projects/lims/server/src/config/env.js) defaults `JWT_SECRET` to `'fallback-secret'` if undefined.
   - *Remediation*: Enforce startup crashes in production: `if (!process.env.JWT_SECRET) throw new Error(...)`.
6. **Absence of Rate Limiting**:
   - *Limitation*: `/api/auth/login` has no rate limiter, leaving it vulnerable to brute-force credential stuffing.
   - *Remediation*: Install `express-rate-limit` on authentication endpoints.

---

## 17 — Debugging

### Common Issues and Remediation Steps

#### 1. "Transaction numbers are only allowed on a replica set member or mongos"
- **Cause**: The application is connected to a standalone MongoDB instance that lacks replica set configuration.
- **Fix**: Either unset `MONGODB_URI` to use the built-in `MongoMemoryReplSet`, or convert the standalone MongoDB instance into a single-node replica set:
  ```bash
  mongod --replSet rs0 --dbpath /data/db
  # In mongosh:
  rs.initiate()
  ```

#### 2. HTTP 409 Conflict Errors on Status Updates
- **Cause**: Optimistic Concurrency Control failure. The version key `__v` sent by the client does not match the database version.
- **Verification**: Check the sample document's `__v` in MongoDB vs. `req.body.version`.
- **Fix**: The client state is stale. Refresh the browser page to re-fetch the latest document version before editing.

#### 3. CORS Network Errors in Development
- **Cause**: Client (`localhost:5173`) called Express (`localhost:5000`) directly instead of through the Vite development proxy.
- **Fix**: Ensure client API calls use relative paths (`/api/...`). Check that [`client/vite.config.ts`](file:///Users/nameet/156/Projects/lims/client/vite.config.ts) has the correct proxy target:
  ```typescript
  server: {
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } }
  }
  ```

#### 4. Mongoose `CastError: Cast to ObjectId failed`
- **Cause**: An invalid or non-24-character hexadecimal string was passed as an ID parameter in the URL.
- **Fix**: Verify route IDs against regex `/^[0-9a-fA-F]{24}$/`. Handled automatically by `sample.validator.js` and normalized to `400 Bad Request` by `errorHandler.js`.

---

## 18 — Interview Questions

### Junior Level

**Q1: What is the difference between Authentication and Authorization in this project?**
> *Answer*: Authentication verifies identity—"Who are you?" In LabCentral, this is handled by `auth.js` middleware, which verifies the user's JWT token and populates `req.user`. Authorization verifies permissions—"What are you allowed to do?" This is handled by `authorize.js` middleware, which checks if `req.user.role` has the required rights (e.g. `admin` or `technician`) to perform a mutation.

**Q2: Why does the password field say `passwordHash` in the User model?**
> *Answer*: The field is explicitly named `passwordHash` to emphasize that plaintext passwords are never stored. Passwords are salted and hashed using `bcryptjs` (with 12 rounds) in `auth.service.js` before being saved to MongoDB. Furthermore, `User.toJSON()` explicitly deletes `passwordHash` so it can never leak in API responses.

---

### Mid Level

**Q3: How does Optimistic Concurrency Control work in LabCentral?**
> *Answer*: LabCentral utilizes Mongoose's version key (`__v`). When a client views a sample, it receives its current `__v` (e.g., `0`). When updating status, the client sends `{ status, version: 0 }`. The server executes `Sample.findOne({ _id, __v: version })` inside a transaction. If another user modified the sample in the interim, `__v` would be `1`, causing the query to return `null`. The server recognizes that the document exists but the version mismatched, throwing an HTTP `409 Conflict` to prevent overwriting the other user's changes.

**Q4: Why does `report.controller.js` use MongoDB `$facet` instead of multiple queries?**
> *Answer*: `$facet` allows executing multiple aggregation pipelines within a single stage on the same input documents. In LabCentral, `getSummary` computes sample distribution by status, sample distribution by matrix type, and total record count simultaneously. Using `$facet` accomplishes this in a single database round-trip, significantly reducing network overhead and database connection usage.

---

### Senior Level

**Q5: Walk me through the ACID transaction in `updateSampleStatus`. What failure modes does it prevent?**
> *Answer*: In `sample.service.js`, `updateSampleStatus` opens a Mongoose ClientSession and starts a transaction. It performs the OCC version check, validates the state machine transition, increments `__v`, updates the sample, and inserts an audit log entry with `session.startTransaction()`. Without a transaction, if the server crashed or the database failed immediately after saving the sample but before writing the audit log, the system would enter an inconsistent state—a status change without a compliance audit record. The transaction guarantees that both writes succeed or both roll back atomically.

**Q6: What architectural improvements would you prioritize before deploying LabCentral to high-scale production?**
> *Answer*: I would prioritize four key upgrades:
> 1. **Session & Token Hardening**: Move JWT storage from client `localStorage` to `httpOnly`, `Secure` cookies with short expiration (15m) paired with a Redis-backed refresh token rotation flow.
> 2. **Security Gateway**: Introduce `helmet` for security headers, strict CORS origin whitelisting, and `express-rate-limit` on authentication endpoints.
> 3. **Asynchronous Processing**: Introduce a message queue (BullMQ + Redis) for non-critical side effects like notifications or audit log streaming.
> 4. **Caching Layer**: Cache assignable staff lists and aggregate analytics in Redis with cache invalidation on mutations to decrease primary database read load.

---

## 19 — Hands-on Exercises

To master this codebase, implement these four hands-on exercises:

### Exercise 1: Add a Priority Field to Samples
1. **Model** ([`Sample.js`](file:///Users/nameet/156/Projects/lims/server/src/models/Sample.js)): Add `priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }`.
2. **Validator** ([`sample.validator.js`](file:///Users/nameet/156/Projects/lims/server/src/validators/sample.validator.js)): Update `createSampleSchema` to accept optional `priority`.
3. **Service** ([`sample.service.js`](file:///Users/nameet/156/Projects/lims/server/src/services/sample.service.js)): Include `priority` when constructing `sampleData`.
4. **Client** ([`samples.api.ts`](file:///Users/nameet/156/Projects/lims/client/src/api/samples.api.ts) & [`SampleCard.tsx`](file:///Users/nameet/156/Projects/lims/client/src/components/kanban/SampleCard.tsx)): Add `priority` to TypeScript interface and render a visual badge (red for high, yellow for medium) on the card.

### Exercise 2: Fix the Audit Trail Gap on Notes
1. **Problem**: When a note is added via `addNote()`, no `AuditLog` entry is created.
2. **Task**: In [`sample.service.js`](file:///Users/nameet/156/Projects/lims/server/src/services/sample.service.js), refactor `addNote` to use a MongoDB transaction:
   - Start transaction session.
   - Push note to `sample.notes`.
   - Save sample with session.
   - Insert `AuditLog` document with `action: 'NOTE_ADDED'`.
   - Commit transaction and end session.

### Exercise 3: Add IP Rate Limiting to Auth Routes
1. Install `express-rate-limit` in `server/`.
2. Create middleware `rateLimiter.js` configured for 5 requests per 15 minutes.
3. Attach to `/api/auth/login` in [`auth.routes.js`](file:///Users/nameet/156/Projects/lims/server/src/routes/auth.routes.js).
4. Verify by dispatching 6 quick login attempts using curl; assert the 6th returns HTTP 429 Too Many Requests.

### Exercise 4: Write an Automated State Machine Test
1. Install `vitest` or `jest` in `server/`.
2. Create `src/utils/stateMachine.test.js`.
3. Write unit tests asserting:
   - `validateTransition('received', 'in_progress').valid === true`
   - `validateTransition('received', 'completed').valid === false`
   - `validateTransition('completed', 'received').valid === false` (terminal state)

---

## 20 — Glossary

- **ACID**: Set of database transaction properties: **Atomicity** (all-or-nothing writes), **Consistency** (data validation rules remain intact), **Isolation** (concurrent transactions do not interfere), and **Durability** (committed transactions survive system failures).
- **Audit Trail**: A secure, append-only chronological record providing documentary evidence of the sequence of activities that have affected a specific operation, procedure, or event.
- **Bcrypt**: An adaptive password hashing algorithm based on the Blowfish cipher that incorporates cryptographic salting and a configurable work factor to resist brute-force and hardware acceleration attacks.
- **CORS (Cross-Origin Resource Sharing)**: An HTTP-header-based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources.
- **Finite State Machine (FSM)**: A mathematical computation model consisting of a finite number of states, transitions between those states, and actions, where only one state can be active at any given moment.
- **JWT (JSON Web Token)**: An open standard (RFC 7519) defining a compact and self-contained format for securely transmitting information between parties as a digitally signed JSON object.
- **MERN Stack**: A technology suite comprising MongoDB (database), Express.js (backend framework), React (frontend library), and Node.js (JavaScript runtime environment).
- **NoSQL Injection**: An attack vector targeting document or graph databases where an attacker injects malicious database engine operators (e.g., `$gt`, `$ne`) through unsanitized input to alter query logic.
- **ODM (Object-Document Mapper)**: A software library that translates between in-memory code objects and document database representations (e.g., Mongoose mapping JavaScript objects to MongoDB documents).
- **Optimistic Concurrency Control (OCC)**: A concurrency control method applied to transactional systems assuming that multiple transactions can frequently complete without interfering with each other, checking for conflicts via record versioning prior to committing writes.
- **Pessimistic Locking**: A concurrency control method where records are explicitly locked upon read to prevent concurrent modifications by other transactions until the lock is released.
- **RBAC (Role-Based Access Control)**: A security approach that restricts system access to authorized users based on predefined organizational roles rather than individual permissions.
- **Replica Set**: A cluster of MongoDB database instances that maintain the same data set, providing high availability, redundancy, and the distributed consensus required for multi-document ACID transactions.
- **SPA (Single-Page Application)**: A web application that interacts with the user by dynamically rewriting the current web page with data from the web server rather than loading entire new pages in the browser.
- **Zod**: A TypeScript-first schema declaration and validation library that ensures runtime data conforms to static type definitions through strict parsing and coercion.
