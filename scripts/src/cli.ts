import { Command } from "commander";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".olympay");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const DEFAULT_API = "https://api.olympay.tech/v1";

const RESET  = "\x1b[0m";
const GOLD   = "\x1b[38;2;196;146;58m";
const DIM    = "\x1b[2m";
const BOLD   = "\x1b[1m";
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const CYAN   = "\x1b[36m";

const ASCII_BANNER = `
${GOLD} ██████╗ ██╗      ██╗   ██╗███╗   ███╗██████╗  █████╗ ██╗   ██╗${RESET}
${GOLD}██╔═══██╗██║      ╚██╗ ██╔╝████╗ ████║██╔══██╗██╔══██╗╚██╗ ██╔╝${RESET}
${GOLD}██║   ██║██║       ╚████╔╝ ██╔████╔██║██████╔╝███████║ ╚████╔╝ ${RESET}
${GOLD}██║   ██║██║        ╚██╔╝  ██║╚██╔╝██║██╔═══╝ ██╔══██║  ╚██╔╝  ${RESET}
${GOLD}╚██████╔╝███████╗   ██║   ██║ ╚═╝ ██║██║     ██║  ██║   ██║   ${RESET}
${GOLD} ╚═════╝ ╚══════╝   ╚═╝   ╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ${RESET}
${DIM}  Financial control for autonomous AI agents  •  olympay.tech${RESET}
`;

interface Config {
  apiKey: string;
  apiBase: string;
}

function loadConfig(): Config | null {
  if (!existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8")) as Config;
  } catch {
    return null;
  }
}

