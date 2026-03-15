# Olympay

**Financial control infrastructure for autonomous AI agents.**

Olympay gives every AI agent its own financial identity — a dedicated account, virtual card, programmable spending rules, and a full audit trail. Built for teams deploying AI agents at scale who need to know exactly what their agents are spending, where, and why.

---

## What Is Olympay?

When you deploy an AI agent that can spend money — booking travel, paying APIs, purchasing software — you need more than a shared credit card. You need:

- **Isolation**: each agent has its own account and card so charges are never mixed
- **Policy enforcement**: real-time rules that block, allow, or flag transactions before they settle
- **Human approval**: a review queue for high-risk spend that a human must sign off on
- **Audit trail**: every event — create, update, authorize, deny — is logged and immutable

Olympay provides all of this through a dashboard, an HTTP API, and a CLI you install with a single command.

---

## Features

| Feature | Description |
|---|---|
| **Agent Accounts** | Each agent gets one or more isolated ledger accounts with balance tracking |
| **Virtual Cards** | Issue VISA/Mastercard virtual cards linked to any agent account |
| **Spend Policies** | Five policy types: spend limit, merchant allowlist, merchant blocklist, approval required, time window |
| **Transaction Engine** | Real-time evaluation returns `ALLOW`, `DENY`, or `REVIEW` before money moves |
| **Approval Workflows** | Human-in-the-loop queue for transactions that need sign-off |
| **Audit Logs** | Immutable, append-only event log covering every action in the system |
| **Multi-Workspace** | Each user account is fully isolated — no data leakage between workspaces |
| **CLI** | Full-featured terminal tool to spawn agents and manage resources programmatically |
| **API** | REST API with workspace API key auth for programmatic integration |

---

## Quick Start

### 1. Open an Account

