import { Store } from "lucide-react";
import {
  PageHeader,
  MUTED, MONO, SANS, CREAM, BORDER, BLACK,
} from "@/components/ui/page-shell";

export default function Merchants() {
  return (
    <div>
      <PageHeader
        title="Merchants"
        subtitle="Manage merchant allowlists, blocklists, and per-vendor spending rules."
      />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "80px 24px",
        background: "#fff", border: `1px solid ${BORDER}`,
        borderRadius: "8px", textAlign: "center",
        gap: "16px",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "10px",
          background: CREAM, border: `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Store size={20} color={MUTED} />
        </div>
        <div>
          <p style={{ fontFamily: SANS, fontSize: "15px", fontWeight: 500, color: BLACK, marginBottom: "6px" }}>
            No merchants yet
          </p>
          <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED, maxWidth: "340px", lineHeight: 1.6 }}>
            Merchants appear here automatically once agents begin transacting. Each unique merchant ID is tracked and can be allowlisted or blocked via policy.
          </p>
        </div>
        <div style={{
          marginTop: "8px",
          padding: "10px 20px",
          background: CREAM, border: `1px solid ${BORDER}`,
          borderRadius: "4px",
          fontFamily: MONO, fontSize: "10px", color: MUTED, letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          Merchant management coming soon
        </div>
      </div>
    </div>
  );
}
