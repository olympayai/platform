import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowRight, ChevronRight, Copy, Check, ExternalLink, Menu, X } from "lucide-react";
import olympayLogo from "@/assets/logo.png";

/* ─── Design tokens ─── */
const GOLD    = "#c4923a";
const GOLDL   = "#d4a84e";
const BLACK   = "#0a0a08";
const CREAM   = "#f7f2e9";
const BORDER  = "#e2ddd4";
const MUTED   = "#6b6457";
const MONO    = "'JetBrains Mono', 'Fira Mono', monospace";
const SANS    = "'DM Sans', sans-serif";
const SERIF   = "'Playfair Display', Georgia, serif";

const LOGO_GOLD = "brightness(0) saturate(100%) invert(65%) sepia(40%) saturate(600%) hue-rotate(5deg)";
const LOGO_BLACK = "brightness(0) saturate(100%)";

/* ─── Code block component ─── */
function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{
      position: "relative",
      background: "#111110",
      border: "1px solid rgba(196,146,58,0.15)",
      borderRadius: "6px",
      overflow: "hidden",
      marginTop: "12px",
      marginBottom: "20px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.25)",
      }}>
        <span style={{ fontFamily: MONO, fontSize: "9px", color: "rgba(196,146,58,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{lang}</span>
        <button onClick={copy} style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: MONO, fontSize: "9px", color: "rgba(255,255,255,0.35)",
          padding: "2px 4px", borderRadius: "3px",
          transition: "color 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: "18px 20px",
        fontFamily: MONO, fontSize: "12px", lineHeight: 1.7,
        color: "#e2dcc8",
        overflowX: "auto",
        whiteSpace: "pre",
      }}>{code.trim()}</pre>
    </div>
  );
}

/* ─── Inline code ─── */
function Code({ children }: { children: string }) {
  return (
    <code style={{
      fontFamily: MONO, fontSize: "12px",
      background: "#111110", color: GOLDL,
      padding: "1px 6px", borderRadius: "3px",
      border: "1px solid rgba(196,146,58,0.18)",
    }}>{children}</code>
  );
}