Visit [olympay.tech](https://olympay.tech) and click **Open Your Account**. Sign in with your email via Privy — no wallet required.

### 2. Generate a Workspace API Key

Go to **API** in the dashboard sidebar, then click **Generate Key**. Copy the full `olympay_ws_...` key — it is only shown once.

### 3. Install the CLI

```bash
npm install -g olympay
```

### 4. Log In

```bash
olympay login --key olympay_ws_YOUR_KEY_HERE
```

### 5. Spawn Your First Agent

```bash
olympay agent create --name "procurement-bot"
```

The command returns an agent ID and an agent-level API key. Keep both safe.

### 6. Open an Account for the Agent

```bash
olympay account create --agent AGENT_ID --name "main" --currency USD
```

### 7. Issue a Virtual Card

```bash
olympay card issue --agent AGENT_ID --account ACCOUNT_ID
```

---

## Dashboard

The Olympay dashboard is available at [olympay.tech](https://olympay.tech). It provides read-only monitoring and control over your workspace:

| Page | Purpose |
|---|---|
| **Dashboard** | Platform overview — agents, transactions, pending approvals, recent events |
| **Agents** | List all agents, copy API keys, suspend or activate agents |
| **Accounts** | View account balances and statuses |
| **Cards** | View all virtual cards, toggle spending |
| **Policies** | View and manage spending rules |
| **Transactions** | Full transaction history with policy verdict details |
| **Approvals** | Review queue for transactions flagged as `REVIEW` |
| **Audit Logs** | Immutable system event log |
| **API** | Workspace key management, CLI reference, endpoint documentation |

Agents are created exclusively via the CLI or API. The dashboard is for monitoring and control only.

---

## CLI Reference

Install globally:

```bash
npm install -g olympay
```

Run `olympay --help` for the full command list with the ASCII banner.

### Authentication

```bash
# Log in with a workspace API key
olympay login --key olympay_ws_...

# Show current credentials
olympay whoami

# Remove credentials
olympay logout
```

### Agents

```bash
# Spawn a new agent (returns agent API key)
olympay agent create --name "my-bot" --description "Handles SaaS subscriptions"

# List all agents
olympay agent list

# Suspend an agent (blocks all transactions immediately)
olympay agent suspend AGENT_ID

# Re-activate a suspended agent
olympay agent activate AGENT_ID
```

### Accounts

```bash
# Open a ledger account
olympay account create --agent AGENT_ID --name "main" --currency USD

# List all accounts
olympay account list
```

### Cards

```bash
# Issue a virtual card
olympay card issue --agent AGENT_ID --account ACCOUNT_ID --brand VISA

# List all cards
olympay card list
```

### Policies

```bash
# Create a spending policy
olympay policy create --name "daily-cap" --type SPEND_LIMIT --config '{"maxAmountMinor":10000}'

# List all spending policies
olympay policy list

# Assign a policy to an agent, account, or card
olympay policy assign --policy POLICY_ID --target-type AGENT --target AGENT_ID
```

### Transactions

```bash
# Submit a transaction attempt for policy evaluation
olympay tx eval --agent AGENT_ID --account ACCOUNT_ID --amount 5000

# Returns ALLOW, DENY, or REVIEW with matched policy breakdown
```

### Workspace Keys

```bash
# Generate a new workspace API key
olympay workspace generate-key --name "CI pipeline"

# List all active keys
olympay workspace keys

# Revoke a key by ID
olympay workspace revoke KEY_ID
```

---

## API Reference

Base URL: `https://api.olympay.tech/v1`

All requests require a `Bearer` token in the `Authorization` header. Accepted tokens:

- **Privy JWT** — obtained from the dashboard session (for browser requests)
- **Workspace API key** — `olympay_ws_...` (for CLI and server-to-server requests)

All responses follow this envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

On error:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Agent abc123 not found"
  }
}
```

### Endpoints

#### Agents
```
GET    /agents               List all agents
POST   /agents               Create a new agent
GET    /agents/:id           Get a single agent
PATCH  /agents/:id           Update agent metadata or status
```

#### Accounts
```
GET    /accounts             List all accounts
POST   /accounts             Open a new account for an agent
GET    /accounts/:id         Get account balance and details
```

#### Cards
```
GET    /cards                List all virtual cards
POST   /cards                Issue a new virtual card
POST   /cards/:id/toggle     Enable or disable card spending
```

#### Policies
```
GET    /policies             List all policies
POST   /policies             Create a new spending policy
PATCH  /policies/:id         Update policy configuration
```

#### Transactions
```
GET    /transactions                  List all transactions
POST   /transactions/evaluate         Evaluate a spend intent
```

#### Approvals
```
GET    /approvals                     List all approval requests
GET    /approvals/:id                 Get a single approval
POST   /approvals/:id/approve         Approve a flagged transaction
POST   /approvals/:id/decline         Decline a flagged transaction
```

#### Audit Logs
```
GET    /audit-logs           Full audit trail (filterable)
```

#### Workspace
```
GET    /workspace/keys       List active API keys (masked)
POST   /workspace/keys       Generate a new API key (returns full key once)
DELETE /workspace/keys/:id   Revoke an API key
```

### Evaluate a Spend Intent

```bash
curl -X POST https://api.olympay.tech/v1/transactions/evaluate \
  -H "Authorization: Bearer olympay_ws_..." \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agt_01j9k2...",
    "amountMinor": 25000,
    "currency": "USD",
    "merchantId": "merch_stripe",
    "purpose": "SaaS subscription renewal"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "verdict": "ALLOW",
    "transactionId": "txn_01j9kz...",
    "evaluatedAt": "2026-03-15T08:42:11Z",
    "policyId": "pol_01j8a1...",
    "policyName": "Monthly SaaS Limit",
    "remainingBudgetMinor": 75000
  }
}
```

Possible `verdict` values:

| Verdict | Meaning |
|---|---|
| `ALLOW` | Transaction approved — proceed |
| `DENY` | Transaction blocked by policy |
| `REVIEW` | Transaction flagged — queued for human approval |

---

## Policy Types

| Type | Description |
|---|---|
| `SPEND_LIMIT` | Block transactions above a configurable amount (daily, monthly, or per-transaction) |
| `MERCHANT_ALLOWLIST` | Only allow transactions from a specific set of merchant IDs |
| `MERCHANT_BLOCKLIST` | Block transactions from specific merchant IDs |
| `APPROVAL_REQUIRED` | Always route to the approval queue regardless of amount |
| `TIME_WINDOW` | Only allow transactions within a defined time range |

---

## Security

- All API traffic is over HTTPS
- Workspace API keys are hashed — full value shown only at creation time
- Agent API keys are scoped to a single agent's operations
- Every workspace is isolated — queries are always filtered by `workspaceId`
- Audit logs are append-only and cannot be deleted
- Privy is used for dashboard authentication — no passwords stored

---

## Support

- Website: [olympay.tech](https://olympay.tech)
- API docs: [olympay.tech/api](https://olympay.tech) — navigate to **API** in the dashboard

---

## License

MIT
