import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Activity, ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";

/* ─── Responsive hook ─── */
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

/* ─── Section fade-in hook ─── */
function useFadeIn() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.filter = "blur(0px)";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

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
  "Agents",
  "Transactions",
  "Accounts",
  "Cards",
  "Policies",
  "Audit Logs",
  "API",
];

const NAV_SCROLL_MAP: Record<string, string> = {
  "Agents":       "use-cases",
  "Transactions": "how-it-works",
  "Accounts":     "section-accounts",
  "Cards":        "section-cards",
  "Policies":     "section-policies",
  "Audit Logs":   "section-audit",
  "API":          "integration",
};

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
    desc: "Olympay evaluates the intent against your active policies in milliseconds and returns a verdict: ALLOW, DENY, or escalate to REVIEW.",
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
    id: "feature-accounts",
    n: "01",
    title: "Dedicated Agent Accounts",
    desc: "Every agent gets its own account with a unique routing number. Receive inbound payments, hold balances, and issue cards from a single account object scoped to that agent.",
  },
  {
    id: "feature-cards",
    n: "02",
    title: "Precision Virtual Cards",
    desc: "Disposable cards scoped to a single transaction. Persistent cards with velocity controls, time-of-day restrictions, and merchant locks. Generated on demand via API in milliseconds.",
  },
  {
    id: "feature-policies",
    n: "03",
    title: "Programmable Spend Policies",
    desc: "Attach a policy to any agent or card in seconds. Cap daily spend, restrict to approved merchant categories, and require human sign-off above a threshold. Rules enforce themselves.",
  },
  {
    id: "feature-audit",
    n: "04",
    title: "Audit Logs by Default",
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
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "380px" }}>

      {/* ── Physical card ── */}
      <div style={{
        width: "100%",
        aspectRatio: "1.586",
        background: "linear-gradient(145deg, #1c1c19 0%, #0d0d0b 55%, #1e190f 100%)",
        borderRadius: "18px",
        padding: "26px 28px",
        boxSizing: "border-box",
        border: "1px solid rgba(196,146,58,0.18)",
        boxShadow: "0 24px 56px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        {/* Decorative radial glows */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "260px", height: "260px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,146,58,0.09) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-50px", left: "-30px",
          width: "200px", height: "200px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,146,58,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "7px",
              background: "rgba(196,146,58,0.14)",
              border: "1px solid rgba(196,146,58,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Activity size={13} color={C.goldLight} />
            </div>
            <span style={{ fontFamily: MONO, fontSize: "12px", color: C.goldLight, fontWeight: 700, letterSpacing: "0.07em" }}>OLYMPAY</span>
          </div>
          {/* Network circles (Mastercard-style) */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.13)", marginRight: "-10px", zIndex: 1 }} />
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(196,146,58,0.38)" }} />
          </div>
        </div>

        {/* Middle: chip + PAN */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* EMV chip */}
          <div style={{
            width: "38px", height: "28px", borderRadius: "5px",
            background: "linear-gradient(135deg, #d4a845 0%, #a07830 45%, #c9983f 100%)",
            marginBottom: "18px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "rgba(0,0,0,0.18)", transform: "translateY(-50%)" }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: "1px", background: "rgba(0,0,0,0.15)", transform: "translateX(-50%)" }} />
            <div style={{ position: "absolute", top: "6px", left: "6px", right: "6px", bottom: "6px", borderRadius: "2px", border: "1px solid rgba(0,0,0,0.12)" }} />
          </div>
          <div style={{ fontFamily: MONO, fontSize: "16px", color: "#e6dcc6", letterSpacing: "0.26em", fontWeight: 500 }}>
            •••• •••• •••• 7842
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: "rgba(229,212,175,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "3px" }}>Agent</div>
            <div style={{ fontFamily: MONO, fontSize: "12px", color: "#e6dcc6", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "10px" }}>PROCUREMENT-BOT</div>
            <div style={{ display: "flex", gap: "22px" }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "8px", color: "rgba(229,212,175,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "2px" }}>Valid thru</div>
                <div style={{ fontFamily: MONO, fontSize: "11px", color: "#e6dcc6" }}>12 / 27</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "8px", color: "rgba(229,212,175,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "2px" }}>CVV</div>
                <div style={{ fontFamily: MONO, fontSize: "11px", color: "#e6dcc6" }}>•••</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", justifyContent: "flex-end", marginBottom: "8px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontFamily: MONO, fontSize: "8px", color: "#4ade80", letterSpacing: "0.14em" }}>ACTIVE</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: "rgba(229,212,175,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "3px" }}>Spend limit</div>
            <div style={{ fontFamily: MONO, fontSize: "22px", color: C.goldLight, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1 }}>$1,500</div>
          </div>
        </div>
      </div>

      {/* ── Virtual Account panel ── */}
      <div style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        padding: "18px 22px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "14px", paddingBottom: "12px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <Activity size={11} color={C.gold} />
            <span style={{ fontFamily: MONO, fontSize: "9px", color: C.black, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Virtual Account</span>
          </div>
          <span style={{
            fontFamily: MONO, fontSize: "8px", color: C.muted,
            letterSpacing: "0.08em", background: C.cream,
            border: `1px solid ${C.border}`, padding: "2px 8px", borderRadius: "4px",
          }}>ACH · Fedwire</span>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Account Holder</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
              <span style={{ fontFamily: MONO, fontSize: "10px", color: C.black, fontWeight: 600 }}>PROCUREMENT-BOT</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Policy</div>
            <span style={{
              fontFamily: MONO, fontSize: "9px", color: C.gold, fontWeight: 700,
              background: `${C.gold}14`, border: `1px solid ${C.gold}35`,
              padding: "2px 8px", borderRadius: "4px", display: "inline-block", letterSpacing: "0.06em",
            }}>CONTRACTORS</span>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Routing</div>
            <div style={{ fontFamily: MONO, fontSize: "10px", color: C.black }}>021 000 021</div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Balance</div>
            <div style={{ fontFamily: MONO, fontSize: "14px", color: C.black, fontWeight: 700 }}>
              $12,400<span style={{ fontSize: "9px", color: C.muted, fontWeight: 400 }}>.00</span>
            </div>
          </div>
          <div style={{ gridColumn: "1/-1", paddingTop: "10px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Account Number</div>
            <div style={{ fontFamily: MONO, fontSize: "10px", color: C.black, letterSpacing: "0.1em" }}>•••• •••• 4891</div>
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

/* ─── Fade-section wrapper styles ─── */
const fadeInit: React.CSSProperties = {
  opacity: 0,
  filter: "blur(6px)",
  transform: "translateY(18px)",
  transition: "opacity 0.6s ease, filter 0.6s ease, transform 0.6s ease",
};

/* ─── Main component ─── */
export default function Landing() {
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width < 1024;

  /* section refs */
  const refHowItWorks  = useFadeIn();
  const refFeatures    = useFadeIn();
  const refAccounts    = useFadeIn();
  const refCards       = useFadeIn();
  const refPolicies    = useFadeIn();
  const refAudit       = useFadeIn();
  const refUseCases    = useFadeIn();
  const refIntegration = useFadeIn();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), mobileOpen ? 200 : 0);
  };

  return (
    <div style={{ fontFamily: SANS, background: C.cream, color: C.black, minHeight: "100vh" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(10,10,8,0.80)" : "rgba(10,10,8,0.97)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid rgba(255,255,255,0.07)`,
        transition: "background 0.35s ease",
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
              OLYMPAY
            </span>
          </div>

          {/* Nav links — desktop only */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
              {NAV_LINKS.map((l, i) => (
                <button key={l} onClick={() => scrollTo(NAV_SCROLL_MAP[l])}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: isTablet ? "0 10px" : "0 14px", height: "48px",
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
          )}

          {/* Right: CTA + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!isMobile && (
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
            )}
            {isMobile && (
              <button onClick={() => setMobileOpen(v => !v)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(229,220,200,0.8)", padding: "4px",
                display: "flex", alignItems: "center",
              }}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {isMobile && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}>
          {/* Backdrop blur overlay */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(10,10,8,0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              opacity: mobileOpen ? 1 : 0,
              transition: "opacity 0.25s ease",
            }}
          />
          {/* Drawer panel */}
          <div style={{
            position: "absolute", top: "48px", left: 0, right: 0,
            background: "rgba(14,14,11,0.96)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            transform: mobileOpen ? "translateY(0)" : "translateY(-8px)",
            opacity: mobileOpen ? 1 : 0,
            transition: "transform 0.25s ease, opacity 0.25s ease",
            padding: "16px 0 24px",
          }}>
            {NAV_LINKS.map((l) => (
              <button key={l} onClick={() => scrollTo(NAV_SCROLL_MAP[l])}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "14px 24px",
                  fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em",
                  color: "rgba(229,220,200,0.7)",
                  textTransform: "uppercase",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.goldLight)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(229,220,200,0.7)")}
              >{l}</button>
            ))}
            <div style={{ padding: "20px 24px 0" }}>
              <button onClick={() => navigate("/login")} style={{
                width: "100%", background: C.gold, border: "none", cursor: "pointer",
                padding: "12px 18px",
                fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em",
                color: C.black, fontWeight: 600, textTransform: "uppercase",
                borderRadius: "4px",
              }}>
                OPEN DASHBOARD →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ paddingTop: "48px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", minHeight: isMobile ? "auto" : "calc(100vh - 48px)" }}>
          {/* Left */}
          <div style={{
            padding: isMobile ? "48px 24px 40px" : "64px 72px",
            borderRight: isMobile ? "none" : `1px solid ${C.border}`,
            borderBottom: isMobile ? `1px solid ${C.border}` : "none",
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

            {/* Logo ticker */}
            <div style={{ marginTop: "64px", overflow: "hidden", position: "relative" }}>
              <style>{`
                @keyframes ticker {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .logo-ticker { animation: ticker 18s linear infinite; }
                .logo-ticker:hover { animation-play-state: paused; }
              `}</style>
              <div className="logo-ticker" style={{
                display: "flex", alignItems: "center", gap: "48px",
                width: "max-content",
              }}>
                {[...["Stripe", "OpenAI", "Anthropic", "Visa", "Mastercard", "OpenClaw"],
                  ...["Stripe", "OpenAI", "Anthropic", "Visa", "Mastercard", "OpenClaw"]
                ].map((logo, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: "48px" }}>
                    <span style={{
                      fontFamily: MONO, fontSize: "11px",
                      color: "rgba(10,10,8,0.22)", letterSpacing: "0.08em",
                      whiteSpace: "nowrap", userSelect: "none",
                    }}>{logo}</span>
                    <span style={{
                      width: "3px", height: "3px", borderRadius: "50%",
                      background: "rgba(196,146,58,0.3)", flexShrink: 0,
                      display: "inline-block",
                    }} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — hidden on mobile */}
          {!isMobile && (
            <div style={{
              padding: "64px 72px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: C.cream,
            }}>
              <DarkCard />
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section ref={refHowItWorks} id="how-it-works" style={{ ...fadeInit, borderBottom: `1px solid ${C.border}` }}>
        {/* Header */}
        <div style={{
          padding: isMobile ? "40px 24px 28px" : "64px 72px 48px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "24px", height: "2px", background: C.gold }}></div>
            <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Transactions</span>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 400, lineHeight: 1.15, maxWidth: "700px" }}>
            Designed for agents that operate with real money.
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "14px", color: C.muted, marginTop: "16px", maxWidth: "580px", lineHeight: 1.65 }}>
            Your agent declares its intent. Olympay validates it against your policy in real time. If it clears, a payment instrument is issued and constrained to that specific action. Nothing more.
          </p>
        </div>

        {/* Steps */}
        <div>
          {STEPS.map((step, i) => (
            <div key={step.n} style={{
              display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr 200px",
              borderBottom: i < STEPS.length - 1 ? `1px solid ${C.border}` : "none",
              minHeight: isMobile ? "auto" : "120px",
            }}>
              {/* Step text */}
              <div style={{
                padding: isMobile ? "20px 24px 16px" : "32px 40px",
                borderRight: isMobile ? "none" : `1px solid ${C.border}`,
                borderBottom: isMobile ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.12em", marginBottom: "10px" }}>{step.n}</div>
                <div style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 600, color: C.black, marginBottom: "8px" }}>{step.title}</div>
                <div style={{ fontFamily: SANS, fontSize: "12px", color: C.muted, lineHeight: 1.65 }}>{step.desc}</div>
              </div>

              {/* Center visual — desktop only */}
              {!isMobile && <div style={{
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
              </div>}

              {/* Tag — desktop only */}
              {!isMobile && <div style={{
                padding: "32px 24px",
                display: "flex", alignItems: "center", justifyContent: "flex-start",
              }}>
                <Tag label={step.tag} accent={i === 2} />
              </div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={refFeatures} id="features" style={{ ...fadeInit, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: isMobile ? "40px 24px 28px" : "64px 80px 48px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "24px", height: "2px", background: C.gold }}></div>
            <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Features</span>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.15, maxWidth: "600px" }}>
            Infrastructure built for agents that transact at scale.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)" }}>
          {FEATURES.map((f, i) => (
            <div key={f.n} id={f.id} style={{
              padding: isMobile ? "24px 20px" : "40px 32px",
              borderRight: isMobile ? (i % 2 === 0 ? `1px solid ${C.border}` : "none") : (i < FEATURES.length - 1 ? `1px solid ${C.border}` : "none"),
              borderBottom: isMobile && i < 2 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ fontFamily: MONO, fontSize: "10px", color: C.muted, marginBottom: "20px" }}>{f.n}</div>
              <h3 style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 600, color: C.black, lineHeight: 1.4, marginBottom: "12px" }}>{f.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: "13px", color: C.muted, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ACCOUNTS ── */}
      <section ref={refAccounts} id="section-accounts" style={{ ...fadeInit, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", minHeight: isMobile ? "auto" : "640px" }}>

          {/* Left: copy */}
          <div style={{
            padding: isMobile ? "40px 24px" : "72px 72px",
            borderRight: isMobile ? "none" : `1px solid ${C.border}`,
            borderBottom: isMobile ? `1px solid ${C.border}` : "none",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "24px", height: "2px", background: C.gold }} />
              <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Accounts</span>
            </div>

            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.15, marginBottom: "20px", maxWidth: "420px" }}>
              One SDK. Full control over every agent account.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: "14px", color: C.muted, lineHeight: 1.7, marginBottom: "36px", maxWidth: "400px" }}>
              Provision accounts, rotate keys, assign agents, and adjust spending permissions from your terminal or inside your application code. Everything runs under a single API key prefixed with <code style={{ fontFamily: MONO, fontSize: "12px", color: C.gold, background: `${C.gold}10`, padding: "1px 5px", borderRadius: "2px" }}>olympay</code>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "36px" }}>
              {[
                { tag: "SDK",  desc: "Install @olympay/sdk and start provisioning accounts in under two minutes." },
                { tag: "CLI",  desc: "The olympay CLI lets you inspect, create, and manage accounts without writing code." },
                { tag: "KEYS", desc: "API keys are scoped to environments. Rotate them any time without downtime." },
                { tag: "RBAC", desc: "Assign roles to agents: read-only observers, spenders, or full account controllers." },
              ].map(item => (
                <div key={item.tag} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: C.gold, background: `${C.gold}12`, border: `1px solid ${C.gold}35`,
                    borderRadius: "2px", padding: "2px 6px", whiteSpace: "nowrap", marginTop: "2px",
                  }}>{item.tag}</span>
                  <span style={{ fontFamily: SANS, fontSize: "13px", color: C.muted, lineHeight: 1.6 }}>{item.desc}</span>
                </div>
              ))}
            </div>

            <button onClick={() => {}} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              width: "fit-content", padding: "11px 24px",
              fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em",
              fontWeight: 600, textTransform: "uppercase",
              background: "transparent", color: C.black,
              border: `1px solid ${C.border}`, borderRadius: "3px", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = C.gold; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.black; }}
            >
              VIEW SDK DOCS <ArrowRight size={12} />
            </button>
          </div>

          {/* Right: code panel mockup */}
          <div style={{
            padding: isMobile ? "32px 24px" : "48px 56px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: C.cream,
          }}>
            <div style={{
              width: "100%", maxWidth: "540px",
              background: "#0e0e0c", border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: "8px", overflow: "hidden",
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            }}>
              {/* Terminal topbar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "#161614",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f87171" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fbbf24" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4ade80" }} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>OLYMPAY SDK</span>
                <span style={{ fontFamily: MONO, fontSize: "8px", color: `${C.gold}99`, letterSpacing: "0.06em" }}>v1.0.0</span>
              </div>

              {/* Tab row */}
              <div style={{
                display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "#161614",
              }}>
                {["install.sh", "accounts.ts", "cli.sh"].map((tab, ti) => (
                  <div key={tab} style={{
                    padding: "8px 16px",
                    fontFamily: MONO, fontSize: "9px", letterSpacing: "0.06em",
                    color: ti === 1 ? C.gold : "rgba(255,255,255,0.3)",
                    borderBottom: ti === 1 ? `2px solid ${C.gold}` : "2px solid transparent",
                    cursor: "pointer",
                  }}>{tab}</div>
                ))}
              </div>

              {/* Code body */}
              <div style={{ padding: "20px 24px", fontFamily: MONO, fontSize: "12px", lineHeight: 1.75, overflowX: "auto" }}>

                {/* install comment */}
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ color: "rgba(255,255,255,0.22)" }}>{"// 1. install"}</span>
                  <br />
                  <span style={{ color: "#4ade80" }}>$</span>{" "}
                  <span style={{ color: "rgba(229,220,200,0.85)" }}>npm install </span>
                  <span style={{ color: C.gold }}>@olympay/sdk</span>
                </div>

                {/* init */}
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ color: "rgba(255,255,255,0.22)" }}>{"// 2. initialise client"}</span>
                  <br />
                  <span style={{ color: "#93c5fd" }}>import</span>{" "}
                  <span style={{ color: "rgba(229,220,200,0.85)" }}>{"{ Olympay }"}</span>{" "}
                  <span style={{ color: "#93c5fd" }}>from</span>{" "}
                  <span style={{ color: "#86efac" }}>'@olympay/sdk'</span>
                  <br />
                  <br />
                  <span style={{ color: "#c4b5fd" }}>const</span>{" "}
                  <span style={{ color: C.gold }}>olympay</span>{" "}
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>=</span>{" "}
                  <span style={{ color: "#93c5fd" }}>new</span>{" "}
                  <span style={{ color: "#fde68a" }}>Olympay</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>{"({"}</span>
                  <br />
                  <span style={{ color: "rgba(229,220,200,0.4)" }}>{"  "}</span>
                  <span style={{ color: "#f9a8d4" }}>apiKey</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>: </span>
                  <span style={{ color: "#86efac" }}>process.env.</span>
                  <span style={{ color: C.gold }}>OLYMPAY_API_KEY</span>
                  <br />
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>{"});"}</span>
                </div>

                {/* create account */}
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ color: "rgba(255,255,255,0.22)" }}>{"// 3. provision an agent account"}</span>
                  <br />
                  <span style={{ color: "#c4b5fd" }}>const</span>{" "}
                  <span style={{ color: "#fde68a" }}>account</span>{" "}
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>=</span>{" "}
                  <span style={{ color: "#93c5fd" }}>await</span>{" "}
                  <span style={{ color: C.gold }}>olympay</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>.</span>
                  <span style={{ color: "#f9a8d4" }}>accounts</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>.</span>
                  <span style={{ color: "#fde68a" }}>create</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>{"({"}</span>
                  <br />
                  <span style={{ color: "#f9a8d4" }}>{"  agentId"}</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>: </span>
                  <span style={{ color: "#86efac" }}>'agent_procurement_01'</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>,</span>
                  <br />
                  <span style={{ color: "#f9a8d4" }}>{"  name"}</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>:    </span>
                  <span style={{ color: "#86efac" }}>'Procurement Bot'</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>,</span>
                  <br />
                  <span style={{ color: "#f9a8d4" }}>{"  currency"}</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>: </span>
                  <span style={{ color: "#86efac" }}>'USD'</span>
                  <br />
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>{"});"}</span>
                </div>

                {/* assign policy */}
                <div>
                  <span style={{ color: "rgba(255,255,255,0.22)" }}>{"// 4. attach spending policy"}</span>
                  <br />
                  <span style={{ color: "#93c5fd" }}>await</span>{" "}
                  <span style={{ color: C.gold }}>olympay</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>.</span>
                  <span style={{ color: "#f9a8d4" }}>accounts</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>.</span>
                  <span style={{ color: "#fde68a" }}>attachPolicy</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>{"({"}</span>
                  <br />
                  <span style={{ color: "#f9a8d4" }}>{"  accountId"}</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>: </span>
                  <span style={{ color: "#fde68a" }}>account</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>.</span>
                  <span style={{ color: "#f9a8d4" }}>id</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>,</span>
                  <br />
                  <span style={{ color: "#f9a8d4" }}>{"  policyId"}</span>
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>: </span>
                  <span style={{ color: "#86efac" }}>'pol_daily_500'</span>
                  <br />
                  <span style={{ color: "rgba(229,220,200,0.6)" }}>{"});"}</span>
                </div>
              </div>

              {/* CLI strip at bottom */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "#161614", padding: "12px 24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    { prompt: "$", cmd: "olympay accounts list", out: null },
                    { prompt: " ", cmd: null, out: "acct_01  Procurement Bot  ACTIVE  USD" },
                    { prompt: " ", cmd: null, out: "acct_02  Research Agent   ACTIVE  USD" },
                    { prompt: "$", cmd: "olympay agents status agent_procurement_01", out: null },
                    { prompt: " ", cmd: null, out: "status: ACTIVE   policy: pol_daily_500" },
                  ].map((line, li) => (
                    <div key={li} style={{ display: "flex", gap: "8px", fontFamily: MONO, fontSize: "10px" }}>
                      <span style={{ color: line.prompt === "$" ? "#4ade80" : "transparent", userSelect: "none" }}>$</span>
                      {line.cmd
                        ? <span><span style={{ color: C.gold }}>olympay</span><span style={{ color: "rgba(229,220,200,0.7)" }}>{line.cmd.slice("olympay".length)}</span></span>
                        : <span style={{ color: "rgba(255,255,255,0.35)" }}>{line.out}</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CARDS ── */}
      <section ref={refCards} id="section-cards" style={{ ...fadeInit, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", minHeight: isMobile ? "auto" : "600px" }}>

          {/* Left: copy */}
          <div style={{
            padding: isMobile ? "40px 24px" : "72px 72px",
            borderRight: isMobile ? "none" : `1px solid ${C.border}`,
            borderBottom: isMobile ? `1px solid ${C.border}` : "none",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "24px", height: "2px", background: C.gold }} />
              <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Cards</span>
            </div>

            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.15, marginBottom: "20px", maxWidth: "420px" }}>
              Every agent gets its own card. Scoped, trackable, revocable.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: "14px", color: C.muted, lineHeight: 1.7, marginBottom: "36px", maxWidth: "400px" }}>
              Issue virtual cards to any agent in milliseconds via API. Each card carries its own spend policy, merchant restrictions, and velocity controls. Enable or disable spending without touching the agent.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { tag: "DISPOSABLE",   desc: "One-time cards that expire immediately after a single approved transaction." },
                { tag: "PERSISTENT",   desc: "Long-lived cards with daily limits, time windows, and merchant locks." },
                { tag: "INSTANT_REVOKE", desc: "Kill spending on any card in one API call. No lag, no partial charges." },
                { tag: "AUDIT_TRAIL",  desc: "Every authorization logged against the original intent record." },
              ].map(item => (
                <div key={item.tag} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: C.gold, background: `${C.gold}12`, border: `1px solid ${C.gold}35`,
                    borderRadius: "2px", padding: "2px 6px", whiteSpace: "nowrap", marginTop: "2px",
                  }}>{item.tag}</span>
                  <span style={{ fontFamily: SANS, fontSize: "13px", color: C.muted, lineHeight: 1.6 }}>{item.desc}</span>
                </div>
              ))}
            </div>

            <button onClick={() => {}} style={{
              marginTop: "40px", display: "inline-flex", alignItems: "center", gap: "8px",
              width: "fit-content", padding: "11px 24px",
              fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em",
              fontWeight: 600, textTransform: "uppercase",
              background: "transparent", color: C.black,
              border: `1px solid ${C.border}`, borderRadius: "3px", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = C.gold; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.black; }}
            >
              VIEW API REFERENCE <ArrowRight size={12} />
            </button>
          </div>

          {/* Right: dashboard mockup */}
          <div style={{
            padding: isMobile ? "32px 24px" : "48px 56px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: C.cream,
          }}>
            <div style={{
              width: "100%", maxWidth: "520px",
              background: "#fff", border: `1px solid ${C.border}`,
              borderRadius: "8px", overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}>
              {/* Mock topbar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f87171" }} />
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fbbf24" }} />
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" }} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>VIRTUAL CARDS</span>
                <span style={{
                  fontFamily: MONO, fontSize: "8px", color: C.gold,
                  background: `${C.gold}12`, border: `1px solid ${C.gold}35`,
                  borderRadius: "3px", padding: "2px 8px",
                }}>+ ISSUE CARD</span>
              </div>

              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "140px 90px 70px 1fr 80px",
                padding: "8px 20px",
                background: C.cream, borderBottom: `1px solid ${C.border}`,
              }}>
                {["Card", "Agent", "Status", "Policy", "Spending"].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>

              {/* Card rows */}
              {[
                { last4: "7842", brand: "MC",    agent: "PROCUREMENT-BOT", status: "ACTIVE",  policy: "CONTRACTORS",  enabled: true  },
                { last4: "3291", brand: "VISA",  agent: "RESEARCH-AGENT",  status: "ACTIVE",  policy: "SAAS_SPEND",   enabled: true  },
                { last4: "5544", brand: "MC",    agent: "TRAVEL-BOT",      status: "PAUSED",  policy: "TRAVEL_LIMIT", enabled: false },
                { last4: "8810", brand: "VISA",  agent: "ANALYTICS-AI",    status: "ACTIVE",  policy: "MONTHLY_CAP",  enabled: true  },
              ].map((card, ci) => (
                <div
                  key={card.last4}
                  style={{
                    display: "grid", gridTemplateColumns: "140px 90px 70px 1fr 80px",
                    padding: "12px 20px", alignItems: "center",
                    borderBottom: ci < 3 ? `1px solid ${C.border}` : "none",
                    background: ci % 2 === 0 ? "transparent" : `${C.cream}60`,
                  }}
                >
                  {/* Card number */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      height: "22px", width: "34px", background: C.black, borderRadius: "2px",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: MONO, fontSize: "6px", color: C.gold, fontWeight: 700 }}>{card.brand}</span>
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: "11px", color: C.black }}>•••• {card.last4}</span>
                  </div>
                  {/* Agent */}
                  <span style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.04em" }}>{card.agent}</span>
                  {/* Status */}
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", fontWeight: 700,
                    color: card.status === "ACTIVE" ? "#16a34a" : "#92400e",
                    background: card.status === "ACTIVE" ? "#f0fdf4" : "#fffbeb",
                    border: `1px solid ${card.status === "ACTIVE" ? "#bbf7d0" : "#fde68a"}`,
                    borderRadius: "3px", padding: "2px 6px", display: "inline-block",
                  }}>{card.status}</span>
                  {/* Policy */}
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", color: C.gold,
                    background: `${C.gold}10`, border: `1px solid ${C.gold}30`,
                    borderRadius: "3px", padding: "2px 6px", display: "inline-block",
                    letterSpacing: "0.04em",
                  }}>{card.policy}</span>
                  {/* Spending toggle */}
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", fontWeight: 700,
                    color: card.enabled ? "#16a34a" : "#78716c",
                    background: card.enabled ? "#f0fdf4" : "#f5f5f4",
                    border: `1px solid ${card.enabled ? "#bbf7d0" : "#d6d3d1"}`,
                    borderRadius: "3px", padding: "2px 8px", display: "inline-block",
                  }}>{card.enabled ? "ENABLED" : "DISABLED"}</span>
                </div>
              ))}

              {/* Footer stats */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                borderTop: `1px solid ${C.border}`,
                background: C.cream,
              }}>
                {[
                  { label: "Cards Issued",    val: "247" },
                  { label: "Spend Controlled", val: "$1.2M" },
                  { label: "Fraud Blocked",   val: "100%" },
                ].map((stat, si) => (
                  <div key={stat.label} style={{
                    padding: "14px 20px",
                    borderRight: si < 2 ? `1px solid ${C.border}` : "none",
                    textAlign: "center",
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: "14px", fontWeight: 700, color: C.black }}>{stat.val}</div>
                    <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, letterSpacing: "0.08em", marginTop: "3px", textTransform: "uppercase" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POLICIES ── */}
      <section ref={refPolicies} id="section-policies" style={{ ...fadeInit, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", minHeight: isMobile ? "auto" : "600px" }}>

          {/* Right: mockup first (mirrored layout vs Cards) */}
          <div style={{
            padding: isMobile ? "32px 24px" : "48px 56px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: C.cream,
            borderRight: isMobile ? "none" : `1px solid ${C.border}`,
            borderBottom: isMobile ? `1px solid ${C.border}` : "none",
          }}>
            <div style={{
              width: "100%", maxWidth: "520px",
              background: "#fff", border: `1px solid ${C.border}`,
              borderRadius: "8px", overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}>
              {/* Mock topbar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f87171" }} />
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fbbf24" }} />
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" }} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>SPEND POLICIES</span>
                <span style={{
                  fontFamily: MONO, fontSize: "8px", color: C.gold,
                  background: `${C.gold}12`, border: `1px solid ${C.gold}35`,
                  borderRadius: "3px", padding: "2px 8px",
                }}>+ CREATE POLICY</span>
              </div>

              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 110px 60px 130px",
                padding: "8px 20px",
                background: C.cream, borderBottom: `1px solid ${C.border}`,
              }}>
                {["Policy Name", "Type", "Status", "Configuration"].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>

              {/* Policy rows */}
              {[
                {
                  name: "Daily $500 Limit",   desc: "Procurement agents",
                  type: "SPEND_LIMIT",         typeColor: "#c2410c", typeBg: "#fff7ed", typeBorder: "#fed7aa",
                  status: "ACTIVE",
                  config: '{ "max": 50000,\n  "window": "daily" }',
                },
                {
                  name: "SaaS Vendors Only",   desc: "Software subscriptions",
                  type: "MERCHANT_ALLOWLIST",  typeColor: "#1d4ed8", typeBg: "#eff6ff", typeBorder: "#bfdbfe",
                  status: "ACTIVE",
                  config: '{ "ids": ["stripe",\n  "aws", "gh"] }',
                },
                {
                  name: "High Value Approval", desc: "> $1,000 requires sign-off",
                  type: "APPROVAL_REQUIRED",   typeColor: "#7c3aed", typeBg: "#f5f3ff", typeBorder: "#ddd6fe",
                  status: "ACTIVE",
                  config: '{ "threshold":\n  100000 }',
                },
                {
                  name: "Monthly Travel Cap",  desc: "Travel and hotels",
                  type: "SPEND_LIMIT",         typeColor: "#c2410c", typeBg: "#fff7ed", typeBorder: "#fed7aa",
                  status: "INACTIVE",
                  config: '{ "max": 200000,\n  "window": "monthly" }',
                },
              ].map((pol, pi) => (
                <div key={pol.name} style={{
                  display: "grid", gridTemplateColumns: "1fr 110px 60px 130px",
                  padding: "11px 20px", alignItems: "center",
                  borderBottom: pi < 3 ? `1px solid ${C.border}` : "none",
                  background: pi % 2 === 0 ? "transparent" : `${C.cream}60`,
                }}>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 500, color: C.black }}>{pol.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, marginTop: "2px" }}>{pol.desc}</div>
                  </div>
                  <span style={{
                    fontFamily: MONO, fontSize: "7px", fontWeight: 700, letterSpacing: "0.04em",
                    color: pol.typeColor, background: pol.typeBg, border: `1px solid ${pol.typeBorder}`,
                    borderRadius: "3px", padding: "2px 5px", display: "inline-block",
                  }}>{pol.type}</span>
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", fontWeight: 700,
                    color: pol.status === "ACTIVE" ? "#16a34a" : "#78716c",
                    background: pol.status === "ACTIVE" ? "#f0fdf4" : "#f5f5f4",
                    border: `1px solid ${pol.status === "ACTIVE" ? "#bbf7d0" : "#d6d3d1"}`,
                    borderRadius: "3px", padding: "2px 6px", display: "inline-block",
                  }}>{pol.status}</span>
                  <pre style={{
                    fontFamily: MONO, fontSize: "8px", color: C.muted,
                    background: C.cream, border: `1px solid ${C.border}`,
                    borderRadius: "3px", padding: "5px 7px",
                    margin: 0, lineHeight: 1.5,
                  }}>{pol.config}</pre>
                </div>
              ))}

              {/* Footer stats */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                borderTop: `1px solid ${C.border}`,
                background: C.cream,
              }}>
                {[
                  { label: "Active Policies", val: "18" },
                  { label: "Verdicts / Day",  val: "4.3K" },
                  { label: "Deny Rate",       val: "2.1%" },
                ].map((stat, si) => (
                  <div key={stat.label} style={{
                    padding: "14px 20px",
                    borderRight: si < 2 ? `1px solid ${C.border}` : "none",
                    textAlign: "center",
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: "14px", fontWeight: 700, color: C.black }}>{stat.val}</div>
                    <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, letterSpacing: "0.08em", marginTop: "3px", textTransform: "uppercase" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Left: copy */}
          <div style={{
            padding: isMobile ? "40px 24px" : "72px 72px",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "24px", height: "2px", background: C.gold }} />
              <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Policies</span>
            </div>

            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.15, marginBottom: "20px", maxWidth: "420px" }}>
              Rules that enforce themselves before a cent moves.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: "14px", color: C.muted, lineHeight: 1.7, marginBottom: "36px", maxWidth: "400px" }}>
              Attach a policy to any agent or card and it runs automatically on every transaction. No middleware, no manual review unless you require it. Three types cover every control scenario.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  type: "SPEND_LIMIT",
                  color: "#c2410c", bg: "#fff7ed", border: "#fed7aa",
                  desc: "Cap daily, weekly, or monthly spend per agent. Transactions that exceed the window are automatically denied.",
                },
                {
                  type: "MERCHANT_ALLOWLIST",
                  color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe",
                  desc: "Restrict charges to a pre-approved list of merchant IDs. Any unknown vendor is blocked before authorization.",
                },
                {
                  type: "APPROVAL_REQUIRED",
                  color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
                  desc: "Escalate any transaction above a threshold to a human reviewer. Funds are held until approved or rejected.",
                },
              ].map(item => (
                <div key={item.type} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", fontWeight: 700,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    color: item.color, background: item.bg, border: `1px solid ${item.border}`,
                    borderRadius: "3px", padding: "3px 7px", whiteSpace: "nowrap", marginTop: "2px",
                    flexShrink: 0,
                  }}>{item.type}</span>
                  <span style={{ fontFamily: SANS, fontSize: "13px", color: C.muted, lineHeight: 1.65 }}>{item.desc}</span>
                </div>
              ))}
            </div>

            <button onClick={() => {}} style={{
              marginTop: "40px", display: "inline-flex", alignItems: "center", gap: "8px",
              width: "fit-content", padding: "11px 24px",
              fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em",
              fontWeight: 600, textTransform: "uppercase",
              background: "transparent", color: C.black,
              border: `1px solid ${C.border}`, borderRadius: "3px", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = C.gold; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.black; }}
            >
              VIEW POLICY DOCS <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* ── AUDIT LOGS ── */}
      <section ref={refAudit} id="section-audit" style={{ ...fadeInit, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", minHeight: isMobile ? "auto" : "600px" }}>

          {/* Left: copy */}
          <div style={{
            padding: isMobile ? "40px 24px" : "72px 72px",
            borderRight: isMobile ? "none" : `1px solid ${C.border}`,
            borderBottom: isMobile ? `1px solid ${C.border}` : "none",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "24px", height: "2px", background: C.gold }} />
              <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Audit Logs</span>
            </div>

            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.15, marginBottom: "20px", maxWidth: "420px" }}>
              Every decision recorded. Every cent accounted for.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: "14px", color: C.muted, lineHeight: 1.7, marginBottom: "36px", maxWidth: "400px" }}>
              An immutable event stream captures every action taken by agents, policies, and humans. Query any transaction, replicate any decision, and prove compliance in seconds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  tag: "IMMUTABLE",
                  desc: "Log entries are append-only and cryptographically sealed. No retroactive edits, ever.",
                },
                {
                  tag: "REAL_TIME",
                  desc: "Events stream to your dashboard within milliseconds of each agent action.",
                },
                {
                  tag: "QUERYABLE",
                  desc: "Filter by agent, card, policy, verdict, or time window via API or dashboard.",
                },
                {
                  tag: "EXPORTABLE",
                  desc: "Download full CSV exports for any date range to satisfy audit or compliance requirements.",
                },
              ].map(item => (
                <div key={item.tag} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: C.gold, background: `${C.gold}12`, border: `1px solid ${C.gold}35`,
                    borderRadius: "2px", padding: "2px 6px", whiteSpace: "nowrap", marginTop: "2px",
                    flexShrink: 0,
                  }}>{item.tag}</span>
                  <span style={{ fontFamily: SANS, fontSize: "13px", color: C.muted, lineHeight: 1.6 }}>{item.desc}</span>
                </div>
              ))}
            </div>

            <button onClick={() => {}} style={{
              marginTop: "40px", display: "inline-flex", alignItems: "center", gap: "8px",
              width: "fit-content", padding: "11px 24px",
              fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em",
              fontWeight: 600, textTransform: "uppercase",
              background: "transparent", color: C.black,
              border: `1px solid ${C.border}`, borderRadius: "3px", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = C.gold; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.black; }}
            >
              VIEW LOG SCHEMA <ArrowRight size={12} />
            </button>
          </div>

          {/* Right: live audit log feed mockup */}
          <div style={{
            padding: isMobile ? "32px 24px" : "48px 56px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: C.cream,
          }}>
            <div style={{
              width: "100%", maxWidth: "520px",
              background: "#fff", border: `1px solid ${C.border}`,
              borderRadius: "8px", overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}>
              {/* Mock topbar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f87171" }} />
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fbbf24" }} />
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
                  <span style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>AUDIT LOG — LIVE</span>
                </div>
                <span style={{
                  fontFamily: MONO, fontSize: "8px", color: C.muted,
                  background: C.cream, border: `1px solid ${C.border}`,
                  borderRadius: "3px", padding: "2px 8px",
                }}>EXPORT CSV</span>
              </div>

              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "80px 1fr 120px 100px",
                padding: "8px 20px",
                background: C.cream, borderBottom: `1px solid ${C.border}`,
              }}>
                {["Time", "Action", "Entity", "Actor"].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>

              {/* Log rows */}
              {[
                { time: "14:22:01", action: "CARD_ISSUED",      actionColor: "#16a34a", actionBg: "#f0fdf4", actionBorder: "#bbf7d0", entity: "card · ••7842",   actor: "PROCUREMENT-BOT" },
                { time: "14:22:03", action: "POLICY_ATTACHED",  actionColor: "#1d4ed8", actionBg: "#eff6ff", actionBorder: "#bfdbfe", entity: "policy · CONTRACTORS", actor: "SYSTEM" },
                { time: "14:22:48", action: "TXN_ALLOWED",      actionColor: "#16a34a", actionBg: "#f0fdf4", actionBorder: "#bbf7d0", entity: "txn · t_92xk",    actor: "PROCUREMENT-BOT" },
                { time: "14:31:17", action: "TXN_DENIED",       actionColor: "#b91c1c", actionBg: "#fef2f2", actionBorder: "#fecaca", entity: "txn · t_08mz",    actor: "RESEARCH-AGENT" },
                { time: "14:35:50", action: "APPROVAL_SENT",    actionColor: "#7c3aed", actionBg: "#f5f3ff", actionBorder: "#ddd6fe", entity: "txn · t_44qr",    actor: "ANALYTICS-AI" },
                { time: "14:36:12", action: "CARD_PAUSED",      actionColor: "#92400e", actionBg: "#fffbeb", actionBorder: "#fde68a", entity: "card · ••5544",   actor: "user@olympay.io" },
              ].map((row, ri) => (
                <div key={row.time + ri} style={{
                  display: "grid", gridTemplateColumns: "80px 1fr 120px 100px",
                  padding: "10px 20px", alignItems: "center",
                  borderBottom: ri < 5 ? `1px solid ${C.border}` : "none",
                  background: ri % 2 === 0 ? "transparent" : `${C.cream}60`,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: "9px", color: C.muted }}>{row.time}</span>
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", fontWeight: 700, letterSpacing: "0.04em",
                    color: row.actionColor, background: row.actionBg, border: `1px solid ${row.actionBorder}`,
                    borderRadius: "3px", padding: "2px 6px", display: "inline-block",
                  }}>{row.action}</span>
                  <span style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, letterSpacing: "0.03em" }}>{row.entity}</span>
                  <span style={{ fontFamily: MONO, fontSize: "9px", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.actor}</span>
                </div>
              ))}

              {/* Footer stats */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                borderTop: `1px solid ${C.border}`,
                background: C.cream,
              }}>
                {[
                  { label: "Events Today",  val: "12.4K" },
                  { label: "Retention",     val: "5 Yrs" },
                  { label: "Avg Latency",   val: "< 20ms" },
                ].map((stat, si) => (
                  <div key={stat.label} style={{
                    padding: "14px 20px",
                    borderRight: si < 2 ? `1px solid ${C.border}` : "none",
                    textAlign: "center",
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: "14px", fontWeight: 700, color: C.black }}>{stat.val}</div>
                    <div style={{ fontFamily: MONO, fontSize: "8px", color: C.muted, letterSpacing: "0.08em", marginTop: "3px", textTransform: "uppercase" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section ref={refUseCases} id="use-cases" style={{ ...fadeInit, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: isMobile ? "40px 24px 28px" : "64px 80px 48px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "24px", height: "2px", background: C.gold }}></div>
            <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>Agents</span>
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
                display: "grid", gridTemplateColumns: isMobile ? "1fr auto" : "80px 1fr 60px",
                padding: isMobile ? "20px 24px" : "28px 80px",
                borderBottom: i < USE_CASES.length - 1 ? `1px solid ${C.border}` : "none",
                cursor: "pointer", transition: "background 0.15s",
                alignItems: "center",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,146,58,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {!isMobile && <span style={{ fontFamily: MONO, fontSize: "11px", color: C.muted }}>{uc.n}</span>}
              <div>
                <div style={{ fontFamily: SANS, fontSize: isMobile ? "15px" : "17px", fontWeight: 500, color: C.black, marginBottom: "3px" }}>{uc.title}</div>
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
      <section ref={refIntegration} id="integration" style={{ ...fadeInit, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: isMobile ? "40px 24px 28px" : "64px 80px 48px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "24px", height: "2px", background: C.gold }}></div>
            <span style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>API</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Tag label="SETUP" />
            <ArrowRight size={12} color={C.muted} />
            <Tag label="LIVE" accent />
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 400 }}>From API key to first transaction in minutes.</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)" }}>
          {[
            { n: "Step 01", title: "Connect and configure", items: ["Register your workspace and retrieve API credentials", "Invite teammates and set permission levels"] },
            { n: "Step 02", title: "Write your policies", items: ["Encode spending rules, merchant allowlists, and approval thresholds", "Link policies to specific agents or agent groups"] },
            { n: "Step 03", title: "Deploy and monitor", items: ["Agents begin transacting within their defined boundaries", "Every decision streams to your dashboard in real time"] },
          ].map((step, i) => (
            <div key={step.n} style={{
              padding: isMobile ? "28px 24px" : "48px 40px",
              borderRight: isMobile ? "none" : (i < 2 ? `1px solid ${C.border}` : "none"),
              borderBottom: isMobile && i < 2 ? `1px solid ${C.border}` : "none",
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
          padding: isMobile ? "40px 24px" : "64px 80px",
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
        padding: isMobile ? "24px 24px" : "32px 80px",
        borderTop: `1px solid ${C.border}`,
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: isMobile ? "16px" : "0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity size={13} color={C.gold} />
          <span style={{ fontFamily: MONO, fontSize: "10px", color: C.muted, letterSpacing: "0.08em" }}>OLYMPAY</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: "12px", color: C.muted }}>
          Spend infrastructure for autonomous AI. Olympay is not a bank.
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
