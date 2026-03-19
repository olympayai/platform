import { ReactNode, useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";

const GOLD = "#c4923a";
const BLACK = "#0a0a08";
const CREAM = "#f7f2e9";
const BORDER = "#d5cbbf";
const MUTED = "#3d3020";
const SERIF = "'Playfair Display', Georgia, serif";
const MONO = "'JetBrains Mono', monospace";
const SANS = "'DM Sans', sans-serif";

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => fn();
  }, []);
  return w;
}

/* ── Page header with optional action button ── */
export function PageHeader({
  title, subtitle, action, onAction,
}: { title: string; subtitle: string; action?: string; onAction?: () => void }) {
  const w = useWindowWidth();
  const isMobile = w < 640;
  return (
    <div style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "flex-start",
      justifyContent: "space-between",
      gap: isMobile ? "12px" : "0",
      paddingBottom: "24px", borderBottom: `1px solid ${BORDER}`, marginBottom: "24px",
    }}>
      <div>
        <h1 style={{ fontFamily: SERIF, fontSize: isMobile ? "22px" : "28px", fontWeight: 400, color: BLACK, marginBottom: "4px" }}>{title}</h1>
        <p style={{ fontFamily: SANS, fontSize: "13px", color: MUTED }}>{subtitle}</p>
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 18px",
            width: isMobile ? "100%" : "auto",
            justifyContent: isMobile ? "center" : "flex-start",
            fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em",
            fontWeight: 600, textTransform: "uppercase", cursor: "pointer",
            background: BLACK, color: CREAM,
            border: `1px solid ${BLACK}`, borderRadius: "4px", transition: "all 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = GOLD; (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.color = BLACK; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BLACK; (e.currentTarget as HTMLElement).style.borderColor = BLACK; (e.currentTarget as HTMLElement).style.color = CREAM; }}
        >
          <Plus size={12} /> {action}
        </button>
      )}
    </div>
  );
}

/* ── Table panel wrapper ── */
export function TablePanel({ children, search, onSearch, placeholder, extra }: {
  children: ReactNode; search?: string; onSearch?: (v: string) => void;
  placeholder?: string; extra?: ReactNode;
}) {
  const w = useWindowWidth();
  const isMobile = w < 640;
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden" }}>
      {(onSearch || extra) && (
        <div style={{
          padding: "12px 16px", borderBottom: `1px solid ${BORDER}`,
          display: "flex", flexDirection: isMobile ? "column" : "row",
          gap: "10px", alignItems: isMobile ? "stretch" : "center",
          background: CREAM,
        }}>
          {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
          {onSearch && (
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={13} color={MUTED} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={search}
                onChange={e => onSearch(e.target.value)}
                placeholder={placeholder || "Search..."}
                style={{
                  width: "100%", paddingLeft: "30px", paddingRight: "12px",
                  paddingTop: "7px", paddingBottom: "7px", boxSizing: "border-box",
                  fontFamily: SANS, fontSize: "13px", color: BLACK,
                  background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "4px",
                  outline: "none",
                }}
              />
            </div>
          )}
        </div>
      )}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as any}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? "560px" : "auto" }}>
          {children}
        </table>
      </div>
    </div>
  );
}

/* ── Standard <thead> ── */
export function TableHead({ cols }: { cols: { label: string; right?: boolean }[] }) {
  return (
    <thead>
      <tr style={{ borderBottom: `1px solid ${BORDER}`, background: CREAM }}>
        {cols.map((col) => (
          <th key={col.label} style={{
            padding: "10px 16px", textAlign: col.right ? "right" : "left",
            fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em",
            textTransform: "uppercase", color: MUTED, fontWeight: 600,
            whiteSpace: "nowrap",
          }}>{col.label}</th>
        ))}
      </tr>
    </thead>
  );
}

