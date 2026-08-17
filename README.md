# LabCentral — LIMS

A full-stack **MERN** application for tracking laboratory sample workflows. Built as a portfolio project to demonstrate clean backend architecture, state-machine enforcement, atomic audit logging with MongoDB transactions, and a polished React UI.

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Tech Stack](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [State Machine](#state-machine)
- [Key Design Decisions](#key-design-decisions)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Demo Credentials](#demo-credentials)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React (Vite) Frontend                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Login/   │  │  Kanban  │  │  Sample  │  │  Reports  │  │
│  │ Register  │  │Dashboard │  │  Detail  │  │   Page    │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│            ↕ Axios (JWT in Authorization header)            │
├─────────────────────────────────────────────────────────────┤
│                   Express.js Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Controllers │  │   Services   │  │    Middleware     │  │
│  │  (HTTP I/O)  │──│(Business     │  │(auth, validate,  │  │
│  │              │  │  Logic)      │  │ error handling)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│            ↕ Mongoose ODM (sessions/transactions)           │
├─────────────────────────────────────────────────────────────┤
│              MongoDB (Replica Set for Transactions)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Users   │  │ Samples  │  │AuditLogs │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Layering

| Layer        | Responsibility                                     | Example                      |
|-------------|---------------------------------------------------|------------------------------|
| **Routes**      | Define endpoints, attach middleware                | `sample.routes.js`           |
| **Controllers** | Parse request, call service, format response       | `sample.controller.js`       |
| **Services**    | Business logic, transactions, state machine checks | `sample.service.js`          |
| **Models**      | Schema, indexes, virtuals — no business logic      | `Sample.js`                  |
| **Middleware**  | Cross-cutting: auth, validation, error handling    | `auth.js`, `validate.js`     |

---

## State Machine

Samples follow a strict status state machine. Only the transitions shown below are allowed — any other transition returns a `400 Bad Request`.

```
  received ──► in_progress ──► qc_review ──► completed
      │             │              │
      │             │              └──► rejected
      │             └──────────────────► rejected
      └────────────────────────────────► rejected
```

**Transition map (code representation):**

```js
const TRANSITIONS = {
  received:    ['in_progress', 'rejected'],
  in_progress: ['qc_review',  'rejected'],
  qc_review:   ['completed',  'rejected'],
  completed:   [],  // terminal — no further transitions
  rejected:    [],  // terminal — no further transitions
};
```

**Why enforce transitions server-side?**
- The frontend shows only valid transition buttons, but the backend independently validates every transition
- This ensures data integrity even if the API is called directly (e.g., via Postman or a script)
- Invalid transitions return a clear error: `"Invalid status transition: 'completed' → 'received' is not allowed."`

---

## Key Design Decisions

### 1. Atomic Audit Logging with MongoDB Transactions

**Problem:** When a sample's status changes, we must also create an audit log entry. If the audit log write fails, the sample should not be updated (data would be inconsistent).

**Solution:** Every `PATCH /api/samples/:id/status` endpoint uses a Mongoose session/transaction:

```js
const session = await mongoose.startSession();
session.startTransaction();
try {
  // 1. Find & update sample (with version check)
  // 2. Create audit log entry
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

**Trade-off:** MongoDB transactions require a **replica set**, which adds setup complexity. For development, this project uses `mongodb-memory-server` to spin up an in-memory replica set automatically — zero external dependencies needed.

### 2. Optimistic Concurrency Control

**Problem:** If two users open the same sample and both try to update its status, the second write would silently overwrite the first.

**Solution:** The Sample model uses Mongoose's `versionKey` (`__v`):
1. Client reads a sample (including its `__v`)
2. Client sends update with `{ status: 'in_progress', version: 0 }`
3. Server queries `{ _id: id, __v: version }` — if no match, sample was already modified → **409 Conflict**
4. On success, `__v` is explicitly incremented via `sample.increment()`

This prevents silent data loss from concurrent edits without the complexity of pessimistic locking.

### 3. In-Memory MongoDB for Development

**Why not just use a local MongoDB installation?**
- Reduces setup friction to zero — `npm install && npm run dev` just works
- No need to install MongoDB, configure a replica set, or manage data directories
- Data resets on restart, which is ideal for development and demos
- Swap in a real MongoDB connection string via `.env` when ready for production

### 4. Zod Validation on All Inputs

Every API input is validated using Zod schemas before reaching the controller. This provides:
- Type-safe validation with clear error messages
- Automatic request body sanitization (strips unknown fields)
- Consistent error format: `{ error: "Validation failed", details: [...] }`
- Validation is separate from business logic (middleware, not in controllers)

### 5. Role-Based Access Control

Three roles with different capabilities:

| Role         | Can Create Samples | Can Change Status | Can View | Can Add Notes |
|-------------|-------------------|------------------|---------|--------------|
| `admin`      | ✅                 | ✅                | ✅       | ✅            |
| `technician` | ✅                 | ✅                | ✅       | ✅            |
| `viewer`     | ❌                 | ❌                | ✅       | ❌            |

---

## Getting Started

### Prerequisites

- **Node.js** v18+ (v20+ recommended)
- **npm** v9+
- No MongoDB installation required (uses in-memory DB for development)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd lims

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration

```bash
# In the server/ directory, copy the example env file
cd server
cp .env.example .env

# Edit .env if needed (defaults work for development):
#   PORT=5001
#   JWT_SECRET=dev-secret-do-not-use-in-production-abc123xyz
#   JWT_EXPIRES_IN=7d
#   MONGODB_URI=  (leave empty for in-memory DB)
```

### Seed the Database

```bash
# From the server/ directory
npm run seed
```

This creates:
- **3 users**: admin, technician, and viewer
- **30 sample records** across all statuses with realistic audit trails and notes

### Run the Application

```bash
# Terminal 1: Start the backend (from server/)
npm run dev

# Terminal 2: Start the frontend (from client/)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api

### Using a Real MongoDB Instance

For production or persistent development data, set `MONGODB_URI` in `.env`:

```env
# MongoDB Atlas (free tier supports replica sets)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lims?retryWrites=true&w=majority

# Local MongoDB (must be a replica set for transactions)
MONGODB_URI=mongodb://localhost:27017/lims?replicaSet=rs0
```

---

## Project Structure

```
lims/
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # Mongoose connection (memory or external)
│   │   │   └── env.js               # Centralized env config
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification
│   │   │   ├── authorize.js         # Role-based access
│   │   │   ├── validate.js          # Zod validation middleware
│   │   │   └── errorHandler.js      # Global error normalizer
│   │   ├── models/
│   │   │   ├── User.js              # User schema (toJSON strips passwordHash)
│   │   │   ├── Sample.js            # Sample schema + status enum + notes
│   │   │   └── AuditLog.js          # Append-only audit log
│   │   ├── routes/                  # Route definitions with middleware
│   │   ├── controllers/             # HTTP I/O layer
│   │   ├── services/                # Business logic + transactions
│   │   ├── validators/              # Zod schemas
│   │   ├── utils/
│   │   │   ├── sampleCode.js        # SMP-YYYY-NNNNN auto-generation
│   │   │   └── stateMachine.js      # Transition map + validation
│   │   └── app.js                   # Express app assembly
│   ├── seed.js                      # Database seed script
│   ├── server.js                    # Entry point
│   ├── .env.example                 # Environment template
│   └── package.json
│
├── client/                          # React (Vite) frontend
│   ├── src/
│   │   ├── api/                     # Axios instance + typed API functions
│   │   ├── components/
│   │   │   ├── ui/                  # Toast notifications
│   │   │   ├── layout/              # Sidebar, Topbar, AppLayout
│   │   │   ├── kanban/              # KanbanBoard, KanbanColumn, SampleCard
│   │   │   ├── samples/             # AuditTimeline, NotesSection, CreateForm
│   │   │   └── reports/             # StatCard, Charts
│   │   ├── context/                 # AuthContext (JWT management)
│   │   ├── pages/                   # Route-level page components
│   │   ├── lib/utils.ts             # Utility functions (cn helper)
│   │   ├── index.css                # Tailwind v4 theme + custom tokens
│   │   └── App.tsx                  # Router + protected routes
│   └── vite.config.ts               # Vite config with API proxy
│
└── README.md
```

---

## API Reference

### Auth Endpoints

| Method | Endpoint             | Body                                  | Auth | Response          |
|--------|----------------------|---------------------------------------|------|-------------------|
| POST   | `/api/auth/register` | `{ name, email, password, role? }`    | No   | `{ user, token }` |
| POST   | `/api/auth/login`    | `{ email, password }`                 | No   | `{ user, token }` |
| GET    | `/api/auth/me`       | —                                     | Yes  | `{ user }`        |

### Sample Endpoints

| Method | Endpoint                      | Auth | Role              | Notes                                    |
|--------|-------------------------------|------|-------------------|------------------------------------------|
| GET    | `/api/samples`                | Yes  | All               | Query: `?status=&type=&page=&limit=`     |
| GET    | `/api/samples/:id`            | Yes  | All               | Includes populated references + audit log|
| POST   | `/api/samples`                | Yes  | admin, technician | Body: `{ type, assignedTo?, notes? }`    |
| PATCH  | `/api/samples/:id/status`     | Yes  | admin, technician | Body: `{ status, version }`              |
| POST   | `/api/samples/:id/notes`      | Yes  | admin, technician | Body: `{ text }`                         |
| GET    | `/api/samples/:id/audit-log`  | Yes  | All               | Chronological audit entries              |

### Reports Endpoint

| Method | Endpoint              | Auth | Notes                                   |
|--------|-----------------------|------|-----------------------------------------|
| GET    | `/api/reports/summary`| Yes  | Counts by status and by type            |

### Error Response Format

All errors return a consistent shape:

```json
{
  "error": "Human-readable message",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Demo Credentials

After running `npm run seed`:

| Role        | Email            | Password   |
|-------------|------------------|------------|
| Admin       | admin@lims.dev   | admin123   |
| Technician  | tech@lims.dev    | tech1234   |
| Viewer      | viewer@lims.dev  | view1234   |

---


