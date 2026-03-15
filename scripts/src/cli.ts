#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".olympay");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const DEFAULT_API = "https://api.olympay.tech/v1";

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
    console.error("Not logged in. Run:  olympay login --key olympay_ws_...");
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
    console.error(`Error: ${msg}`);
    process.exit(1);
  }
  return json?.data ?? json;
}

const program = new Command();

program
  .name("olympay")
  .description("Olympay CLI - spawn and manage AI agents with financial controls")
  .version("0.1.0");

program
  .command("login")
  .description("Authenticate with a workspace API key")
  .requiredOption("--key <key>", "Workspace API key (olympay_ws_...)")
  .option("--api <url>", "API base URL", DEFAULT_API)
  .action((opts) => {
    if (!opts.key.startsWith("olympay_ws_")) {
      console.error("Invalid key format. Expected: olympay_ws_...");
      process.exit(1);
    }
    saveConfig({ apiKey: opts.key, apiBase: opts.api });
    console.log("Logged in successfully.");
    console.log(`API base: ${opts.api}`);
  });

program
  .command("logout")
  .description("Remove stored credentials")
  .action(() => {
    if (existsSync(CONFIG_FILE)) {
      writeFileSync(CONFIG_FILE, "{}");
    }
    console.log("Logged out.");
  });

program
  .command("whoami")
  .description("Show current credentials")
  .action(() => {
    const cfg = loadConfig();
    if (!cfg?.apiKey) {
      console.log("Not logged in.");
    } else {
      const masked = cfg.apiKey.slice(0, 18) + "..." + cfg.apiKey.slice(-4);
      console.log(`API key: ${masked}`);
      console.log(`API base: ${cfg.apiBase}`);
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
    console.log("\nAgent spawned successfully!");
    console.log("--------------------------------");
    console.log(`ID:       ${agent.id}`);
    console.log(`Name:     ${agent.name}`);
    console.log(`API Key:  ${agent.apiKey}`);
    console.log(`Status:   ${agent.status}`);
    console.log("--------------------------------");
    console.log("Keep this API key safe - use it to authenticate transactions.");
  });

agentCmd
  .command("list")
  .description("List all agents in your workspace")
  .action(async () => {
    const agents = await apiCall("GET", "/agents");
    if (!agents.length) {
      console.log("No agents found.");
      return;
    }
    console.log(`\n${"ID".padEnd(38)} ${"Name".padEnd(25)} ${"Status".padEnd(12)} API Key`);
    console.log("-".repeat(100));
    for (const a of agents) {
      const key = a.apiKey ? a.apiKey.slice(0, 20) + "..." : "-";
      console.log(`${a.id.padEnd(38)} ${a.name.padEnd(25)} ${a.status.padEnd(12)} ${key}`);
    }
  });

agentCmd
  .command("suspend <id>")
  .description("Suspend an agent")
  .action(async (id) => {
    await apiCall("PATCH", `/agents/${id}/status`, { status: "suspended" });
    console.log(`Agent ${id} suspended.`);
  });

agentCmd
  .command("activate <id>")
  .description("Activate an agent")
  .action(async (id) => {
    await apiCall("PATCH", `/agents/${id}/status`, { status: "active" });
    console.log(`Agent ${id} activated.`);
  });

const accountCmd = program.command("account").description("Manage agent accounts");

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
    console.log("\nAccount opened!");
    console.log(`ID:       ${account.id}`);
    console.log(`Name:     ${account.name}`);
    console.log(`Currency: ${account.currency}`);
    console.log(`Status:   ${account.status}`);
  });

accountCmd
  .command("list")
  .description("List all accounts in your workspace")
  .action(async () => {
    const accounts = await apiCall("GET", "/accounts");
    if (!accounts.length) { console.log("No accounts found."); return; }
    console.log(`\n${"ID".padEnd(38)} ${"Name".padEnd(25)} ${"Agent".padEnd(38)} Balance`);
    console.log("-".repeat(110));
    for (const a of accounts) {
      const bal = `$${((a.balanceMinor ?? 0) / 100).toFixed(2)} ${a.currency}`;
      console.log(`${a.id.padEnd(38)} ${a.name.padEnd(25)} ${a.agentId.padEnd(38)} ${bal}`);
    }
  });

const cardCmd = program.command("card").description("Manage virtual cards");

cardCmd
  .command("issue")
  .description("Issue a virtual card to an agent account")
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
    console.log("\nCard issued!");
    console.log(`ID:      ${card.id}`);
    console.log(`Brand:   ${card.brand ?? "VISA"}`);
    console.log(`Last4:   ${card.last4 ?? "-"}`);
    console.log(`Status:  ${card.status}`);
  });

cardCmd
  .command("list")
  .description("List all cards in your workspace")
  .action(async () => {
    const cards = await apiCall("GET", "/cards");
    if (!cards.length) { console.log("No cards found."); return; }
    console.log(`\n${"ID".padEnd(38)} ${"Brand".padEnd(8)} ${"Last4".padEnd(6)} ${"Status".padEnd(12)} Agent`);
    console.log("-".repeat(90));
    for (const c of cards) {
      console.log(`${c.id.padEnd(38)} ${(c.brand ?? "-").padEnd(8)} ${(c.last4 ?? "-").padEnd(6)} ${c.status.padEnd(12)} ${c.agentId}`);
    }
  });

const policyCmd = program.command("policy").description("Manage spending policies");

policyCmd
  .command("list")
  .description("List all policies in your workspace")
  .action(async () => {
    const policies = await apiCall("GET", "/policies");
    if (!policies.length) { console.log("No policies found."); return; }
    console.log(`\n${"ID".padEnd(38)} ${"Name".padEnd(30)} ${"Type".padEnd(25)} Status`);
    console.log("-".repeat(100));
    for (const p of policies) {
      console.log(`${p.id.padEnd(38)} ${p.name.padEnd(30)} ${p.type.padEnd(25)} ${p.status}`);
    }
  });

const wsCmd = program.command("workspace").description("Manage workspace settings");

wsCmd
  .command("keys")
  .description("List active workspace API keys")
  .action(async () => {
    const keys = await apiCall("GET", "/workspace/keys");
    if (!keys.length) { console.log("No keys found."); return; }
    console.log(`\n${"ID".padEnd(38)} ${"Name".padEnd(20)} Key`);
    console.log("-".repeat(100));
    for (const k of keys) {
      console.log(`${k.id.padEnd(38)} ${k.name.padEnd(20)} ${k.key}`);
    }
  });

wsCmd
  .command("generate-key")
  .description("Generate a new workspace API key")
  .option("--name <name>", "Key name", "Default")
  .action(async (opts) => {
    const key = await apiCall("POST", "/workspace/keys", { name: opts.name });
    console.log("\nNew workspace API key generated!");
    console.log("--------------------------------");
    console.log(`ID:   ${key.id}`);
    console.log(`Name: ${key.name}`);
    console.log(`Key:  ${key.key}`);
    console.log("--------------------------------");
    console.log("Use this key with: olympay login --key <key>");
  });

program.parse();
