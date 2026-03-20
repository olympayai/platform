# Olympay — Architecture

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

- **Dashboard users**: Privy JWT (verified via JWKS)
- **CLI users**: Workspace API key (`olympay_ws_xxx`) passed as Bearer token
- **Agent API keys**: `olympay_agt_xxx` stored on the agents table

## Structure

```text
olympay/
├── artifacts/
│   ├── api-server/         # Express API server (all backend routes)
│   └── olympay/            # React + Vite frontend dashboard
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
- `webhooks` — Registered webhook endpoints with signing secrets

## API Routes (Express at /api)

Auth middleware at `/api/v1/*` — accepts Privy JWT or workspace API key as Bearer token.

All routes return `{ success: boolean, data: T }` or `{ success: false, error: { code, message } }`.

### Endpoints

- `GET/POST /api/v1/workspace/keys` — manage workspace API keys
- `DELETE /api/v1/workspace/keys/:id` — revoke a key
- `GET/POST /api/v1/agents` — list and create agents
- `GET/PATCH /api/v1/agents/:id` — get or update an agent
- `GET/POST /api/v1/accounts` — list and open accounts
- `GET/POST /api/v1/cards` — list and issue cards
- `POST /api/v1/cards/:id/toggle` — enable or disable card
- `GET/POST /api/v1/policies` — list and create policies
- `GET/POST /api/v1/transactions` — list transactions and evaluate spend intents
- `GET/POST/PATCH /api/v1/approvals` — manage approval queue
- `GET /api/v1/audit-logs` — full audit trail
- `GET/POST/DELETE /api/v1/webhooks` — manage webhook endpoints

## Olympay Payment Protocol (OPP) v1

Every transaction attempt goes through the policy evaluation engine. The `/attempt` response includes a `protocol` field:

```json
{
  "protocol": {
    "version": "v1",
    "policiesEvaluated": 3,
    "evaluatedAt": "2026-03-15T08:42:11Z"
  }
}
```

Public spec available at: `https://olympay.tech/protocol/v1`

## Webhook Events

Fired after every transaction evaluation. Signed with `X-Olympay-Signature: sha256=...` (HMAC-SHA256).

Event types: `transaction.allowed`, `transaction.denied`, `transaction.review`

## TypeScript and Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

Root commands:

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API types
- `pnpm --filter @workspace/db run push` — push schema to DB
