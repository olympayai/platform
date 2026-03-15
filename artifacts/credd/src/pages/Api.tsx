import { useState } from "react";
import { Copy, Check, Terminal, Key, BookOpen, Zap } from "lucide-react";
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


export default function Api() {
  return (
    <div>
      <PageHeader
        title="API"
        subtitle="Credentials, endpoint reference, and integration guide."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>

        {/* API Keys */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Key size={14} color={GOLD} />
            <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, color: BLACK, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              API Credentials
            </span>
          </div>

          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "40px 24px", textAlign: "center",
            background: CREAM, border: `1px solid ${BORDER}`,
            borderRadius: "6px", gap: "12px",
          }}>
            <Key size={18} color={MUTED} style={{ opacity: 0.5 }} />
            <div>
              <p style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 500, color: BLACK, marginBottom: "4px" }}>
                No API credentials yet
              </p>
              <p style={{ fontFamily: SANS, fontSize: "12px", color: MUTED, lineHeight: 1.6, maxWidth: "280px" }}>
                API key issuance is coming soon. Credentials will appear here once your workspace is provisioned.
              </p>
            </div>
          </div>

          <div style={{
            marginTop: "12px", padding: "12px", borderRadius: "4px",
            background: `${GOLD}10`, border: `1px solid ${GOLD}40`,
          }}>
            <p style={{ fontFamily: SANS, fontSize: "12px", color: MUTED, lineHeight: 1.6, margin: 0 }}>
              Once issued, keep your secret key confidential. All API requests must include{" "}
              <code style={{ fontFamily: MONO, fontSize: "11px", color: GOLD }}>Authorization: Bearer olympay_live_...</code>
            </p>
          </div>
        </div>

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
