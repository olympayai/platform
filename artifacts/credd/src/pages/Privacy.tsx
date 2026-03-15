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
    title: "Information We Collect",
    body: `We collect information you provide directly, such as your name, email address, and payment details when you register for an Olympay account. We also collect information automatically when you use our services, including usage data, IP addresses, browser type, and device identifiers. For agents and accounts you create through the API, we log all transactions, policy evaluations, and approval decisions as part of the audit record.`,
  },
  {
    title: "How We Use Your Information",
    body: `We use collected information to provide, operate, and improve the Olympay platform; to process transactions and enforce spending policies; to send service notifications and security alerts; to comply with legal obligations including financial regulations and anti-money-laundering requirements; and to detect and prevent fraud or unauthorized activity.`,
  },
  {
    title: "Data Sharing",
    body: `We do not sell your personal data. We share data with card network partners and banking partners strictly as required to process payments and issue virtual cards. We may share data with law enforcement or regulators when legally required. All third-party processors are contractually bound to handle your data in accordance with applicable privacy law.`,
  },
  {
    title: "Data Retention",
    body: `Transaction records and audit logs are retained for a minimum of 7 years to satisfy financial regulatory requirements. Account and identity data is retained for the duration of your account plus 5 years after closure. You may request deletion of non-regulated personal data by contacting privacy@olympay.tech.`,
  },
  {
    title: "Security",
    body: `Olympay implements industry-standard security controls including AES-256 encryption at rest, TLS 1.3 in transit, SOC 2 Type II certified infrastructure, and role-based access controls. API keys are hashed and never stored in plaintext. Card PAN data is handled under PCI DSS Level 1 compliance.`,
  },
  {
    title: "Your Rights",
    body: `Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. California residents have rights under CCPA. EEA residents have rights under GDPR. To exercise any right, contact privacy@olympay.tech. We will respond within 30 days.`,
  },
  {
    title: "Cookies",
    body: `We use strictly necessary session cookies to authenticate your dashboard session. We do not use advertising cookies or third-party tracking scripts. You may disable cookies in your browser, but doing so will prevent dashboard access.`,
  },
  {
    title: "Contact",
    body: `For privacy questions or requests, contact our Data Protection Officer at privacy@olympay.tech. Olympay is operated by Olympay Technologies, Inc. For regulatory inquiries, write to legal@olympay.tech.`,
  },
];

export default function Privacy() {
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
            Privacy Policy
          </h1>
          <p style={{ fontFamily: SANS, fontSize: "14px", color: MUTED, lineHeight: 1.7, margin: 0 }}>
            Last updated: March 2026. This policy describes how Olympay Technologies, Inc. collects, uses, and protects your information when you use the Olympay platform and API.
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
          privacy@olympay.tech
        </span>
      </footer>
    </div>
  );
}
