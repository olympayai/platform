# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is a full-stack implementation of **Credd AI** — financial infrastructure for autonomous AI agents.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Build**: esbuild (CJS bundle)

## What is Credd AI?

Credd AI is a financial control platform that gives each AI agent its own financial identity: accounts, virtual cards, programmable spending rules, approval workflows, and full auditability.

### Core Features
- **Agent management** — Create and manage AI agents with statuses (active/inactive/suspended/pending)
- **Accounts** — Each agent has one or more accounts with balance tracking
- **Virtual cards** — Cards linked to agents and accounts with spending controls
- **Policy engine** — Programmable spending rules: SPEND_LIMIT, MERCHANT_ALLOWLIST, MERCHANT_BLOCKLIST, APPROVAL_REQUIRED, TIME_WINDOW
- **Transaction engine** — Real-time policy evaluation: ALLOW, DENY, or REVIEW decisions
- **Approval workflows** — Human-in-the-loop review for flagged transactions
- **Audit logs** — Full audit trail of all system events
- **Monitoring dashboard** — Overview of agents, accounts, cards, policies, transactions, and pending approvals

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (all backend routes)
│   └── credd/              # React + Vite frontend dashboard
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema (Drizzle / PostgreSQL)

Tables:
- `agents` — AI agent entities
- `accounts` — Financial accounts per agent
- `cards` — Virtual cards linked to accounts
- `policies` — Spending rules (type + configJson)
- `policy_assignments` — Maps policies to AGENT/ACCOUNT/CARD targets
- `transactions` — Transaction attempts with decision and approval status
- `approval_requests` — Pending approval items for REVIEW decisions
- `audit_logs` — Event log for all system actions

## API Routes (Express at /api)

All routes return `{ success: boolean, data: T }` or `{ success: false, error: { code, message } }`.

- `GET /api/v1/agents` — List agents
- `POST /api/v1/agents` — Create agent
- `GET /api/v1/agents/:id` — Get agent
- `GET /api/v1/agents/:agentId/accounts` — Agent accounts
- `GET /api/v1/agents/:agentId/transactions` — Agent transactions
- `GET /api/v1/agents/:agentId/policies` — Agent policies
- `GET/POST /api/v1/accounts` — List/create accounts
- `GET /api/v1/accounts/:id` — Get account
- `PATCH /api/v1/accounts/:id/status` — Update status (active→frozen→closed)
- `GET /api/v1/accounts/:accountId/cards` — Account cards
- `GET /api/v1/accounts/:accountId/transactions` — Account transactions
- `GET /api/v1/accounts/:accountId/policies` — Account policies
- `GET/POST /api/v1/cards` — List/create cards
- `GET /api/v1/cards/:id` — Get card
- `PATCH /api/v1/cards/:id/status` — Update status
- `PATCH /api/v1/cards/:id/spending` — Toggle spending
- `GET /api/v1/cards/:cardId/policies` — Card policies
- `GET/POST /api/v1/policies` — List/create policies
- `GET /api/v1/policies/:id` — Get policy
- `PATCH /api/v1/policies/:id/status` — Update status
- `GET /api/v1/policies/:id/assignments` — Policy assignments
- `GET/POST /api/v1/policy-assignments` — List/create assignments
- `GET /api/v1/transactions` — List transactions
- `POST /api/v1/transactions/attempt` — Attempt transaction (runs policy engine)
- `GET /api/v1/transactions/:id` — Get transaction
- `GET /api/v1/transactions/:id/approval` — Get approval for transaction
- `GET /api/v1/approvals` — List approvals (filter by status query)
- `GET /api/v1/approvals/:id` — Get approval
- `POST /api/v1/approvals/:id/approve` — Approve
- `POST /api/v1/approvals/:id/decline` — Decline
- `GET /api/v1/audit-logs` — List audit logs (filterable)
- `GET /api/v1/audit-logs/:id` — Get audit log
- `GET /api/v1/entities/:entityType/:entityId/audit-logs` — Entity audit logs
- `GET /api/v1/monitoring/overview` — Platform overview stats
- `GET /api/v1/monitoring/transactions/summary` — Transaction stats
- `GET /api/v1/monitoring/approvals/summary` — Approval stats
- `GET /api/v1/monitoring/agents/activity` — Per-agent activity
- `GET /api/v1/monitoring/recent-activity` — Recent audit events

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

Root commands:
- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API types
- `pnpm --filter @workspace/db run push` — push schema to DB
