import { useEffect } from "react";
import { useLocation } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import { Activity } from "lucide-react";

const GOLD = "#c4923a";
const BLACK = "#0a0a08";
const CREAM = "#f7f2e9";
const BORDER = "#d5cbbf";
const MUTED = "#3d3020";
const SERIF = "'Playfair Display', Georgia, serif";
const MONO = "'JetBrains Mono', monospace";
const SANS = "'DM Sans', sans-serif";

export default function Login() {
  const { ready, authenticated, login } = usePrivy();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (ready && authenticated) {
      navigate("/dashboard");
    }
  }, [ready, authenticated, navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      background: CREAM,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Top nav */}
      <nav style={{
        height: "48px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 40px",
        background: BLACK, borderBottom: `1px solid rgba(255,255,255,0.07)`,
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <Activity size={14} color={GOLD} />
          <span style={{ fontFamily: MONO, fontSize: "13px", color: GOLD, fontWeight: 600, letterSpacing: "0.04em" }}>
            OLYMPAY
          </span>
        </a>
      </nav>

      {/* Center card */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{
          width: "100%", maxWidth: "400px",
          background: "#fff", border: `1px solid ${BORDER}`,
          borderRadius: "8px", overflow: "hidden",
        }}>
          {/* Card header */}
          <div style={{
            padding: "32px 36px 24px",
            borderBottom: `1px solid ${BORDER}`,
            background: CREAM,
            textAlign: "center",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "44px", height: "44px",
              background: BLACK, borderRadius: "8px", marginBottom: "16px",
            }}>
              <Activity size={18} color={GOLD} />
            </div>
            <h1 style={{
              fontFamily: SERIF, fontSize: "24px", fontWeight: 400,
              color: BLACK, marginBottom: "6px",
            }}>
              Sign in to Olympay
            </h1>
            <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED }}>
              Access your AI agent financial control panel
            </p>
          </div>

          {/* Card body */}
          <div style={{ padding: "28px 36px" }}>
            {/* Email login button */}
            <button
              onClick={login}
              disabled={!ready}
              style={{
                width: "100%", padding: "13px 20px",
                fontFamily: MONO, fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.12em", textTransform: "uppercase",
                background: BLACK, color: CREAM,
                border: `1px solid ${BLACK}`, borderRadius: "4px",
                cursor: ready ? "pointer" : "not-allowed",
                opacity: ready ? 1 : 0.6,
                transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
              onMouseEnter={e => {
                if (ready) {
                  (e.currentTarget as HTMLElement).style.background = GOLD;
                  (e.currentTarget as HTMLElement).style.borderColor = GOLD;
                  (e.currentTarget as HTMLElement).style.color = BLACK;
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = BLACK;
                (e.currentTarget as HTMLElement).style.borderColor = BLACK;
                (e.currentTarget as HTMLElement).style.color = CREAM;
              }}
            >
              {!ready ? (
                "Loading..."
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                  Continue with Email
                </>
              )}
            </button>

            {/* Terms note */}
            <p style={{
              fontFamily: SANS, fontSize: "11px", color: MUTED,
              textAlign: "center", marginTop: "20px", lineHeight: 1.6,
            }}>
              By signing in you agree to our{" "}
              <span style={{ color: GOLD, cursor: "pointer" }}>Terms of Service</span>
              {" "}and{" "}
              <span style={{ color: GOLD, cursor: "pointer" }}>Privacy Policy</span>
            </p>
          </div>
        </div>

        {/* Features below card */}
        <div style={{
          position: "absolute", bottom: "40px",
          display: "flex", gap: "32px",
          justifyContent: "center",
        }}>
          {[
            "Programmable spending policies",
            "Human-in-the-loop approvals",
            "Full audit logging",
          ].map((text) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: GOLD }} />
              <span style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
