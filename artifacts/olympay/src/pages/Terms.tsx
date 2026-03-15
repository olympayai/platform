import { useLocation } from "wouter";
import olympayLogo from "@/assets/logo.png";

const GOLD   = "#c4923a";
const BLACK  = "#0a0a08";
const CREAM  = "#f7f2e9";
const BORDER = "#e2ddd4";
const MUTED  = "#6b6457";
const MONO   = "'JetBrains Mono', 'Fira Mono', monospace";
const SANS   = "'DM Sans', sans-serif";
const SERIF  = "'Playfair Display', Georgia, serif";
const LOGO_GOLD = "brightness(0) saturate(100%) invert(64%) sepia(53%) saturate(601%) hue-rotate(8deg) brightness(98%)";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: `By accessing or using Olympay's platform, API, SDKs, or any related services (collectively, the "Services"), you agree to be bound by these Terms of Service. If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization. If you do not agree to these terms, do not use the Services.`,
  },
  {
    title: "Eligibility",
    body: `You must be at least 18 years old and legally permitted to enter contracts in your jurisdiction to use Olympay. The Services are intended for business use. Consumer use is not supported. By registering, you represent that you are using the Services for business or commercial purposes only.`,
  },
  {
    title: "Account Registration",
    body: `You are responsible for maintaining the confidentiality of your API keys and login credentials. You must notify Olympay immediately at security@olympay.tech if you become aware of any unauthorized access to your account. Olympay is not liable for losses resulting from unauthorized use of your credentials if you failed to take reasonable security precautions.`,
  },
  {
    title: "Permitted Use",
    body: `You may use the Services to issue virtual cards, manage spending policies, and process payments for legitimate business purposes. You may not use the Services for any illegal activity, money laundering, terrorist financing, sanctions evasion, or any purpose that violates applicable law. Olympay reserves the right to immediately suspend accounts suspected of prohibited activity.`,
  },
  {
    title: "API Usage",
    body: `You may integrate with the Olympay API subject to the rate limits specified in your plan. You must not attempt to reverse engineer, circumvent security controls, or use the API in a manner that would impose unreasonable load on Olympay infrastructure. Olympay may modify, deprecate, or version the API with reasonable notice via changelog and email.`,
  },
  {
    title: "Fees and Billing",
    body: `Fees are charged as described in your subscription plan at the time of signup. Transaction fees are assessed per authorization as published in the pricing schedule. Olympay reserves the right to change fees with 30 days prior written notice. Unpaid amounts accrue interest at 1.5% per month. You are responsible for all applicable taxes.`,
  },
  {
    title: "Intellectual Property",
    body: `Olympay retains all intellectual property rights in the Services, API, SDKs, and documentation. You retain all rights to your data and agent configurations. Olympay is granted a limited, non-exclusive license to process your data solely as required to provide the Services. Nothing in these terms transfers ownership of either party's intellectual property.`,
  },
  {
    title: "Limitation of Liability",
    body: `To the maximum extent permitted by law, Olympay's total liability for any claims arising from or related to the Services is limited to the fees you paid in the 3 months preceding the claim. Olympay is not liable for indirect, incidental, special, or consequential damages. Some jurisdictions do not allow these limitations, so they may not apply to you.`,
  },
  {
    title: "Termination",
    body: `Either party may terminate this agreement with 30 days written notice. Olympay may immediately suspend or terminate access for breach of these terms, fraud, or legal obligation. Upon termination, you remain responsible for fees incurred through the termination date. Audit log data will be retained per regulatory requirements regardless of termination.`,
  },
  {
    title: "Governing Law",
    body: `These terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes shall be resolved by binding arbitration under JAMS rules in San Francisco, California, except that either party may seek injunctive relief in any court of competent jurisdiction.`,
  },
  {
    title: "Contact",
    body: `For questions about these terms, contact legal@olympay.tech. For urgent security or compliance matters, contact security@olympay.tech or compliance@olympay.tech respectively.`,
  },
];

export default function Terms() {
  const [, navigate] = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: CREAM, color: BLACK }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        padding: "0 80px", height: "60px",
        borderBottom: `1px solid ${BORDER}`,
        background: CREAM,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => navigate("/")} style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}>
          <img src={olympayLogo} alt="Olympay" style={{ width: "22px", height: "22px", filter: LOGO_GOLD }} />
          <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 600, color: BLACK, letterSpacing: "0.1em" }}>OLYMPAY</span>
        </button>
        <button onClick={() => navigate("/")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: MONO, fontSize: "10px", color: MUTED,
          letterSpacing: "0.1em", textTransform: "uppercase",
          transition: "color 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = BLACK)}
          onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
        >Back to Home</button>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "80px 32px 120px" }}>
        <div style={{ marginBottom: "48px" }}>
          <div style={{
            display: "inline-block",
            fontFamily: MONO, fontSize: "9px", fontWeight: 600,
            color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>Legal</div>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: BLACK, margin: "0 0 16px", lineHeight: 1.15 }}>
            Terms of Service
          </h1>
          <p style={{ fontFamily: SANS, fontSize: "14px", color: MUTED, lineHeight: 1.7, margin: 0 }}>
            Last updated: March 2026. These Terms of Service govern your access to and use of the Olympay platform, API, and related services provided by Olympay Technologies, Inc.
          </p>
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "48px" }}>
          {SECTIONS.map((s, i) => (
            <div key={i} style={{ marginBottom: "40px" }}>
              <h2 style={{ fontFamily: SANS, fontSize: "15px", fontWeight: 600, color: BLACK, marginBottom: "10px", marginTop: 0 }}>
                {s.title}
              </h2>
              <p style={{ fontFamily: SANS, fontSize: "14px", color: MUTED, lineHeight: 1.8, margin: 0 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${BORDER}`,
        padding: "24px 80px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, letterSpacing: "0.08em" }}>
          OLYMPAY
        </span>
        <span style={{ fontFamily: SANS, fontSize: "12px", color: MUTED }}>
          legal@olympay.tech
        </span>
      </footer>
    </div>
  );
}
