import { useState } from "react";
import {
  useListTransactions, useAttemptTransaction, getListTransactionsQueryKey,
  useListAgents, useListAccounts, useListCards,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  Modal, Field, Input, Select, ModalActions,
  MUTED, MONO, BLACK, CREAM, BORDER, GOLD,
} from "@/components/ui/page-shell";

export default function Transactions() {
  const [isOpen, setIsOpen] = useState(false);
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
      },
    },
  });

  const filtered = transactions.filter(
    (t) => t.id.includes(search) || t.merchantId?.includes(search)
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    attemptTx({
      data: {
        agentId: fd.get("agentId") as string,
        accountId: fd.get("accountId") as string,
        cardId: (fd.get("cardId") as string) || undefined,
        merchantId: (fd.get("merchantId") as string) || undefined,
        amountMinor: parseInt(fd.get("amount") as string) * 100,
        currency: "USD",
        direction: "DEBIT",
      },
    });
  };

  const simulateBtn = (
    <button
      onClick={() => { setAttemptResult(null); setIsOpen(true); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "7px 16px",
        fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em",
        fontWeight: 600, textTransform: "uppercase", cursor: "pointer",
        background: GOLD, color: BLACK,
        border: `1px solid ${GOLD}`, borderRadius: "4px",
      }}
    >
      <Play size={11} fill={BLACK} /> Simulate
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="Audit trail of all agent spending and policy evaluations."
      />

      <TablePanel
        search={search} onSearch={setSearch} placeholder="Search by ID or merchant..."
        extra={simulateBtn}
      >
        <TableHead cols={[
          { label: "Transaction ID" }, { label: "Agent" }, { label: "Decision" },
          { label: "Status" }, { label: "Amount", right: true }, { label: "Time", right: true },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={6} message="Loading transactions..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={6} message="No transactions found." />
          ) : (
            filtered.map((tx) => {
              const agent = agents.find((a) => a.id === tx.agentId);
              return (
                <TR key={tx.id}>
                  <TD>
                    <div style={{ fontFamily: MONO, fontSize: "11px" }}>{tx.id.substring(0, 16)}...</div>
                    <div style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginTop: "2px" }}>{tx.merchantId || "Unknown"}</div>
                  </TD>
                  <TD muted>{agent?.name || "Unknown"}</TD>
                  <TD><StatusBadge status={tx.decision} /></TD>
                  <TD><StatusBadge status={tx.status} /></TD>
                  <TD right mono>
                    <span style={{ color: tx.direction === "CREDIT" ? "#16a34a" : BLACK }}>
                      {tx.direction === "CREDIT" ? "+" : "−"}{formatMoney(tx.amountMinor, tx.currency)}
                    </span>
                  </TD>
                  <TD right muted>{formatDate(tx.requestedAt)}</TD>
                </TR>
              );
            })
          )}
        </tbody>
      </TablePanel>

      {isOpen && (
        <Modal
          title="Simulate Transaction"
          subtitle="Test the policy engine against an agent."
          onClose={() => { setIsOpen(false); setAttemptResult(null); }}
        >
          {attemptResult ? (
            <div>
              {/* Result display */}
              <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <StatusBadge status={attemptResult.decision.result} />
                </div>
                <p style={{ fontFamily: MONO, fontSize: "12px", color: MUTED }}>{attemptResult.decision.reason}</p>
              </div>

              <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "16px", marginBottom: "20px" }}>
                <p style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: "12px" }}>Policy Evaluation Log</p>
                {attemptResult.decision.matchedPolicies.length === 0 ? (
                  <p style={{ fontFamily: MONO, fontSize: "11px", color: MUTED }}>No policies matched this context.</p>
                ) : (
                  attemptResult.decision.matchedPolicies.map((mp: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < attemptResult.decision.matchedPolicies.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                      <span style={{ fontFamily: MONO, fontSize: "11px", color: BLACK }}>{mp.policyType}</span>
                      <StatusBadge status={mp.outcome} />
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "16px", borderTop: `1px solid ${BORDER}` }}>
                <button onClick={() => { setIsOpen(false); setAttemptResult(null); }} style={{
                  padding: "8px 20px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.08em",
                  textTransform: "uppercase", background: BLACK, color: CREAM,
                  border: `1px solid ${BLACK}`, borderRadius: "4px", cursor: "pointer",
                }}>Close</button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <Field label="Agent">
                <Select name="agentId" required>
                  <option value="">Select an agent...</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="Account">
                  <Select name="accountId" required>
                    <option value="">Select account...</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </Select>
                </Field>
                <Field label="Card (Optional)">
                  <Select name="cardId">
                    <option value="">None</option>
                    {cards.map((c) => <option key={c.id} value={c.id}>•••• {c.last4}</option>)}
                  </Select>
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="Amount ($)">
                  <Input name="amount" type="number" required defaultValue="50" />
                </Field>
                <Field label="Merchant ID">
                  <Input name="merchantId" placeholder="e.g. stripe, aws" />
                </Field>
              </div>
              <ModalActions
                onCancel={() => setIsOpen(false)}
                submitLabel={isPending ? "Processing..." : "Run Simulation"}
                disabled={isPending}
              />
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
