import { useState } from "react";
import { useListAccounts, useCreateAccount, getListAccountsQueryKey, useListAgents } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  Modal, Field, Input, Select, ModalActions,
  MUTED, MONO,
} from "@/components/ui/page-shell";

export default function Accounts() {
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
      },
    },
  });

  const filtered = accounts.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search)
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createAccount({
      data: {
        agentId: fd.get("agentId") as string,
        name: fd.get("name") as string,
        currency: (fd.get("currency") as string) || "USD",
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Manage agent balances and ledger accounts."
        action="New Account"
        onAction={() => setIsOpen(true)}
      />

      <TablePanel search={search} onSearch={setSearch} placeholder="Search accounts...">
        <TableHead cols={[
          { label: "Account" }, { label: "Agent" }, { label: "Status" },
          { label: "Balance", right: true }, { label: "Available", right: true },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={5} message="Loading accounts..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={5} message="No accounts found." />
          ) : (
            filtered.map((account) => {
              const agent = agents.find((a) => a.id === account.agentId);
              return (
                <TR key={account.id}>
                  <TD>
                    <div style={{ fontWeight: 500 }}>{account.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginTop: "2px" }}>{account.id}</div>
                  </TD>
                  <TD muted>{agent?.name || "Unknown Agent"}</TD>
                  <TD><StatusBadge status={account.status} /></TD>
                  <TD right mono>{formatMoney(account.balanceMinor, account.currency)}</TD>
                  <TD right mono>
                    <span style={{ color: "#16a34a" }}>{formatMoney(account.availableBalanceMinor, account.currency)}</span>
                  </TD>
                </TR>
              );
            })
          )}
        </tbody>
      </TablePanel>

      {isOpen && (
        <Modal title="Create Account" subtitle="Open a ledger account for an agent." onClose={() => setIsOpen(false)}>
          <form onSubmit={onSubmit}>
            <Field label="Owner Agent">
              <Select name="agentId" required>
                <option value="">Select an agent...</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Account Name">
              <Input name="name" required placeholder="e.g. Primary Operating Account" />
            </Field>
            <Field label="Currency">
              <Select name="currency">
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </Select>
            </Field>
            <ModalActions onCancel={() => setIsOpen(false)} submitLabel={isCreating ? "Creating..." : "Create Account"} disabled={isCreating} />
          </form>
        </Modal>
      )}
    </div>
  );
}
