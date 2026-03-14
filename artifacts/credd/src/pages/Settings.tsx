import { Shield, Bell, Key, Database } from "lucide-react";
import { PageHeader, GOLD, BLACK, CREAM, BORDER, MUTED, MONO, SANS } from "@/components/ui/page-shell";

const ITEMS = [
  { icon: Shield,   title: "Security",       desc: "API keys, access controls, and authentication settings.",      badge: "Configure" },
  { icon: Bell,     title: "Notifications",  desc: "Manage alerts for approvals, policy violations, and anomalies.", badge: "Configure" },
  { icon: Key,      title: "API Access",     desc: "Generate and manage API credentials for agents.",               badge: "Manage" },
  { icon: Database, title: "Data Retention", desc: "Configure how long audit logs and transaction data are kept.",   badge: "Configure" },
];

const PLATFORM_INFO = [
  { label: "Version",        value: "1.0.0" },
  { label: "Environment",    value: "Production" },
  { label: "Region",         value: "us-east-1" },
  { label: "Policy engine",  value: "Olympay v1 (ALLOW / DENY / REVIEW)" },
];

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure platform behaviour, security, and notifications." />

      {/* Setting cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {ITEMS.map((item) => (
          <div
            key={item.title}
            style={{
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: "8px",
              padding: "20px",
              cursor: "pointer",
              transition: "border-color 0.15s",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{
                padding: "8px",
                background: CREAM,
                border: `1px solid ${BORDER}`,
                borderRadius: "6px",
                display: "inline-flex",
              }}>
                <item.icon size={14} color={MUTED} />
              </div>
              <span style={{
                fontFamily: MONO, fontSize: "9px", fontWeight: 700,
                color: GOLD, background: `${GOLD}12`,
                border: `1px solid ${GOLD}35`,
                borderRadius: "3px", padding: "2px 8px",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>{item.badge}</span>
            </div>
            <div>
              <p style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: BLACK, marginBottom: "4px" }}>{item.title}</p>
              <p style={{ fontFamily: SANS, fontSize: "12px", color: MUTED, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Platform info panel */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, background: CREAM }}>
          <p style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: BLACK }}>Platform information</p>
        </div>
        <div style={{ padding: "0 20px" }}>
          {PLATFORM_INFO.map(({ label, value }, i) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: i < PLATFORM_INFO.length - 1 ? `1px solid ${BORDER}` : "none",
            }}>
              <span style={{ fontFamily: SANS, fontSize: "13px", color: MUTED }}>{label}</span>
              <span style={{ fontFamily: MONO, fontSize: "11px", color: BLACK }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
