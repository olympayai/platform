import { useState } from "react";
import {
  useListTransactions, useAttemptTransaction, getListTransactionsQueryKey,
  useListAgents, useListAccounts, useListCards,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, ShieldCheck, ShieldX, ShieldAlert, Shield, Zap, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  Modal, Field, Input, Select, ModalActions,
  MUTED, MONO, BLACK, CREAM, BORDER, GOLD,
} from "@/components/ui/page-shell";

function ProtocolBanner() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "12px", flexWrap: "wrap",
      background: `linear-gradient(135deg, ${BLACK} 0%, #1a1a14 100%)`,
      border: `1px solid ${GOLD}33`,
      borderRadius: "8px", padding: "12px 20px",
      marginBottom: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          background: `${GOLD}22`, border: `1px solid ${GOLD}55`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Zap size={13} color={GOLD} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 600 }}>
              Olympay Payment Protocol
            </span>
            <span style={{
              fontFamily: MONO, fontSize: "8px", letterSpacing: "0.1em",
              textTransform: "uppercase", color: BLACK, fontWeight: 700,
              background: GOLD, borderRadius: "3px", padding: "2px 6px",
            }}>v1</span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: "9px", color: "#a8a29e", marginTop: "2px", display: "block" }}>
            Every transaction is evaluated in real-time by the policy engine before settlement.
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 6px #16a34a88" }} />
        <span style={{ fontFamily: MONO, fontSize: "9px", color: "#a8a29e", letterSpacing: "0.06em" }}>Engine Active</span>
        <a
          href="https://olympay.tech/protocol/v1"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: "8px", color: `${GOLD}99`, display: "flex", alignItems: "center", gap: "3px", textDecoration: "none" }}
        >
          <ExternalLink size={10} />
          <span style={{ fontFamily: MONO, fontSize: "9px" }}>spec</span>
        </a>
      </div>
    </div>
  );
}

const SANS = "'DM Sans', sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";

type DecisionFilter = "ALL" | "ALLOW" | "DENY" | "REVIEW" | "NONE";

const DECISION_TABS: { label: string; value: DecisionFilter; icon: any; color: string }[] = [
  { label: "All",     value: "ALL",    icon: Shield,      color: "#78716c" },
  { label: "Allowed", value: "ALLOW",  icon: ShieldCheck, color: "#16a34a" },
  { label: "Denied",  value: "DENY",   icon: ShieldX,     color: "#dc2626" },
  { label: "Review",  value: "REVIEW", icon: ShieldAlert, color: "#d97706" },
];

function getMerchant(tx: any): string {
  if (tx.metadataJson?.merchant) return tx.metadataJson.merchant;
  if (tx.merchantId) return tx.merchantId;
  return "Unknown";
}

