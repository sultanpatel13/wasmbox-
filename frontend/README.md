# WasmBox Frontend Core

Developer 2's implementation of the WasmBox frontend — API integration, authentication, protected routes, upload page, sandbox page, executions page, logs page, terminal with xterm.js, WebSocket live logs, Zustand/React Query state handling, types, hooks, services, and error handling.

Built to work independently without Developer 1's UI/layout. Uses temporary placeholders and shared interfaces for later integration.

---

## Features

### Authentication
- Demo login (any email/password works)
- Session persistence via localStorage
- Protected routes with redirect to login
- Logout functionality

### Pages
| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Demo authentication |
| **Sandbox** | `/sandbox` | Module selection, permissions, xterm.js terminal |
| **Upload** | `/upload` | Drag-and-drop WASM module upload + module list |
| **Executions** | `/executions` | Execution history table with status, duration, cancel |
| **Logs** | `/logs` | Live WebSocket logs with search/filter by level |

### Core Integrations
- **API Client** (`services/api.ts`) — Centralized fetch wrapper with `ApiError`, mock fallback when `VITE_API_BASE_URL` not set
- **WebSocket** (`services/websocket.ts`) — Auto-reconnecting log stream with exponential backoff
- **Terminal** (`components/TerminalPanel.tsx`) — Full xterm.js with fit, web links, search, unicode11 addons
- **State** — Zustand for UI state, React Query for server state
- **Toasts** — Sonner for success/error/warning/info notifications

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start dev server (http://localhost:5173)
npm run dev

# Production build
npm run build
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base (e.g., `http://localhost:8000`) | *empty → uses mock data* |
| `VITE_WS_URL` | WebSocket endpoint for live logs (e.g., `ws://localhost:8000/ws/logs`) | *empty → uses mock interval* |

Without backend: all API calls use `mockData.ts` — perfect for offline development.

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppLayout.tsx    # Main layout with sidebar + user menu
│   ├── ErrorBoundary.tsx
│   ├── StatusPill.tsx
│   ├── TerminalPanel.tsx
│   └── UploadDropzone.tsx
├── context/
│   └── AuthContext.tsx  # Auth provider (demo mode)
├── hooks/
│   ├── useRuntimeData.ts       # Zustand store hook + auto-init
│   ├── useRuntimeQueries.ts    # React Query hooks
│   └── useToast.ts             # Sonner wrapper
├── pages/
│   ├── LoginPage.tsx
│   ├── SandboxPage.tsx
│   ├── UploadPage.tsx
│   ├── ExecutionsPage.tsx
│   └── LogsPage.tsx
├── routes/
│   ├── ProtectedRoute.tsx
│   ├── PublicRoute.tsx
│   ├── router.tsx              # React Router v7 config
│   └── index.tsx               # Route definitions
├── services/
│   ├── api.ts                  # Base fetch + ApiError
│   ├── auth.ts                 # Session management
│   ├── execution.ts            # API calls + mock fallback
│   ├── mockData.ts             # Demo data
│   └── websocket.ts            # WS with reconnection
├── store/
│   └── runtimeStore.ts         # Zustand store + actions
├── types/
│   └── execution.ts            # TypeScript interfaces
├── utils/
│   └── format.ts               # Date/bytes/duration formatters
├── styles/
│   └── globals.css             # Complete dark theme
├── main.tsx                    # Entry with providers
└── vite-env.d.ts               # Env types
```

---

## Key Types (from `types/execution.ts`)

```typescript
type ExecutionStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

interface WasmModule {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  checksum?: string;
}

interface Execution {
  id: string;
  moduleId: string;
  moduleName: string;
  status: ExecutionStatus;
  command: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  memoryMb?: number;
  cpuPercent?: number;
  output: string;
}

interface RuntimeStatus {
  connected: boolean;
  activeExecutions: number;
  memoryMb: number;
  cpuPercent: number;
  version: string;
}

interface PermissionSet {
  filesystem: boolean;
  network: boolean;
  environment: boolean;
}
```

---

## Git Workflow (Per Chat Guidance)

```bash
# Create your branch
git checkout -b feature/frontend-core

# Develop independently — no dependency on Developer 1's UI
# Use placeholders where needed

# Commit regularly
git add .
git commit -m "Implement terminal module with xterm.js"
git push origin feature/frontend-core
```

When Developer 1 finishes `Navbar`/`Sidebar`/`MainLayout`, wrap pages:

```tsx
// Before (standalone)
<Route path="/sandbox" element={<Sandbox />} />

// After (integrated)
<MainLayout>
  <Routes>
    <Route path="/sandbox" element={<Sandbox />} />
  </Routes>
</MainLayout>
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Routing | React Router 7 |
| State | Zustand + React Query (TanStack Query) |
| Terminal | @xterm/xterm + addons |
| Styling | Custom CSS (dark theme, responsive) |
| Icons | Lucide React |
| Notifications | Sonner |
| Auth | localStorage demo session |

---

## Mock Data

When `VITE_API_BASE_URL` is not set, all services fall back to `mockData.ts`:

- 1 preloaded module (`hello_world.wasm`)
- 2 executions (completed + running)
- 3 live logs (info/debug/warn)
- Runtime status: connected, 1 active, 65MB, 34% CPU

This allows full frontend development without a backend.

---

## Adding a Backend

1. Set `VITE_API_BASE_URL` and `VITE_WS_URL` in `.env`
2. Implement these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/runtime/status` | Returns `RuntimeStatus` |
| GET | `/api/modules` | Returns `WasmModule[]` |
| POST | `/api/modules` | Upload WASM (multipart/form-data `module`) |
| GET | `/api/executions` | Returns `Execution[]` |
| POST | `/api/executions` | Start execution (`moduleId`, `command`, `permissions`) |
| POST | `/api/executions/:id/cancel` | Cancel execution |
| GET | `/api/logs` | Returns `ExecutionLog[]` |
| WS | `/ws/logs` | Streams `ExecutionLog` events |

---

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Type-check + production build
npm run preview   # Preview production build
```

---

## License

MIT