function saveConfig(cfg: Config) {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

function requireConfig(): Config {
  const cfg = loadConfig();
  if (!cfg?.apiKey) {
    console.error(`${RED}Not logged in.${RESET} Run:  ${GOLD}olympay login --key olympay_ws_...${RESET}`);
    process.exit(1);
  }
  return cfg;
}

async function apiCall(method: string, path: string, body?: unknown): Promise<any> {
  const cfg = requireConfig();
  const url = `${cfg.apiBase}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cfg.apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message ?? `HTTP ${res.status}`;
    console.error(`${RED}Error:${RESET} ${msg}`);
    process.exit(1);
  }
  return json?.data ?? json;
}

const program = new Command();

program
  .name("olympay")
  .description("Olympay CLI - spawn and manage AI agents with financial controls")
  .version("0.1.0")
  .addHelpText("before", ASCII_BANNER);

program
  .command("login")
  .description("Authenticate with a workspace API key")
  .requiredOption("--key <key>", "Workspace API key (olympay_ws_...)")
  .option("--api <url>", "API base URL", DEFAULT_API)
  .action((opts) => {
    if (!opts.key.startsWith("olympay_ws_")) {
      console.error(`${RED}Invalid key format.${RESET} Expected: ${GOLD}olympay_ws_...${RESET}`);
      process.exit(1);
    }
    saveConfig({ apiKey: opts.key, apiBase: opts.api });
    console.log(ASCII_BANNER);
    console.log(`${GREEN}Logged in successfully.${RESET}`);
    console.log(`${DIM}API base:${RESET} ${opts.api}`);
    console.log(`${DIM}Config:  ${RESET} ${CONFIG_FILE}`);
    console.log(`\n${GOLD}Next steps:${RESET}`);
    console.log(`  ${CYAN}olympay agent create --name "my-bot"${RESET}   Spawn your first agent`);
    console.log(`  ${CYAN}olympay agent list${RESET}                      List all agents`);
    console.log(`  ${CYAN}olympay account create --agent <id> --name "main"${RESET}`);
  });

program
  .command("logout")
  .description("Remove stored credentials")
  .action(() => {
    if (existsSync(CONFIG_FILE)) {
      writeFileSync(CONFIG_FILE, "{}");
    }
    console.log(`${GREEN}Logged out.${RESET} Credentials removed from ${CONFIG_FILE}`);
  });

program
  .command("whoami")
  .description("Show current credentials")
  .action(() => {
    const cfg = loadConfig();
    if (!cfg?.apiKey) {
      console.log(`${DIM}Not logged in.${RESET}`);
    } else {
      const masked = cfg.apiKey.slice(0, 18) + "..." + cfg.apiKey.slice(-4);
      console.log(`${GOLD}API key:${RESET}  ${masked}`);
      console.log(`${GOLD}API base:${RESET} ${cfg.apiBase}`);
    }
  });

const agentCmd = program.command("agent").description("Manage AI agents");

agentCmd
  .command("create")
  .description("Spawn a new AI agent and receive its API key")
  .requiredOption("--name <name>", "Agent name")
  .option("--description <desc>", "Agent description")
  .action(async (opts) => {
    const agent = await apiCall("POST", "/agents", {
      name: opts.name,
      description: opts.description,
      status: "active",
    });
    console.log(`\n${GREEN}Agent spawned successfully!${RESET}`);
    console.log(`${DIM}${"─".repeat(48)}${RESET}`);
    console.log(`${GOLD}ID:      ${RESET} ${agent.id}`);
    console.log(`${GOLD}Name:    ${RESET} ${agent.name}`);
    console.log(`${GOLD}API Key: ${RESET} ${BOLD}${agent.apiKey}${RESET}`);
    console.log(`${GOLD}Status:  ${RESET} ${agent.status}`);
    console.log(`${DIM}${"─".repeat(48)}${RESET}`);
    console.log(`${DIM}Keep this API key safe - use it to authenticate transactions.${RESET}`);
  });

agentCmd
  .command("list")
  .description("List all agents in your workspace")
  .action(async () => {
    const agents = await apiCall("GET", "/agents");
    if (!agents.length) {
      console.log(`${DIM}No agents found.${RESET} Create one with: ${GOLD}olympay agent create --name "..."${RESET}`);
      return;
    }
    console.log(`\n${GOLD}${"ID".padEnd(38)} ${"NAME".padEnd(25)} ${"STATUS".padEnd(12)} API KEY${RESET}`);
    console.log(`${DIM}${"─".repeat(100)}${RESET}`);
    for (const a of agents) {
      const key = a.apiKey ? a.apiKey.slice(0, 20) + "..." : DIM + "-" + RESET;
      const status = a.status === "active" ? `${GREEN}${a.status}${RESET}` : `${DIM}${a.status}${RESET}`;
      console.log(`${a.id.padEnd(38)} ${a.name.padEnd(25)} ${a.status.padEnd(12)} ${key}`);
    }
  });

agentCmd
  .command("suspend <id>")
  .description("Suspend an agent to block all transactions")
  .action(async (id) => {
    await apiCall("PATCH", `/agents/${id}/status`, { status: "suspended" });
    console.log(`${GREEN}Agent ${id} suspended.${RESET}`);
  });

agentCmd
  .command("activate <id>")
  .description("Re-activate a suspended agent")
  .action(async (id) => {
    await apiCall("PATCH", `/agents/${id}/status`, { status: "active" });
    console.log(`${GREEN}Agent ${id} activated.${RESET}`);
  });

const accountCmd = program.command("account").description("Manage agent ledger accounts");

accountCmd
  .command("create")
  .description("Open a ledger account for an agent")
  .requiredOption("--agent <agentId>", "Agent ID")
  .requiredOption("--name <name>", "Account name")
  .option("--currency <currency>", "Currency code", "USD")
  .action(async (opts) => {
    const account = await apiCall("POST", "/accounts", {
      agentId: opts.agent,
      name: opts.name,
      currency: opts.currency,
    });
    console.log(`\n${GREEN}Account opened!${RESET}`);
    console.log(`${GOLD}ID:       ${RESET} ${account.id}`);
    console.log(`${GOLD}Name:     ${RESET} ${account.name}`);
    console.log(`${GOLD}Currency: ${RESET} ${account.currency}`);
    console.log(`${GOLD}Status:   ${RESET} ${account.status}`);
  });

accountCmd
  .command("list")
  .description("List all accounts in your workspace")
  .action(async () => {
    const accounts = await apiCall("GET", "/accounts");
    if (!accounts.length) {
      console.log(`${DIM}No accounts found.${RESET}`);
      return;
    }
    console.log(`\n${GOLD}${"ID".padEnd(38)} ${"NAME".padEnd(25)} ${"AGENT".padEnd(38)} BALANCE${RESET}`);
    console.log(`${DIM}${"─".repeat(110)}${RESET}`);
    for (const a of accounts) {
      const bal = `$${((a.balanceMinor ?? 0) / 100).toFixed(2)} ${a.currency}`;
      console.log(`${a.id.padEnd(38)} ${a.name.padEnd(25)} ${a.agentId.padEnd(38)} ${bal}`);
    }
  });

const cardCmd = program.command("card").description("Manage virtual cards");

cardCmd
  .command("issue")
  .description("Issue a virtual card linked to an agent account")
  .requiredOption("--agent <agentId>", "Agent ID")
  .requiredOption("--account <accountId>", "Account ID")
  .option("--brand <brand>", "Card brand (e.g. VISA)", "VISA")
  .option("--last4 <last4>", "Last 4 digits (optional)")
  .action(async (opts) => {
    const card = await apiCall("POST", "/cards", {
      agentId: opts.agent,
      accountId: opts.account,
      brand: opts.brand,
      last4: opts.last4,
    });
    console.log(`\n${GREEN}Card issued!${RESET}`);
    console.log(`${GOLD}ID:     ${RESET} ${card.id}`);
    console.log(`${GOLD}Brand:  ${RESET} ${card.brand ?? "VISA"}`);
    console.log(`${GOLD}Last4:  ${RESET} ${card.last4 ?? DIM + "-" + RESET}`);
    console.log(`${GOLD}Status: ${RESET} ${card.status}`);
  });

cardCmd
  .command("list")
  .description("List all virtual cards in your workspace")
  .action(async () => {
    const cards = await apiCall("GET", "/cards");
    if (!cards.length) {
      console.log(`${DIM}No cards found.${RESET}`);
      return;
    }
    console.log(`\n${GOLD}${"ID".padEnd(38)} ${"BRAND".padEnd(8)} ${"LAST4".padEnd(6)} ${"STATUS".padEnd(12)} AGENT${RESET}`);
    console.log(`${DIM}${"─".repeat(90)}${RESET}`);
    for (const c of cards) {
      console.log(`${c.id.padEnd(38)} ${(c.brand ?? "-").padEnd(8)} ${(c.last4 ?? "-").padEnd(6)} ${c.status.padEnd(12)} ${c.agentId}`);
    }
  });

const policyCmd = program.command("policy").description("Manage spending policies");

policyCmd
  .command("list")
  .description("List all spending policies in your workspace")
  .action(async () => {
    const policies = await apiCall("GET", "/policies");
    if (!policies.length) {
      console.log(`${DIM}No policies found.${RESET}`);
      return;
    }
    console.log(`\n${GOLD}${"ID".padEnd(38)} ${"NAME".padEnd(30)} ${"TYPE".padEnd(25)} STATUS${RESET}`);
    console.log(`${DIM}${"─".repeat(100)}${RESET}`);
    for (const p of policies) {
      console.log(`${p.id.padEnd(38)} ${p.name.padEnd(30)} ${p.type.padEnd(25)} ${p.status}`);
    }
  });

const wsCmd = program.command("workspace").description("Manage workspace settings and API keys");

wsCmd
  .command("keys")
  .description("List active workspace API keys")
  .action(async () => {
    const keys = await apiCall("GET", "/workspace/keys");
    if (!keys.length) {
      console.log(`${DIM}No keys found.${RESET} Generate one with: ${GOLD}olympay workspace generate-key${RESET}`);
      return;
    }
    console.log(`\n${GOLD}${"ID".padEnd(38)} ${"NAME".padEnd(20)} KEY${RESET}`);
    console.log(`${DIM}${"─".repeat(100)}${RESET}`);
    for (const k of keys) {
      console.log(`${k.id.padEnd(38)} ${k.name.padEnd(20)} ${k.key}`);
    }
  });

wsCmd
  .command("generate-key")
  .description("Generate a new workspace API key")
  .option("--name <name>", "Key label", "CLI Key")
  .action(async (opts) => {
    const key = await apiCall("POST", "/workspace/keys", { name: opts.name });
    console.log(`\n${GREEN}New workspace API key generated!${RESET}`);
    console.log(`${DIM}${"─".repeat(56)}${RESET}`);
    console.log(`${GOLD}ID:   ${RESET} ${key.id}`);
    console.log(`${GOLD}Name: ${RESET} ${key.name}`);
    console.log(`${GOLD}Key:  ${RESET} ${BOLD}${key.key}${RESET}`);
    console.log(`${DIM}${"─".repeat(56)}${RESET}`);
    console.log(`${DIM}Use with:${RESET} ${GOLD}olympay login --key ${key.key}${RESET}`);
  });

program.parse();