/* ── Standard table row ── */
export function TR({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      style={{ borderBottom: `1px solid ${BORDER}`, background: hovered ? CREAM : "#fff", transition: "background 0.1s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >{children}</tr>
  );
}

/* ── Standard table cell ── */
export function TD({ children, right, mono, muted }: { children: ReactNode; right?: boolean; mono?: boolean; muted?: boolean }) {
  return (
    <td style={{
      padding: "12px 16px", textAlign: right ? "right" : "left",
      fontFamily: mono ? MONO : SANS, fontSize: mono ? "11px" : "13px",
      color: muted ? MUTED : BLACK, verticalAlign: "middle",
      whiteSpace: right ? "nowrap" : undefined,
    }}>{children}</td>
  );
}

/* ── Empty / loading cell ── */
export function TableEmpty({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: "48px 20px", textAlign: "center", fontFamily: SANS, fontSize: "13px", color: MUTED }}>
        {message}
      </td>
    </tr>
  );
}

/* ── Modal overlay ── */
export function Modal({ title, subtitle, onClose, children, accent }: {
  title: string; subtitle?: string; onClose: () => void; children: ReactNode; accent?: string;
}) {
  const w = useWindowWidth();
  const isMobile = w < 640;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex",
      alignItems: isMobile ? "flex-end" : "center",
      justifyContent: "center",
      background: "rgba(10,10,8,0.5)",
      padding: isMobile ? "0" : "24px",
    }} onClick={onClose}>
      <div
        style={{
          background: "#fff", border: `1px solid ${BORDER}`,
          borderRadius: isMobile ? "12px 12px 0 0" : "8px",
          width: "100%", maxWidth: isMobile ? "100%" : "480px",
          overflow: "hidden",
          maxHeight: isMobile ? "90vh" : undefined,
          overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: BORDER }} />
          </div>
        )}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, background: accent ? `${accent}10` : CREAM }}>
          <h2 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 400, color: accent || BLACK }}>{title}</h2>
          {subtitle && <p style={{ fontFamily: SANS, fontSize: "12px", color: MUTED, marginTop: "2px" }}>{subtitle}</p>}
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Form field wrappers ── */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", boxSizing: "border-box",
  fontFamily: SANS, fontSize: "13px", color: BLACK,
  background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "4px",
  outline: "none", transition: "border-color 0.15s",
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...props.style }}>{children}</select>;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...inputStyle, resize: "none", ...props.style }} />;
}

/* ── Modal footer buttons ── */
export function ModalActions({ onCancel, submitLabel, disabled, danger }: {
  onCancel: () => void; submitLabel: string; disabled?: boolean; danger?: boolean;
}) {
  const w = useWindowWidth();
  const isMobile = w < 640;
  return (
    <div style={{
      display: "flex",
      flexDirection: isMobile ? "column-reverse" : "row",
      justifyContent: "flex-end", gap: "10px",
      marginTop: "24px", paddingTop: "16px", borderTop: `1px solid ${BORDER}`,
    }}>
      <button onClick={onCancel} style={{
        padding: "10px 18px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.08em",
        textTransform: "uppercase", background: "transparent", border: `1px solid ${BORDER}`,
        color: MUTED, cursor: "pointer", borderRadius: "4px", transition: "all 0.15s",
        width: isMobile ? "100%" : "auto",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BLACK; (e.currentTarget as HTMLElement).style.color = BLACK; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = MUTED; }}
      >Cancel</button>
      <button type="submit" disabled={disabled} style={{
        padding: "10px 20px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.08em",
        textTransform: "uppercase", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        background: danger ? "#dc2626" : BLACK, color: CREAM,
        border: `1px solid ${danger ? "#dc2626" : BLACK}`,
        borderRadius: "4px", opacity: disabled ? 0.5 : 1, transition: "all 0.15s",
        width: isMobile ? "100%" : "auto",
      }}>{submitLabel}</button>
    </div>
  );
}

export { GOLD, BLACK, CREAM, BORDER, MUTED, SERIF, MONO, SANS };
