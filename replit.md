# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is a full-stack implementation of **Olympay** — a financial control platform for autonomous AI agents.

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
- **Auth**: Privy (email login, JWT via JWKS verification)
- **Build**: esbuild (CJS bundle)

## What is Olympay?

Olympay is a financial control platform that gives each AI agent its own financial identity: accounts, virtual cards, programmable spending rules, approval workflows, and full auditability. Styled with cream/off-white + gold aesthetic. Domain: `olympay.tech`.

### Core Features
- **Multi-tenant** — Each user (workspace) sees only their own data; identified by Privy user DID
- **Agent management** — Agents spawned via CLI only; dashboard is read-only monitor + controls
- **Accounts** — Each agent has one or more ledger accounts with balance tracking
- **Virtual cards** — Cards linked to agents and accounts with spending controls
- **Policy engine** — Programmable spending rules: SPEND_LIMIT, MERCHANT_ALLOWLIST, MERCHANT_BLOCKLIST, APPROVAL_REQUIRED, TIME_WINDOW
- **Transaction engine** — Real-time policy evaluation: ALLOW, DENY, or REVIEW decisions
- **Approval workflows** — Human-in-the-loop review for flagged transactions
- **Audit logs** — Full audit trail of all system events
- **Workspace API keys** — `olympay_ws_xxx` keys for CLI/programmatic access; generated in dashboard

### Auth Model
- **Dashboard users**: Privy JWT (verified via JWKS at `https://auth.privy.io/api/v1/apps/{appId}/jwks.json`)
- **CLI users**: Workspace API key (`olympay_ws_xxx`) passed as Bearer token
- **Agent API keys**: `olympay_agt_xxx` stored on the agents table (future use)
- Privy App ID: `cmmq9suw202wk0clhb690sjxz`

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (all backend routes)
│   └── olympay/            # React + Vite frontend dashboard (internal pkg: @workspace/credd)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks + custom-fetch (injects Privy JWT)
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/cli.ts          # Olympay CLI tool (commander-based)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## CLI Tool

Run with: `pnpm --filter @workspace/scripts run olympay -- <command>`

Commands:
- `login --key olympay_ws_...` — store workspace API key credentials
- `logout` — remove credentials
- `whoami` — show current credentials
- `agent create --name "..."` — spawn a new agent (returns its API key)
- `agent list` — list all agents
- `agent suspend <id>` / `agent activate <id>` — toggle agent status
- `account create --agent <id> --name "..."` — open a ledger account
- `account list` — list all accounts
- `card issue --agent <id> --account <id>` — issue a virtual card
- `card list` — list all cards
- `policy list` — list all policies
- `workspace generate-key` — generate a new workspace API key
- `workspace keys` — list active workspace API keys

## Database Schema (Drizzle / PostgreSQL)

All tables include a `workspaceId` column for multi-tenancy.

Tables:
- `agents` — AI agent entities (includes `apiKey` for agent-level auth)
- `accounts` — Financial accounts per agent
- `cards` — Virtual cards linked to accounts
- `policies` — Spending rules (type + configJson)
- `policy_assignments` — Maps policies to AGENT/ACCOUNT/CARD targets
- `transactions` — Transaction attempts with decision and approval status
- `approval_requests` — Pending approval items for REVIEW decisions
- `audit_logs` — Event log for all system actions
- `workspace_api_keys` — Workspace-scoped API keys (revokedAt = soft delete)

## API Routes (Express at /api)

Auth middleware at `/api/v1/*` — accepts Privy JWT or workspace API key as Bearer token.

All routes return `{ success: boolean, data: T }` or `{ success: false, error: { code, message } }`.

Workspace Keys:
- `GET /api/v1/workspace/keys` — list active keys (masked)
- `POST /api/v1/workspace/keys` — generate new key (returns full key once)
- `DELETE /api/v1/workspace/keys/:id` — revoke key

Agents / Accounts / Cards / Policies / Transactions / Approvals / Audit Logs / Monitoring:
- Standard CRUD + status patches on all resource types
- All queries scoped to `workspaceId`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

Root commands:
- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API types
- `pnpm --filter @workspace/db run push` — push schema to DB
