import { useState } from "react";
import { useListAccounts, useCreateAccount, getListAccountsQueryKey, useListAgents } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Wallet, Search, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDate } from "@/lib/utils";

export default function Accounts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  
  const { data: accountsRes, isLoading } = useListAccounts();
  const accounts = accountsRes?.data || [];

  const { data: agentsRes } = useListAgents();
  const agents = agentsRes?.data || [];
  
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
        setIsDialogOpen(false);
      }
    }
  });

  const filteredAccounts = accounts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createAccount({
      data: {
        agentId: fd.get('agentId') as string,
        name: fd.get('name') as string,
        currency: fd.get('currency') as string || 'USD',
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center">
            <Wallet className="mr-3 h-8 w-8 text-primary" />
            Accounts
          </h1>
          <p className="text-slate-400 mt-1">Manage agent balances and ledger accounts.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> New Account
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search accounts..."
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
                <th className="px-6 py-4 font-semibold tracking-wider">Account</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Agent</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Balance</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => {
                  const agent = agents.find(a => a.id === account.agentId);
                  return (
                    <tr key={account.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{account.name}</div>
                        <div className="text-xs font-mono text-slate-500 mt-1">{account.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{agent?.name || 'Unknown Agent'}</div>
                        <div className="text-xs font-mono text-slate-500 mt-1 truncate w-32">{account.agentId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={account.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-white">
                        {formatMoney(account.balanceMinor, account.currency)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-400">
                        {formatMoney(account.availableBalanceMinor, account.currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white">Create Account</h2>
              <p className="text-sm text-slate-400 mt-1">Open a ledger account for an agent.</p>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Owner Agent</label>
                <select 
                  name="agentId"
                  required
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="" className="bg-slate-900">Select an agent...</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id} className="bg-slate-900">{a.name} ({a.id.substring(0,8)}...)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Account Name</label>
                <input 
                  name="name" 
                  required 
                  placeholder="e.g. Primary Operating Account"
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Currency</label>
                <select 
                  name="currency"
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="USD" className="bg-slate-900">USD - US Dollar</option>
                  <option value="EUR" className="bg-slate-900">EUR - Euro</option>
                  <option value="GBP" className="bg-slate-900">GBP - British Pound</option>
                </select>
              </div>
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
                  {isPending ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
