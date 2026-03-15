import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import olympayLogo from "@/assets/logo.png";

const GOLD   = "#c4923a";
const BLACK  = "#0a0a08";
const CREAM  = "#f7f2e9";
const BORDER = "#d5cbbf";
const MUTED  = "#3d3020";
const SERIF  = "'Playfair Display', Georgia, serif";
const MONO   = "'JetBrains Mono', monospace";
const SANS   = "'DM Sans', sans-serif";

/* ─── Legal content ─── */
const PRIVACY_SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly, such as your name, email address, and payment details when you register for an Olympay account. We also collect information automatically when you use our services, including usage data, IP addresses, browser type, and device identifiers. For agents and accounts you create through the API, we log all transactions, policy evaluations, and approval decisions as part of the audit record.",
  },
  {
    title: "How We Use Your Information",
    body: "We use collected information to provide, operate, and improve the Olympay platform; to process transactions and enforce spending policies; to send service notifications and security alerts; to comply with legal obligations including financial regulations and anti-money-laundering requirements; and to detect and prevent fraud or unauthorized activity.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell your personal data. We share data with card network partners and banking partners strictly as required to process payments and issue virtual cards. We may share data with law enforcement or regulators when legally required. All third-party processors are contractually bound to handle your data in accordance with applicable privacy law.",
  },
  {
    title: "Data Retention",
    body: "Transaction records and audit logs are retained for a minimum of 7 years to satisfy financial regulatory requirements. Account and identity data is retained for the duration of your account plus 5 years after closure. You may request deletion of non-regulated personal data by contacting privacy@olympay.tech.",
  },
  {
    title: "Security",
    body: "Olympay implements industry-standard security controls including AES-256 encryption at rest, TLS 1.3 in transit, SOC 2 Type II certified infrastructure, and role-based access controls. API keys are hashed and never stored in plaintext. Card PAN data is handled under PCI DSS Level 1 compliance.",
  },
  {
    title: "Your Rights",
    body: "Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. California residents have rights under CCPA. EEA residents have rights under GDPR. To exercise any right, contact privacy@olympay.tech. We will respond within 30 days.",
  },
  {
    title: "Cookies",
    body: "We use strictly necessary session cookies to authenticate your dashboard session. We do not use advertising cookies or third-party tracking scripts. You may disable cookies in your browser, but doing so will prevent dashboard access.",
  },
  {
    title: "Contact",
    body: "For privacy questions or requests, contact our Data Protection Officer at privacy@olympay.tech. For regulatory inquiries, write to legal@olympay.tech.",
  },
];

const TERMS_SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: `By accessing or using Olympay's platform, API, SDKs, or any related services, you agree to be bound by these Terms of Service. If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization.`,
  },
  {
    title: "Eligibility",
    body: "You must be at least 18 years old and legally permitted to enter contracts in your jurisdiction. The Services are intended for business use only. Consumer use is not supported.",
  },
  {
    title: "Account Registration",
    body: "You are responsible for maintaining the confidentiality of your API keys and login credentials. Notify Olympay immediately at security@olympay.tech if you become aware of any unauthorized access to your account.",
  },
  {
    title: "Permitted Use",
    body: "You may use the Services to issue virtual cards, manage spending policies, and process payments for legitimate business purposes. You may not use the Services for any illegal activity, money laundering, terrorist financing, sanctions evasion, or any purpose that violates applicable law.",
  },
  {
    title: "API Usage",
    body: "You may integrate with the Olympay API subject to the rate limits specified in your plan. You must not attempt to reverse engineer, circumvent security controls, or impose unreasonable load on Olympay infrastructure.",
  },
  {
    title: "Fees and Billing",
    body: "Fees are charged as described in your subscription plan. Transaction fees are assessed per authorization as published in the pricing schedule. Olympay reserves the right to change fees with 30 days prior written notice. Unpaid amounts accrue interest at 1.5% per month.",
  },
  {
    title: "Intellectual Property",
    body: "Olympay retains all intellectual property rights in the Services, API, SDKs, and documentation. You retain all rights to your data and agent configurations.",
  },
  {
    title: "Limitation of Liability",
    body: "To the maximum extent permitted by law, Olympay's total liability for any claims is limited to the fees you paid in the 3 months preceding the claim. Olympay is not liable for indirect, incidental, special, or consequential damages.",
  },
  {
    title: "Termination",
    body: "Either party may terminate this agreement with 30 days written notice. Olympay may immediately suspend access for breach of these terms, fraud, or legal obligation.",
  },
  {
    title: "Governing Law",
    body: "These terms are governed by the laws of the State of Delaware, United States. Disputes shall be resolved by binding arbitration under JAMS rules in San Francisco, California.",
  },
  {
    title: "Contact",
    body: "For questions about these terms, contact legal@olympay.tech.",
  },
];

/* ─── Modal component ─── */
type ModalType = "terms" | "privacy" | null;

