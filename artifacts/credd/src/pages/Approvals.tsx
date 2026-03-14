import { useState } from "react";
import {
  useListApprovals, useApproveRequest, useDeclineRequest, getListApprovalsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  Modal, Field, Textarea, ModalActions,
  MUTED, MONO, BLACK, CREAM, BORDER,
} from "@/components/ui/page-shell";

const FILTERS = ["PENDING", "APPROVED", "DECLINED"];

export default function Approvals() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("PENDING");
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [decisionMode, setDecisionMode] = useState<"APPROVE" | "DECLINE" | null>(null);
  const queryClient = useQueryClient();

  const { data: appRes, isLoading } = useListApprovals({ status: filter });
  const approvals = appRes?.data || [];

  const { mutate: approve, isPending: isApproving } = useApproveRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() });
        setActiveRequest(null); setDecisionMode(null);
      },
    },
  });

  const { mutate: decline, isPending: isDeclining } = useDeclineRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() });
        setActiveRequest(null); setDecisionMode(null);
      },
    },
  });

  const filtered = approvals.filter(
    (a) => a.id.includes(search) || a.transactionId.includes(search)
  );

  const onSubmitDecision = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const reason = fd.get("reason") as string;
    if (decisionMode === "APPROVE") {
      approve({ id: activeRequest.id, data: { decisionReason: reason, reviewerId: "admin_user" } });
    } else {
      decline({ id: activeRequest.id, data: { decisionReason: reason, reviewerId: "admin_user" } });
    }
  };

  const filterBar = (
    <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: "4px", overflow: "hidden" }}>
      {FILTERS.map((s) => (
        <button key={s} onClick={() => setFilter(s)} style={{
          padding: "6px 16px", fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em",
          fontWeight: 600, textTransform: "uppercase", cursor: "pointer", border: "none",
          borderRight: s !== "DECLINED" ? `1px solid ${BORDER}` : "none",
          background: filter === s ? BLACK : CREAM,
          color: filter === s ? "#f7f2e9" : MUTED,
          transition: "all 0.15s",
        }}>{s}</button>
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Approval Workflows"
        subtitle="Human-in-the-loop review for flagged transactions."
      />

      <TablePanel search={search} onSearch={setSearch} placeholder="Search request ID..." extra={filterBar}>
        <TableHead cols={[
          { label: "Request ID" }, { label: "Transaction ID" }, { label: "Status" },
          { label: "Created" }, { label: "Action", right: true },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={5} message="Loading approvals..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={5} message="No approval requests found." />
          ) : (
            filtered.map((app) => (
              <TR key={app.id}>
                <TD mono muted>{app.id}</TD>
                <TD mono muted>{app.transactionId}</TD>
                <TD><StatusBadge status={app.status} /></TD>
                <TD muted>{formatDate(app.createdAt)}</TD>
                <TD right>
                  {app.status === "PENDING" && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        onClick={() => { setActiveRequest(app); setDecisionMode("APPROVE"); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: "4px" }}
                        title="Approve"
                      ><CheckCircle size={18} /></button>
                      <button
                        onClick={() => { setActiveRequest(app); setDecisionMode("DECLINE"); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "4px" }}
                        title="Decline"
                      ><XCircle size={18} /></button>
                    </div>
                  )}
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </TablePanel>

      {activeRequest && decisionMode && (
        <Modal
          title={decisionMode === "APPROVE" ? "Approve Transaction" : "Decline Transaction"}
          onClose={() => { setActiveRequest(null); setDecisionMode(null); }}
          accent={decisionMode === "APPROVE" ? "#16a34a" : "#dc2626"}
        >
          <form onSubmit={onSubmitDecision}>
            <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "12px", marginBottom: "16px" }}>
              <div style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Request ID</div>
              <div style={{ fontFamily: MONO, fontSize: "12px", color: BLACK }}>{activeRequest.id}</div>
            </div>
            <Field label="Reason / Note (Optional)">
              <Textarea name="reason" rows={3} placeholder="Internal note for audit log..." />
            </Field>
            <ModalActions
              onCancel={() => { setActiveRequest(null); setDecisionMode(null); }}
              submitLabel={isApproving || isDeclining ? "Processing..." : decisionMode === "APPROVE" ? "Confirm Approval" : "Confirm Decline"}
              disabled={isApproving || isDeclining}
              danger={decisionMode === "DECLINE"}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}
