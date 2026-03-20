import { Link } from "wouter";
import olympayLogo from "@/assets/logo.png";

const GOLD = "#c4923a";
const BLACK = "#0a0a08";
const CREAM = "#f7f2e9";
const BORDER = "#e2d9cc";
const MUTED = "#78716c";
const MONO = "'JetBrains Mono', monospace";
const SANS = "'DM Sans', sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";

function Tag({ children, color = GOLD }: { children: string; color?: string }) {
  return (
    <span style={{
      fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
      color: BLACK, background: color, borderRadius: "3px", padding: "2px 8px", fontWeight: 700,
    }}>{children}</span>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: "56px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        <div style={{ width: "3px", height: "24px", background: GOLD, borderRadius: "2px", flexShrink: 0 }} />
        <h2 style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: 400, color: BLACK, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Code({ children, block = false }: { children: string; block?: boolean }) {
  if (block) {
    return (
      <pre style={{
        fontFamily: MONO, fontSize: "12px", lineHeight: 1.7, color: "#e5dcc8",
        background: BLACK, borderRadius: "8px", padding: "20px 24px",
        overflowX: "auto", margin: "12px 0",
        border: `1px solid ${GOLD}22`,
      }}>{children}</pre>
    );
  }
  return (
    <code style={{ fontFamily: MONO, fontSize: "11px", color: GOLD, background: `${GOLD}15`, borderRadius: "3px", padding: "1px 6px" }}>
      {children}
    </code>
  );
}

function FlowStep({ n, title, desc, color = GOLD }: { n: string; title: string; desc: string; color?: string }) {
  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
        background: `${color}22`, border: `1px solid ${color}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: MONO, fontSize: "11px", color, fontWeight: 700,
      }}>{n}</div>
      <div style={{ flex: 1, paddingTop: "4px" }}>
        <p style={{ fontFamily: MONO, fontSize: "11px", color, fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</p>
        <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED, margin: 0, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

function EventRow({ event, trigger, color }: { event: string; trigger: string; color: string }) {
  return (
    <tr>
      <td style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}` }}>
        <Code>{event}</Code>
      </td>
      <td style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontFamily: SANS, fontSize: "12px", color: MUTED }}>{trigger}</span>
      </td>
      <td style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, textAlign: "right" }}>
        <span style={{
          fontFamily: MONO, fontSize: "8px", letterSpacing: "0.08em", textTransform: "uppercase",
          color, background: `${color}18`, border: `1px solid ${color}33`,
          borderRadius: "3px", padding: "2px 8px",
        }}>{event.split(".")[1]}</span>
      </td>
    </tr>
  );
}

