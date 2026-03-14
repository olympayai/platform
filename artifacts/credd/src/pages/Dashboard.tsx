import { useGetMonitoringOverview, useGetApprovalsSummary } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Users, Wallet, CreditCard, ShieldCheck, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekData = DAYS.map((day) => ({ day, volume: Math.floor(Math.random() * 4000 + 1000) }));

const GOLD = "#c4923a";
const BLACK = "#0a0a08";
const CREAM = "#f7f2e9";
const BORDER = "#d5cbbf";
const MUTED = "#3d3020";
const SERIF = "'Playfair Display', Georgia, serif";
const MONO = "'JetBrains Mono', monospace";
const SANS = "'DM Sans', sans-serif";

const healthItems = [
  { name: "API", status: "operational", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { name: "Policy engine", status: "operational", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { name: "Approval queue", status: "healthy", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { name: "Monitoring", status: "stable", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
];

function StatCard({ title, value, subtitle, icon: Icon }: any) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${BORDER}`,
      borderRadius: "8px",
      padding: "24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ padding: "8px", background: CREAM, border: `1px solid ${BORDER}`, borderRadius: "6px" }}>
          <Icon size={14} color={MUTED} />
        </div>
      </div>
      <p style={{ fontFamily: SANS, fontSize: "12px", color: MUTED, marginBottom: "4px" }}>{title}</p>
      <p style={{ fontFamily: SERIF, fontSize: "32px", fontWeight: 400, color: BLACK, lineHeight: 1 }}>{value}</p>
      {subtitle && <p style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginTop: "6px", letterSpacing: "0.05em" }}>{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: overviewRes, isLoading } = useGetMonitoringOverview();
  const { data: appSummaryRes } = useGetApprovalsSummary();

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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: "24px", borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <h1 style={{ fontFamily: SERIF, fontSize: "28px", fontWeight: 400, color: BLACK, marginBottom: "4px" }}>Overview</h1>
          <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED }}>
            Operational control center for AI agent spending, approvals, and platform health.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/agents")}
            style={{
              padding: "9px 20px",
              fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em", fontWeight: 600,
              textTransform: "uppercase", cursor: "pointer",
              background: BLACK, color: CREAM,
              border: `1px solid ${BLACK}`, borderRadius: "4px",
              transition: "all 0.15s",
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
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.color = GOLD; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = BLACK; }}
          >View Transactions</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <StatCard title="Active Agents" value={overview?.activeAgents ?? 0} subtitle={`${overview?.totalAgents ?? 0} TOTAL REGISTERED`} icon={Users} />
        <StatCard title="Active Accounts" value={overview?.activeAccounts ?? 0} subtitle={`${overview?.totalAccounts ?? 0} TOTAL CREATED`} icon={Wallet} />
        <StatCard title="Active Cards" value={overview?.activeCards ?? 0} subtitle={`${overview?.totalCards ?? 0} ISSUED`} icon={CreditCard} />
        <StatCard title="Active Policies" value={overview?.activePolicies ?? 0} subtitle="ENFORCING SPEND CONTROLS" icon={ShieldCheck} />
      </div>

      {/* Pending approvals alert */}
      {(overview?.pendingApprovals ?? 0) > 0 && (
        <div style={{
          background: "#fffbeb", border: `1px solid #fbbf24`,
          borderRadius: "6px", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <p style={{ fontFamily: SANS, fontSize: "13px", color: "#92400e" }}>
            {overview?.pendingApprovals} transaction{overview?.pendingApprovals !== 1 ? "s" : ""} pending human approval
          </p>
          <button onClick={() => navigate("/approvals")} style={{
            fontFamily: MONO, fontSize: "10px", letterSpacing: "0.08em",
            background: "#fbbf24", border: "none", borderRadius: "3px",
            padding: "5px 12px", color: "#78350f", cursor: "pointer", fontWeight: 600,
          }}>REVIEW →</button>
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        {/* Transaction activity */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
            <div>
              <p style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: BLACK }}>Transaction activity</p>
              <p style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginTop: "2px", letterSpacing: "0.06em" }}>7-DAY VOLUME</p>
            </div>
            <button onClick={() => navigate("/transactions")} style={{
              fontFamily: MONO, fontSize: "9px", color: GOLD, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em",
            }}>VIEW ALL →</button>
          </div>
          <div style={{ height: "200px", marginTop: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="day" stroke="transparent" tick={{ fill: MUTED, fontSize: 11, fontFamily: MONO }} tickLine={false} axisLine={false} />
                <YAxis stroke="transparent" tick={{ fill: MUTED, fontSize: 11, fontFamily: MONO }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  cursor={{ stroke: GOLD, strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "6px", fontFamily: MONO, fontSize: "11px" }}
                  labelStyle={{ color: BLACK }}
                  itemStyle={{ color: GOLD }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Volume"]}
                />
                <Area type="monotone" dataKey="volume" stroke={GOLD} strokeWidth={2} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approvals summary */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px" }}>
          <p style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: BLACK, marginBottom: "4px" }}>Approvals summary</p>
          <p style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginBottom: "20px", letterSpacing: "0.06em" }}>REVIEW QUEUE</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{
              background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: "6px", padding: "16px", textAlign: "center",
            }}>
              <p style={{ fontFamily: MONO, fontSize: "10px", color: "#a16207", letterSpacing: "0.1em", marginBottom: "6px" }}>PENDING REVIEW</p>
              <p style={{ fontFamily: SERIF, fontSize: "36px", color: "#92400e", fontWeight: 400 }}>{approvals?.pendingApprovalRequests ?? 0}</p>
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
            <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "12px", textAlign: "center" }}>
              <p style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.1em", marginBottom: "4px" }}>TOTAL TRANSACTIONS</p>
              <p style={{ fontFamily: SERIF, fontSize: "22px", color: BLACK, fontWeight: 400 }}>{overview?.totalTransactions ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System health */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px" }}>
        <p style={{ fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: BLACK, marginBottom: "4px" }}>System health</p>
        <p style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginBottom: "20px", letterSpacing: "0.06em" }}>SERVICE STATUS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {healthItems.map(item => (
            <div key={item.name} style={{
              background: CREAM, border: `1px solid ${BORDER}`,
              borderRadius: "6px", padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontFamily: SANS, fontSize: "13px", color: BLACK }}>{item.name}</span>
              <span style={{
                fontFamily: MONO, fontSize: "9px", fontWeight: 600,
                padding: "2px 8px", borderRadius: "3px", letterSpacing: "0.06em",
                background: item.bg, border: `1px solid ${item.border}`, color: item.color,
              }}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
