import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Activity, ArrowRight, ArrowUpRight } from "lucide-react";

/* ─── Color & font tokens (self-contained, no Tailwind theme) ─── */
const C = {
  cream: "#f7f2e9",
  black: "#0a0a08",
  gold: "#c4923a",
  goldLight: "#d4a84a",
  muted: "#7a7060",
  border: "#d5cbbf",
  cardBg: "#111110",
  cardText: "#e0d5c0",
};
const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Inter', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const NAV_LINKS = [
  "Solutions",
  "Payments",
  "Banking",
  "Plans",
  "Workflows",
  "Ledger",
  "Developers",
];

const STEPS = [
  {
    n: "Step 01",
    title: "Define spending boundaries",
    desc: "Specify exactly what each agent is permitted to buy, which merchants are allowed, daily caps, and recurring limits, all through a single policy object.",
    tag: "POLICY_CONFIGURED",
  },
  {
    n: "Step 02",
    title: "Agent submits intent",
    desc: "Every spend attempt begins with a signed intent payload. The agent declares purpose, amount, and target before any funds move.",
    tag: "INTENT_RECEIVED",
  },
  {
    n: "Step 03",
    title: "Real-time policy evaluation",
    desc: "Credd evaluates the intent against your active policies in milliseconds and returns a verdict: ALLOW, DENY, or escalate to REVIEW.",
    tag: "DECISION: ALLOW",
  },
  {
    n: "Step 04",
    title: "Funds released under constraint",
    desc: "Approved transactions are executed using the agent's dedicated card or account, locked to the exact scope that was approved.",
    tag: "FUNDS_RELEASED",
  },
  {
    n: "Step 05",
    title: "Instant reconciliation",
    desc: "Settlement data is matched back to the original intent in real time. Any discrepancy triggers an immediate alert and hold.",
    tag: "RECONCILED: OK",
  },
];

const FEATURES = [
  {
    n: "01",
    title: "Precision Financial Instruments",
    desc: "Disposable cards scoped to a single transaction. Persistent cards with velocity controls, time-of-day restrictions, and merchant locks. Dedicated accounts for agents that receive inbound payments.",
  },
  {
    n: "02",
    title: "Programmable Guardrails",
    desc: "Attach a policy to any agent or card in seconds. Cap daily spend, restrict to approved merchant categories, and require human sign-off above a threshold. Rules enforce themselves.",
  },
  {
    n: "03",
    title: "Continuous Transaction Visibility",
    desc: "Stream every authorization and settlement to your dashboard the moment it happens. Filter by agent, policy, or outcome. Export to your data warehouse in one click.",
  },
  {
    n: "04",
    title: "Audit-Ready by Default",
    desc: "Each transaction carries a signed intent record and a complete decision log. When a charge needs justification, you already hold the evidence before anyone asks.",
  },
];

const USE_CASES = [
  { n: "01", title: "Autonomous Procurement Pipelines", cat: "Sourcing & Purchasing" },
  { n: "02", title: "Marketplace Buying Automation", cat: "E-commerce & Retail" },
  { n: "03", title: "License & Subscription Control", cat: "Recurring Payments" },
  { n: "04", title: "Itinerary & Logistics Agents", cat: "Travel, Hotels, Rentals" },
  { n: "05", title: "Vendor & Supplier Disbursements", cat: "Outbound Payments" },
];

