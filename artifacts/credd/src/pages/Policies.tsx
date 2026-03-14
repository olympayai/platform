import { useState } from "react";
import { useListPolicies, useCreatePolicy, getListPoliciesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge, PolicyTypeBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  Modal, Field, Input, Select, ModalActions,
  MUTED, MONO, CREAM, BORDER,
} from "@/components/ui/page-shell";

export default function Policies() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("SPEND_LIMIT");
  const queryClient = useQueryClient();

  const { data: policiesRes, isLoading } = useListPolicies();
  const policies = policiesRes?.data || [];

  const { mutate: createPolicy, isPending: isCreating } = useCreatePolicy({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPoliciesQueryKey() });
        setIsOpen(false);
      },
    },
  });

  const filtered = policies.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = fd.get("type") as any;
    let configJson: any = {};
    if (type === "SPEND_LIMIT") {
      configJson = { maxAmountMinor: parseInt(fd.get("maxAmount") as string) * 100, window: fd.get("window") };
    } else if (type === "MERCHANT_ALLOWLIST") {
      configJson = { merchantIds: (fd.get("merchantIds") as string).split(",").map((s) => s.trim()) };
    }
    createPolicy({ data: { name: fd.get("name") as string, type, configJson, description: fd.get("description") as string } });
  };

  return (
    <div>
      <PageHeader
        title="Policies"
        subtitle="Define spending rules and approval workflows."
        action="Create Policy"
        onAction={() => setIsOpen(true)}
      />

      <TablePanel search={search} onSearch={setSearch} placeholder="Search policies...">
        <TableHead cols={[{ label: "Policy Name" }, { label: "Type" }, { label: "Status" }, { label: "Configuration" }]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={4} message="Loading policies..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={4} message="No policies found." />
          ) : (
            filtered.map((policy) => (
              <TR key={policy.id}>
                <TD>
                  <div style={{ fontWeight: 500 }}>{policy.name}</div>
                  <div style={{ fontSize: "11px", color: MUTED, marginTop: "2px" }}>{policy.description || "No description"}</div>
                </TD>
                <TD><PolicyTypeBadge type={policy.type} /></TD>
                <TD><StatusBadge status={policy.status} /></TD>
                <TD>
                  <pre style={{
                    fontFamily: MONO, fontSize: "10px", color: MUTED,
                    background: CREAM, border: `1px solid ${BORDER}`,
                    borderRadius: "4px", padding: "8px", maxWidth: "240px",
                    overflowX: "auto", margin: 0,
                  }}>
                    {JSON.stringify(policy.configJson, null, 2)}
                  </pre>
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </TablePanel>

      {isOpen && (
        <Modal title="Create Policy" subtitle="Define new rules for the transaction engine." onClose={() => setIsOpen(false)}>
          <form onSubmit={onSubmit}>
            <Field label="Policy Name">
              <Input name="name" required placeholder="e.g. Daily $500 Limit" />
            </Field>
            <Field label="Description">
              <Input name="description" placeholder="Optional..." />
            </Field>
            <Field label="Type">
              <Select name="type" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="SPEND_LIMIT">Spend Limit</option>
                <option value="MERCHANT_ALLOWLIST">Merchant Allowlist</option>
                <option value="APPROVAL_REQUIRED">Require Human Approval</option>
              </Select>
            </Field>

            {selectedType === "SPEND_LIMIT" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "14px", background: CREAM, border: `1px solid ${BORDER}`, borderRadius: "4px", marginBottom: "16px" }}>
                <Field label="Max Amount ($)">
                  <Input name="maxAmount" type="number" required defaultValue="1000" />
                </Field>
                <Field label="Time Window">
                  <Select name="window">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </Field>
              </div>
            )}

            {selectedType === "MERCHANT_ALLOWLIST" && (
              <div style={{ padding: "14px", background: CREAM, border: `1px solid ${BORDER}`, borderRadius: "4px", marginBottom: "16px" }}>
                <Field label="Allowed Merchant IDs (comma separated)">
                  <Input name="merchantIds" required placeholder="merch_123, merch_456" />
                </Field>
              </div>
            )}

            <ModalActions onCancel={() => setIsOpen(false)} submitLabel={isCreating ? "Creating..." : "Create Policy"} disabled={isCreating} />
          </form>
        </Modal>
      )}
    </div>
  );
}
