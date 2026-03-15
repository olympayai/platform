import { useState } from "react";
import { useListAuditLogs } from "@workspace/api-client-react";
import { formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  MUTED, MONO, BLACK, CREAM, BORDER, GOLD,
} from "@/components/ui/page-shell";

export default function AuditLogs() {
  const [search, setSearch] = useState("");

  const { data: logsRes, isLoading } = useListAuditLogs({ limit: 100 });
  const logs = logsRes?.data || [];

  const filtered = logs.filter(
    (l) => l.entityId.includes(search) || l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable record of all system events and modifications."
      />

      <TablePanel search={search} onSearch={setSearch} placeholder="Search by action or entity ID...">
        <TableHead cols={[
          { label: "Timestamp" }, { label: "Action" }, { label: "Entity" }, { label: "Actor" },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={4} message="Loading audit trail..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={4} message="No logs found." />
          ) : (
            filtered.map((log) => (
              <TR key={log.id}>
                <TD muted>{formatDate(log.createdAt)}</TD>
                <TD>
                  <span style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "2px 8px", borderRadius: "3px",
                    fontFamily: MONO, fontSize: "9px", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    background: CREAM, border: `1px solid ${BORDER}`, color: GOLD,
                  }}>
                    {log.action}
                  </span>
                </TD>
                <TD>
                  <div style={{ fontFamily: MONO, fontSize: "11px", color: BLACK }}>{log.entityType}</div>
                  <div style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginTop: "2px" }}>{log.entityId}</div>
                </TD>
                <TD>
                  <div style={{ fontSize: "12px", color: MUTED }}>{log.actorType}</div>
                  {log.actorId && <div style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginTop: "2px" }}>{log.actorId}</div>}
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </TablePanel>
    </div>
  );
}
