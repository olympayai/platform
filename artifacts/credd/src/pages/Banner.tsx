import olympayLogo from "@/assets/logo.png";

const SERIF = "'Playfair Display', Georgia, serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SANS  = "'Inter', system-ui, sans-serif";

const CREAM  = "#f4ede0";
const BLACK  = "#0a0a08";
const GOLD   = "#b8873a";
const GOLD2  = "#c4923a";
const MUTED  = "rgba(10,10,8,0.38)";
const BORDER = "rgba(10,10,8,0.12)";

const LOGO_GOLD = "brightness(0) saturate(100%) invert(55%) sepia(48%) saturate(601%) hue-rotate(8deg) brightness(88%)";

function Barcode() {
  const bars = [3,1,2,1,3,2,1,2,3,1,2,1,1,3,2,1,2,3,1,2,2,1,3,1,2,3,1,2,1,3];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5px", height: "28px" }}>
      {bars.map((w, i) => (
        <div key={i} style={{
          width: `${w}px`,
          height: i % 4 === 0 ? "28px" : i % 3 === 0 ? "22px" : "18px",
          background: BLACK,
          opacity: 0.75,
        }} />
      ))}
    </div>
  );
}

function CardMockup() {
  return (
    <div style={{
      width: "380px",
      background: "linear-gradient(135deg, #161410 0%, #0e0c0a 60%, #1a1510 100%)",
      borderRadius: "16px",
      padding: "28px 28px 24px",
      boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.08)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "180px", height: "180px",
        background: `radial-gradient(circle, ${GOLD2}22 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "6px",
            background: "rgba(196,146,58,0.14)", border: "1px solid rgba(196,146,58,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={olympayLogo} alt="Olympay" style={{ width: "18px", height: "18px", filter: LOGO_GOLD }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(229,220,200,0.85)", fontWeight: 700, letterSpacing: "0.07em" }}>OLYMPAY</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(255,255,255,0.12)", marginRight: "-8px", zIndex: 1 }} />
          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: `${GOLD2}55` }} />
        </div>
      </div>

      {/* Chip */}
      <div style={{
        width: "40px", height: "30px", borderRadius: "5px",
        background: `linear-gradient(135deg, ${GOLD2}cc, ${GOLD}88)`,
        marginBottom: "22px",
        border: "1px solid rgba(255,255,255,0.15)",
      }} />

      {/* Card number */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px",
        fontFamily: MONO, fontSize: "13px", color: "rgba(229,220,200,0.55)", letterSpacing: "0.15em",
      }}>
        <span>••••</span><span>••••</span><span>••••</span><span style={{ color: "rgba(229,220,200,0.85)" }}>7842</span>
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: "8px", color: "rgba(229,220,200,0.35)", letterSpacing: "0.1em", marginBottom: "4px" }}>AGENT</div>
          <div style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(229,220,200,0.9)", fontWeight: 700, letterSpacing: "0.06em" }}>PROCUREMENT-BOT</div>
          <div style={{ display: "flex", gap: "14px", marginTop: "8px" }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: "7px", color: "rgba(229,220,200,0.3)", letterSpacing: "0.1em", marginBottom: "2px" }}>VALID THRU</div>
              <div style={{ fontFamily: MONO, fontSize: "10px", color: "rgba(229,220,200,0.7)" }}>12 / 27</div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: "7px", color: "rgba(229,220,200,0.3)", letterSpacing: "0.1em", marginBottom: "2px" }}>CVV</div>
              <div style={{ fontFamily: MONO, fontSize: "10px", color: "rgba(229,220,200,0.7)" }}>•••</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: MONO, fontSize: "7px", color: "rgba(229,220,200,0.3)", letterSpacing: "0.1em", marginBottom: "4px" }}>SPEND LIMIT</div>
          <div style={{ fontFamily: MONO, fontSize: "22px", color: GOLD2, fontWeight: 700 }}>
            $1,500<span style={{ fontSize: "11px", opacity: 0.6 }}>.00</span>
          </div>
          <div style={{
            marginTop: "6px",
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "2px 7px",
            background: "rgba(74,222,128,0.12)",
            border: "1px solid rgba(74,222,128,0.25)",
            borderRadius: "3px",
          }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ fontFamily: MONO, fontSize: "7px", color: "#4ade80", letterSpacing: "0.08em" }}>ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountPanel() {
  return (
    <div style={{
      width: "380px", marginTop: "16px",
      background: CREAM,
      border: `1px solid ${BORDER}`,
      borderRadius: "10px",
      padding: "18px 22px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "14px", paddingBottom: "12px",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <img src={olympayLogo} alt="Olympay" style={{ width: "13px", height: "13px", filter: LOGO_GOLD }} />
          <span style={{ fontFamily: MONO, fontSize: "8px", color: BLACK, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Virtual Account</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontFamily: MONO, fontSize: "7px", color: MUTED }}>ACH</span>
          <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: MUTED }} />
          <span style={{ fontFamily: MONO, fontSize: "7px", color: MUTED }}>Fedwire</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
        {[
          { label: "ACCOUNT HOLDER", value: "PROCUREMENT-BOT", dot: true },
          { label: "POLICY", value: "CONTRACTORS", tag: true },
          { label: "ROUTING", value: "021 000 021" },
          { label: "BALANCE", value: "$12,400.00", bold: true },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontFamily: MONO, fontSize: "7px", color: MUTED, letterSpacing: "0.1em", marginBottom: "4px" }}>{item.label}</div>
            {item.dot ? (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80" }} />
                <span style={{ fontFamily: MONO, fontSize: "9px", color: BLACK, fontWeight: 600, letterSpacing: "0.04em" }}>{item.value}</span>
              </div>
            ) : item.tag ? (
              <span style={{
                display: "inline-block",
                fontFamily: MONO, fontSize: "8px", fontWeight: 700,
                color: GOLD, background: `${GOLD2}15`,
                border: `1px solid ${GOLD2}40`, borderRadius: "3px",
                padding: "2px 7px", letterSpacing: "0.06em",
              }}>{item.value}</span>
            ) : (
              <span style={{ fontFamily: MONO, fontSize: "10px", color: item.bold ? BLACK : "rgba(10,10,8,0.65)", fontWeight: item.bold ? 700 : 400 }}>{item.value}</span>
            )}
          </div>
        ))}
        <div style={{ gridColumn: "1 / -1", borderTop: `1px solid ${BORDER}`, paddingTop: "10px" }}>
          <div style={{ fontFamily: MONO, fontSize: "7px", color: MUTED, letterSpacing: "0.1em", marginBottom: "4px" }}>ACCOUNT NUMBER</div>
          <div style={{ fontFamily: MONO, fontSize: "11px", color: BLACK, letterSpacing: "0.12em" }}>•••• •••• 4891</div>
        </div>
      </div>
    </div>
  );
}

export default function BannerPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#e8e2d8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
    }}>
      {/* ── BANNER FRAME ── */}
      <div id="olympay-banner" style={{
        width: "1400px",
        height: "788px",
        background: CREAM,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        boxShadow: "0 32px 120px rgba(0,0,0,0.22)",
      }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{
          flex: "0 0 820px",
          display: "flex",
          flexDirection: "column",
          padding: "44px 56px",
          position: "relative",
        }}>

          {/* ── TOP META ROW ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "auto" }}>
            {/* Category label */}
            <div>
              <div style={{ fontFamily: MONO, fontSize: "9px", color: BLACK, fontWeight: 700, letterSpacing: "0.14em", lineHeight: 1.5 }}>
                FINANCIAL<br />PLATFORM
              </div>
            </div>

            {/* Center meta block */}
            <div style={{ textAlign: "left", maxWidth: "220px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontFamily: MONO, fontSize: "9px", color: BLACK,
                letterSpacing: "0.1em", marginBottom: "8px",
              }}>
                <img src={olympayLogo} alt="" style={{ width: "12px", height: "12px", filter: LOGO_GOLD }} />
                <span style={{ color: GOLD, fontWeight: 700 }}>O</span>
                <span>|</span>
                <span style={{ color: GOLD, fontWeight: 700 }}>P</span>
                <span>|</span>
                <span style={{ color: GOLD, fontWeight: 700 }}>A</span>
                <span style={{ fontFamily: MONO, fontSize: "9px", color: MUTED }}>2025</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: "8px", color: MUTED, lineHeight: 1.6, letterSpacing: "0.04em" }}>
                SPEND INFRASTRUCTURE<br />
                FOR AUTONOMOUS AI<br />
                AGENTS · VERSION 1.0
              </div>
              <div style={{ marginTop: "10px" }}>
                <Barcode />
              </div>
              <div style={{ fontFamily: MONO, fontSize: "7px", color: MUTED, letterSpacing: "0.08em", marginTop: "5px" }}>
                OLP-2025-0001-FINANCIAL
              </div>
            </div>

            {/* Empty spacer matching right strip width */}
            <div style={{ width: "60px" }} />
          </div>

          {/* ── BIG HEADLINE ── */}
          <div style={{ marginTop: "32px", lineHeight: 0.88 }}>
            <div style={{
              fontFamily: SERIF,
              fontSize: "188px",
              fontWeight: 700,
              color: BLACK,
              letterSpacing: "-0.02em",
              display: "block",
            }}>
              FULL
            </div>
            <div style={{
              fontFamily: SERIF,
              fontSize: "188px",
              fontWeight: 700,
              color: GOLD,
              letterSpacing: "-0.02em",
              display: "block",
              marginTop: "-8px",
            }}>
              CONTROL
            </div>
          </div>

          {/* ── BOTTOM META ── */}
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            marginTop: "auto", paddingTop: "24px",
          }}>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: MUTED, lineHeight: 1.7, letterSpacing: "0.04em" }}>
              SZE: PAGE 1 · OLYMPAY · 2025<br />
              REV: V1.0 · PRODUCTION
            </div>
            <div style={{ maxWidth: "300px" }}>
              <p style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(10,10,8,0.5)", lineHeight: 1.75, letterSpacing: "0.01em" }}>
                OLYMPAY TRANSLATES SEAMLESSLY INTO AGENT-NATIVE FINANCIAL INFRASTRUCTURE.
                ACCOUNTS, VIRTUAL CARDS, AND PROGRAMMABLE POLICIES THAT OPERATE AT MACHINE SPEED.
              </p>
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div style={{
          flex: 1,
          background: `linear-gradient(160deg, #181410 0%, #0e0c0a 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "40px 32px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle center glow */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px", height: "400px",
            background: `radial-gradient(circle, ${GOLD2}0f 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          {/* Top label */}
          <div style={{
            position: "absolute", top: "28px", left: "36px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <div style={{ width: "16px", height: "1px", background: `${GOLD2}44` }} />
            <span style={{ fontFamily: MONO, fontSize: "8px", color: `${GOLD2}66`, letterSpacing: "0.14em" }}>ASCII · LOGO</span>
          </div>

          {/* ASCII ART — semi-transparent */}
          <pre style={{
            fontFamily: MONO,
            fontSize: "10.5px",
            lineHeight: 1.35,
            color: GOLD2,
            opacity: 0.18,
            letterSpacing: "0.02em",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "pre",
            margin: 0,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}>{`
 ██████╗ ██╗      ██╗   ██╗███╗   ███╗██████╗  █████╗ ██╗   ██╗
██╔═══██╗██║      ╚██╗ ██╔╝████╗ ████║██╔══██╗██╔══██╗╚██╗ ██╔╝
██║   ██║██║       ╚████╔╝ ██╔████╔██║██████╔╝███████║ ╚████╔╝ 
██║   ██║██║        ╚██╔╝  ██║╚██╔╝██║██╔═══╝ ██╔══██║  ╚██╔╝  
╚██████╔╝███████╗   ██║   ██║ ╚═╝ ██║██║     ██║  ██║   ██║   
 ╚═════╝ ╚══════╝   ╚═╝   ╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   `}</pre>

          {/* ASCII icon symbol — center, slightly more visible */}
          <pre style={{
            fontFamily: MONO,
            fontSize: "12px",
            lineHeight: 1.4,
            color: GOLD2,
            opacity: 0.32,
            letterSpacing: "0.04em",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "pre",
            margin: 0,
            position: "relative",
            zIndex: 1,
            textAlign: "center",
          }}>{`
        · · · · · · · · ·
      ·                   ·
    ·   ╔═══════════════╗   ·
    ·   ║               ║   ·
    ·   ║   ╔═══════╗   ║   ·
    ·   ║   ║ ◈ ◈ ◈ ║   ║   ·
    ·   ║   ║       ║   ║   ·
    ·   ║   ╚═══════╝   ║   ·
    ·   ║               ║   ·
    ·   ╚═══════════════╝   ·
      ·                   ·
        · · · · · · · · ·

          [ OLYMPAY ]
      ── ── ── ── ── ── ──
      FINANCIAL  PLATFORM
      FOR  AUTONOMOUS  AI
      ── ── ── ── ── ── ──
      v1.0  ·  PRODUCTION`}</pre>

          {/* Bottom label */}
          <div style={{
            position: "absolute", bottom: "28px", right: "40px",
            fontFamily: MONO, fontSize: "8px", color: `rgba(229,220,200,0.2)`,
            letterSpacing: "0.1em",
          }}>
            OLYMPAY · FINTECH INFRA
          </div>
        </div>

        {/* ══ RIGHT VERTICAL STRIP ══ */}
        <div style={{
          width: "36px",
          background: GOLD,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 0",
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: MONO, fontSize: "9px", fontWeight: 700,
            color: "#0a0a08", letterSpacing: "0.16em",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
          }}>
            PLATFORM
          </div>

          <img src={olympayLogo} alt="Olympay" style={{
            width: "18px", height: "18px",
            filter: "brightness(0) saturate(100%)",
            opacity: 0.7,
          }} />

          <div style={{
            fontFamily: MONO, fontSize: "9px", fontWeight: 700,
            color: "#0a0a08", letterSpacing: "0.16em",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}>
            AGENTS
          </div>
        </div>

        {/* ══ BOTTOM VERTICAL LABELS (left side) ══ */}
        <div style={{
          position: "absolute", left: "16px", bottom: "44px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
        }}>
          {["ACCOUNTS", "POLICIES", "CARDS"].map((label, i) => (
            <div key={label} style={{
              fontFamily: MONO, fontSize: "7px",
              color: i === 0 ? GOLD : MUTED,
              letterSpacing: "0.14em",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontWeight: i === 0 ? 700 : 400,
            }}>{label}</div>
          ))}
        </div>

        {/* ══ DIVIDER LINE ══ */}
        <div style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: "820px",
          width: "1px",
          background: `linear-gradient(to bottom, ${BORDER}, rgba(10,10,8,0.04) 30%, rgba(229,220,200,0.08) 70%, transparent)`,
        }} />

      </div>

      {/* ── Caption ── */}
      <div style={{
        position: "fixed", bottom: "20px",
        fontFamily: MONO, fontSize: "10px",
        color: "rgba(10,10,8,0.35)", letterSpacing: "0.1em",
        textAlign: "center",
      }}>
        OLYMPAY · BANNER · 1400 × 788
      </div>
    </div>
  );
}
