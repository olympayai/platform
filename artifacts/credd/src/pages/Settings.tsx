import { Settings as SettingsIcon, Shield, Bell, Key, Database } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure platform behaviour, security, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Shield, title: "Security", desc: "API keys, access controls, and authentication settings.", badge: "Configure" },
          { icon: Bell, title: "Notifications", desc: "Manage alerts for approvals, policy violations, and anomalies.", badge: "Configure" },
          { icon: Key, title: "API Access", desc: "Generate and manage API credentials for agents.", badge: "Manage" },
          { icon: Database, title: "Data Retention", desc: "Configure how long audit logs and transaction data are kept.", badge: "Configure" },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-white/[0.05] rounded-lg">
                <item.icon className="h-4 w-4 text-slate-400" />
              </div>
              <span className="text-[11px] text-primary border border-primary/30 bg-primary/10 rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.badge}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Platform information</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: "Version", value: "1.0.0" },
            { label: "Environment", value: "Production" },
            { label: "Region", value: "us-east-1" },
            { label: "Policy engine", value: "Dredd v1 (ALLOW / DENY / REVIEW)" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-300 font-mono text-xs">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
