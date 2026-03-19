import { useState } from "react";
import { Store, ShieldCheck, ShieldX, Shield, TrendingUp } from "lucide-react";
import { useListTransactions, useListPolicies } from "@workspace/api-client-react";
import { formatMoney, formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  MUTED, MONO, SANS, CREAM, BORDER, BLACK, GOLD,
} from "@/components/ui/page-shell";

const SERIF = "'Playfair Display', Georgia, serif";

type PolicyStatus = "allowlisted" | "blocklisted" | "uncontrolled";

interface MerchantSummary {
  id: string;
  name: string;
  category: string;
  txCount: number;
  totalSpendMinor: number;
  currency: string;
  allowCount: number;
  denyCount: number;
  lastSeen: string;
  policyStatus: PolicyStatus;
}

function getMerchantName(tx: any): string {
  if (tx.metadataJson?.merchant) return tx.metadataJson.merchant;
  if (tx.merchantId) return tx.merchantId;
  return "Unknown";
}

function getMerchantId(tx: any): string {
  if (tx.merchantId) return tx.merchantId;
  if (tx.metadataJson?.merchant) return tx.metadataJson.merchant;
  return "unknown";
}

function StatusPill({ status }: { status: PolicyStatus }) {
  const map: Record<PolicyStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
    allowlisted:  { label: "Allowlisted",  color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: ShieldCheck },
    blocklisted:  { label: "Blocklisted",  color: "#dc2626", bg: "#fff1f2", border: "#fecdd3", icon: ShieldX    },
    uncontrolled: { label: "Uncontrolled", color: "#78716c", bg: "#f5f5f4", border: "#d6d3d1", icon: Shield     },
  };
  const v = map[status];
  const Icon = v.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "2px 8px", borderRadius: "3px",
      fontFamily: MONO, fontSize: "9px", fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
    }}>
      <Icon size={9} />
      {v.label}
    </span>
  );
}

function SummaryCard({ label, value, color, bg, border }: any) {
  return (
    <div style={{
      flex: 1, minWidth: "120px",
      padding: "16px 20px",
      background: bg || "#fff",
      border: `1px solid ${border || BORDER}`,
      borderRadius: "6px",
      display: "flex", flexDirection: "column", gap: "4px",
    }}>
      <span style={{ fontFamily: SERIF, fontSize: "28px", fontWeight: 400, color: color || BLACK, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontFamily: MONO, fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: color || MUTED, opacity: 0.8 }}>
        {label}
      </span>
    </div>
  );
}

type Filter = "ALL" | "allowlisted" | "blocklisted" | "uncontrolled";

const FILTER_TABS: { label: string; value: Filter }[] = [
  { label: "All Merchants", value: "ALL" },
  { label: "Allowlisted",   value: "allowlisted" },
  { label: "Blocklisted",   value: "blocklisted" },
  { label: "Uncontrolled",  value: "uncontrolled" },
];

