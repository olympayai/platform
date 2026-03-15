import { useState } from "react";
import { useListAgents, getListAgentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  MUTED, MONO, GOLD, BLACK, BORDER, CREAM,
} from "@/components/ui/page-shell";

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "";

async function patchAgentStatus(id: string, status: string, token: string) {
  const res = await fetch(`${API_BASE}/api/v1/agents/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

function maskKey(key: string | null | undefined): string {
  if (!key) return "-";
  if (key.length <= 20) return key;
  return key.slice(0, 16) + "..." + key.slice(-4);
}

export default function Agents() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: agentsRes, isLoading } = useListAgents();
  const agents = agentsRes?.data || [];

  const filtered = agents.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search)
  );

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="AI agents spawned via CLI. Each agent carries its own API key and financial identity."
      />

      <div style={{
        margin: "0 0 24px",
        padding: "14px 20px",
        background: CREAM,
        border: `1px solid ${BORDER}`,
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <span style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, letterSpacing: "0.06em" }}>SPAWN AGENT</span>
        <code style={{
          fontFamily: MONO, fontSize: "12px", color: BLACK,
          background: "#f0ece3", padding: "4px 10px", borderRadius: "4px",
          border: `1px solid ${BORDER}`,
        }}>
          olympay agent create --name "My Bot" --workspace-key olympay_ws_...
        </code>
      </div>

      <TablePanel search={search} onSearch={setSearch} placeholder="Search by name or ID...">
        <TableHead cols={[
          { label: "Agent" },
          { label: "Status" },
          { label: "API Key" },
          { label: "Description" },
          { label: "Created", right: true },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={5} message="Loading agents..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={5} message="No agents found. Spawn your first agent from the CLI." />
          ) : (
            filtered.map((agent) => (
              <TR key={agent.id}>
                <TD>
                  <div style={{ fontWeight: 500 }}>{agent.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginTop: "2px" }}>{agent.id}</div>
                </TD>
                <TD><StatusBadge status={agent.status} /></TD>
                <TD>
                  {(agent as any).apiKey ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <code style={{ fontFamily: MONO, fontSize: "10px", color: BLACK }}>
                        {maskKey((agent as any).apiKey)}
                      </code>
                      <button
                        onClick={() => copyKey((agent as any).apiKey, agent.id)}
                        title="Copy API key"
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: copiedId === agent.id ? GOLD : MUTED,
                          fontFamily: MONO, fontSize: "9px", padding: "2px 4px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {copiedId === agent.id ? "COPIED" : "COPY"}
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: MUTED, fontSize: "12px" }}>-</span>
                  )}
                </TD>
                <TD muted>{agent.description || "-"}</TD>
                <TD right muted>{formatDate(agent.createdAt)}</TD>
              </TR>
            ))
          )}
        </tbody>
      </TablePanel>
    </div>
  );
}
