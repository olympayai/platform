import { useState } from "react";
import {
  useListCards, useCreateCard, getListCardsQueryKey,
  useListAgents, useListAccounts, useToggleCardSpending,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Power } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  Modal, Field, Select, ModalActions,
  MUTED, MONO, BLACK,
} from "@/components/ui/page-shell";

export default function Cards() {
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
      },
    },
  });

  const { mutate: toggleSpending } = useToggleCardSpending({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() }) },
  });

  const filtered = cards.filter((c) => (c.last4 && c.last4.includes(search)) || c.id.includes(search));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createCard({
      data: {
        agentId: fd.get("agentId") as string,
        accountId: fd.get("accountId") as string,
        brand: fd.get("brand") as string,
        network: "credit",
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Virtual Cards"
        subtitle="Issue and control payment instruments for agents."
        action="Issue Card"
        onAction={() => setIsOpen(true)}
      />

      <TablePanel search={search} onSearch={setSearch} placeholder="Search by last 4 or ID...">
        <TableHead cols={[
          { label: "Card" }, { label: "Agent" }, { label: "Status" },
          { label: "Spending", right: true }, { label: "Created", right: true },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={5} message="Loading cards..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={5} message="No cards found." />
          ) : (
            filtered.map((card) => {
              const agent = agents.find((a) => a.id === card.agentId);
              return (
                <TR key={card.id}>
                  <TD>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        height: "28px", width: "44px", background: BLACK,
                        borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: "8px", color: "#c4923a", fontWeight: 700 }}>
                          {(card.brand || "VISA").toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontFamily: MONO, fontWeight: 600 }}>•••• {card.last4 || "****"}</div>
                        <div style={{ fontFamily: MONO, fontSize: "10px", color: MUTED }}>{card.id.substring(0, 12)}...</div>
                      </div>
                    </div>
                  </TD>
                  <TD muted>{agent?.name || "Unknown"}</TD>
                  <TD><StatusBadge status={card.status} /></TD>
                  <TD right>
                    <button
                      onClick={() => toggleSpending({ id: card.id, data: { spendingEnabled: !card.spendingEnabled } })}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "3px 10px", borderRadius: "3px",
                        fontFamily: MONO, fontSize: "9px", fontWeight: 700,
                        cursor: "pointer", border: "1px solid",
                        background: card.spendingEnabled ? "#f0fdf4" : "#f5f5f4",
                        color: card.spendingEnabled ? "#16a34a" : "#78716c",
                        borderColor: card.spendingEnabled ? "#bbf7d0" : "#d6d3d1",
                      }}
                    >
                      <Power size={10} />
                      {card.spendingEnabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </TD>
                  <TD right muted>{formatDate(card.createdAt)}</TD>
                </TR>
              );
            })
          )}
        </tbody>
      </TablePanel>

      {isOpen && (
        <Modal title="Issue Virtual Card" subtitle="Create a new payment card linked to an account." onClose={() => setIsOpen(false)}>
          <form onSubmit={onSubmit}>
            <Field label="Owner Agent">
              <Select name="agentId" required>
                <option value="">Select an agent...</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </Field>
            <Field label="Funding Account">
              <Select name="accountId" required>
                <option value="">Select an account...</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </Field>
            <Field label="Card Brand">
              <Select name="brand">
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
              </Select>
            </Field>
            <ModalActions onCancel={() => setIsOpen(false)} submitLabel={isCreating ? "Issuing..." : "Issue Card"} disabled={isCreating} />
          </form>
        </Modal>
      )}
    </div>
  );
}
