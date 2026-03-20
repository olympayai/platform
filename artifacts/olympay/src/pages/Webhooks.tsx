import { useState, useEffect, useCallback } from "react";
import {
  Webhook, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check,
  Zap, CheckCircle2, XCircle, Clock, Globe,
} from "lucide-react";
import {
  PageHeader, TablePanel, TableHead, TR, TD, TableEmpty,
  Modal, Field, Input, ModalActions,
  MUTED, MONO, BLACK, CREAM, BORDER, GOLD,
} from "@/components/ui/page-shell";
import { formatDate } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";

const SANS = "'DM Sans', sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";

const ALL_EVENTS = [
  { value: "transaction.completed", label: "Transaction Completed", color: "#16a34a" },
  { value: "transaction.denied",    label: "Transaction Denied",    color: "#dc2626" },
  { value: "transaction.review",    label: "Transaction Review",    color: "#d97706" },
  { value: "approval.approved",     label: "Approval Approved",     color: "#16a34a" },
  { value: "approval.rejected",     label: "Approval Rejected",     color: "#dc2626" },
];

function StatusDot({ code }: { code?: string | null }) {
  if (!code) return <span style={{ fontFamily: MONO, fontSize: "10px", color: MUTED }}>Never fired</span>;
  const ok = code === "200" || code === "201" || code === "204";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      {ok
        ? <CheckCircle2 size={12} color="#16a34a" />
        : <XCircle size={12} color="#dc2626" />
      }
      <span style={{ fontFamily: MONO, fontSize: "10px", color: ok ? "#16a34a" : "#dc2626" }}>
        HTTP {code}
      </span>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: MUTED, display: "flex", alignItems: "center" }}
    >
      {copied ? <Check size={11} color={GOLD} /> : <Copy size={11} />}
    </button>
  );
}

