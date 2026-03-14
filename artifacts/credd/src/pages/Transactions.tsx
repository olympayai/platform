import { useState } from "react";
import { 
  useListTransactions, 
  useAttemptTransaction, 
  getListTransactionsQueryKey,
  useListAgents,
  useListAccounts,
  useListCards
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, ArrowLeftRight, Search, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDate } from "@/lib/utils";

export default function Transactions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [attemptResult, setAttemptResult] = useState<any>(null);
  
  const queryClient = useQueryClient();
  
  const { data: txRes, isLoading } = useListTransactions();
  const transactions = txRes?.data || [];

  const { data: agentsRes } = useListAgents();
  const agents = agentsRes?.data || [];
  
  const { data: accRes } = useListAccounts();
  const accounts = accRes?.data || [];

  const { data: cardsRes } = useListCards();
  const cards = cardsRes?.data || [];
  
  const { mutate: attemptTx, isPending } = useAttemptTransaction({
    mutation: {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        setAttemptResult(res.data);
      }
    }
  });

  const filteredTxs = transactions.filter(t => t.id.includes(search) || t.merchantId?.includes(search));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    attemptTx({
      data: {
        agentId: fd.get('agentId') as string,
        accountId: fd.get('accountId') as string,
        cardId: fd.get('cardId') as string || undefined,
        merchantId: fd.get('merchantId') as string || 'test_merchant',
        amountMinor: parseInt(fd.get('amount') as string) * 100,
        currency: 'USD',
        direction: 'DEBIT'
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center">
            <ArrowLeftRight className="mr-3 h-8 w-8 text-primary" />
            Transactions
          </h1>
          <p className="text-slate-400 mt-1">Audit trail of all agent spending and policy evaluations.</p>
        </div>
        <button 
          onClick={() => { setAttemptResult(null); setIsDialogOpen(true); }}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2.5 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all flex items-center"
        >
          <Play className="mr-2 h-4 w-4 fill-current" /> Simulate Attempt
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Merchant..."
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
                <th className="px-6 py-4 font-semibold tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Agent</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Engine Decision</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Final Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const agent = agents.find(a => a.id === tx.agentId);
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-white text-xs">{tx.id}</div>
                        <div className="text-xs text-slate-500 mt-1">{tx.merchantId || 'Unknown Merch'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300 font-medium">{agent?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={tx.decision} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-white">
                        {tx.direction === 'CREDIT' ? '+' : '-'}{formatMoney(tx.amountMinor, tx.currency)}
                      </td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap text-xs">
                        {formatDate(tx.requestedAt)}
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
          <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200 relative">
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-accent/20 to-transparent">
              <h2 className="text-xl font-bold text-white flex items-center"><Play className="w-5 h-5 mr-2 text-accent fill-current"/> Simulate Transaction</h2>
              <p className="text-sm text-slate-400 mt-1">Test the policy engine against an agent.</p>
            </div>
            
            {attemptResult ? (
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                    <StatusBadge status={attemptResult.decision.result} className="text-base px-4 py-1" />
                  </div>
                  <h3 className="text-lg font-medium text-white">{attemptResult.decision.reason}</h3>
                </div>
                
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Policy Evaluation Log</p>
                  <div className="space-y-2">
                    {attemptResult.decision.matchedPolicies.map((mp: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-300 font-mono text-xs">{mp.policyType}</span>
                        <StatusBadge status={mp.outcome} />
                      </div>
                    ))}
                    {attemptResult.decision.matchedPolicies.length === 0 && (
                      <div className="text-sm text-slate-500 italic">No policies matched this context.</div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
                  >
                    Close Simulator
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Agent</label>
                  <select name="agentId" required className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all">
                    <option value="" className="bg-slate-900">Select an agent...</option>
                    {agents.map(a => <option key={a.id} value={a.id} className="bg-slate-900">{a.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Account</label>
                    <select name="accountId" required className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all">
                      <option value="" className="bg-slate-900">Select account...</option>
                      {accounts.map(a => <option key={a.id} value={a.id} className="bg-slate-900">{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Card (Optional)</label>
                    <select name="cardId" className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all">
                      <option value="" className="bg-slate-900">None</option>
                      {cards.map(c => <option key={c.id} value={c.id} className="bg-slate-900">...{c.last4}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($)</label>
                    <input name="amount" type="number" required defaultValue="50" className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Merchant ID</label>
                    <input name="merchantId" defaultValue="aws_cloud" className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
                  </div>
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
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 transition-all"
                  >
                    {isPending ? 'Processing...' : 'Run Simulation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
