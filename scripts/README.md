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

---

### `olympay policy create`

Create a new spending policy.

```bash
olympay policy create --name "daily-cap" --type SPEND_LIMIT --config '{"maxAmountMinor":10000}'
```

| Flag | Required | Description |
|---|---|---|
| `--name` | Yes | Policy name |
| `--type` | Yes | Policy type (see [Policy Types](#policy-types)) |
| `--config` | No | JSON config object (depends on policy type) |
| `--description` | No | Optional description |

**Config by type:**

| Type | Config keys |
|---|---|
| `SPEND_LIMIT` | `maxAmountMinor` (integer, minor currency units) |
| `MERCHANT_ALLOWLIST` | `merchantIds` (array of strings) |
| `MERCHANT_BLOCKLIST` | `merchantIds` (array of strings) |
| `APPROVAL_REQUIRED` | No config needed |
| `TIME_WINDOW` | `startHour`, `endHour` (0-23, UTC) |

---

### `olympay policy assign`

Assign a policy to an agent, account, or card.

```bash
olympay policy assign --policy POLICY_ID --target-type AGENT --target AGENT_ID
```

| Flag | Required | Description |
|---|---|---|
| `--policy` | Yes | Policy ID |
| `--target-type` | Yes | `AGENT`, `ACCOUNT`, or `CARD` |
| `--target` | Yes | ID of the target entity |
| `--priority` | No | Evaluation priority (lower = higher, default: `100`) |

---

### `olympay tx eval`

Submit a transaction attempt for real-time policy evaluation. Returns the decision (`ALLOW`, `DENY`, or `REVIEW`) and the transaction record.

```bash
olympay tx eval --agent AGENT_ID --account ACCOUNT_ID --amount 5000
```

| Flag | Required | Description |
|---|---|---|
| `--agent` | Yes | Agent ID |
| `--account` | Yes | Account ID |
| `--amount` | Yes | Amount in minor units (e.g. `1000` = $10.00) |
| `--card` | No | Card ID |
| `--merchant` | No | Merchant identifier |
| `--currency` | No | Currency code (default: `USD`) |
| `--direction` | No | `DEBIT` or `CREDIT` (default: `DEBIT`) |

**Output:**
```
Transaction DENY
────────────────────────────────────────────────────────
Transaction ID:  3cafac02-d2b9-4b1f-a210-ce38a64a01d6
Amount:          200.00 USD
Decision:        DENY
Reason:          Denied by policy: SPEND_LIMIT
Policies:        SPEND_LIMIT=DENY
────────────────────────────────────────────────────────
```

If a policy of type `APPROVAL_REQUIRED` matches, the decision is `REVIEW` and an approval request is created — visible in the dashboard.

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

### `olympay workspace revoke`

Revoke a workspace API key by its ID. Revoked keys are immediately rejected by the API.

```bash
olympay workspace revoke KEY_ID
```

Use `olympay workspace keys` to find the key ID first.

---

## Full Workflow Example

```bash
# 1. Authenticate
olympay login --key olympay_ws_...

# 2. Spawn an agent for handling SaaS payments
olympay agent create --name "saas-bot" --description "Manages SaaS subscriptions"
# Output: ID: <AGENT_ID>, API Key: olympay_agt_...

# 3. Open a USD account for the agent
olympay account create --agent <AGENT_ID> --name "saas-budget" --currency USD
# Output: ID: <ACCOUNT_ID>

# 4. Issue a virtual card
olympay card issue --agent <AGENT_ID> --account <ACCOUNT_ID> --brand VISA
# Output: ID: <CARD_ID>

# 5. Create a spending limit policy (blocks transactions above $100)
olympay policy create --name "100-cap" --type SPEND_LIMIT --config '{"maxAmountMinor":10000}'
# Output: ID: <POLICY_ID>

# 6. Assign the policy to the agent
olympay policy assign --policy <POLICY_ID> --target-type AGENT --target <AGENT_ID>

# 7. Evaluate a transaction attempt ($50 - should ALLOW)
olympay tx eval --agent <AGENT_ID> --account <ACCOUNT_ID> --amount 5000

# 8. Evaluate a transaction attempt ($200 - should DENY)
olympay tx eval --agent <AGENT_ID> --account <ACCOUNT_ID> --amount 20000

# 9. Emergency: suspend the agent
olympay agent suspend <AGENT_ID>

# 10. Resume after review
olympay agent activate <AGENT_ID>

# 11. List all resources
olympay agent list
olympay account list
olympay card list
olympay policy list
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