export default function Merchants() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  const { data: txRes, isLoading: txLoading } = useListTransactions();
  const { data: polRes } = useListPolicies();

  const transactions = txRes?.data || [];
  const policies = polRes?.data || [];

  // Build allowlisted / blocklisted merchant sets from policies
  const allowlistedIds = new Set<string>();
  const blocklistedIds = new Set<string>();

  policies.forEach((p: any) => {
    const ids: string[] = p.configJson?.merchantIds || p.configJson?.allowed || [];
    if (p.type === "MERCHANT_ALLOWLIST") ids.forEach((id: string) => allowlistedIds.add(id));
    if (p.type === "MERCHANT_BLOCKLIST") ids.forEach((id: string) => blocklistedIds.add(id));
  });

  // Derive unique merchants from transactions
  const merchantMap = new Map<string, MerchantSummary>();

  transactions.forEach((tx: any) => {
    const key = getMerchantId(tx);
    const name = getMerchantName(tx);
    const existing = merchantMap.get(key);

    const policyStatus: PolicyStatus =
      blocklistedIds.has(key) ? "blocklisted" :
      allowlistedIds.has(key) ? "allowlisted" :
      "uncontrolled";

    if (!existing) {
      merchantMap.set(key, {
        id: key,
        name,
        category: tx.metadataJson?.category || "uncategorized",
        txCount: 1,
        totalSpendMinor: tx.decision !== "DENY" ? (tx.amountMinor || 0) : 0,
        currency: tx.currency || "USD",
        allowCount: tx.decision === "ALLOW" ? 1 : 0,
        denyCount: tx.decision === "DENY" ? 1 : 0,
        lastSeen: tx.requestedAt || tx.createdAt,
        policyStatus,
      });
    } else {
      existing.txCount += 1;
      existing.totalSpendMinor += tx.decision !== "DENY" ? (tx.amountMinor || 0) : 0;
      existing.allowCount += tx.decision === "ALLOW" ? 1 : 0;
      existing.denyCount += tx.decision === "DENY" ? 1 : 0;
      if (tx.requestedAt > existing.lastSeen) existing.lastSeen = tx.requestedAt;
    }
  });

  const merchants = Array.from(merchantMap.values()).sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  );

  const filtered = merchants.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || m.policyStatus === filter;
    return matchSearch && matchFilter;
  });

  const allowlisted  = merchants.filter(m => m.policyStatus === "allowlisted").length;
  const blocklisted  = merchants.filter(m => m.policyStatus === "blocklisted").length;
  const uncontrolled = merchants.filter(m => m.policyStatus === "uncontrolled").length;
  const totalSpend   = merchants.reduce((s, m) => s + m.totalSpendMinor, 0);

  const isLoading = txLoading;

  return (
    <div>
      <PageHeader
        title="Merchants"
        subtitle="Every unique merchant your agents have transacted with, and their policy status."
      />

      {/* Summary row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <SummaryCard label="Total Merchants" value={merchants.length} />
        <SummaryCard label="Total Spend" value={formatMoney(totalSpend, "USD")}
          color={GOLD} bg="#fef9ec" border="#f3d99c" />
        <SummaryCard label="Allowlisted" value={allowlisted}
          color="#16a34a" bg="#f0fdf4" border="#bbf7d0" />
        <SummaryCard label="Blocklisted" value={blocklisted}
          color="#dc2626" bg="#fff1f2" border="#fecdd3" />
        <SummaryCard label="Uncontrolled" value={uncontrolled}
          color="#78716c" bg="#f5f5f4" border="#d6d3d1" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", borderBottom: `1px solid ${BORDER}`, overflowX: "auto", WebkitOverflowScrolling: "touch" } as any}>
        {FILTER_TABS.map(tab => {
          const active = filter === tab.value;
          const count = tab.value === "ALL" ? merchants.length
            : merchants.filter(m => m.policyStatus === tab.value).length;
          return (
            <button key={tab.value} onClick={() => setFilter(tab.value)} style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "7px 14px", cursor: "pointer", border: "none",
              borderBottom: active ? `2px solid ${BLACK}` : "2px solid transparent",
              background: "transparent",
              fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: active ? BLACK : MUTED,
              fontWeight: active ? 700 : 400,
              transition: "all 0.15s",
              marginBottom: "-1px",
            }}>
              {tab.label}
              <span style={{
                fontFamily: MONO, fontSize: "8px",
                background: active ? `${BLACK}12` : "#f5f5f4",
                color: active ? BLACK : MUTED,
                border: `1px solid ${active ? BLACK + "25" : BORDER}`,
                borderRadius: "10px", padding: "0 5px",
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      <TablePanel search={search} onSearch={setSearch} placeholder="Search by merchant or category...">
        <TableHead cols={[
          { label: "Merchant" },
          { label: "Category" },
          { label: "Policy Status" },
          { label: "Transactions", right: true },
          { label: "Total Spend", right: true },
          { label: "Last Seen", right: true },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={6} message="Loading merchants..." />
          ) : filtered.length === 0 && merchants.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "64px 24px", gap: "12px", textAlign: "center",
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "10px",
                    background: CREAM, border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Store size={20} color={MUTED} />
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: "14px", color: MUTED, maxWidth: "320px", lineHeight: 1.6 }}>
                    No merchant activity yet. Merchants appear automatically once agents begin transacting.
                  </p>
                </div>
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={6} message="No merchants match your search." />
          ) : (
            filtered.map((m) => (
              <TR key={m.id}>
                <TD>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "6px", flexShrink: 0,
                      background: CREAM, border: `1px solid ${BORDER}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Store size={13} color={MUTED} />
                    </div>
                    <div>
                      <div style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 500, color: BLACK }}>{m.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, marginTop: "2px" }}>{m.id}</div>
                    </div>
                  </div>
                </TD>
                <TD>
                  <span style={{
                    fontFamily: MONO, fontSize: "8px", letterSpacing: "0.06em",
                    textTransform: "uppercase", color: MUTED,
                    background: "#f5f5f4", border: `1px solid ${BORDER}`,
                    borderRadius: "2px", padding: "2px 6px",
                  }}>
                    {m.category.replace(/_/g, " ")}
                  </span>
                </TD>
                <TD><StatusPill status={m.policyStatus} /></TD>
                <TD right>
                  <div style={{ fontFamily: MONO, fontSize: "12px", color: BLACK }}>{m.txCount}</div>
                  {m.denyCount > 0 && (
                    <div style={{ fontFamily: MONO, fontSize: "9px", color: "#dc2626", marginTop: "2px" }}>
                      {m.denyCount} blocked
                    </div>
                  )}
                </TD>
                <TD right mono>
                  <span style={{ color: m.totalSpendMinor > 0 ? BLACK : MUTED }}>
                    {m.totalSpendMinor > 0 ? formatMoney(m.totalSpendMinor, m.currency) : "--"}
                  </span>
                </TD>
                <TD right muted>{formatDate(m.lastSeen)}</TD>
              </TR>
            ))
          )}
        </tbody>
      </TablePanel>

      {/* Policy tip */}
      {merchants.filter(m => m.policyStatus === "uncontrolled").length > 0 && (
        <div style={{
          marginTop: "16px", padding: "12px 16px",
          background: "#fffbeb", border: `1px solid #fde68a`,
          borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px",
        }}>
          <TrendingUp size={14} color="#d97706" />
          <span style={{ fontFamily: SANS, fontSize: "12px", color: "#92400e" }}>
            <strong>{merchants.filter(m => m.policyStatus === "uncontrolled").length} merchant{merchants.filter(m => m.policyStatus === "uncontrolled").length > 1 ? "s are" : " is"} uncontrolled</strong> — not covered by any allowlist or blocklist policy.
            Create a Merchant Allowlist or Blocklist policy in the Policies page to enforce rules.
          </span>
        </div>
      )}
    </div>
  );
}