function LegalModal({ type, onClose }: { type: ModalType; onClose: () => void }) {
  const isTerms   = type === "terms";
  const title     = isTerms ? "Terms of Service" : "Privacy Policy";
  const updated   = "Last updated: March 2026";
  const sections  = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(10,10,8,0.55)",
        backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "560px",
          maxHeight: "82vh",
          background: CREAM,
          border: `1px solid ${BORDER}`,
          borderRadius: "10px",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
          animation: "slideUp 0.18s ease",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "22px 28px 20px",
          borderBottom: `1px solid ${BORDER}`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          flexShrink: 0,
          background: CREAM,
        }}>
          <div>
            <div style={{
              fontFamily: MONO, fontSize: "8px", fontWeight: 600,
              color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase",
              marginBottom: "6px",
            }}>Legal</div>
            <h2 style={{
              fontFamily: SERIF, fontSize: "22px", fontWeight: 400,
              color: BLACK, margin: 0, lineHeight: 1.2,
            }}>{title}</h2>
            <p style={{
              fontFamily: SANS, fontSize: "11px", color: MUTED,
              margin: "4px 0 0", lineHeight: 1,
            }}>{updated}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "28px", height: "28px", flexShrink: 0,
              background: "none", border: `1px solid ${BORDER}`,
              borderRadius: "4px", cursor: "pointer",
              color: MUTED, transition: "all 0.12s",
              marginTop: "2px",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = BLACK;
              (e.currentTarget as HTMLElement).style.color = BLACK;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = BORDER;
              (e.currentTarget as HTMLElement).style.color = MUTED;
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{
          overflowY: "auto", padding: "24px 28px 28px",
          flex: 1,
        }}>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: i < sections.length - 1 ? "24px" : 0 }}>
              <h3 style={{
                fontFamily: SANS, fontSize: "13px", fontWeight: 600,
                color: BLACK, margin: "0 0 6px",
              }}>{s.title}</h3>
              <p style={{
                fontFamily: SANS, fontSize: "13px", color: MUTED,
                lineHeight: 1.75, margin: 0,
              }}>{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px",
          borderTop: `1px solid ${BORDER}`,
          flexShrink: 0,
          background: "#fff",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 24px",
              fontFamily: MONO, fontSize: "10px", fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              background: BLACK, color: CREAM,
              border: "none", borderRadius: "4px", cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = GOLD)}
            onMouseLeave={e => (e.currentTarget.style.background = BLACK)}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Login page ─── */
export default function Login() {
  const { ready, authenticated, login } = usePrivy();
  const [, navigate] = useLocation();
  const [modal, setModal] = useState<ModalType>(null);

  useEffect(() => {
    if (ready && authenticated) navigate("/dashboard");
  }, [ready, authenticated, navigate]);

  const closeModal = useCallback(() => setModal(null), []);

  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", flexDirection: "column" }}>

      {/* Top nav */}
      <nav style={{
        height: "48px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 40px",
        background: BLACK, borderBottom: `1px solid rgba(255,255,255,0.07)`,
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src={olympayLogo} alt="Olympay" style={{ width: "28px", height: "28px", filter: "brightness(0) saturate(100%) invert(64%) sepia(53%) saturate(601%) hue-rotate(8deg) brightness(98%)" }} />
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
              <img src={olympayLogo} alt="Olympay" style={{ width: "34px", height: "34px", filter: "brightness(0) saturate(100%) invert(64%) sepia(53%) saturate(601%) hue-rotate(8deg) brightness(98%)" }} />
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: "24px", fontWeight: 400, color: BLACK, marginBottom: "6px" }}>
              Sign in to Olympay
            </h1>
            <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED }}>
              Access your AI agent financial control panel
            </p>
          </div>

          {/* Card body */}
          <div style={{ padding: "28px 36px" }}>
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
              {!ready ? "Loading..." : (
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
              <span
                role="button"
                tabIndex={0}
                onClick={() => setModal("terms")}
                onKeyDown={e => e.key === "Enter" && setModal("terms")}
                style={{
                  color: GOLD, cursor: "pointer",
                  textDecoration: "underline", textDecorationColor: `${GOLD}55`,
                  textUnderlineOffset: "2px", transition: "opacity 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Terms of Service
              </span>
              {" "}and{" "}
              <span
                role="button"
                tabIndex={0}
                onClick={() => setModal("privacy")}
                onKeyDown={e => e.key === "Enter" && setModal("privacy")}
                style={{
                  color: GOLD, cursor: "pointer",
                  textDecoration: "underline", textDecorationColor: `${GOLD}55`,
                  textUnderlineOffset: "2px", transition: "opacity 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Privacy Policy
              </span>
            </p>
          </div>
        </div>

        {/* Features below card */}
        <div style={{
          position: "absolute", bottom: "40px",
          display: "flex", gap: "32px",
          justifyContent: "center",
        }}>
          {["Programmable spending policies", "Human-in-the-loop approvals", "Full audit logging"].map(text => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: GOLD }} />
              <span style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal && <LegalModal type={modal} onClose={closeModal} />}
    </div>
  );
}