/* ─── Parameter table ─── */
function ParamTable({ rows }: { rows: { name: string; type: string; req?: boolean; desc: string }[] }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden", marginTop: "12px", marginBottom: "20px" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "160px 90px 48px 1fr",
        padding: "7px 16px", background: CREAM,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {["Parameter", "Type", "Req", "Description"].map(h => (
          <span key={h} style={{ fontFamily: MONO, fontSize: "8px", color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={r.name} style={{
          display: "grid", gridTemplateColumns: "160px 90px 48px 1fr",
          padding: "10px 16px", alignItems: "start",
          borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : "none",
          background: i % 2 === 0 ? "#fff" : `${CREAM}88`,
        }}>
          <Code>{r.name}</Code>
          <span style={{ fontFamily: MONO, fontSize: "11px", color: "#1d4ed8" }}>{r.type}</span>
          <span style={{ fontFamily: MONO, fontSize: "10px", color: r.req ? "#b91c1c" : MUTED }}>{r.req ? "yes" : "no"}</span>
          <span style={{ fontFamily: SANS, fontSize: "13px", color: MUTED, lineHeight: 1.55 }}>{r.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Method badge ─── */
function Method({ m }: { m: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    GET:    { bg: "#eff6ff", color: "#1d4ed8" },
    POST:   { bg: "#f0fdf4", color: "#16a34a" },
    PATCH:  { bg: "#fff7ed", color: "#c2410c" },
    DELETE: { bg: "#fef2f2", color: "#b91c1c" },
    PUT:    { bg: "#fdf4ff", color: "#7c3aed" },
  };
  const s = cfg[m];
  return (
    <span style={{
      fontFamily: MONO, fontSize: "9px", fontWeight: 700,
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}30`,
      borderRadius: "3px", padding: "2px 7px",
      letterSpacing: "0.06em",
    }}>{m}</span>
  );
}

/* ─── Endpoint row ─── */
function Endpoint({ method, path, desc }: { method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT"; path: string; desc: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "11px 16px",
      border: `1px solid ${BORDER}`, borderRadius: "5px",
      background: "#fff", marginBottom: "8px",
    }}>
      <Method m={method} />
      <code style={{ fontFamily: MONO, fontSize: "12px", color: BLACK, flex: 1 }}>{path}</code>
      <span style={{ fontFamily: SANS, fontSize: "12px", color: MUTED }}>{desc}</span>
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
      <div style={{ width: "20px", height: "2px", background: GOLD }} />
      <span style={{ fontFamily: MONO, fontSize: "10px", color: GOLD, letterSpacing: "0.14em", textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

/* ─── Nav structure ─── */
const NAV = [
  {
    group: "Introduction",
    items: [
      { id: "overview",       label: "Overview" },
      { id: "authentication", label: "Authentication" },
      { id: "errors",         label: "Errors & Rate Limits" },
    ],
  },
  {
    group: "REST API",
    items: [
      { id: "api-agents",       label: "Agents" },
      { id: "api-cards",        label: "Cards" },
      { id: "api-accounts",     label: "Accounts" },
      { id: "api-policies",     label: "Policy Engine" },
      { id: "api-transactions", label: "Transactions" },
      { id: "api-webhooks",     label: "Webhooks" },
    ],
  },
  {
    group: "SDK",
    items: [
      { id: "sdk-js",     label: "JavaScript / TypeScript" },
      { id: "sdk-python", label: "Python" },
    ],
  },
  {
    group: "CLI",
    items: [
      { id: "cli", label: "CLI Reference" },
    ],
  },
  {
    group: "Concepts",
    items: [
      { id: "policy-docs", label: "Policy Reference" },
      { id: "log-schema",  label: "Log Schema" },
    ],
  },
  {
    group: "Use Cases",
    items: [
      { id: "use-case-01", label: "01 — Procurement Pipelines" },
      { id: "use-case-02", label: "02 — Marketplace Automation" },
      { id: "use-case-03", label: "03 — Subscription Control" },
      { id: "use-case-04", label: "04 — Itinerary & Logistics" },
      { id: "use-case-05", label: "05 — Vendor Disbursements" },
    ],
  },
];

/* ─── Main component ─── */
export default function Docs() {
  const [, navigate] = useLocation();
  const [active, setActive] = useState("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* scroll-spy */
  useEffect(() => {
    observersRef.current.forEach(o => o.disconnect());
    observersRef.current = [];
    const allIds = NAV.flatMap(g => g.items.map(i => i.id));
    allIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActive(id);
      }, { rootMargin: "-25% 0px -65% 0px" });
      obs.observe(el);
      observersRef.current.push(obs);
    });
    return () => observersRef.current.forEach(o => o.disconnect());
  }, []);

  /* handle hash on mount */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) { el.scrollIntoView({ behavior: "smooth" }); setActive(hash); }
      }, 120);
    }
  }, []);

  const scrollTo = (id: string) => {
    setMobileNav(false);
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: "smooth" }); setActive(id); }
    window.history.replaceState(null, "", `#${id}`);
  };

  const H2 = ({ children }: { children: string }) => (
    <h2 style={{ fontFamily: SERIF, fontSize: "clamp(24px, 2.5vw, 32px)", fontWeight: 400, lineHeight: 1.2, color: BLACK, marginBottom: "12px", marginTop: "0" }}>{children}</h2>
  );
  const H3 = ({ children }: { children: string }) => (
    <h3 style={{ fontFamily: SANS, fontSize: "15px", fontWeight: 600, color: BLACK, marginBottom: "10px", marginTop: "28px" }}>{children}</h3>
  );
  const P = ({ children }: { children: React.ReactNode }) => (
    <p style={{ fontFamily: SANS, fontSize: "14px", color: MUTED, lineHeight: 1.75, marginBottom: "16px" }}>{children}</p>
  );
  const Note = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      background: `${GOLD}0f`, border: `1px solid ${GOLD}35`,
      borderRadius: "5px", padding: "13px 16px",
      fontFamily: SANS, fontSize: "13px", color: BLACK, lineHeight: 1.65,
      marginBottom: "20px",
    }}>
      <span style={{ fontFamily: MONO, fontSize: "8px", color: GOLD, fontWeight: 700, letterSpacing: "0.12em", display: "block", marginBottom: "5px" }}>NOTE</span>
      {children}
    </div>
  );

  const Divider = () => <div style={{ height: "1px", background: BORDER, margin: "48px 0" }} />;

  return (
    <div style={{ fontFamily: SANS, background: CREAM, color: BLACK, minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(10,10,8,0.88)" : "rgba(10,10,8,0.97)",
        backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        transition: "background 0.35s ease",
      }}>
        <div style={{
          maxWidth: "1360px", margin: "0 auto",
          padding: "0 24px", height: "48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => navigate("/")} style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}>
              <img src={olympayLogo} alt="Olympay" style={{ width: "26px", height: "26px", filter: LOGO_GOLD }} />
              <span style={{ fontFamily: MONO, fontSize: "12px", color: "rgba(229,212,175,0.8)", fontWeight: 500, letterSpacing: "0.05em" }}>OLYMPAY</span>
            </button>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "16px" }}>/</span>
            <span style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(229,212,175,0.5)", letterSpacing: "0.08em" }}>DOCS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate("/login")} style={{
              background: GOLD, border: "none", cursor: "pointer",
              padding: "7px 16px",
              fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em",
              color: BLACK, fontWeight: 600, textTransform: "uppercase",
              borderRadius: "4px",
            }}>DASHBOARD →</button>
            <button onClick={() => setMobileNav(v => !v)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(229,220,200,0.7)", padding: "4px",
              display: "flex", alignItems: "center",
            }}>
              {mobileNav ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Nav Overlay ── */}
      {mobileNav && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "rgba(10,10,8,0.97)",
          overflowY: "auto",
          paddingTop: "64px",
          paddingBottom: "40px",
        }}>
          {NAV.map(g => (
            <div key={g.group} style={{ padding: "16px 24px 8px" }}>
              <div style={{ fontFamily: MONO, fontSize: "8px", color: "rgba(196,146,58,0.5)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>{g.group}</div>
              {g.items.map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "9px 0",
                  fontFamily: SANS, fontSize: "14px",
                  color: active === item.id ? GOLDL : "rgba(229,220,200,0.65)",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "color 0.15s",
                }}>{item.label}</button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{
        maxWidth: "1360px", margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        paddingTop: "48px",
        minHeight: "100vh",
      }}>

        {/* ── Sidebar ── */}
        <aside style={{
          position: "sticky", top: "48px",
          height: "calc(100vh - 48px)",
          overflowY: "auto",
          borderRight: `1px solid ${BORDER}`,
          padding: "32px 0 40px",
          scrollbarWidth: "none",
        }}>
          <style>{`aside::-webkit-scrollbar { display: none; }`}</style>
          {NAV.map(g => (
            <div key={g.group} style={{ marginBottom: "20px" }}>
              <div style={{ fontFamily: MONO, fontSize: "8px", color: "rgba(196,146,58,0.6)", letterSpacing: "0.14em", textTransform: "uppercase", padding: "0 24px", marginBottom: "6px" }}>{g.group}</div>
              {g.items.map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: active === item.id ? `${GOLD}10` : "none",
                  borderLeft: `2px solid ${active === item.id ? GOLD : "transparent"}`,
                  border: "none",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "2px",
                  borderLeftColor: active === item.id ? GOLD : "transparent",
                  cursor: "pointer",
                  padding: "7px 24px 7px 22px",
                  fontFamily: SANS, fontSize: "13px",
                  color: active === item.id ? BLACK : MUTED,
                  fontWeight: active === item.id ? 500 : 400,
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.color = BLACK; }}
                  onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.color = MUTED; }}
                >{item.label}</button>
              ))}
            </div>
          ))}
        </aside>

        {/* ── Content ── */}
        <main style={{ padding: "48px 64px 120px", maxWidth: "900px" }}>

          {/* ════════════════════════════════════════════════
              OVERVIEW
          ════════════════════════════════════════════════ */}
          <section id="overview" style={{ marginBottom: "0" }}>
            <SectionLabel>Introduction</SectionLabel>
            <H2>Olympay Developer Documentation</H2>
            <P>
              Olympay is a financial infrastructure platform purpose-built for autonomous AI agents. It provides every primitive you need to give your agents real spending power — virtual accounts, programmable cards, declarative spend policies, real-time transaction evaluation, human-in-the-loop approval flows, and a tamper-evident audit log — all available over a single REST API.
            </P>
            <P>
              This documentation covers the full Olympay surface area: the REST API, the official JavaScript and Python SDKs, the CLI, the policy engine, the log schema, and five reference use-case architectures that show how to wire Olympay into real agent workflows.
            </P>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
              marginBottom: "32px",
            }}>
              {[
                { title: "API Base URL", val: "https://api.olympay.tech/v1" },
                { title: "Latest SDK Version", val: "@olympay/sdk v1.4.2" },
                { title: "CLI Version", val: "olympay-cli v1.2.0" },
              ].map(c => (
                <div key={c.title} style={{
                  background: "#fff", border: `1px solid ${BORDER}`,
                  borderRadius: "6px", padding: "14px 16px",
                }}>
                  <div style={{ fontFamily: MONO, fontSize: "8px", color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>{c.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: "12px", color: BLACK, fontWeight: 600 }}>{c.val}</div>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              AUTHENTICATION
          ════════════════════════════════════════════════ */}
          <section id="authentication">
            <SectionLabel>Introduction</SectionLabel>
            <H2>Authentication</H2>
            <P>
              Olympay uses API keys to authenticate requests. All keys are scoped and must be kept secret — never expose them in client-side code or public repositories.
            </P>

            <H3>Key Types</H3>
            <ParamTable rows={[
              { name: "olympay_live_…", type: "string", req: true, desc: "Secret key. Full access to agents, cards, policies, and transactions. Use only on trusted server-side environments." },
              { name: "olympay_pub_…",  type: "string", req: false, desc: "Publishable key. Limited read-only access for client-side initialization. Cannot create or mutate resources." },
              { name: "olympay_ws_…",   type: "string", req: false, desc: "Workspace key. Used to scope multi-tenant deployments. Issued per workspace and namespaces all resources." },
            ]} />

            <H3>Sending the Key</H3>
            <P>Pass your secret key as a Bearer token in the <Code>Authorization</Code> header of every request.</P>
            <CodeBlock lang="bash" code={`curl https://api.olympay.tech/v1/agents \\
  -H "Authorization: Bearer olympay_live_••••••••••••••••" \\
  -H "Content-Type: application/json"`} />

            <Note>
              Your API keys are available in the <strong>Settings → API Keys</strong> panel of the dashboard. Rotate keys immediately if you suspect they have been compromised. Each key can be scoped to specific IP addresses or resources via the dashboard.
            </Note>

            <H3>Test vs. Live Mode</H3>
            <P>
              All keys prefixed with <Code>olympay_test_</Code> operate in sandbox mode. Sandbox transactions are never settled and sandbox cards are never sent to real payment networks. Live keys are prefixed <Code>olympay_live_</Code>.
            </P>
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              ERRORS
          ════════════════════════════════════════════════ */}
          <section id="errors">
            <SectionLabel>Introduction</SectionLabel>
            <H2>Errors & Rate Limits</H2>
            <P>Olympay uses conventional HTTP status codes. Errors return a JSON body with a machine-readable <Code>code</Code> and a human-readable <Code>message</Code>.</P>

            <CodeBlock lang="json" code={`{
  "error": {
    "code": "policy_violated",
    "message": "Transaction denied: spend limit of $500/day exceeded.",
    "param": "amount",
    "doc_url": "https://docs.olympay.tech/errors/policy_violated"
  }
}`} />

            <ParamTable rows={[
              { name: "200 OK",                  type: "Success",  desc: "Request completed successfully." },
              { name: "201 Created",             type: "Success",  desc: "Resource created." },
              { name: "400 Bad Request",         type: "Error",    desc: "Missing or invalid parameters. Check the error.param field." },
              { name: "401 Unauthorized",        type: "Error",    desc: "Invalid or missing API key." },
              { name: "403 Forbidden",           type: "Error",    desc: "Key lacks permission for this operation." },
              { name: "404 Not Found",           type: "Error",    desc: "Resource does not exist." },
              { name: "409 Conflict",            type: "Error",    desc: "Request conflicts with the current state (e.g., pausing an already-paused card)." },
              { name: "422 Unprocessable",       type: "Error",    desc: "Semantically invalid request (e.g., spend_limit below minimum)." },
              { name: "429 Rate Limited",        type: "Error",    desc: "Too many requests. Back off and retry after the Retry-After header value." },
              { name: "500 Server Error",        type: "Error",    desc: "Unexpected server error. Retry with exponential backoff." },
            ]} />

            <H3>Rate Limits</H3>
            <P>The API is rate-limited per workspace at <strong>1,000 requests/minute</strong> for standard plans and <strong>10,000 requests/minute</strong> for enterprise. The response headers <Code>X-RateLimit-Limit</Code>, <Code>X-RateLimit-Remaining</Code>, and <Code>X-RateLimit-Reset</Code> indicate your current quota.</P>
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              API — AGENTS
          ════════════════════════════════════════════════ */}
          <section id="api-agents">
            <SectionLabel>REST API</SectionLabel>
            <H2>Agents</H2>
            <P>An <strong>Agent</strong> is the top-level identity object for an autonomous AI process. Every card, account, and transaction is associated with an agent. Agents carry metadata, a status, and optional default policies.</P>

            <Endpoint method="GET"    path="/v1/agents"            desc="List all agents" />
            <Endpoint method="POST"   path="/v1/agents"            desc="Create a new agent" />
            <Endpoint method="GET"    path="/v1/agents/:id"        desc="Retrieve a single agent" />
            <Endpoint method="PATCH"  path="/v1/agents/:id"        desc="Update agent metadata or status" />
            <Endpoint method="DELETE" path="/v1/agents/:id"        desc="Permanently deactivate an agent" />
            <Endpoint method="GET"    path="/v1/agents/:id/cards"  desc="List all cards issued to this agent" />
            <Endpoint method="GET"    path="/v1/agents/:id/transactions" desc="List all transactions by this agent" />

            <H3>Create an Agent — Request Body</H3>
            <ParamTable rows={[
              { name: "name",            type: "string",   req: true,  desc: "Human-readable identifier for the agent, e.g. 'procurement-bot'." },
              { name: "metadata",        type: "object",   req: false, desc: "Arbitrary key-value pairs (max 50 keys) for your own tracking." },
              { name: "default_policy",  type: "string",   req: false, desc: "Policy ID to auto-attach to all cards issued to this agent." },
              { name: "spend_cap",       type: "integer",  req: false, desc: "Optional hard cap in cents across all active cards for this agent." },
            ]} />

            <CodeBlock lang="bash" code={`curl https://api.olympay.tech/v1/agents \\
  -X POST \\
  -H "Authorization: Bearer olympay_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "procurement-bot",
    "metadata": {
      "team": "operations",
      "owner": "alex@acme.com"
    },
    "default_policy": "pol_01hzk4m7n8x"
  }'`} />

            <CodeBlock lang="json" code={`{
  "id": "agt_01j2k9mx3nt",
  "object": "agent",
  "name": "procurement-bot",
  "status": "active",
  "metadata": { "team": "operations", "owner": "alex@acme.com" },
  "default_policy": "pol_01hzk4m7n8x",
  "spend_this_month": 0,
  "created_at": "2026-03-14T09:00:00Z"
}`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              API — CARDS
          ════════════════════════════════════════════════ */}
          <section id="api-cards">
            <SectionLabel>REST API</SectionLabel>
            <H2>Cards</H2>
            <P>Virtual cards are the primary spending instrument for agents. Each card can carry its own policy, spend limit, and merchant restrictions, independent of the issuing agent's defaults.</P>

            <Endpoint method="GET"    path="/v1/cards"              desc="List all virtual cards" />
            <Endpoint method="POST"   path="/v1/cards"              desc="Issue a new virtual card" />
            <Endpoint method="GET"    path="/v1/cards/:id"          desc="Retrieve card details (PAN is never returned)" />
            <Endpoint method="PATCH"  path="/v1/cards/:id"          desc="Update limit, policy, or metadata" />
            <Endpoint method="POST"   path="/v1/cards/:id/pause"    desc="Immediately halt spending on a card" />
            <Endpoint method="POST"   path="/v1/cards/:id/resume"   desc="Re-enable a paused card" />
            <Endpoint method="POST"   path="/v1/cards/:id/cancel"   desc="Permanently cancel a card" />
            <Endpoint method="GET"    path="/v1/cards/:id/sensitive" desc="Retrieve PAN, CVV, expiry (requires sensitive scope)" />

            <H3>Issue a Card — Request Body</H3>
            <ParamTable rows={[
              { name: "agent_id",    type: "string",  req: true,  desc: "The agent this card is issued to." },
              { name: "type",        type: "enum",    req: false, desc: "'persistent' (default) or 'disposable'. Disposable cards expire after one approved transaction." },
              { name: "spend_limit", type: "integer", req: false, desc: "Maximum total spend in cents. Set to 0 for unlimited (policy-only control)." },
              { name: "policy_id",   type: "string",  req: false, desc: "Override the agent's default policy for this specific card." },
              { name: "expires_at",  type: "string",  req: false, desc: "ISO 8601 expiry datetime. Leave blank to use network default (typically 3 years)." },
              { name: "metadata",    type: "object",  req: false, desc: "Arbitrary key-value pairs." },
            ]} />

            <CodeBlock lang="bash" code={`curl https://api.olympay.tech/v1/cards \\
  -X POST \\
  -H "Authorization: Bearer olympay_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "agt_01j2k9mx3nt",
    "type": "persistent",
    "spend_limit": 150000,
    "policy_id": "pol_01hzk4m7n8x",
    "metadata": { "project": "Q2-procurement" }
  }'`} />

            <CodeBlock lang="json" code={`{
  "id": "card_01j5nr7p2xk",
  "object": "card",
  "agent_id": "agt_01j2k9mx3nt",
  "type": "persistent",
  "status": "active",
  "last4": "7842",
  "brand": "visa",
  "spend_limit": 150000,
  "spend_to_date": 0,
  "policy_id": "pol_01hzk4m7n8x",
  "expires_at": "2029-03-14T00:00:00Z",
  "created_at": "2026-03-14T09:01:00Z"
}`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              API — ACCOUNTS
          ════════════════════════════════════════════════ */}
          <section id="api-accounts">
            <SectionLabel>REST API</SectionLabel>
            <H2>Accounts</H2>
            <P>Virtual accounts provide ACH and Fedwire banking primitives for agents that need to receive funds, hold balances, or execute outbound disbursements. Each account gets a dedicated routing and account number.</P>

            <Endpoint method="GET"  path="/v1/accounts"                  desc="List all virtual accounts" />
            <Endpoint method="POST" path="/v1/accounts"                  desc="Create a new virtual account" />
            <Endpoint method="GET"  path="/v1/accounts/:id"              desc="Get account details" />
            <Endpoint method="GET"  path="/v1/accounts/:id/balance"      desc="Real-time balance" />
            <Endpoint method="GET"  path="/v1/accounts/:id/transactions" desc="Transaction history for this account" />
            <Endpoint method="POST" path="/v1/accounts/:id/transfer"     desc="Initiate an outbound ACH or wire transfer" />

            <H3>Create Account — Request Body</H3>
            <ParamTable rows={[
              { name: "agent_id",    type: "string", req: true,  desc: "The agent this account belongs to." },
              { name: "type",        type: "enum",   req: false, desc: "'checking' (default) or 'savings'." },
              { name: "description", type: "string", req: false, desc: "Internal label, e.g. 'Vendor Escrow Q2'." },
            ]} />

            <CodeBlock lang="bash" code={`curl https://api.olympay.tech/v1/accounts \\
  -X POST \\
  -H "Authorization: Bearer olympay_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "agt_01j2k9mx3nt",
    "type": "checking",
    "description": "Vendor Payments Q2"
  }'`} />

            <CodeBlock lang="json" code={`{
  "id": "acc_01k3mw9xr2p",
  "object": "account",
  "agent_id": "agt_01j2k9mx3nt",
  "type": "checking",
  "status": "active",
  "routing_number": "021000021",
  "account_number": "••••4891",
  "balance": 0,
  "currency": "usd",
  "description": "Vendor Payments Q2",
  "created_at": "2026-03-14T09:02:00Z"
}`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              API — POLICIES
          ════════════════════════════════════════════════ */}
          <section id="api-policies">
            <SectionLabel>REST API</SectionLabel>
            <H2>Policy Engine</H2>
            <P>Policies are reusable rule sets evaluated in real time on every transaction attempt. They run synchronously in the authorization path — if a policy denies a transaction, the card network authorization is declined within milliseconds.</P>

            <Endpoint method="GET"    path="/v1/policies"              desc="List all policies" />
            <Endpoint method="POST"   path="/v1/policies"              desc="Create a new policy" />
            <Endpoint method="GET"    path="/v1/policies/:id"          desc="Get policy details" />
            <Endpoint method="PATCH"  path="/v1/policies/:id"          desc="Update policy configuration" />
            <Endpoint method="DELETE" path="/v1/policies/:id"          desc="Delete policy (must be detached first)" />
            <Endpoint method="POST"   path="/v1/policies/:id/attach"   desc="Attach policy to a card or agent" />
            <Endpoint method="POST"   path="/v1/policies/:id/detach"   desc="Detach policy from a card or agent" />
            <Endpoint method="POST"   path="/v1/policies/evaluate"     desc="Dry-run a transaction against a policy" />

            <H3>Create Policy — Request Body</H3>
            <ParamTable rows={[
              { name: "name",   type: "string", req: true,  desc: "Human-readable policy name." },
              { name: "type",   type: "enum",   req: true,  desc: "'spend_limit', 'merchant_allowlist', or 'approval_required'. See Policy Reference for full schema." },
              { name: "config", type: "object", req: true,  desc: "Type-specific configuration object. See Policy Reference section for each type's schema." },
            ]} />

            <CodeBlock lang="bash" code={`curl https://api.olympay.tech/v1/policies \\
  -X POST \\
  -H "Authorization: Bearer olympay_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Daily $500 Limit",
    "type": "spend_limit",
    "config": {
      "max_amount": 50000,
      "window": "daily",
      "currency": "usd"
    }
  }'`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              API — TRANSACTIONS
          ════════════════════════════════════════════════ */}
          <section id="api-transactions">
            <SectionLabel>REST API</SectionLabel>
            <H2>Transactions</H2>
            <P>The transactions API exposes the full event log of card authorizations, settlements, reversals, and ACH movements. Transactions in <Code>pending_approval</Code> status are paused until a human reviewer acts.</P>

            <Endpoint method="GET"  path="/v1/transactions"             desc="List transactions (paginated, filterable)" />
            <Endpoint method="GET"  path="/v1/transactions/:id"         desc="Get single transaction" />
            <Endpoint method="POST" path="/v1/transactions/:id/approve" desc="Approve a pending_approval transaction" />
            <Endpoint method="POST" path="/v1/transactions/:id/reject"  desc="Reject a pending_approval transaction" />
            <Endpoint method="POST" path="/v1/transactions/:id/dispute" desc="Flag a settled transaction for dispute" />

            <H3>Transaction Object</H3>
            <CodeBlock lang="json" code={`{
  "id": "txn_01j9rk2vx4m",
  "object": "transaction",
  "card_id": "card_01j5nr7p2xk",
  "agent_id": "agt_01j2k9mx3nt",
  "status": "authorized",
  "type": "card_authorization",
  "amount": 12450,
  "currency": "usd",
  "merchant": {
    "name": "Stripe Inc",
    "category": "software",
    "mcc": "7372",
    "country": "US"
  },
  "policy_verdict": {
    "policy_id": "pol_01hzk4m7n8x",
    "result": "allow",
    "reason": "Within daily spend window"
  },
  "created_at": "2026-03-14T09:05:00Z",
  "settled_at": null
}`} />

            <H3>List Filters</H3>
            <ParamTable rows={[
              { name: "agent_id",  type: "string",  desc: "Filter by agent." },
              { name: "card_id",   type: "string",  desc: "Filter by card." },
              { name: "status",    type: "enum",    desc: "'authorized', 'settled', 'declined', 'pending_approval', 'reversed'." },
              { name: "from",      type: "string",  desc: "ISO 8601 start datetime." },
              { name: "to",        type: "string",  desc: "ISO 8601 end datetime." },
              { name: "limit",     type: "integer", desc: "Page size, max 100. Default 25." },
              { name: "cursor",    type: "string",  desc: "Pagination cursor from previous response." },
            ]} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              API — WEBHOOKS
          ════════════════════════════════════════════════ */}
          <section id="api-webhooks">
            <SectionLabel>REST API</SectionLabel>
            <H2>Webhooks</H2>
            <P>Olympay delivers real-time events to your server via HTTPS webhooks. Every event is signed with an HMAC-SHA256 signature using your webhook secret, delivered in the <Code>Olympay-Signature</Code> header.</P>

            <Endpoint method="POST"   path="/v1/webhooks"      desc="Register a webhook endpoint" />
            <Endpoint method="GET"    path="/v1/webhooks"      desc="List registered endpoints" />
            <Endpoint method="GET"    path="/v1/webhooks/:id"  desc="Get endpoint details and recent deliveries" />
            <Endpoint method="DELETE" path="/v1/webhooks/:id"  desc="Remove a webhook endpoint" />

            <H3>Event Types</H3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
              {[
                "agent.created","agent.updated","agent.deactivated",
                "card.issued","card.paused","card.resumed","card.cancelled",
                "txn.authorized","txn.settled","txn.declined",
                "txn.approval_requested","txn.approved","txn.rejected",
                "policy.attached","policy.detached","policy.violated",
                "account.credited","account.debited",
              ].map(ev => (
                <code key={ev} style={{
                  fontFamily: MONO, fontSize: "11px",
                  background: "#111110", color: "#e2dcc8",
                  padding: "3px 8px", borderRadius: "3px",
                  border: "1px solid rgba(196,146,58,0.12)",
                }}>{ev}</code>
              ))}
            </div>

            <H3>Verifying Signatures</H3>
            <CodeBlock lang="typescript" code={`import crypto from "crypto";

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(\`sha256=\${expected}\`)
  );
}`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              SDK — JAVASCRIPT
          ════════════════════════════════════════════════ */}
          <section id="sdk-js">
            <SectionLabel>SDK</SectionLabel>
            <H2>JavaScript / TypeScript SDK</H2>
            <P>The official <Code>@olympay/sdk</Code> package provides a fully-typed client for all Olympay API resources. It works in Node.js 18+ and edge runtimes (Cloudflare Workers, Vercel Edge, Deno).</P>

            <H3>Installation</H3>
            <CodeBlock lang="bash" code={`npm install @olympay/sdk
# or
pnpm add @olympay/sdk
# or
yarn add @olympay/sdk`} />

            <H3>Initialization</H3>
            <CodeBlock lang="typescript" code={`import { Olympay } from "@olympay/sdk";

const client = new Olympay({
  apiKey: process.env.OLYMPAY_SECRET_KEY!, // olympay_live_...
  timeout: 10_000,    // ms, default 30000
  maxRetries: 2,      // default 2
});`} />

            <H3>Agents</H3>
            <CodeBlock lang="typescript" code={`// Create an agent
const agent = await client.agents.create({
  name: "procurement-bot",
  metadata: { team: "ops", owner: "deploy@acme.com" },
});

// List agents
const agents = await client.agents.list({ limit: 20 });

// Update
await client.agents.update(agent.id, { metadata: { tier: "premium" } });

// Deactivate
await client.agents.delete(agent.id);`} />

            <H3>Cards</H3>
            <CodeBlock lang="typescript" code={`// Issue a persistent card
const card = await client.cards.issue({
  agentId: agent.id,
  type: "persistent",
  spendLimit: 150_000,   // $1,500.00 in cents
  policyId: "pol_01hzk4m7n8x",
  metadata: { project: "Q2-vendors" },
});

// Pause spending immediately
await client.cards.pause(card.id);

// Resume
await client.cards.resume(card.id);

// Issue a one-time disposable card
const disposable = await client.cards.issue({
  agentId: agent.id,
  type: "disposable",
  spendLimit: 9_900,  // $99.00
});`} />

            <H3>Transactions</H3>
            <CodeBlock lang="typescript" code={`// List recent transactions for an agent
const txns = await client.transactions.list({
  agentId: agent.id,
  status: "authorized",
  from: "2026-03-01T00:00:00Z",
  limit: 50,
});

// Approve a pending transaction
await client.transactions.approve("txn_01j9rk2vx4m");

// Reject
await client.transactions.reject("txn_01j9rk2vx4m", {
  reason: "Vendor not on approved list",
});`} />

            <H3>Policies</H3>
            <CodeBlock lang="typescript" code={`// Create a spend limit policy
const policy = await client.policies.create({
  name: "Daily $500",
  type: "spend_limit",
  config: { maxAmount: 50_000, window: "daily" },
});

// Attach to a card
await client.policies.attach(policy.id, { cardId: card.id });

// Dry-run evaluation
const verdict = await client.policies.evaluate({
  policyId: policy.id,
  amount: 75_000,  // Would this $750 charge be allowed?
  merchantId: "stripe",
});
console.log(verdict.result); // "deny" — over daily limit`} />

            <H3>Webhooks</H3>
            <CodeBlock lang="typescript" code={`// Register a webhook
const hook = await client.webhooks.create({
  url: "https://yourapp.com/olympay/events",
  events: ["txn.approval_requested", "txn.declined"],
});

// Verify incoming events (Express example)
app.post("/olympay/events", express.raw({ type: "*/*" }), (req, res) => {
  const sig = req.headers["olympay-signature"] as string;
  const event = client.webhooks.constructEvent(
    req.body,
    sig,
    process.env.OLYMPAY_WEBHOOK_SECRET!
  );
  switch (event.type) {
    case "txn.approval_requested":
      await reviewQueue.push(event.data);
      break;
  }
  res.json({ received: true });
});`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              SDK — PYTHON
          ════════════════════════════════════════════════ */}
          <section id="sdk-python">
            <SectionLabel>SDK</SectionLabel>
            <H2>Python SDK</H2>
            <P>The <Code>olympay</Code> Python package supports Python 3.9+ and includes both synchronous and async (<Code>asyncio</Code>) clients.</P>

            <H3>Installation</H3>
            <CodeBlock lang="bash" code={`pip install olympay
# or
uv add olympay
# or
poetry add olympay`} />

            <H3>Synchronous Client</H3>
            <CodeBlock lang="python" code={`import os
from olympay import Olympay

client = Olympay(api_key=os.environ["OLYMPAY_SECRET_KEY"])

# Create an agent
agent = client.agents.create(
    name="procurement-bot",
    metadata={"team": "ops"}
)

# Issue a card
card = client.cards.issue(
    agent_id=agent.id,
    type="persistent",
    spend_limit=150_000,
    policy_id="pol_01hzk4m7n8x"
)

# List recent transactions
txns = client.transactions.list(agent_id=agent.id, limit=25)
for txn in txns.data:
    print(txn.id, txn.status, txn.amount)`} />

            <H3>Async Client</H3>
            <CodeBlock lang="python" code={`import asyncio
import os
from olympay import AsyncOlympay

async def main():
    client = AsyncOlympay(api_key=os.environ["OLYMPAY_SECRET_KEY"])

    agent = await client.agents.create(name="async-procurement-bot")

    # Issue and immediately attach a policy
    card, policy = await asyncio.gather(
        client.cards.issue(agent_id=agent.id, spend_limit=50_000),
        client.policies.create(
            name="SaaS Only",
            type="merchant_allowlist",
            config={"merchant_ids": ["stripe", "aws", "github"]}
        )
    )

    await client.policies.attach(policy.id, card_id=card.id)
    print(f"Card {card.id} issued with policy {policy.id}")

asyncio.run(main())`} />

            <H3>Webhook Handler (FastAPI)</H3>
            <CodeBlock lang="python" code={`from fastapi import FastAPI, Request, Header, HTTPException
from olympay import Olympay

app = FastAPI()
client = Olympay(api_key=os.environ["OLYMPAY_SECRET_KEY"])

@app.post("/olympay/events")
async def handle_event(
    request: Request,
    olympay_signature: str = Header(...)
):
    payload = await request.body()
    try:
        event = client.webhooks.construct_event(
            payload,
            olympay_signature,
            os.environ["OLYMPAY_WEBHOOK_SECRET"]
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event.type == "txn.approval_requested":
        # Push to your approval queue
        await approval_queue.enqueue(event.data)

    return {"received": True}`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              CLI
          ════════════════════════════════════════════════ */}
          <section id="cli">
            <SectionLabel>CLI</SectionLabel>
            <H2>CLI Reference</H2>
            <P>The Olympay CLI lets you manage agents, cards, policies, and logs directly from your terminal. It is the fastest way to prototype, debug, and automate workflows without writing application code.</P>

            <H3>Installation</H3>
            <CodeBlock lang="bash" code={`npm install -g @olympay/cli
# verify
olympay --version  # 1.2.0`} />

            <H3>Authentication</H3>
            <CodeBlock lang="bash" code={`# Interactive login (browser-based)
olympay login

# Or provide key directly
olympay login --key olympay_live_••••••••

# Check current auth status
olympay whoami

# Switch workspace
olympay workspace use ws_production`} />

            <H3>Agents</H3>
            <CodeBlock lang="bash" code={`# List agents (table view)
olympay agents list

# Create an agent
olympay agents create --name "procurement-bot" --meta team=ops

# Inspect an agent
olympay agents get agt_01j2k9mx3nt

# Deactivate
olympay agents delete agt_01j2k9mx3nt`} />

            <H3>Cards</H3>
            <CodeBlock lang="bash" code={`# Issue a card
olympay cards issue \\
  --agent agt_01j2k9mx3nt \\
  --type persistent \\
  --limit 1500 \\
  --policy pol_01hzk4m7n8x

# List cards
olympay cards list --agent agt_01j2k9mx3nt --status active

# Pause a card
olympay cards pause card_01j5nr7p2xk

# Resume
olympay cards resume card_01j5nr7p2xk

# Cancel permanently
olympay cards cancel card_01j5nr7p2xk`} />

            <H3>Policies</H3>
            <CodeBlock lang="bash" code={`# Create a spend limit policy
olympay policies create \\
  --name "Daily $500" \\
  --type spend_limit \\
  --max 50000 \\
  --window daily

# Create a merchant allowlist
olympay policies create \\
  --name "SaaS Vendors Only" \\
  --type merchant_allowlist \\
  --merchants stripe,aws,github,vercel

# Create an approval-required policy
olympay policies create \\
  --name "High Value Approval" \\
  --type approval_required \\
  --threshold 100000

# Attach to a card
olympay policies attach pol_01hzk4m7n8x --card card_01j5nr7p2xk

# List policies
olympay policies list`} />

            <H3>Transactions</H3>
            <CodeBlock lang="bash" code={`# List recent transactions
olympay txns list --limit 20

# Filter by agent and status
olympay txns list --agent agt_01j2k9mx3nt --status declined

# Approve a pending transaction
olympay txns approve txn_01j9rk2vx4m

# Reject with reason
olympay txns reject txn_01j9rk2vx4m --reason "Unauthorized vendor"`} />

            <H3>Logs (Real-time Stream)</H3>
            <CodeBlock lang="bash" code={`# Stream all audit events
olympay logs stream

# Filter by agent
olympay logs stream --agent agt_01j2k9mx3nt

# Filter by event type
olympay logs stream --event txn.declined

# Export logs to file
olympay logs export \\
  --from 2026-03-01 \\
  --to 2026-03-14 \\
  --format csv \\
  --output ./audit-march.csv`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              POLICY REFERENCE
          ════════════════════════════════════════════════ */}
          <section id="policy-docs">
            <SectionLabel>Concepts</SectionLabel>
            <H2>Policy Reference</H2>
            <P>
              Policies are evaluated synchronously inside the card authorization loop. When an agent's card receives a charge, Olympay calls all attached policies in order. If any policy returns <Code>deny</Code>, the authorization is declined immediately and a <Code>txn.declined</Code> event is emitted. If a policy returns <Code>review</Code>, the transaction is held and a <Code>txn.approval_requested</Code> event is sent to all registered webhooks.
            </P>

            <H3>1. spend_limit</H3>
            <P>Caps cumulative spend within a rolling or fixed time window. Evaluated against the card's total settled amount in the specified window.</P>
            <ParamTable rows={[
              { name: "max_amount", type: "integer", req: true,  desc: "Maximum spend in cents within the window." },
              { name: "window",     type: "enum",    req: true,  desc: "'daily', 'weekly', 'monthly', or 'lifetime'." },
              { name: "currency",   type: "string",  req: false, desc: "ISO 4217 currency code. Defaults to 'usd'. Multi-currency transactions are converted at real-time rates." },
            ]} />
            <CodeBlock lang="json" code={`{
  "name": "Monthly $2,000 Cap",
  "type": "spend_limit",
  "config": {
    "max_amount": 200000,
    "window": "monthly",
    "currency": "usd"
  }
}`} />

            <H3>2. merchant_allowlist</H3>
            <P>Restricts charges to a pre-approved set of merchant IDs or Merchant Category Codes (MCCs). Any merchant not on the list causes an immediate decline.</P>
            <ParamTable rows={[
              { name: "merchant_ids",  type: "array",   req: false, desc: "List of Olympay-normalized merchant identifiers (e.g. 'stripe', 'aws')." },
              { name: "mcc_codes",     type: "array",   req: false, desc: "List of 4-digit MCC codes to permit (e.g. ['7372', '5045'])." },
              { name: "mode",          type: "enum",    req: false, desc: "'allowlist' (default) — only listed merchants pass. 'blocklist' — listed merchants are blocked." },
            ]} />
            <CodeBlock lang="json" code={`{
  "name": "SaaS Vendors Only",
  "type": "merchant_allowlist",
  "config": {
    "merchant_ids": ["stripe", "aws", "github", "vercel", "linear"],
    "mcc_codes": ["7372"],
    "mode": "allowlist"
  }
}`} />

            <H3>3. approval_required</H3>
            <P>Holds any transaction above a configurable threshold in <Code>pending_approval</Code> status. The transaction is not settled until a human approves or rejects it via the dashboard, API, or CLI. If no action is taken within the <Code>timeout_seconds</Code> window, the transaction is automatically rejected.</P>
            <ParamTable rows={[
              { name: "threshold",       type: "integer", req: true,  desc: "Transactions at or above this amount (in cents) trigger the review flow." },
              { name: "timeout_seconds", type: "integer", req: false, desc: "Auto-reject after this many seconds if no human acts. Default 3600 (1 hour)." },
              { name: "notify_email",    type: "string",  req: false, desc: "Email address to notify when a transaction is held for review." },
              { name: "notify_webhook",  type: "string",  req: false, desc: "Webhook URL for push notification. Overrides workspace default webhook for this policy." },
            ]} />
            <CodeBlock lang="json" code={`{
  "name": "High Value Approval",
  "type": "approval_required",
  "config": {
    "threshold": 100000,
    "timeout_seconds": 3600,
    "notify_email": "finance@acme.com"
  }
}`} />

            <H3>Policy Chaining</H3>
            <P>Multiple policies can be attached to a single card or agent. They are evaluated in the order they were attached. The first policy that returns <Code>deny</Code> short-circuits the chain. <Code>review</Code> verdicts are additive — if two policies both return <Code>review</Code>, only one approval is required.</P>
            <CodeBlock lang="bash" code={`# Attach in order: spend limit first, then approval gate
olympay policies attach pol_spend_limit --card card_01j5nr7p2xk
olympay policies attach pol_approval    --card card_01j5nr7p2xk`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              LOG SCHEMA
          ════════════════════════════════════════════════ */}
          <section id="log-schema">
            <SectionLabel>Concepts</SectionLabel>
            <H2>Log Schema</H2>
            <P>Every action taken by an agent, card, policy, or human is recorded as an immutable audit event. Events are append-only and cryptographically sealed — no log entry can be modified or deleted after it is written. The log is queryable via API, CLI, and the dashboard.</P>

            <H3>Event Object</H3>
            <CodeBlock lang="json" code={`{
  "id": "evt_01jk9r2xv4m",
  "object": "event",
  "type": "txn.authorized",
  "timestamp": "2026-03-14T09:05:00.381Z",
  "agent_id": "agt_01j2k9mx3nt",
  "card_id": "card_01j5nr7p2xk",
  "policy_id": "pol_01hzk4m7n8x",
  "txn_id": "txn_01j9rk2vx4m",
  "actor": {
    "type": "agent",
    "id": "agt_01j2k9mx3nt",
    "name": "procurement-bot"
  },
  "data": {
    "amount": 12450,
    "merchant_name": "Stripe Inc",
    "policy_verdict": "allow"
  },
  "metadata": {},
  "sealed": true,
  "seal_hash": "sha256:a3f8b2d..."
}`} />

            <H3>Actor Types</H3>
            <ParamTable rows={[
              { name: "agent",   type: "string", desc: "Action was initiated by an autonomous agent." },
              { name: "user",    type: "string", desc: "Action was taken by a human user (email or user ID)." },
              { name: "system",  type: "string", desc: "Action was triggered automatically by the Olympay platform (e.g. policy auto-attach, expiry)." },
              { name: "api",     type: "string", desc: "Action was taken via a direct API call using a secret key (not attributed to a named user)." },
            ]} />

            <H3>Full Event Type Reference</H3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
              {[
                { type: "agent.created",            desc: "A new agent was registered." },
                { type: "agent.updated",            desc: "Agent metadata or status changed." },
                { type: "agent.deactivated",        desc: "Agent permanently disabled." },
                { type: "card.issued",              desc: "A virtual card was issued to an agent." },
                { type: "card.paused",              desc: "Spending on a card was paused." },
                { type: "card.resumed",             desc: "A paused card was re-enabled." },
                { type: "card.cancelled",           desc: "A card was permanently cancelled." },
                { type: "policy.attached",          desc: "A policy was attached to a card or agent." },
                { type: "policy.detached",          desc: "A policy was removed from a card or agent." },
                { type: "policy.violated",          desc: "A transaction violated a policy rule." },
                { type: "txn.authorized",           desc: "Transaction was authorized by the card network." },
                { type: "txn.settled",              desc: "Transaction was settled and funds moved." },
                { type: "txn.declined",             desc: "Transaction was declined by a policy or the network." },
                { type: "txn.reversed",             desc: "A settled transaction was reversed." },
                { type: "txn.approval_requested",   desc: "Transaction held pending human review." },
                { type: "txn.approved",             desc: "Held transaction was approved by a reviewer." },
                { type: "txn.rejected",             desc: "Held transaction was rejected by a reviewer." },
                { type: "account.credited",         desc: "Funds were deposited into a virtual account." },
                { type: "account.debited",          desc: "Funds were withdrawn or transferred out." },
              ].map(ev => (
                <div key={ev.type} style={{
                  background: "#fff", border: `1px solid ${BORDER}`,
                  borderRadius: "5px", padding: "10px 12px",
                }}>
                  <code style={{ fontFamily: MONO, fontSize: "11px", color: GOLD, display: "block", marginBottom: "4px" }}>{ev.type}</code>
                  <span style={{ fontFamily: SANS, fontSize: "12px", color: MUTED, lineHeight: 1.5 }}>{ev.desc}</span>
                </div>
              ))}
            </div>

            <H3>Querying Logs via API</H3>
            <CodeBlock lang="bash" code={`# Get all events for an agent in the last 24 hours
curl "https://api.olympay.tech/v1/events?agent_id=agt_01j2k9mx3nt&from=2026-03-13T00:00:00Z" \\
  -H "Authorization: Bearer olympay_live_••••••••"

# Get only declined transactions
curl "https://api.olympay.tech/v1/events?type=txn.declined&limit=50" \\
  -H "Authorization: Bearer olympay_live_••••••••"`} />
          </section>

          <Divider />

          {/* ════════════════════════════════════════════════
              USE CASES
          ════════════════════════════════════════════════ */}
          <section id="use-cases">
            <SectionLabel>Use Cases</SectionLabel>
            <H2>Agent Architecture Patterns</H2>
            <P>
              The following five patterns demonstrate how to wire Olympay into real autonomous agent workflows. Each pattern includes the recommended account structure, card configuration, policy setup, and approval topology for production deployments.
            </P>
          </section>

          {/* USE CASE 01 */}
          <section id="use-case-01" style={{ marginTop: "40px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
              paddingBottom: "20px", borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "8px",
                background: `${GOLD}14`, border: `1px solid ${GOLD}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: MONO, fontSize: "11px", color: GOLD, fontWeight: 700 }}>01</span>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>Sourcing & Purchasing</div>
                <h3 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 400, color: BLACK, margin: 0 }}>Autonomous Procurement Pipelines</h3>
              </div>
            </div>

            <P>A procurement agent monitors vendor catalogs, compares prices, verifies vendor approval status, and executes purchases — all without human involvement for transactions within policy bounds. High-value or off-policy purchases are automatically escalated.</P>

            <H3>Architecture</H3>
            <P>Each procurement agent receives a <Code>persistent</Code> card with a <Code>spend_limit</Code> policy capping daily spend at an amount appropriate to the purchasing tier. A chained <Code>merchant_allowlist</Code> policy restricts charges to pre-approved vendor IDs. An <Code>approval_required</Code> policy is attached last to escalate any single transaction above $500.</P>

            <CodeBlock lang="typescript" code={`import { Olympay } from "@olympay/sdk";

const client = new Olympay({ apiKey: process.env.OLYMPAY_SECRET_KEY! });

// --- One-time setup ---
const agent = await client.agents.create({
  name: "procurement-bot-v2",
  metadata: { department: "ops", tier: "tier-1" },
});

const dailyLimit = await client.policies.create({
  name: "Daily $2,000 Procurement Cap",
  type: "spend_limit",
  config: { maxAmount: 200_000, window: "daily" },
});

const approvedVendors = await client.policies.create({
  name: "Approved Vendor List",
  type: "merchant_allowlist",
  config: {
    merchantIds: ["amazon_business", "staples", "grainger", "uline"],
  },
});

const highValueGate = await client.policies.create({
  name: "Over $500 Requires Approval",
  type: "approval_required",
  config: { threshold: 50_000, notifyEmail: "procurement@acme.com" },
});

const card = await client.cards.issue({
  agentId: agent.id,
  type: "persistent",
  spendLimit: 500_000,  // hard ceiling: $5,000
});

// Attach in evaluation order
await client.policies.attach(dailyLimit.id,     { cardId: card.id });
await client.policies.attach(approvedVendors.id, { cardId: card.id });
await client.policies.attach(highValueGate.id,  { cardId: card.id });

// --- Agent runtime (LLM tool call) ---
// When the agent decides to purchase, it calls:
async function purchaseFromVendor(vendorId: string, amountCents: number) {
  // The card is provided to the vendor's payment API.
  // Olympay evaluates all three policies in real time before authorization.
  // If amount >= $500, Olympay emits txn.approval_requested and holds the charge.
  console.log(\`Card \${card.last4} ready. Policies will evaluate at charge time.\`);
}`} />
          </section>

          {/* USE CASE 02 */}
          <section id="use-case-02" style={{ marginTop: "48px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
              paddingBottom: "20px", borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "8px",
                background: `${GOLD}14`, border: `1px solid ${GOLD}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: MONO, fontSize: "11px", color: GOLD, fontWeight: 700 }}>02</span>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>E-commerce & Retail</div>
                <h3 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 400, color: BLACK, margin: 0 }}>Marketplace Buying Automation</h3>
              </div>
            </div>

            <P>A buying agent watches marketplace listings, detects price drops, validates inventory levels, and checks out automatically when conditions are met. Each purchase uses a <Code>disposable</Code> card so the card number is never reused across merchants, eliminating cross-merchant data correlation risk.</P>

            <H3>Recommended Setup</H3>
            <P>Use one persistent agent with a fresh disposable card generated per transaction. The disposable card expires after the first authorization, and its <Code>spend_limit</Code> is set exactly to the expected transaction amount to prevent overcharges.</P>

            <CodeBlock lang="typescript" code={`async function buyListing(
  agentId: string,
  listingPrice: number,
  merchantId: string
) {
  // Issue a single-use card sized exactly to the listing price
  const card = await client.cards.issue({
    agentId,
    type: "disposable",
    spendLimit: listingPrice + 100,  // +$1.00 tolerance for dynamic pricing
    metadata: { listing_id: merchantId, purpose: "marketplace-buy" },
  });

  // Return card details to the agent's checkout tool
  // After one charge, the card auto-expires
  return {
    cardId: card.id,
    last4: card.last4,
    expiresAt: card.expiresAt,
  };
}`} />
          </section>

          {/* USE CASE 03 */}
          <section id="use-case-03" style={{ marginTop: "48px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
              paddingBottom: "20px", borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "8px",
                background: `${GOLD}14`, border: `1px solid ${GOLD}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: MONO, fontSize: "11px", color: GOLD, fontWeight: 700 }}>03</span>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>Recurring Payments</div>
                <h3 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 400, color: BLACK, margin: 0 }}>License & Subscription Control</h3>
              </div>
            </div>

            <P>A subscription-management agent audits active SaaS licenses, detects unused seats, cancels or downgrades plans, and renews critical tools before expiry. Each vendor gets its own persistent card so spend per tool is tracked with zero ambiguity in the audit log.</P>

            <H3>Per-Vendor Card Pattern</H3>
            <CodeBlock lang="typescript" code={`const SAAS_VENDORS = [
  { name: "github",  merchantId: "github",  monthlyBudget: 40_000 },
  { name: "linear",  merchantId: "linear",  monthlyBudget: 15_000 },
  { name: "vercel",  merchantId: "vercel",  monthlyBudget: 20_000 },
  { name: "aws",     merchantId: "aws",     monthlyBudget: 150_000 },
];

async function provisionSaasCards(agentId: string) {
  return Promise.all(
    SAAS_VENDORS.map(async (vendor) => {
      const allowlist = await client.policies.create({
        name: \`Allowlist: \${vendor.name}\`,
        type: "merchant_allowlist",
        config: { merchantIds: [vendor.merchantId] },
      });

      const cap = await client.policies.create({
        name: \`Monthly cap: \${vendor.name}\`,
        type: "spend_limit",
        config: { maxAmount: vendor.monthlyBudget, window: "monthly" },
      });

      const card = await client.cards.issue({
        agentId,
        type: "persistent",
        metadata: { vendor: vendor.name, purpose: "saas-subscription" },
      });

      await client.policies.attach(allowlist.id, { cardId: card.id });
      await client.policies.attach(cap.id,       { cardId: card.id });

      return { vendor: vendor.name, cardId: card.id };
    })
  );
}`} />
          </section>

          {/* USE CASE 04 */}
          <section id="use-case-04" style={{ marginTop: "48px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
              paddingBottom: "20px", borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "8px",
                background: `${GOLD}14`, border: `1px solid ${GOLD}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: MONO, fontSize: "11px", color: GOLD, fontWeight: 700 }}>04</span>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>Travel, Hotels, Rentals</div>
                <h3 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 400, color: BLACK, margin: 0 }}>Itinerary & Logistics Agents</h3>
              </div>
            </div>

            <P>A travel agent books flights, hotels, ground transport, and meals for employees or contractors. It enforces travel policy automatically — no manual expense reports needed. Each trip gets a dedicated card with an MCC-scoped allowlist (airlines: 3000-3299, hotels: 7011, car rental: 7512) and a per-trip spend cap.</P>

            <CodeBlock lang="typescript" code={`async function createTripCard(agentId: string, tripBudgetCents: number) {
  const travelPolicy = await client.policies.create({
    name: "Travel MCC Allowlist",
    type: "merchant_allowlist",
    config: {
      mccCodes: [
        "3000", "3001",  // Airlines
        "7011",          // Hotels & Lodging
        "7512",          // Car Rental
        "5812",          // Restaurants
        "4121",          // Taxi / Rideshare
      ],
    },
  });

  const tripCap = await client.policies.create({
    name: \`Trip Budget $\${tripBudgetCents / 100}\`,
    type: "spend_limit",
    config: { maxAmount: tripBudgetCents, window: "lifetime" },
  });

  const approval = await client.policies.create({
    name: "Premium Booking Approval",
    type: "approval_required",
    config: { threshold: 80_000 }, // Anything over $800 needs sign-off
  });

  const card = await client.cards.issue({
    agentId,
    type: "persistent",
    metadata: { purpose: "business-travel" },
  });

  await client.policies.attach(travelPolicy.id, { cardId: card.id });
  await client.policies.attach(tripCap.id,      { cardId: card.id });
  await client.policies.attach(approval.id,     { cardId: card.id });

  return card;
}`} />
          </section>

          {/* USE CASE 05 */}
          <section id="use-case-05" style={{ marginTop: "48px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
              paddingBottom: "20px", borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "8px",
                background: `${GOLD}14`, border: `1px solid ${GOLD}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: MONO, fontSize: "11px", color: GOLD, fontWeight: 700 }}>05</span>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>Outbound Payments</div>
                <h3 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 400, color: BLACK, margin: 0 }}>Vendor & Supplier Disbursements</h3>
              </div>
            </div>

            <P>An accounts-payable agent processes inbound invoices, validates them against purchase orders, and initiates outbound ACH or wire transfers from a dedicated virtual account. All disbursements above a configurable threshold require dual human approval before funds move.</P>

            <CodeBlock lang="typescript" code={`async function processInvoice(invoice: {
  vendorId: string;
  amountCents: number;
  poNumber: string;
}) {
  // 1. Validate invoice against PO (your business logic)
  const po = await yourDb.purchaseOrders.find(invoice.poNumber);
  if (!po || po.amountCents < invoice.amountCents) {
    throw new Error("Invoice exceeds PO amount or PO not found");
  }

  // 2. For amounts under $10k, initiate transfer directly
  if (invoice.amountCents < 1_000_000) {
    return client.accounts.transfer(DISBURSEMENT_ACCOUNT_ID, {
      amount: invoice.amountCents,
      method: "ach",
      recipientBankAccount: po.vendorBankAccount,
      description: \`Invoice \${invoice.poNumber}\`,
    });
  }

  // 3. For amounts >= $10k, create a pending approval record
  // Your human-in-the-loop flow approves before olympay.accounts.transfer is called
  return approvalQueue.create({
    type: "large_disbursement",
    payload: invoice,
    requiredApprovers: 2,
    expiresInSeconds: 86_400,
  });
}`} />

            <Note>
              Olympay virtual accounts support both ACH (1-2 business days) and same-day Fedwire transfers. Fedwire requires explicit enablement in your workspace settings and carries a per-transfer fee. See the <strong>Accounts</strong> section for transfer request parameters.
            </Note>
          </section>

          <Divider />

          {/* Footer nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => navigate("/")} style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              background: "none", border: `1px solid ${BORDER}`, cursor: "pointer",
              padding: "10px 20px", borderRadius: "4px",
              fontFamily: MONO, fontSize: "10px", color: MUTED, letterSpacing: "0.1em",
              textTransform: "uppercase", transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.color = GOLD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = MUTED; }}
            >
              ← BACK TO HOME
            </button>
            <button onClick={() => navigate("/login")} style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              background: GOLD, border: "none", cursor: "pointer",
              padding: "10px 20px", borderRadius: "4px",
              fontFamily: MONO, fontSize: "10px", color: BLACK, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              OPEN DASHBOARD <ArrowRight size={12} />
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