function EventPill({ event }: { event: string }) {
  const meta = ALL_EVENTS.find(e => e.value === event);
  const color = meta?.color ?? "#78716c";
  return (
    <span style={{
      fontFamily: MONO, fontSize: "8px", letterSpacing: "0.06em", textTransform: "uppercase",
      color, background: `${color}18`, border: `1px solid ${color}33`,
      borderRadius: "3px", padding: "2px 6px", display: "inline-block", marginRight: "4px", marginBottom: "3px",
    }}>{event.replace(".", " / ")}</span>
  );
}

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function Webhooks() {
  const { getAccessToken } = usePrivy();
  const [hooks, setHooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "transaction.completed", "transaction.denied", "transaction.review",
  ]);

  const fetchHooks = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/api/v1/webhooks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHooks(data.data || []);
    } catch {
      setHooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => { fetchHooks(); }, [fetchHooks]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      const token = await getAccessToken();
      await fetch(`${BASE_URL}/api/v1/webhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          url: fd.get("url"),
          description: fd.get("description") || undefined,
          events: selectedEvents,
        }),
      });
      setIsOpen(false);
      setSelectedEvents(["transaction.completed", "transaction.denied", "transaction.review"]);
      await fetchHooks();
    } finally {
      setIsPending(false);
    }
  };

  const toggleHook = async (id: string, current: boolean) => {
    const token = await getAccessToken();
    await fetch(`${BASE_URL}/api/v1/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !current }),
    });
    await fetchHooks();
  };

  const deleteHook = async (id: string) => {
    if (!confirm("Delete this webhook? This cannot be undone.")) return;
    const token = await getAccessToken();
    await fetch(`${BASE_URL}/api/v1/webhooks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchHooks();
  };

  const toggleEvent = (ev: string) => {
    setSelectedEvents(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  const filtered = hooks.filter(h =>
    h.url.toLowerCase().includes(search.toLowerCase()) ||
    (h.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const addBtn = (
    <button
      onClick={() => setIsOpen(true)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "7px 16px",
        fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em",
        fontWeight: 600, textTransform: "uppercase", cursor: "pointer",
        background: GOLD, color: BLACK,
        border: `1px solid ${GOLD}`, borderRadius: "4px",
      }}
    >
      <Plus size={11} /> Add Webhook
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Webhooks"
        subtitle="Receive real-time notifications when transactions are processed by the protocol engine."
        action={addBtn}
      />

      {/* Protocol context banner */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: "14px",
        background: BLACK, borderRadius: "8px", padding: "16px 20px", marginBottom: "24px",
        border: `1px solid ${GOLD}33`,
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
          background: `${GOLD}22`, border: `1px solid ${GOLD}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Zap size={14} color={GOLD} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 600 }}>
              How it works
            </span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: "12px", color: "#a8a29e", lineHeight: 1.6, margin: 0 }}>
            Every time your agent submits a transaction, the Olympay Payment Protocol evaluates it in real-time.
            The result — <span style={{ color: "#16a34a" }}>ALLOW</span>, <span style={{ color: "#dc2626" }}>DENY</span>, or <span style={{ color: "#d97706" }}>REVIEW</span> — is instantly
            pushed to all active webhooks via signed HTTP POST. Verify each payload using the <code style={{ fontFamily: MONO, fontSize: "10px", color: GOLD }}>X-Olympay-Signature</code> header.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { label: "Total",  value: hooks.length,                       color: "#78716c", bg: "#f5f5f4", border: "#d6d3d1" },
          { label: "Active", value: hooks.filter(h => h.isActive).length,  color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "Paused", value: hooks.filter(h => !h.isActive).length, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
        ].map(item => (
          <div key={item.label} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "12px 24px", minWidth: "80px",
            background: item.bg, border: `1px solid ${item.border}`, borderRadius: "6px",
          }}>
            <span style={{ fontFamily: SERIF, fontSize: "24px", fontWeight: 400, color: item.color, lineHeight: 1 }}>{item.value}</span>
            <span style={{ fontFamily: MONO, fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: item.color, marginTop: "4px", opacity: 0.8 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <TablePanel search={search} onSearch={setSearch} placeholder="Search by URL or description...">
        <TableHead cols={[
          { label: "Endpoint" },
          { label: "Events" },
          { label: "Last Response" },
          { label: "Last Fired", right: true },
          { label: "Status", right: true },
          { label: "", right: true },
        ]} />
        <tbody>
          {isLoading ? (
            <TableEmpty colSpan={6} message="Loading webhooks..." />
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={6} message={hooks.length === 0 ? "No webhooks yet. Add one to start receiving events." : "No results found."} />
          ) : (
            filtered.map(hook => (
              <TR key={hook.id}>
                <TD>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Globe size={11} color={hook.isActive ? "#16a34a" : MUTED} />
                    <span style={{ fontFamily: MONO, fontSize: "11px", color: BLACK, wordBreak: "break-all" }}>{hook.url}</span>
                    <CopyBtn text={hook.url} />
                  </div>
                  {hook.description && (
                    <span style={{ fontFamily: SANS, fontSize: "11px", color: MUTED, marginTop: "2px", display: "block" }}>{hook.description}</span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span style={{ fontFamily: MONO, fontSize: "9px", color: MUTED }}>Secret:</span>
                    <span style={{ fontFamily: MONO, fontSize: "9px", color: MUTED }}>{hook.secret}</span>
                    <CopyBtn text={hook.secret} />
                  </div>
                </TD>
                <TD>
                  <div style={{ display: "flex", flexWrap: "wrap", maxWidth: "200px" }}>
                    {((hook.events as string[]) || []).map(ev => <EventPill key={ev} event={ev} />)}
                  </div>
                </TD>
                <TD><StatusDot code={hook.lastStatusCode} /></TD>
                <TD right muted>
                  {hook.lastFiredAt
                    ? <span style={{ fontFamily: MONO, fontSize: "10px" }}><Clock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />{formatDate(hook.lastFiredAt)}</span>
                    : <span style={{ fontFamily: MONO, fontSize: "10px", color: MUTED }}>Never</span>
                  }
                </TD>
                <TD right>
                  <button
                    onClick={() => toggleHook(hook.id, hook.isActive)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}
                    title={hook.isActive ? "Pause webhook" : "Activate webhook"}
                  >
                    {hook.isActive
                      ? <><ToggleRight size={20} color="#16a34a" /><span style={{ fontFamily: MONO, fontSize: "9px", color: "#16a34a" }}>Active</span></>
                      : <><ToggleLeft size={20} color={MUTED} /><span style={{ fontFamily: MONO, fontSize: "9px", color: MUTED }}>Paused</span></>
                    }
                  </button>
                </TD>
                <TD right>
                  <button
                    onClick={() => deleteHook(hook.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: MUTED }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                    title="Delete webhook"
                  >
                    <Trash2 size={13} />
                  </button>
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </TablePanel>

      {isOpen && (
        <Modal
          title="Add Webhook"
          subtitle="Register an endpoint to receive real-time transaction events."
          onClose={() => { setIsOpen(false); setSelectedEvents(["transaction.completed", "transaction.denied", "transaction.review"]); }}
        >
          <form onSubmit={onSubmit}>
            <Field label="Endpoint URL">
              <Input name="url" type="url" required placeholder="https://your-app.com/webhooks/olympay" />
            </Field>
            <Field label="Description (Optional)">
              <Input name="description" placeholder="e.g. Production event handler" />
            </Field>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: "10px" }}>
                Events to Subscribe
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {ALL_EVENTS.map(ev => (
                  <label key={ev.value} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev.value)}
                      onChange={() => toggleEvent(ev.value)}
                      style={{ accentColor: GOLD, width: "14px", height: "14px" }}
                    />
                    <EventPill event={ev.value} />
                    <span style={{ fontFamily: SANS, fontSize: "12px", color: BLACK }}>{ev.label}</span>
                  </label>
                ))}
              </div>
              {selectedEvents.length === 0 && (
                <p style={{ fontFamily: MONO, fontSize: "10px", color: "#dc2626", marginTop: "8px" }}>Select at least one event.</p>
              )}
            </div>

            <div style={{
              background: CREAM, border: `1px solid ${BORDER}`, borderRadius: "4px",
              padding: "12px 16px", marginBottom: "20px",
            }}>
              <p style={{ fontFamily: MONO, fontSize: "9px", color: MUTED, letterSpacing: "0.08em", marginBottom: "6px" }}>VERIFICATION</p>
              <p style={{ fontFamily: SANS, fontSize: "11px", color: BLACK, lineHeight: 1.5, margin: 0 }}>
                A signing secret (<code style={{ fontFamily: MONO, color: GOLD }}>whsec_...</code>) will be generated automatically.
                Use it to verify the <code style={{ fontFamily: MONO, color: GOLD }}>X-Olympay-Signature</code> header on every incoming request.
              </p>
            </div>

            <ModalActions
              onCancel={() => { setIsOpen(false); setSelectedEvents(["transaction.completed", "transaction.denied", "transaction.review"]); }}
              submitLabel={isPending ? "Registering..." : "Register Webhook"}
              disabled={isPending || selectedEvents.length === 0}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}
