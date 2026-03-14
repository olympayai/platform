import { useState } from "react";
import { useListAuditLogs } from "@workspace/api-client-react";
import { FileTerminal, Search, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  
  const { data: logsRes, isLoading } = useListAuditLogs({ limit: 100 });
  const logs = logsRes?.data || [];

  const filteredLogs = logs.filter(l => 
    l.entityId.includes(search) || 
    l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center">
          <FileTerminal className="mr-3 h-8 w-8 text-primary" />
          Audit Logs
        </h1>
        <p className="text-slate-400 mt-1">Immutable record of all system events and modifications.</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by action or entity ID..."
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
                <th className="px-6 py-4 font-semibold tracking-wider">Timestamp</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Action</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Entity</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap text-xs">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium bg-white/5 text-primary border border-white/10">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-mono text-xs">{log.entityType}</div>
                      <div className="text-slate-500 font-mono text-[10px] mt-0.5">{log.entityId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-400 text-xs">{log.actorType}</div>
                      {log.actorId && <div className="text-slate-500 font-mono text-[10px] mt-0.5">{log.actorId}</div>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
