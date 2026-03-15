# olympay

> CLI for Olympay — financial control for autonomous AI agents.

```
 ██████╗ ██╗      ██╗   ██╗███╗   ███╗██████╗  █████╗ ██╗   ██╗
██╔═══██╗██║      ╚██╗ ██╔╝████╗ ████║██╔══██╗██╔══██╗╚██╗ ██╔╝
██║   ██║██║       ╚████╔╝ ██╔████╔██║██████╔╝███████║ ╚████╔╝ 
██║   ██║██║        ╚██╔╝  ██║╚██╔╝██║██╔═══╝ ██╔══██║  ╚██╔╝  
╚██████╔╝███████╗   ██║   ██║ ╚═╝ ██║██║     ██║  ██║   ██║   
 ╚═════╝ ╚══════╝   ╚═╝   ╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   
  Financial control for autonomous AI agents  •  olympay.tech
```

## Installation

```bash
npm install -g olympay
```

Requires Node.js 18 or later.

## Getting Started

### 1. Create an account

Sign up at [olympay.tech](https://olympay.tech), go to **API** in the sidebar, and click **Generate Key** to create a workspace API key.

### 2. Authenticate

```bash
olympay login --key olympay_ws_YOUR_KEY
```

### 3. Spawn an agent

```bash
olympay agent create --name "my-agent"
```

This returns your agent's ID and its dedicated API key. Store both securely.

---

## Command Reference

### `olympay login`

Authenticate with a workspace API key.

```bash
olympay login --key <workspace_key>
```

| Flag | Required | Description |
|---|---|---|
| `--key` | Yes | Workspace API key starting with `olympay_ws_` |
| `--api` | No | Override the API base URL (default: `https://api.olympay.tech/v1`) |

Credentials are saved to `~/.olympay/config.json`.

---

### `olympay logout`

Remove stored credentials.

```bash
olympay logout
```

---

### `olympay whoami`

Show the currently authenticated workspace API key (masked).

```bash
olympay whoami
```

---

### `olympay agent create`

Spawn a new AI agent. Returns the agent's ID and its dedicated API key.

```bash
olympay agent create --name "billing-bot" --description "Handles recurring billing"
```

| Flag | Required | Description |
|---|---|---|
| `--name` | Yes | Display name for the agent |
| `--description` | No | Optional description |

**Output:**
```
Agent spawned successfully!
────────────────────────────────────────────────
ID:       agt_01j9k2...
Name:     billing-bot
API Key:  olympay_agt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Status:   active
────────────────────────────────────────────────
Keep this API key safe - use it to authenticate transactions.
```

---

### `olympay agent list`

List all agents in your workspace.

```bash
olympay agent list
```

---

### `olympay agent suspend`

Suspend an agent. All transactions from a suspended agent are immediately blocked.

```bash
olympay agent suspend AGENT_ID
```

---

### `olympay agent activate`

Re-activate a previously suspended agent.

```bash
olympay agent activate AGENT_ID
```

---

### `olympay account create`

Open a ledger account for an agent.

```bash
olympay account create --agent AGENT_ID --name "main" --currency USD
```

| Flag | Required | Description |
|---|---|---|
| `--agent` | Yes | Agent ID to associate the account with |
| `--name` | Yes | Account name |
| `--currency` | No | Currency code (default: `USD`) |

---

### `olympay account list`

List all accounts in your workspace, including balances.

```bash
olympay account list
```

---

### `olympay card issue`

Issue a virtual card linked to an agent account.

```bash
olympay card issue --agent AGENT_ID --account ACCOUNT_ID --brand VISA
```

| Flag | Required | Description |
|---|---|---|
| `--agent` | Yes | Agent ID |
| `--account` | Yes | Account ID to link the card to |
| `--brand` | No | Card brand (default: `VISA`) |
| `--last4` | No | Optional last 4 digits |

---

### `olympay card list`

List all virtual cards in your workspace.

```bash
olympay card list
```

---

### `olympay policy list`

List all spending policies in your workspace.

```bash
olympay policy list
```

Policies are created and configured in the [Olympay dashboard](https://olympay.tech).

---

### `olympay workspace generate-key`

Generate a new workspace API key. The full key value is shown only once.

```bash
olympay workspace generate-key --name "CI pipeline"
```

| Flag | Required | Description |
|---|---|---|
| `--name` | No | Label for the key (default: `CLI Key`) |

---

### `olympay workspace keys`

List all active (non-revoked) workspace API keys. Keys are shown in masked form.

```bash
olympay workspace keys
```

---

## Full Workflow Example

```bash
# Authenticate
olympay login --key olympay_ws_...

# Spawn an agent for handling SaaS payments
olympay agent create --name "saas-bot" --description "Manages SaaS subscriptions"
# => ID: agt_abc123, API Key: olympay_agt_...

# Open a USD account for the agent
olympay account create --agent agt_abc123 --name "saas-budget" --currency USD
# => ID: acc_def456

# Issue a virtual card for online purchases
olympay card issue --agent agt_abc123 --account acc_def456

# Check everything is in order
olympay agent list
olympay account list
olympay card list
```

---

## Configuration

Credentials are stored at `~/.olympay/config.json`:

```json
{
  "apiKey": "olympay_ws_...",
  "apiBase": "https://api.olympay.tech/v1"
}
```

To use a self-hosted instance, pass `--api` during login:

```bash
olympay login --key olympay_ws_... --api https://your-api-domain.com/v1
```

---

## Policy Types

Policies are managed in the dashboard. The following types are available:

| Type | Description |
|---|---|
| `SPEND_LIMIT` | Block transactions above a configured amount |
| `MERCHANT_ALLOWLIST` | Restrict spending to approved merchant IDs only |
| `MERCHANT_BLOCKLIST` | Block spending at specific merchant IDs |
| `APPROVAL_REQUIRED` | Route all transactions to human approval queue |
| `TIME_WINDOW` | Restrict spending to defined time ranges |

---

## Links

- **Dashboard**: [olympay.tech](https://olympay.tech)
- **API Base**: `https://api.olympay.tech/v1`
- **npm**: [npmjs.com/package/olympay](https://www.npmjs.com/package/olympay)

---

## License

MIT
