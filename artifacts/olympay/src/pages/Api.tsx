import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { Copy, Check, Terminal, Key, BookOpen, Zap, Plus, Trash2 } from "lucide-react";
import {
  PageHeader,
  MONO, SANS, CREAM, BORDER, GOLD, BLACK, MUTED,
} from "@/components/ui/page-shell";

const BASE_URL = "https://api.olympay.tech/v1";

const ENDPOINTS = [
  {
    group: "Agents",
    items: [
      { method: "GET",    path: "/agents",          desc: "List all agents in your workspace" },
      { method: "POST",   path: "/agents",          desc: "Register a new agent" },
      { method: "GET",    path: "/agents/:id",      desc: "Retrieve a single agent" },
      { method: "PATCH",  path: "/agents/:id",      desc: "Update agent metadata or status" },
    ],
  },
  {
    group: "Accounts",
    items: [
      { method: "GET",    path: "/accounts",        desc: "List all ledger accounts" },
      { method: "POST",   path: "/accounts",        desc: "Open a new account for an agent" },
      { method: "GET",    path: "/accounts/:id",    desc: "Get account balance and details" },
    ],
  },
  {
    group: "Cards",
    items: [
      { method: "GET",    path: "/cards",           desc: "List all virtual cards" },
      { method: "POST",   path: "/cards",           desc: "Issue a new virtual card" },
      { method: "POST",   path: "/cards/:id/toggle", desc: "Enable or disable card spending" },
    ],
  },
  {
    group: "Policies",
    items: [
      { method: "GET",    path: "/policies",        desc: "List all policies" },
      { method: "POST",   path: "/policies",        desc: "Create a new spending policy" },
      { method: "PATCH",  path: "/policies/:id",    desc: "Update policy configuration" },
    ],
  },
  {
    group: "Transactions",
    items: [
      { method: "GET",    path: "/transactions",    desc: "List transactions with filters" },
      { method: "POST",   path: "/transactions/evaluate", desc: "Evaluate a spend intent against policies" },
    ],
  },
  {
    group: "Audit Logs",
    items: [
      { method: "GET",    path: "/audit-logs",      desc: "Retrieve immutable audit trail" },
    ],
  },
];

const METHOD_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  GET:    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  POST:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  PATCH:  { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  DELETE: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
};

const EXAMPLE_REQUEST = `curl -X POST ${BASE_URL}/transactions/evaluate \\
  -H "Authorization: Bearer olympay_live_••••••••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agt_01j9k2...",
    "amountMinor": 25000,
    "currency": "USD",
    "merchantId": "merch_stripe",
    "purpose": "SaaS subscription renewal"
  }'`;

const EXAMPLE_RESPONSE = `{
  "success": true,
  "data": {
    "verdict": "ALLOW",
    "transactionId": "txn_01j9kz...",
    "evaluatedAt": "2026-03-14T08:42:11Z",
    "policyId": "pol_01j8a1...",
    "policyName": "Monthly SaaS Limit",
    "remainingBudgetMinor": 75000
  }
}`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copy"
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: copied ? GOLD : MUTED,
        display: "flex", alignItems: "center", gap: "4px",
        fontFamily: MONO, fontSize: "10px", letterSpacing: "0.06em",
        transition: "color 0.15s",
        padding: "2px 6px",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div style={{
      background: BLACK, borderRadius: "6px",
      border: `1px solid rgba(255,255,255,0.08)`,
      overflow: "hidden",
    }}>
      {label && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", color: "rgba(229,220,200,0.45)", letterSpacing: "0.08em" }}>
            {label}
          </span>
          <CopyButton text={code} />
        </div>
      )}
      <pre style={{
        margin: 0, padding: "16px",
        fontFamily: MONO, fontSize: "12px", lineHeight: 1.7,
        color: "#e5dcc8",
        overflowX: "auto",
        whiteSpace: "pre",
      }}>{code}</pre>
    </div>
  );
}


const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "";

interface WorkspaceKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

