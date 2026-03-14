import { useState } from "react";
import { 
  useListApprovals, 
  useApproveRequest,
  useDeclineRequest,
  getListApprovalsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Search, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function Approvals() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | undefined>('PENDING');
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'DECLINE' | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: appRes, isLoading } = useListApprovals({ status: filter });
  const approvals = appRes?.data || [];
  
  const { mutate: approve, isPending: isApproving } = useApproveRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() });
        setActiveRequest(null);
        setDecisionMode(null);
      }
    }
  });

  const { mutate: decline, isPending: isDeclining } = useDeclineRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() });
        setActiveRequest(null);
        setDecisionMode(null);
      }
    }
  });

  const filteredApps = approvals.filter(a => a.id.includes(search) || a.transactionId.includes(search));

  const onSubmitDecision = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const reason = fd.get('reason') as string;
    
    if (decisionMode === 'APPROVE') {
      approve({ id: activeRequest.id, data: { decisionReason: reason, reviewerId: 'admin_user' } });
    } else {
      decline({ id: activeRequest.id, data: { decisionReason: reason, reviewerId: 'admin_user' } });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center">
          <CheckSquare className="mr-3 h-8 w-8 text-primary" />
          Approval Workflows
        </h1>
        <p className="text-slate-400 mt-1">Human-in-the-loop review for flagged transactions.</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 bg-white/[0.02]">
          <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
            {['PENDING', 'APPROVED', 'DECLINED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === status 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search request ID..."
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
                <th className="px-6 py-4 font-semibold tracking-wider">Request ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Target Tx ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Created At</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading approvals...
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No approval requests found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-white text-xs">{app.id}</td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-xs">{app.transactionId}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap text-xs">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setActiveRequest(app); setDecisionMode('APPROVE'); }}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => { setActiveRequest(app); setDecisionMode('DECLINE'); }}
                            className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"
                            title="Decline"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeRequest && decisionMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200">
            <div className={`px-6 py-4 border-b border-white/10 ${decisionMode === 'APPROVE' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
              <h2 className={`text-xl font-bold ${decisionMode === 'APPROVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {decisionMode === 'APPROVE' ? 'Approve Transaction' : 'Decline Transaction'}
              </h2>
            </div>
            <form onSubmit={onSubmitDecision} className="p-6 space-y-4">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <p className="text-xs text-slate-400">Request ID</p>
                <p className="font-mono text-sm text-white">{activeRequest.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Reason / Note (Optional)</label>
                <textarea 
                  name="reason" 
                  rows={3}
                  placeholder="Internal note for audit log..."
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" 
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setActiveRequest(null); setDecisionMode(null); }}
                  className="px-4 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isApproving || isDeclining}
                  className={`px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all ${
                    decisionMode === 'APPROVE' 
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25' 
                      : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                  } disabled:opacity-50`}
                >
                  {isApproving || isDeclining ? 'Processing...' : `Confirm ${decisionMode === 'APPROVE' ? 'Approval' : 'Decline'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