function DecisionSummary({ transactions }: { transactions: any[] }) {
  const allow  = transactions.filter(t => t.decision === "ALLOW").length;
  const deny   = transactions.filter(t => t.decision === "DENY").length;
  const review = transactions.filter(t => t.decision === "REVIEW").length;
  const total  = transactions.length;

  const items = [
    { label: "Total",   value: total,  color: "#78716c", bg: "#f5f5f4",  border: "#d6d3d1" },
    { label: "Allowed", value: allow,  color: "#16a34a", bg: "#f0fdf4",  border: "#bbf7d0" },
    { label: "Denied",  value: deny,   color: "#dc2626", bg: "#fff1f2",  border: "#fecdd3" },
    { label: "Review",  value: review, color: "#d97706", bg: "#fffbeb",  border: "#fde68a" },
  ];

  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
      {items.map(item => (
        <div key={item.label} style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "12px 20px", minWidth: "80px",
          background: item.bg, border: `1px solid ${item.border}`,
          borderRadius: "6px",
        }}>
          <span style={{ fontFamily: SERIF, fontSize: "24px", fontWeight: 400, color: item.color, lineHeight: 1 }}>
            {item.value}
          </span>
          <span style={{ fontFamily: MONO, fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: item.color, marginTop: "4px", opacity: 0.8 }}>
            {item.label}
          </span>
        </div>
      ))}

      {total > 0 && (
        <div style={{
          flex: 1, minWidth: "180px", padding: "12px 20px",
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "6px",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px",
        }}>
          <span style={{ fontFamily: MONO, fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED }}>Policy Engine</span>
          <div style={{ display: "flex", gap: "4px", alignItems: "center", height: "8px", borderRadius: "4px", overflow: "hidden", background: "#f5f5f4" }}>
            {allow  > 0 && <div style={{ flex: allow,  background: "#16a34a", opacity: 0.85 }} />}
            {review > 0 && <div style={{ flex: review, background: "#d97706", opacity: 0.85 }} />}
            {deny   > 0 && <div style={{ flex: deny,   background: "#dc2626", opacity: 0.85 }} />}
          </div>
          <span style={{ fontFamily: MONO, fontSize: "9px", color: MUTED }}>
            {total > 0 ? `${Math.round((allow / total) * 100)}% passed · ${Math.round((deny / total) * 100)}% blocked` : "No data"}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Transactions() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("ALL");
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

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      getMerchant(t).toLowerCase().includes(search.toLowerCase()) ||
      (t.merchantId || "").toLowerCase().includes(search.toLowerCase());
    const matchesDecision = decisionFilter === "ALL" || t.decision === decisionFilter;
    return matchesSearch && matchesDecision;
  });

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

      <ProtocolBanner />

      <DecisionSummary transactions={transactions} />

      {/* Decision filter tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", borderBottom: `1px solid ${BORDER}`, paddingBottom: "0", overflowX: "auto", WebkitOverflowScrolling: "touch" } as any}>
        {DECISION_TABS.map(tab => {
          const Icon = tab.icon;
          const active = decisionFilter === tab.value;
          const count = tab.value === "ALL"
            ? transactions.length
            : transactions.filter(t => t.decision === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setDecisionFilter(tab.value)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "7px 14px",
                fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: "pointer", border: "none",
                borderBottom: active ? `2px solid ${tab.color}` : "2px solid transparent",
                background: "transparent",
                color: active ? tab.color : MUTED,
                fontWeight: active ? 700 : 400,
                transition: "all 0.15s",
                marginBottom: "-1px",
              }}
            >
              <Icon size={10} />
              {tab.label}
              <span style={{
                fontFamily: MONO, fontSize: "8px",
                background: active ? `${tab.color}18` : "#f5f5f4",
                color: active ? tab.color : MUTED,
                border: `1px solid ${active ? tab.color + "30" : BORDER}`,
                borderRadius: "10px", padding: "0 5px",
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      <TablePanel
        search={search} onSearch={setSearch} placeholder="Search by merchant or ID..."
        extra={simulateBtn}
      >
        <TableHead cols={[
          { label: "Merchant" },
          { label: "Agent" },
          { label: "Decision" },
          { label: "Status" },
          { label: "Amount", right: true },
          { label: "Time", right: true },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={6} message="Loading transactions..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={6} message="No transactions found." />
          ) : (
            filtered.map((tx) => {
              const agent = agents.find((a) => a.id === tx.agentId);
              const merchant = getMerchant(tx);
              const category = tx.metadataJson?.category;
              return (
                <TR key={tx.id}>
                  <TD>
                    <div style={{ fontFamily: SANS, fontSize: "13px", color: BLACK, fontWeight: 500 }}>{merchant}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontFamily: MONO, fontSize: "9px", color: MUTED }}>{tx.id.substring(0, 14)}...</span>
                      {category && (
                        <span style={{
                          fontFamily: MONO, fontSize: "8px", letterSpacing: "0.06em",
                          textTransform: "uppercase", color: MUTED,
                          background: "#f5f5f4", border: `1px solid ${BORDER}`,
                          borderRadius: "2px", padding: "1px 5px",
                        }}>{category.replace(/_/g, " ")}</span>
                      )}
                    </div>
                  </TD>
                  <TD muted>{agent?.name || "Unknown"}</TD>
                  <TD><StatusBadge status={tx.decision} /></TD>
                  <TD><StatusBadge status={tx.status} /></TD>
                  <TD right mono>
                    <span style={{ color: tx.direction === "CREDIT" ? "#16a34a" : tx.decision === "DENY" ? "#dc2626" : BLACK }}>
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
              {/* Protocol stamp */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: BLACK, borderRadius: "6px", padding: "10px 14px", marginBottom: "16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={11} color={GOLD} />
                  <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD }}>
                    Olympay Payment Protocol
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: "7px", background: GOLD, color: BLACK, borderRadius: "2px", padding: "1px 5px", fontWeight: 700 }}>v1</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {attemptResult.protocol && (
                    <span style={{ fontFamily: MONO, fontSize: "8px", color: "#78716c" }}>
                      {attemptResult.protocol.policyCount} {attemptResult.protocol.policyCount === 1 ? "policy" : "policies"} evaluated
                    </span>
                  )}
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 5px #16a34a88" }} />
                </div>
              </div>

              <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <StatusBadge status={attemptResult.decision.result} />
                </div>
                <p style={{ fontFamily: MONO, fontSize: "12px", color: MUTED }}>{attemptResult.decision.reason}</p>
                {attemptResult.protocol?.evaluatedAt && (
                  <p style={{ fontFamily: MONO, fontSize: "9px", color: "#a8a29e", marginTop: "6px" }}>
                    Evaluated at {new Date(attemptResult.protocol.evaluatedAt).toLocaleTimeString()}
                  </p>
                )}
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
