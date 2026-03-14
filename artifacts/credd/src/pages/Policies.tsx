import { useState } from "react";
import { useListPolicies, useCreatePolicy, getListPoliciesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldCheck, Search, RefreshCw } from "lucide-react";
import { StatusBadge, PolicyTypeBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function Policies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("SPEND_LIMIT");
  const queryClient = useQueryClient();
  
  const { data: policiesRes, isLoading } = useListPolicies();
  const policies = policiesRes?.data || [];
  
  const { mutate: createPolicy, isPending: isCreating } = useCreatePolicy({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPoliciesQueryKey() });
        setIsDialogOpen(false);
      }
    }
  });

  const filteredPolicies = policies.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    let configJson = {};
    const type = fd.get('type') as any;
    
    if (type === 'SPEND_LIMIT') {
      configJson = { 
        maxAmountMinor: parseInt(fd.get('maxAmount') as string) * 100, 
        window: fd.get('window') 
      };
    } else if (type === 'MERCHANT_ALLOWLIST') {
      configJson = { merchantIds: (fd.get('merchantIds') as string).split(',').map(s=>s.trim()) };
    }

    createPolicy({
      data: {
        name: fd.get('name') as string,
        type,
        configJson,
        description: fd.get('description') as string,
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center">
            <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
            Policies
          </h1>
          <p className="text-slate-400 mt-1">Define spending rules and approval workflows.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Policy
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-white/[0.02] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Policy Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Configuration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading policies...
                  </td>
                </tr>
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No policies found.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{policy.name}</div>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{policy.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <PolicyTypeBadge type={policy.type} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={policy.status} />
                    </td>
                    <td className="px-6 py-4">
                      <pre className="text-[10px] text-slate-400 bg-black/30 p-2 rounded-lg border border-white/5 max-w-xs overflow-x-auto">
                        {JSON.stringify(policy.configJson, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white">Create Policy</h2>
              <p className="text-sm text-slate-400 mt-1">Define new rules for the transaction engine.</p>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Policy Name</label>
                <input 
                  name="name" 
                  required 
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select 
                  name="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="SPEND_LIMIT" className="bg-slate-900">Spend Limit</option>
                  <option value="MERCHANT_ALLOWLIST" className="bg-slate-900">Merchant Allowlist</option>
                  <option value="APPROVAL_REQUIRED" className="bg-slate-900">Require Human Approval</option>
                </select>
              </div>

              {selectedType === 'SPEND_LIMIT' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Amount ($)</label>
                    <input name="maxAmount" type="number" required defaultValue="1000" className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Time Window</label>
                    <select name="window" className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm">
                      <option value="daily" className="bg-slate-900">Daily</option>
                      <option value="weekly" className="bg-slate-900">Weekly</option>
                      <option value="monthly" className="bg-slate-900">Monthly</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedType === 'MERCHANT_ALLOWLIST' && (
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Allowed Merchant IDs (comma separated)</label>
                  <input name="merchantIds" required placeholder="merch_123, merch_456" className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm" />
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 disabled:opacity-50 transition-all"
                >
                  {isPending ? 'Creating...' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