function WorkspaceKeysPanel() {
  const { getAccessToken } = usePrivy();
  const qc = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyData, setNewKeyData] = useState<WorkspaceKey | null>(null);

  const { data: keys = [], isLoading } = useQuery<WorkspaceKey[]>({
    queryKey: ["workspace-keys"],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`${API_BASE}/api/v1/workspace/keys`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch keys");
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`${API_BASE}/api/v1/workspace/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: "CLI Key" }),
      });
      if (!res.ok) throw new Error("Failed to generate key");
      const json = await res.json();
      return json.data as WorkspaceKey;
    },
    onSuccess: (data) => {
      setNewKeyData(data);
      qc.invalidateQueries({ queryKey: ["workspace-keys"] });
    },
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAccessToken();
      const res = await fetch(`${API_BASE}/api/v1/workspace/keys/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to revoke key");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace-keys"] });
    },
  });

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Key size={14} color={GOLD} />
          <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, color: BLACK, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Workspace API Keys
          </span>
        </div>
        <button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: GOLD, color: "#fff", border: "none", borderRadius: "4px",
            padding: "6px 12px", cursor: "pointer",
            fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
            opacity: generate.isPending ? 0.7 : 1,
          }}
        >
          <Plus size={11} />
          {generate.isPending ? "GENERATING..." : "GENERATE KEY"}
        </button>
      </div>

      {newKeyData && (
        <div style={{
          marginBottom: "16px", padding: "12px 14px",
          background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px",
        }}>
          <div style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 600, color: "#15803d", marginBottom: "6px" }}>
            Key generated - save it now, it will not be shown again in full:
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <code style={{ fontFamily: MONO, fontSize: "11px", color: BLACK, wordBreak: "break-all" }}>
              {newKeyData.key}
            </code>
            <button
              onClick={() => copyKey(newKeyData.key, "new")}
              style={{ background: "none", border: "none", cursor: "pointer", color: copiedId === "new" ? GOLD : MUTED }}
            >
              {copiedId === "new" ? <Check size={12} /> : <Copy size={12} />}
            </button>
            <button
              onClick={() => setNewKeyData(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontFamily: MONO, fontSize: "10px" }}
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: "20px", textAlign: "center", color: MUTED, fontFamily: SANS, fontSize: "13px" }}>Loading...</div>
      ) : keys.length === 0 ? (
        <div style={{
          padding: "32px", textAlign: "center", background: CREAM,
          border: `1px solid ${BORDER}`, borderRadius: "6px",
        }}>
          <Key size={16} color={MUTED} style={{ marginBottom: "8px", opacity: 0.4 }} />
          <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED, margin: 0 }}>
            No keys yet. Generate one to authenticate the CLI.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {keys.map((k) => (
            <div key={k.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 12px", background: CREAM, borderRadius: "5px",
              border: `1px solid ${BORDER}`,
            }}>
              <div>
                <div style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 500, color: BLACK }}>{k.name}</div>
                <code style={{ fontFamily: MONO, fontSize: "10px", color: MUTED }}>{k.key}</code>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => copyKey(k.key, k.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: copiedId === k.id ? GOLD : MUTED }}
                  title="Copy key"
                >
                  {copiedId === k.id ? <Check size={12} /> : <Copy size={12} />}
                </button>
                <button
                  onClick={() => revoke.mutate(k.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#e53e3e" }}
                  title="Revoke key"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Api() {
  return (
    <div>
      <PageHeader
        title="API"
        subtitle="Credentials, endpoint reference, and integration guide."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>

        {/* API Keys - live workspace key management */}
        <WorkspaceKeysPanel />

        {/* Quick start */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Zap size={14} color={GOLD} />
            <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, color: BLACK, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Quick Start
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { n: "01", title: "Obtain credentials", desc: "Copy your live secret key from the credentials panel." },
              { n: "02", title: "Evaluate an intent", desc: "POST to /transactions/evaluate with agent ID, amount, and purpose." },
              { n: "03", title: "Handle the verdict", desc: "ALLOW proceeds automatically. DENY surfaces an error. REVIEW queues for approval." },
              { n: "04", title: "Stream events", desc: "Subscribe to the webhook to receive real-time transaction and policy events." },
            ].map(step => (
              <div key={step.n} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{
                  fontFamily: MONO, fontSize: "9px", color: GOLD,
                  background: `${GOLD}12`, border: `1px solid ${GOLD}40`,
                  borderRadius: "3px", padding: "2px 6px",
                  flexShrink: 0, marginTop: "2px",
                }}>{step.n}</span>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: BLACK }}>{step.title}</div>
                  <div style={{ fontFamily: SANS, fontSize: "12px", color: MUTED, lineHeight: 1.5, marginTop: "2px" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Example request / response */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <Terminal size={14} color={GOLD} />
          <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, color: BLACK, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Evaluate a Spend Intent
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <CodeBlock code={EXAMPLE_REQUEST} label="REQUEST · POST /transactions/evaluate" />
          <CodeBlock code={EXAMPLE_RESPONSE} label="RESPONSE · 200 OK" />
        </div>
      </div>

      {/* CLI & SDK */}
      <div style={{ background: BLACK, border: `1px solid rgba(196,146,58,0.25)`, borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
        <div style={{ padding: "20px 24px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Terminal size={14} color={GOLD} />
            <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              CLI & SDK
            </span>
            <span style={{
              fontFamily: MONO, fontSize: "9px", background: `${GOLD}20`,
              color: GOLD, border: `1px solid ${GOLD}50`, borderRadius: "3px",
              padding: "1px 6px", letterSpacing: "0.08em",
            }}>npm install -g olympay</span>
          </div>

          <pre style={{
            margin: "0 0 20px",
            fontFamily: MONO, fontSize: "11px", lineHeight: 1.55,
            color: GOLD,
            letterSpacing: "0.01em",
            overflowX: "auto",
          }}>{` ██████╗ ██╗      ██╗   ██╗███╗   ███╗██████╗  █████╗ ██╗   ██╗
██╔═══██╗██║      ╚██╗ ██╔╝████╗ ████║██╔══██╗██╔══██╗╚██╗ ██╔╝
██║   ██║██║       ╚████╔╝ ██╔████╔██║██████╔╝███████║ ╚████╔╝ 
██║   ██║██║        ╚██╔╝  ██║╚██╔╝██║██╔═══╝ ██╔══██║  ╚██╔╝  
╚██████╔╝███████╗   ██║   ██║ ╚═╝ ██║██║     ██║  ██║   ██║   
 ╚═════╝ ╚══════╝   ╚═╝   ╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   `}
            <span style={{ color: "rgba(229,220,200,0.35)", fontSize: "10px" }}>
              {`  Financial control for autonomous AI agents  •  olympay.tech`}
            </span>
          </pre>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0" }}>
          {[
            {
              label: "AUTH",
              items: [
                { cmd: "olympay login --key <ws_key>", desc: "Authenticate with a workspace API key" },
                { cmd: "olympay logout",               desc: "Remove stored credentials" },
                { cmd: "olympay whoami",                desc: "Show current auth context" },
              ],
            },
            {
              label: "AGENTS",
              items: [
                { cmd: "olympay agent create --name <n>", desc: "Spawn a new agent, returns its API key" },
                { cmd: "olympay agent list",               desc: "List all agents in your workspace" },
                { cmd: "olympay agent suspend <id>",       desc: "Suspend agent (blocks all transactions)" },
                { cmd: "olympay agent activate <id>",      desc: "Re-activate a suspended agent" },
              ],
            },
            {
              label: "ACCOUNTS",
              items: [
                { cmd: "olympay account create --agent <id> --name <n>", desc: "Open a ledger account for an agent" },
                { cmd: "olympay account list",                            desc: "List all accounts" },
              ],
            },
            {
              label: "CARDS",
              items: [
                { cmd: "olympay card issue --agent <id> --account <id>", desc: "Issue a virtual card" },
                { cmd: "olympay card list",                              desc: "List all virtual cards" },
              ],
            },
            {
              label: "POLICIES",
              items: [
                { cmd: "olympay policy create --name <n> --type <t>", desc: "Create a spending policy" },
                { cmd: "olympay policy list",                         desc: "List all spending policies" },
                { cmd: "olympay policy assign --policy <id> --target-type AGENT --target <id>", desc: "Assign policy to an agent, account, or card" },
              ],
            },
            {
              label: "TRANSACTIONS",
              items: [
                { cmd: "olympay tx eval --agent <id> --account <id> --amount <n>", desc: "Evaluate a transaction attempt against policies" },
              ],
            },
            {
              label: "WORKSPACE",
              items: [
                { cmd: "olympay workspace generate-key", desc: "Generate a new workspace API key" },
                { cmd: "olympay workspace keys",         desc: "List active workspace API keys" },
                { cmd: "olympay workspace revoke <id>",  desc: "Revoke a workspace API key" },
              ],
            },
          ].map((group) => (
            <div key={group.label} style={{ borderRight: "1px solid rgba(255,255,255,0.06)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "18px 20px" }}>
              <div style={{ fontFamily: MONO, fontSize: "9px", color: GOLD, letterSpacing: "0.12em", fontWeight: 700, marginBottom: "12px", opacity: 0.7 }}>
                {group.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {group.items.map(item => (
                  <div key={item.cmd}>
                    <code style={{ fontFamily: MONO, fontSize: "10px", color: "#e5dcc8", display: "block", marginBottom: "2px" }}>
                      {item.cmd}
                    </code>
                    <span style={{ fontFamily: MONO, fontSize: "9px", color: "rgba(229,220,200,0.4)", lineHeight: 1.5 }}>
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoint reference */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden" }}>
        <div style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <BookOpen size={14} color={GOLD} />
          <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, color: BLACK, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Endpoint Reference
          </span>
          <span style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginLeft: "4px" }}>
            Base URL: {BASE_URL}
          </span>
        </div>

        {ENDPOINTS.map((group, gi) => (
          <div key={group.group} style={{ borderBottom: gi < ENDPOINTS.length - 1 ? `1px solid ${BORDER}` : "none" }}>
            <div style={{
              padding: "10px 24px",
              background: CREAM,
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {group.group}
              </span>
            </div>
            {group.items.map((ep, ei) => {
              const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
              return (
                <div
                  key={`${group.group}-${ep.method}-${ep.path}`}
                  style={{
                    display: "grid", gridTemplateColumns: "72px 280px 1fr",
                    alignItems: "center",
                    padding: "12px 24px", gap: "16px",
                    borderBottom: ei < group.items.length - 1 ? `1px solid ${BORDER}` : "none",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${GOLD}05`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "2px 0", width: "56px",
                    fontFamily: MONO, fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em",
                    borderRadius: "3px",
                    background: mc.bg, color: mc.color, border: `1px solid ${mc.border}`,
                  }}>
                    {ep.method}
                  </span>
                  <code style={{ fontFamily: MONO, fontSize: "12px", color: BLACK }}>{ep.path}</code>
                  <span style={{ fontFamily: SANS, fontSize: "12px", color: MUTED }}>{ep.desc}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
