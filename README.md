# HR Workflow Designer

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-6366f1?style=for-the-badge&logo=vercel)](https://hr-workflow-kappa.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

A fully functional, drag-and-drop HR workflow designer built for the **Tredence Analytics Full Stack Engineering Intern** case study.

</div>

---

## 🚀 Live Demo

**[https://hr-workflow-kappa.vercel.app](https://hr-workflow-kappa.vercel.app)**

> No install needed — open the link and start building workflows instantly.

---

## Features

### Core
- **Drag-and-drop canvas** — powered by React Flow
- **5 custom node types** — Start, Task, Approval, Automated Step, End
- **Node configuration forms** — fully controlled, per-type
- **Automated actions** — 8 pre-built actions (Send Email, Slack, JIRA, HRMS, etc.)
- **Workflow Sandbox** — BFS-based step-by-step simulation with execution log
- **Live validation** — 7 graph rules including DFS cycle detection

### Bonus
- **Analytics modal** — Donut + Bar charts for node type distribution (Recharts)
- **Export / Import** — Save and load workflows as JSON
- **Undo / Redo** — Ctrl+Z / Ctrl+Y with full history
- **Mini-map** — colour-coded node overview
- **Zoom controls** — fit view, zoom in/out

---

## 🛠️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Vite + React 18 | Fast HMR, production-grade bundler |
| Language | TypeScript (strict) | Type-safe node data, forms, API contracts |
| Canvas | React Flow 11 | Industry-standard workflow canvas |
| State | Zustand 4 | Minimal boilerplate, selector-based subscriptions |
| Charts | Recharts | Declarative, React-native charting |
| Styling | Vanilla CSS (CSS variables) | Zero runtime overhead, full design control |
| Icons | Lucide React | Consistent, tree-shakeable |
| Fonts | Syne + DM Sans | Professional, non-generic |

---

## ⚡ Quick Start

```bash
git clone https://github.com/yashjais1/hr-workflow.git
cd hr-workflow
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Architecture

```
src/
├── api/           # Mock API layer (getAutomations, simulateWorkflow)
├── components/
│   ├── nodes/     # 5 custom React Flow node components + BaseNode wrapper
│   ├── forms/     # Node configuration forms (one per node type)
│   ├── panels/    # PropertiesPanel + SandboxPanel + StatsModal
│   ├── sidebar/   # NodeSidebar — drag-and-drop palette
│   └── ui/        # Toolbar + WorkflowCanvas (React Flow host)
├── store/         # Zustand store: all canvas state + undo/redo history
├── types/         # Shared TypeScript interfaces for all node data shapes
└── utils/         # validation.ts (cycle detection, graph checks) + helpers.ts
```

### Key Design Decisions

**State — Zustand single store**
All workflow state lives in one Zustand store. React Flow controls rendering; Zustand owns the source of truth. No prop drilling.

**Mock API is swap-ready**
`src/api/index.ts` simulates async delays. Replacing with real HTTP calls requires changing only this file — the rest of the app is agnostic.

**Validation is a pure function**
`validateWorkflow(nodes, edges)` has zero side effects. Runs automatically after every mutation via the store.

**Undo/Redo**
Manual history stack — `{nodes, edges}` snapshot pushed before every mutation. Ctrl+Z / Ctrl+Y via `keydown` listener.

---

## What I Would Add Next

- **Backend persistence** — FastAPI or Express; the mock API layer makes this a one-file swap
- **Auto-layout** — Dagre/ELK for automatic graph layout on import
- **Node templates** — pre-built workflows (Leave Approval, Offboarding, etc.)
- **Unit tests** — Jest/Vitest for `validation.ts` and `api/index.ts`
- **Real-time collaboration** — WebSocket + Yjs
