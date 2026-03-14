import { 
  useGetMonitoringOverview, 
  useGetTransactionsSummary, 
  useGetApprovalsSummary,
  useGetRecentActivity
} from "@workspace/api-client-react";
import { Users, Wallet, CreditCard, ShieldCheck, ArrowLeftRight, CheckSquare, Activity, Clock } from "lucide-react";
import { formatMoney, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function StatCard({ title, value, subtitle, icon: Icon, colorClass }: any) {
  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <Icon className="h-5 w-5 text-slate-300" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-white tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: overviewRes, isLoading: loadingOverview } = useGetMonitoringOverview();
  const { data: txSummaryRes } = useGetTransactionsSummary();
  const { data: appSummaryRes } = useGetApprovalsSummary();
  const { data: recentRes } = useGetRecentActivity();

  if (loadingOverview) {
    return <div className="flex items-center justify-center h-96"><Activity className="h-8 w-8 text-primary animate-pulse" /></div>;
  }

  const overview = overviewRes?.data;
  const txSummary = txSummaryRes?.data;
  const approvals = appSummaryRes?.data;
  const recent = recentRes?.data || [];

  const chartData = txSummary ? [
    { name: 'Approved', value: txSummary.approvedTransactions, color: '#10b981' },
    { name: 'Declined', value: txSummary.declinedTransactions, color: '#f43f5e' },
    { name: 'Pending', value: txSummary.pendingTransactions, color: '#f59e0b' },
    { name: 'Review', value: txSummary.reviewPendingTransactions, color: '#3b82f6' },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Platform Overview</h1>
        <p className="text-slate-400 mt-1">Real-time monitoring of your autonomous agents' financial activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Agents" 
          value={overview?.activeAgents || 0} 
          subtitle={`${overview?.totalAgents || 0} total registered`}
          icon={Users}
          colorClass="from-blue-500 to-indigo-500"
        />
        <StatCard 
          title="Active Accounts" 
          value={overview?.activeAccounts || 0} 
          subtitle={`${overview?.totalAccounts || 0} total created`}
          icon={Wallet}
          colorClass="from-emerald-500 to-teal-500"
        />
        <StatCard 
          title="Active Cards" 
          value={overview?.activeCards || 0} 
          subtitle={`${overview?.totalCards || 0} issued`}
          icon={CreditCard}
          colorClass="from-amber-500 to-orange-500"
        />
        <StatCard 
          title="Active Policies" 
          value={overview?.activePolicies || 0} 
          subtitle={`Enforcing spend controls`}
          icon={ShieldCheck}
          colorClass="from-purple-500 to-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center">
              <ArrowLeftRight className="h-5 w-5 mr-2 text-primary" />
              Transaction Summary
            </h3>
            <div className="text-sm font-medium bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-slate-300">
              Total: {txSummary?.totalTransactions || 0}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center">
              <CheckSquare className="h-5 w-5 mr-2 text-primary" />
              Approvals
            </h3>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 blur-2xl rounded-full"></div>
              <p className="text-amber-400/80 text-sm font-medium mb-1">Pending Review</p>
              <p className="text-4xl font-display font-bold text-amber-400">{approvals?.pendingApprovalRequests || 0}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs font-medium mb-1">Approved</p>
                <p className="text-xl font-bold text-white">{approvals?.approvedApprovalRequests || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs font-medium mb-1">Declined</p>
                <p className="text-xl font-bold text-white">{approvals?.declinedApprovalRequests || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Recent Activity
          </h3>
        </div>
        <div className="space-y-4">
          {recent.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    <span className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded mr-2">{item.entityType}</span>
                    {item.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{item.entityId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <div className="text-center py-8 text-slate-500">No recent activity found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
