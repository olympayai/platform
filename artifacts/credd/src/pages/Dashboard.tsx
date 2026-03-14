import { useGetMonitoringOverview, useGetApprovalsSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Users, Wallet, CreditCard, ShieldCheck, ArrowLeftRight, CheckSquare, Activity, Circle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateWeekData() {
  return DAYS.map((day) => ({
    day,
    volume: Math.floor(Math.random() * 4000 + 1000),
  }));
}

const weekData = generateWeekData();

function StatCard({ title, value, subtitle, icon: Icon }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/[0.05] rounded-lg">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
      </div>
      <p className="text-[13px] text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
    </div>
  );
}

const healthItems = [
  { name: "API", status: "operational", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  { name: "Policy engine", status: "operational", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  { name: "Approval queue", status: "healthy", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  { name: "Monitoring", status: "stable", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: overviewRes, isLoading } = useGetMonitoringOverview();
  const { data: appSummaryRes } = useGetApprovalsSummary();
  const { data: recentRes } = useGetRecentActivity();

  const overview = overviewRes?.data;
  const approvals = appSummaryRes?.data;
  const recent = recentRes?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="h-6 w-6 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Operational control center for AI agent spending, approvals, and platform health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/agents")}
            className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary/20"
          >
            Create Agent
          </button>
          <button
            onClick={() => navigate("/transactions")}
            className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            View Transactions
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Agents"
          value={overview?.activeAgents ?? 0}
          subtitle={`${overview?.totalAgents ?? 0} total registered`}
          icon={Users}
        />
        <StatCard
          title="Active Accounts"
          value={overview?.activeAccounts ?? 0}
          subtitle={`${overview?.totalAccounts ?? 0} total created`}
          icon={Wallet}
        />
        <StatCard
          title="Active Cards"
          value={overview?.activeCards ?? 0}
          subtitle={`${overview?.totalCards ?? 0} issued`}
          icon={CreditCard}
        />
        <StatCard
          title="Active Policies"
          value={overview?.activePolicies ?? 0}
          subtitle="Enforcing spend controls"
          icon={ShieldCheck}
        />
      </div>

      {/* Pending approvals banner (if any) */}
      {(overview?.pendingApprovals ?? 0) > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">
              {overview?.pendingApprovals} transaction{overview?.pendingApprovals !== 1 ? "s" : ""} pending human approval
            </span>
          </div>
          <button
            onClick={() => navigate("/approvals")}
            className="text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg transition-all"
          >
            Review now
          </button>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transaction activity chart */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-white">Transaction activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">7-day volume</p>
            </div>
            <button
              onClick={() => navigate("/transactions")}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </button>
          </div>
          <div className="h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="transparent"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="transparent"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#a5b4fc" }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Volume"]}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approvals summary */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Approvals summary</h3>
            <p className="text-xs text-slate-500 mt-0.5">Review queue</p>
          </div>
          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/15 rounded-lg p-4 text-center">
              <p className="text-xs text-amber-400/70 mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-amber-400">{approvals?.pendingApprovalRequests ?? 0}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3 text-center">
                <p className="text-[11px] text-slate-500 mb-1">Approved</p>
                <p className="text-lg font-bold text-white">{approvals?.approvedApprovalRequests ?? 0}</p>
              </div>
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3 text-center">
                <p className="text-[11px] text-slate-500 mb-1">Declined</p>
                <p className="text-lg font-bold text-white">{approvals?.declinedApprovalRequests ?? 0}</p>
              </div>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3 text-center">
              <p className="text-[11px] text-slate-500 mb-1">Total Transactions</p>
              <p className="text-lg font-bold text-white">{overview?.totalTransactions ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System health */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white">System health</h3>
          <p className="text-xs text-slate-500 mt-0.5">Service status</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {healthItems.map((item) => (
            <div
              key={item.name}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 flex items-center justify-between"
            >
              <span className="text-sm text-slate-300">{item.name}</span>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded border ${item.bg}`}>
                <Circle className="h-1.5 w-1.5 fill-current" />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent activity</h3>
          <div className="space-y-2">
            {recent.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5">
                      {item.entityType}
                    </span>
                    <span className="text-sm text-slate-300">{item.action.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{formatDate(item.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
