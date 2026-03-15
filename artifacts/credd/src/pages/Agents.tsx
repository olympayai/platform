import { useState } from "react";
import { useListAgents, useCreateAgent, getListAgentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  Modal, Field, Input, Select, Textarea, ModalActions,
  MUTED, MONO,
} from "@/components/ui/page-shell";

export default function Agents() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: agentsRes, isLoading } = useListAgents();
  const agents = agentsRes?.data || [];

  const { mutate: createAgent, isPending: isCreating } = useCreateAgent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() });
        setIsOpen(false);
      },
    },
  });

  const filtered = agents.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search)
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createAgent({
      data: {
        name: fd.get("name") as string,
        status: (fd.get("status") as any) || "pending",
        description: fd.get("description") as string,
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Manage AI agents and their financial identities."
        action="New Agent"
        onAction={() => setIsOpen(true)}
      />

      <TablePanel search={search} onSearch={setSearch} placeholder="Search by name or ID...">
        <TableHead cols={[
          { label: "Agent" }, { label: "Status" }, { label: "Description" }, { label: "Created", right: true },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={4} message="Loading agents..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={4} message="No agents found." />
          ) : (
            filtered.map((agent) => (
              <TR key={agent.id}>
                <TD>
                  <div style={{ fontWeight: 500 }}>{agent.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginTop: "2px" }}>{agent.id}</div>
                </TD>
                <TD><StatusBadge status={agent.status} /></TD>
                <TD muted>{agent.description || "-"}</TD>
                <TD right muted>{formatDate(agent.createdAt)}</TD>
              </TR>
            ))
          )}
        </tbody>
      </TablePanel>

      {isOpen && (
        <Modal title="Register New Agent" subtitle="Create a financial identity for an AI." onClose={() => setIsOpen(false)}>
          <form onSubmit={onSubmit}>
            <Field label="Agent Name">
              <Input name="name" required placeholder="e.g. TradingBot-Alpha" />
            </Field>
            <Field label="Initial Status">
              <Select name="status">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
            <Field label="Description (Optional)">
              <Textarea name="description" rows={3} placeholder="What does this agent do?" />
            </Field>
            <ModalActions onCancel={() => setIsOpen(false)} submitLabel={isCreating ? "Creating..." : "Create Agent"} disabled={isCreating} />
          </form>
        </Modal>
      )}
    </div>
  );
}
