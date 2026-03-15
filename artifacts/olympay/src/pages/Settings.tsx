import { Shield, Bell, Key, Database } from "lucide-react";
import { PageHeader, CREAM, BORDER, MUTED, MONO, SANS, BLACK } from "@/components/ui/page-shell";

const ITEMS = [
  { icon: Shield,   title: "Security",       desc: "API keys, access controls, and authentication settings." },
  { icon: Bell,     title: "Notifications",  desc: "Manage alerts for approvals, policy violations, and anomalies." },
  { icon: Key,      title: "API Access",     desc: "Generate and manage API credentials for agents." },
  { icon: Database, title: "Data Retention", desc: "Configure how long audit logs and transaction data are kept." },
];

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure platform behaviour, security, and notifications." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {ITEMS.map((item) => (
          <div
            key={item.title}
            style={{
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: "8px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{
              padding: "8px",
              background: CREAM,
              border: `1px solid ${BORDER}`,
              borderRadius: "6px",
              display: "inline-flex",
              width: "fit-content",
            }}>
              <item.icon size={14} color={MUTED} />
            </div>
            <div>
              <p style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: BLACK, marginBottom: "4px" }}>{item.title}</p>
              <p style={{ fontFamily: SANS, fontSize: "12px", color: MUTED, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
            <div style={{
              fontFamily: MONO, fontSize: "9px", color: MUTED,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>Coming soon</div>
          </div>
        ))}
      </div>
    </div>
  );
}
