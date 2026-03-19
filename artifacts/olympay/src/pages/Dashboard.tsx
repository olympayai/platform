import { useGetMonitoringOverview, useGetApprovalsSummary } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Users, Wallet, CreditCard, ShieldCheck, Activity } from "lucide-react";
import { useEffect, useState } from "react";

const GOLD = "#c4923a";
const BLACK = "#0a0a08";
const CREAM = "#f7f2e9";
const BORDER = "#d5cbbf";
const MUTED = "#3d3020";
const SERIF = "'Playfair Display', Georgia, serif";
const MONO = "'JetBrains Mono', monospace";
const SANS = "'DM Sans', sans-serif";

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => fn();
  }, []);
  return w;
}

function StatCard({ title, value, subtitle, icon: Icon }: any) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${BORDER}`,
      borderRadius: "8px",
      padding: "20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div style={{ padding: "8px", background: CREAM, border: `1px solid ${BORDER}`, borderRadius: "6px" }}>
          <Icon size={14} color={MUTED} />
        </div>
      </div>
      <p style={{ fontFamily: SANS, fontSize: "12px", color: MUTED, marginBottom: "4px" }}>{title}</p>
      <p style={{ fontFamily: SERIF, fontSize: "30px", fontWeight: 400, color: BLACK, lineHeight: 1 }}>{value}</p>
      {subtitle && <p style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginTop: "6px", letterSpacing: "0.05em" }}>{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: overviewRes, isLoading } = useGetMonitoringOverview();
  const { data: appSummaryRes } = useGetApprovalsSummary();
  const w = useWindowWidth();
  const isMobile = w < 640;
  const isTablet = w < 900;

  const overview = overviewRes?.data;
  const approvals = appSummaryRes?.data;

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Activity size={20} color={GOLD} style={{ opacity: 0.6 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "flex-start",
        justifyContent: "space-between",
        gap: isMobile ? "14px" : "0",
        paddingBottom: "20px", borderBottom: `1px solid ${BORDER}`,
      }}>
        <div>
          <h1 style={{ fontFamily: SERIF, fontSize: isMobile ? "22px" : "28px", fontWeight: 400, color: BLACK, marginBottom: "4px" }}>Overview</h1>
          <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED }}>
            Operational control center for AI agent spending, approvals, and platform health.
          </p>
        </div>
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "8px",
          width: isMobile ? "100%" : "auto",
        }}>
          <button
            onClick={() => navigate("/agents")}
            style={{
              padding: "9px 20px",
              fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em", fontWeight: 600,
              textTransform: "uppercase", cursor: "pointer",
              background: BLACK, color: CREAM,
              border: `1px solid ${BLACK}`, borderRadius: "4px",
              transition: "all 0.15s",
              width: isMobile ? "100%" : "auto",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = GOLD; (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.color = BLACK; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BLACK; (e.currentTarget as HTMLElement).style.borderColor = BLACK; (e.currentTarget as HTMLElement).style.color = CREAM; }}
          >Create Agent</button>
          <button
            onClick={() => navigate("/transactions")}
            style={{
              padding: "9px 20px",
              fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em", fontWeight: 500,
              textTransform: "uppercase", cursor: "pointer",
              background: "transparent", color: BLACK,
              border: `1px solid ${BORDER}`, borderRadius: "4px",
              transition: "all 0.15s",
              width: isMobile ? "100%" : "auto",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.color = GOLD; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = BLACK; }}
          >View Transactions</button>
        </div>
      </div>

      {/* Stat cards — 2 cols on mobile, 4 on desktop */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: "12px",
      }}>
        <StatCard title="Active Agents"   value={overview?.activeAgents ?? 0}   subtitle={`${overview?.totalAgents ?? 0} TOTAL`}  icon={Users} />
        <StatCard title="Active Accounts" value={overview?.activeAccounts ?? 0} subtitle={`${overview?.totalAccounts ?? 0} TOTAL`} icon={Wallet} />
        <StatCard title="Active Cards"    value={overview?.activeCards ?? 0}    subtitle={`${overview?.totalCards ?? 0} ISSUED`}   icon={CreditCard} />
        <StatCard title="Active Policies" value={overview?.activePolicies ?? 0} subtitle="ENFORCING"                              icon={ShieldCheck} />
      </div>

      {/* Pending approvals alert */}
      {(overview?.pendingApprovals ?? 0) > 0 && (
        <div style={{
          background: "#fffbeb", border: `1px solid #fbbf24`,
          borderRadius: "6px", padding: "14px 16px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: "10px",
        }}>
          <p style={{ fontFamily: SANS, fontSize: "13px", color: "#92400e" }}>
            {overview?.pendingApprovals} transaction{overview?.pendingApprovals !== 1 ? "s" : ""} pending human approval
          </p>
          <button onClick={() => navigate("/approvals")} style={{
            fontFamily: MONO, fontSize: "10px", letterSpacing: "0.08em",
            background: "#fbbf24", border: "none", borderRadius: "3px",
            padding: "6px 14px", color: "#78350f", cursor: "pointer", fontWeight: 600,
            width: isMobile ? "100%" : "auto",
          }}>REVIEW →</button>
        </div>
      )}

      {/* Bottom section: approvals + totals */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: "12px",
      }}>
        {/* Approvals breakdown */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "20px" }}>
          <p style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: BLACK, marginBottom: "4px" }}>Approvals summary</p>
          <p style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginBottom: "16px", letterSpacing: "0.06em" }}>REVIEW QUEUE</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{
              background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: "6px", padding: "14px", textAlign: "center",
            }}>
              <p style={{ fontFamily: MONO, fontSize: "10px", color: "#a16207", letterSpacing: "0.1em", marginBottom: "6px" }}>PENDING REVIEW</p>
              <p style={{ fontFamily: SERIF, fontSize: "34px", color: "#92400e", fontWeight: 400 }}>{approvals?.pendingApprovalRequests ?? 0}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "APPROVED", value: approvals?.approvedApprovalRequests ?? 0, color: "#16a34a" },
                { label: "DECLINED", value: approvals?.declinedApprovalRequests ?? 0, color: "#dc2626" },
              ].map(item => (
                <div key={item.label} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "12px", textAlign: "center" }}>
                  <p style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.1em", marginBottom: "4px" }}>{item.label}</p>
                  <p style={{ fontFamily: SERIF, fontSize: "22px", color: item.color, fontWeight: 400 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform totals */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "20px" }}>
          <p style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: BLACK, marginBottom: "4px" }}>Platform totals</p>
          <p style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginBottom: "16px", letterSpacing: "0.06em" }}>ALL TIME</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {[
              { label: "Total Transactions", value: overview?.totalTransactions ?? 0 },
              { label: "Total Agents",       value: overview?.totalAgents ?? 0 },
              { label: "Total Accounts",     value: overview?.totalAccounts ?? 0 },
              { label: "Total Cards Issued", value: overview?.totalCards ?? 0 },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "13px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
              }}>
                <span style={{ fontFamily: SANS, fontSize: "13px", color: MUTED }}>{row.label}</span>
                <span style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 400, color: BLACK }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
