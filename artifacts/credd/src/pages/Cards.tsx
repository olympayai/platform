import { useState } from "react";
import { 
  useListCards, 
  useCreateCard, 
  getListCardsQueryKey,
  useListAgents,
  useListAccounts,
  useToggleCardSpending
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, CreditCard, Search, RefreshCw, Power } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function Cards() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  
  const { data: cardsRes, isLoading } = useListCards();
  const cards = cardsRes?.data || [];

  const { data: agentsRes } = useListAgents();
  const agents = agentsRes?.data || [];

  const { data: accountsRes } = useListAccounts();
  const accounts = accountsRes?.data || [];
  
  const { mutate: createCard, isPending: isCreating } = useCreateCard({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
        setIsDialogOpen(false);
      }
    }
  });

  const { mutate: toggleSpending } = useToggleCardSpending({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() })
    }
  });

  const filteredCards = cards.filter(c => 
    (c.last4 && c.last4.includes(search)) || c.id.includes(search)
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createCard({
      data: {
        agentId: fd.get('agentId') as string,
        accountId: fd.get('accountId') as string,
        brand: fd.get('brand') as string,
        network: 'credit',
      }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    toggleSpending({ id, data: { spendingEnabled: !current } });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center">
            <CreditCard className="mr-3 h-8 w-8 text-primary" />
            Virtual Cards
          </h1>
          <p className="text-slate-400 mt-1">Issue and control payment instruments for agents.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Issue Card
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Last 4 or ID..."
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
                <th className="px-6 py-4 font-semibold tracking-wider">Card Details</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Owner Agent</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Spending</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading cards...
                  </td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No cards found.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const agent = agents.find(a => a.id === card.agentId);
                  return (
                    <tr key={card.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-12 bg-white/10 rounded border border-white/20 flex items-center justify-center mr-3">
                            <span className="text-[10px] font-bold text-white uppercase">{card.brand || 'VISA'}</span>
                          </div>
                          <div>
                            <div className="font-mono text-white">•••• {card.last4 || '****'}</div>
                            <div className="text-xs font-mono text-slate-500 mt-0.5">{card.id.substring(0,12)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{agent?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={card.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggle(card.id, card.spendingEnabled)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            card.spendingEnabled 
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                              : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                          }`}
                        >
                          <Power className="w-3 h-3 mr-1.5" />
                          {card.spendingEnabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {formatDate(card.createdAt)}
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
              <h2 className="text-xl font-bold text-white">Issue Virtual Card</h2>
              <p className="text-sm text-slate-400 mt-1">Create a new payment card linked to an account.</p>
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
                    <option key={a.id} value={a.id} className="bg-slate-900">{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Funding Account</label>
                <select 
                  name="accountId"
                  required
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="" className="bg-slate-900">Select an account...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id} className="bg-slate-900">{a.name} ({formatMoney(a.availableBalanceMinor)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Brand</label>
                <select 
                  name="brand"
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="visa" className="bg-slate-900">Visa</option>
                  <option value="mastercard" className="bg-slate-900">Mastercard</option>
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
                  {isPending ? 'Issuing...' : 'Issue Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
