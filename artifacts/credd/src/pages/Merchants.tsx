import { Store, Search, Plus } from "lucide-react";

const SAMPLE_MERCHANTS = [
  { id: "mch_001", name: "AWS", category: "Cloud Services", status: "allowlisted", txCount: 142 },
  { id: "mch_002", name: "OpenAI", category: "AI Services", status: "allowlisted", txCount: 89 },
  { id: "mch_003", name: "Stripe", category: "Payments", status: "allowlisted", txCount: 67 },
  { id: "mch_004", name: "Unknown Vendor", category: "Other", status: "blocklisted", txCount: 3 },
];

export default function Merchants() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Merchants</h1>
          <p className="text-sm text-slate-500 mt-1">Manage merchant allowlists, blocklists, and spending rules.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add Merchant
        </button>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search merchants..."
            className="bg-transparent text-sm text-white placeholder:text-slate-600 outline-none flex-1"
          />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Merchant</th>
              <th className="px-5 py-3 text-left">Category</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Transactions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {SAMPLE_MERCHANTS.map((m) => (
              <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <Store className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{m.name}</p>
                      <p className="text-[11px] font-mono text-slate-600">{m.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-400">{m.category}</td>
                <td className="px-5 py-4">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                      m.status === "allowlisted"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-slate-400">{m.txCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