/* ─── Dark virtual card component ─── */
function DarkCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
      {/* Card */}
      <div style={{
        background: C.cardBg,
        borderRadius: "12px",
        padding: "24px",
        width: "340px",
        border: `1px solid rgba(255,255,255,0.08)`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={14} color={C.goldLight} />
            <span style={{ fontFamily: MONO, fontSize: "11px", color: C.goldLight, fontWeight: 500 }}>Credd AI</span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: "10px", color: C.muted, letterSpacing: "0.1em" }}>VISA</span>
        </div>

        <div style={{ fontFamily: MONO, fontSize: "15px", color: C.cardText, letterSpacing: "0.3em", marginBottom: "6px" }}>
          •••• •••• •••• 7842
        </div>
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>EXP</div>
            <div style={{ fontFamily: MONO, fontSize: "11px", color: C.cardText }}>12/25</div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>CVV</div>
            <div style={{ fontFamily: MONO, fontSize: "11px", color: C.cardText }}>•••</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>AGENT</div>
            <div style={{ fontFamily: MONO, fontSize: "12px", color: C.cardText, fontWeight: 500, letterSpacing: "0.05em" }}>PROCUREMENT-BOT</div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "6px", marginBottom: "2px" }}>CARD TYPE</div>
            <div style={{ fontFamily: MONO, fontSize: "11px", color: C.cardText }}>MULTI_USE</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end", marginBottom: "4px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }}></div>
              <span style={{ fontFamily: MONO, fontSize: "9px", color: "#4ade80", letterSpacing: "0.1em" }}>ACTIVE</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>LIMIT</div>
            <div style={{ fontFamily: MONO, fontSize: "13px", color: "#4ade80", fontWeight: 600 }}>$1,500</div>
          </div>
        </div>
      </div>

      {/* Virtual Account */}
      <div style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderTop: "none",
        borderRadius: "0 0 12px 12px",
        padding: "20px 24px",
        width: "340px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={10} color={C.gold} />
            <span style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Virtual Account</span>
          </div>
          <div>
            <span style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, letterSpacing: "0.1em" }}>ACH · Fedwire</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Account Holder</div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.gold }}></div>
              <span style={{ fontFamily: MONO, fontSize: "10px", color: C.black, fontWeight: 500 }}>PROCUREMENT-BOT</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Policy</div>
            <div style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, fontWeight: 500 }}>CONTRACTORS</div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Routing Number</div>
            <div style={{ fontFamily: MONO, fontSize: "10px", color: C.black }}>021 000 021</div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Balance</div>
            <div style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, fontWeight: 600 }}>$12,400</div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Account Number</div>
            <div style={{ fontFamily: MONO, fontSize: "10px", color: C.black }}>•••• •••• 4891</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Flow step tag ─── */
function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div style={{
      display: "inline-block",
      fontFamily: MONO,
      fontSize: "9px",
      letterSpacing: "0.08em",
      padding: "3px 8px",
      border: `1px solid ${accent ? C.gold : C.border}`,
      borderRadius: "4px",
      color: accent ? C.gold : C.muted,
      background: accent ? `${C.gold}10` : "transparent",
      whiteSpace: "nowrap",
    }}>
      {label}
    </div>
  );
}