export default function Protocol() {
  return (
    <div style={{ background: CREAM, minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{
        background: BLACK, borderBottom: `1px solid ${GOLD}22`,
        padding: "0 32px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src={olympayLogo} alt="Olympay" style={{ width: "22px", height: "22px", filter: "brightness(0) saturate(100%) invert(64%) sepia(53%) saturate(601%) hue-rotate(8deg) brightness(98%)" }} />
          <span style={{ fontFamily: MONO, fontSize: "12px", color: GOLD, letterSpacing: "0.1em", fontWeight: 600 }}>OLYMPAY</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontFamily: MONO, fontSize: "9px", color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" }}>Payment Protocol</span>
          <Tag>v1</Tag>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: BLACK, borderBottom: `1px solid ${GOLD}22`, padding: "64px 32px 56px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <Tag>Specification</Tag>
            <Tag color="#16a34a">Stable</Tag>
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: "40px", fontWeight: 400, color: "#f7f2e9", margin: "0 0 16px", lineHeight: 1.15 }}>
            Olympay Payment Protocol <span style={{ color: GOLD }}>v1</span>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: "16px", color: "#a8a29e", margin: "0 0 28px", lineHeight: 1.7, maxWidth: "600px" }}>
            A real-time transaction authorization protocol designed for autonomous AI agents.
            Every payment is evaluated, signed, and delivered with a full audit trail before settlement.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a href="#overview" style={{ fontFamily: MONO, fontSize: "10px", color: BLACK, background: GOLD, borderRadius: "4px", padding: "8px 20px", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Read Spec</a>
            <Link href="/api" style={{ fontFamily: MONO, fontSize: "10px", color: GOLD, border: `1px solid ${GOLD}55`, borderRadius: "4px", padding: "8px 20px", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>API Reference</Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 32px 80px" }}>

        <Section id="overview" title="Overview">
          <p style={{ fontFamily: SANS, fontSize: "14px", color: MUTED, lineHeight: 1.8, marginBottom: "20px" }}>
            The Olympay Payment Protocol (OPP) defines how AI agents submit, evaluate, and settle financial transactions
            through a programmable policy engine. Unlike traditional payment rails, OPP places governance logic
            between the agent and settlement — every transaction must pass a real-time policy check before funds move.
          </p>
          <p style={{ fontFamily: SANS, fontSize: "14px", color: MUTED, lineHeight: 1.8, margin: 0 }}>
            OPP is transport-agnostic. Agents can submit transactions via the REST API or CLI.
            Results are returned synchronously and pushed asynchronously to registered webhook endpoints.
          </p>
        </Section>

        <Section id="flow" title="Transaction Flow">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "28px 24px" }}>
            <FlowStep n="1" title="Submit" desc="Agent calls POST /v1/transactions/attempt with agentId, accountId, amount, merchantId, and optional cardId." />
            <div style={{ borderLeft: `2px dashed ${BORDER}`, marginLeft: "15px", height: "16px" }} />
            <FlowStep n="2" title="Evaluate" desc="The Policy Engine resolves all active policies assigned to the agent, account, and card. Each policy returns ALLOW, DENY, or REVIEW." />
            <div style={{ borderLeft: `2px dashed ${BORDER}`, marginLeft: "15px", height: "16px" }} />
            <FlowStep n="3" title="Decide" desc="A single verdict is resolved: DENY wins over REVIEW, REVIEW wins over ALLOW. The final decision is recorded immutably." color="#d97706" />
            <div style={{ borderLeft: `2px dashed ${BORDER}`, marginLeft: "15px", height: "16px" }} />
            <FlowStep n="4" title="Respond" desc="The API returns the transaction record, decision, matched policies, and protocol metadata synchronously within the same HTTP response." color="#16a34a" />
            <div style={{ borderLeft: `2px dashed ${BORDER}`, marginLeft: "15px", height: "16px" }} />
            <FlowStep n="5" title="Notify" desc="All active webhooks subscribed to the relevant event receive a signed HTTP POST asynchronously within seconds of the decision." color={GOLD} />
          </div>
        </Section>

        <Section id="decisions" title="Decision Outcomes">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {[
              { verdict: "ALLOW", desc: "Transaction passes all policy checks. Proceeds to settlement.", color: "#16a34a" },
              { verdict: "DENY",  desc: "At least one policy blocked the transaction. Funds do not move.", color: "#dc2626" },
              { verdict: "REVIEW", desc: "Flagged for human-in-the-loop approval before settlement.", color: "#d97706" },
            ].map(d => (
              <div key={d.verdict} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "20px" }}>
                <span style={{
                  fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
                  color: d.color, background: `${d.color}18`, border: `1px solid ${d.color}33`,
                  borderRadius: "3px", padding: "3px 8px", display: "inline-block", marginBottom: "12px",
                }}>{d.verdict}</span>
                <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED, margin: 0, lineHeight: 1.6 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="request" title="Request Format">
          <Code block>{`POST /v1/transactions/attempt
Authorization: Bearer <workspace_token>
Content-Type: application/json

{
  "agentId":     "ag_nexus_capital_ai_001",
  "accountId":   "acc_01jq...",
  "cardId":      "card_01jq...",   // optional
  "merchantId":  "stripe",          // optional
  "amountMinor": 4999,              // in cents
  "currency":    "USD",
  "direction":   "DEBIT"
}`}</Code>
        </Section>

        <Section id="response" title="Response Format">
          <Code block>{`{
  "success": true,
  "data": {
    "transaction": {
      "id":         "txn_01jq...",
      "decision":   "ALLOW",
      "status":     "approved",
      "amountMinor": 4999,
      "currency":   "USD",
      "requestedAt": "2026-03-20T09:41:22Z"
    },
    "decision": {
      "result": "ALLOW",
      "reason": "All policies allowed",
      "matchedPolicies": [
        { "policyId": "pol_01jq...", "policyType": "SPEND_LIMIT", "outcome": "ALLOW" }
      ]
    },
    "approvalRequest": null,
    "protocol": {
      "name":        "Olympay Payment Protocol",
      "version":     "v1",
      "evaluatedAt": "2026-03-20T09:41:22.301Z",
      "policyCount": 1,
      "specUrl":     "https://olympay.tech/protocol/v1"
    }
  }
}`}</Code>
        </Section>

        <Section id="webhooks" title="Webhook Events">
          <p style={{ fontFamily: SANS, fontSize: "14px", color: MUTED, lineHeight: 1.8, marginBottom: "20px" }}>
            Every webhook POST includes a <Code>X-Olympay-Signature</Code> header for verification.
            Verify using HMAC-SHA256 with your webhook secret.
          </p>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: CREAM }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED }}>Event</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED }}>Triggered When</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED }}>Decision</th>
                </tr>
              </thead>
              <tbody>
                <EventRow event="transaction.completed" trigger="Transaction passed all policy checks and is approved." color="#16a34a" />
                <EventRow event="transaction.denied"    trigger="Transaction was blocked by one or more policies."   color="#dc2626" />
                <EventRow event="transaction.review"    trigger="Transaction is pending human approval."              color="#d97706" />
                <EventRow event="approval.approved"     trigger="A pending transaction was approved by a reviewer."  color="#16a34a" />
                <EventRow event="approval.rejected"     trigger="A pending transaction was rejected by a reviewer."  color="#dc2626" />
              </tbody>
            </table>
          </div>
          <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED, lineHeight: 1.7, margin: 0 }}>
            Webhook payload example:
          </p>
          <Code block>{`// POST https://your-app.com/webhooks/olympay
// X-Olympay-Event: transaction.denied
// X-Olympay-Signature: sha256=abc123...
// X-Olympay-Protocol: v1

{
  "event":     "transaction.denied",
  "timestamp": "2026-03-20T09:41:22.301Z",
  "protocol":  "olympay-payment-protocol/v1",
  "data": {
    "transaction": { ... },
    "decision": {
      "result": "DENY",
      "reason": "Denied by policy: MERCHANT_BLOCKLIST"
    }
  }
}`}</Code>
        </Section>

        <Section id="verification" title="Signature Verification">
          <p style={{ fontFamily: SANS, fontSize: "14px", color: MUTED, lineHeight: 1.8, marginBottom: "16px" }}>
            Verify every incoming webhook using HMAC-SHA256. Reject any request where the signature does not match.
          </p>
          <Code block>{`// Node.js example
import crypto from "crypto";

function verifySignature(payload, secret, header) {
  const expected = "sha256=" +
    crypto.createHmac("sha256", secret)
          .update(payload)
          .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(header)
  );
}

// In your webhook handler:
const rawBody = req.rawBody; // unparsed string
const sig     = req.headers["x-olympay-signature"];
const secret  = process.env.OLYMPAY_WEBHOOK_SECRET;

if (!verifySignature(rawBody, secret, sig)) {
  return res.status(401).send("Invalid signature");
}
// Safe to process
const event = req.body;`}</Code>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: "64px", paddingTop: "32px", borderTop: `1px solid ${BORDER}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px",
        }}>
          <div>
            <p style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>
              Olympay Payment Protocol
            </p>
            <p style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, margin: 0 }}>Version 1.0 — March 2026</p>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/" style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, textDecoration: "none" }}>Home</Link>
            <Link href="/api" style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, textDecoration: "none" }}>API</Link>
            <Link href="/webhooks" style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, textDecoration: "none" }}>Webhooks</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