/* ─── Main component ─── */
export default function Landing() {
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: SANS, background: C.cream, color: C.black, minHeight: "100vh" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(10,10,8,0.97)" : C.black,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid rgba(255,255,255,0.07)`,
        transition: "background 0.2s",
      }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "0 24px", height: "48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={14} color={C.goldLight} />
            <span style={{ fontFamily: MONO, fontSize: "12px", color: C.goldLight, fontWeight: 500, letterSpacing: "0.05em" }}>
              CREDD AI
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
            {NAV_LINKS.map((l, i) => (
              <button key={l} onClick={() => scrollTo(i === 0 ? "use-cases" : i === 1 ? "features" : "integration")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "0 14px", height: "48px",
                  fontFamily: MONO, fontSize: "10px", letterSpacing: "0.08em",
                  color: "rgba(229,220,200,0.55)",
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
                  textTransform: "uppercase",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.goldLight)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(229,220,200,0.55)")}
              >{l}</button>
            ))}
          </div>

          {/* CTA */}
          <button onClick={() => navigate("/login")} style={{
            background: C.gold, border: "none", cursor: "pointer",
            padding: "8px 18px",
            fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em",
            color: C.black, fontWeight: 600, textTransform: "uppercase",
            borderRadius: "4px",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = C.goldLight)}
            onMouseLeave={e => (e.currentTarget.style.background = C.gold)}
          >
            DASHBOARD →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: "48px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 48px)" }}>
          {/* Left */}
          <div style={{
            padding: "64px 72px",
            borderRight: `1px solid ${C.border}`,
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center",
              fontFamily: MONO, fontSize: "9px", letterSpacing: "0.15em",
              color: C.muted, textTransform: "uppercase",
              border: `1px solid ${C.border}`, borderRadius: "2px",
              padding: "3px 8px", marginBottom: "32px", width: "fit-content",
            }}>PLATFORM</div>

            <h1 style={{
              fontFamily: SERIF, fontSize: "clamp(40px, 4.5vw, 60px)",
              fontWeight: 400, lineHeight: 1.1,
              color: C.black, marginBottom: "24px",
            }}>
              Full financial autonomy for every agent you deploy.
            </h1>

            <p style={{
              fontFamily: SANS, fontSize: "15px", lineHeight: 1.65,
              color: C.muted, marginBottom: "40px", maxWidth: "400px",
            }}>
              Issue dedicated cards and accounts to your AI agents. Define exactly what they can spend, where, and how much, then let them operate independently.
            </p>

            <button onClick={() => navigate("/login")} style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "14px 32px", width: "fit-content",
              fontFamily: MONO, fontSize: "11px", letterSpacing: "0.15em",
              fontWeight: 600, textTransform: "uppercase",
              background: "transparent",
              border: `2px solid ${C.gold}`,
              color: C.gold, cursor: "pointer", borderRadius: "3px",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = C.black; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.gold; }}
            >
              OPEN YOUR ACCOUNT
            </button>

            {/* Logos */}
            <div style={{ display: "flex", alignItems: "center", gap: "32px", marginTop: "64px" }}>
              {["Stripe", "OpenAI", "LangChain", "Anthropic"].map((logo) => (
                <span key={logo} style={{
                  fontFamily: MONO, fontSize: "11px",
                  color: "rgba(10,10,8,0.25)", letterSpacing: "0.05em",
                }}>{logo}</span>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={{
            padding: "64px 72px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: C.cream,
          }}>
            <DarkCard />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ borderBottom: `1px solid ${C.border}` }}>
        {/* Header */}
        <div style={{
          padding: "64px 72px 48px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "24px", height: "2px", background: C.gold }}></div>
            <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>How it works</span>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 400, lineHeight: 1.15, maxWidth: "700px" }}>
            Designed for agents that operate with real money.
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "14px", color: C.muted, marginTop: "16px", maxWidth: "580px", lineHeight: 1.65 }}>
            Your agent declares its intent. Credd validates it against your policy in real time. If it clears, a payment instrument is issued and constrained to that specific action. Nothing more.
          </p>
        </div>

        {/* Steps */}
        <div>
          {STEPS.map((step, i) => (
            <div key={step.n} style={{
              display: "grid", gridTemplateColumns: "280px 1fr 200px",
              borderBottom: i < STEPS.length - 1 ? `1px solid ${C.border}` : "none",
              minHeight: "120px",
            }}>
              {/* Step text */}
              <div style={{
                padding: "32px 40px",
                borderRight: `1px solid ${C.border}`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.12em", marginBottom: "10px" }}>{step.n}</div>
                <div style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 600, color: C.black, marginBottom: "8px" }}>{step.title}</div>
                <div style={{ fontFamily: SANS, fontSize: "12px", color: C.muted, lineHeight: 1.65 }}>{step.desc}</div>
              </div>

              {/* Center visual */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "32px",
                borderRight: `1px solid ${C.border}`,
                position: "relative",
              }}>
                {/* Connecting line */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: "absolute", bottom: 0, left: "50%",
                    width: "1px", height: "100%",
                    background: `linear-gradient(to bottom, ${C.border} 0%, transparent 100%)`,
                    zIndex: 0,
                  }} />
                )}
                <div style={{
                  position: "relative", zIndex: 1,
                  width: "48px", height: "48px",
                  border: `1px solid ${i === 0 ? C.gold : C.border}`,
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i === 0 ? `${C.gold}15` : C.cream,
                }}>
                  <span style={{
                    fontFamily: MONO, fontSize: "10px", fontWeight: 600,
                    color: i === 0 ? C.gold : C.muted,
                  }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>

              {/* Tag */}
              <div style={{
                padding: "32px 24px",
                display: "flex", alignItems: "center", justifyContent: "flex-start",
              }}>
                <Tag label={step.tag} accent={i === 2} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: "64px 80px 48px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "24px", height: "2px", background: C.gold }}></div>
            <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Features</span>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.15, maxWidth: "600px" }}>
            Infrastructure built for agents that transact at scale.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {FEATURES.map((f, i) => (
            <div key={f.n} style={{
              padding: "40px 32px",
              borderRight: i < FEATURES.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ fontFamily: MONO, fontSize: "10px", color: C.muted, marginBottom: "20px" }}>{f.n}</div>
              <h3 style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 600, color: C.black, lineHeight: 1.4, marginBottom: "12px" }}>{f.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: "13px", color: C.muted, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section id="use-cases" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: "64px 80px 48px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "24px", height: "2px", background: C.gold }}></div>
            <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Use Cases</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 400 }}>Where teams are deploying this today.</h2>
            <span style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Live Deployments</span>
          </div>
        </div>

        <div>
          {USE_CASES.map((uc, i) => (
            <div key={uc.n}
              style={{
                display: "grid", gridTemplateColumns: "80px 1fr 60px",
                padding: "28px 80px",
                borderBottom: i < USE_CASES.length - 1 ? `1px solid ${C.border}` : "none",
                cursor: "pointer", transition: "background 0.15s",
                alignItems: "center",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,146,58,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontFamily: MONO, fontSize: "11px", color: C.muted }}>{uc.n}</span>
              <div>
                <div style={{ fontFamily: SANS, fontSize: "17px", fontWeight: 500, color: C.black, marginBottom: "3px" }}>{uc.title}</div>
                <div style={{ fontFamily: MONO, fontSize: "10px", color: C.muted, letterSpacing: "0.06em" }}>{uc.cat}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <ArrowUpRight size={16} color={C.muted} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTEGRATION ── */}
      <section id="integration" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: "64px 80px 48px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "24px", height: "2px", background: C.gold }}></div>
            <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Integration</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Tag label="SETUP" />
            <ArrowRight size={12} color={C.muted} />
            <Tag label="LIVE" accent />
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 400 }}>From API key to first transaction in minutes.</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { n: "Step 01", title: "Connect and configure", items: ["Register your workspace and retrieve API credentials", "Invite teammates and set permission levels"] },
            { n: "Step 02", title: "Write your policies", items: ["Encode spending rules, merchant allowlists, and approval thresholds", "Link policies to specific agents or agent groups"] },
            { n: "Step 03", title: "Deploy and monitor", items: ["Agents begin transacting within their defined boundaries", "Every decision streams to your dashboard in real time"] },
          ].map((step, i) => (
            <div key={step.n} style={{
              padding: "48px 40px",
              borderRight: i < 2 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.12em", marginBottom: "16px" }}>{step.n}</div>
              <h3 style={{ fontFamily: SANS, fontSize: "16px", fontWeight: 600, color: C.black, marginBottom: "20px" }}>{step.title}</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {step.items.map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ fontFamily: MONO, fontSize: "11px", color: C.muted, marginTop: "1px" }}>▸</span>
                    <span style={{ fontFamily: SANS, fontSize: "13px", color: C.muted, lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Ready CTA */}
        <div style={{
          padding: "64px 80px",
          borderTop: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", alignItems: "flex-start",
        }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "28px", fontWeight: 400, marginBottom: "8px" }}>Your agents are ready. Is your spend infrastructure?</h3>
          <p style={{ fontFamily: SANS, fontSize: "14px", color: C.muted, marginBottom: "28px" }}>Connect your first agent and issue a card in under five minutes.</p>
          <button onClick={() => navigate("/login")} style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "13px 28px",
            fontFamily: MONO, fontSize: "11px", letterSpacing: "0.12em",
            fontWeight: 600, textTransform: "uppercase",
            background: C.black, color: C.cream,
            border: `1px solid ${C.black}`, cursor: "pointer",
            borderRadius: "3px", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.black; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.black; e.currentTarget.style.borderColor = C.black; e.currentTarget.style.color = C.cream; }}
          >
            GET ACCESS <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "32px 80px",
        borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity size={13} color={C.gold} />
          <span style={{ fontFamily: MONO, fontSize: "10px", color: C.muted, letterSpacing: "0.08em" }}>CREDD AI</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: "12px", color: C.muted }}>
          Spend infrastructure for autonomous AI. Credd is not a bank.
        </p>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy", "Terms", "Docs", "API"].map(l => (
            <button key={l} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: MONO, fontSize: "10px", color: C.muted,
              letterSpacing: "0.08em", textTransform: "uppercase",
              transition: "color 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >{l}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}
