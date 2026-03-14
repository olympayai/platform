const variants: Record<string, { bg: string; color: string; border: string }> = {
  success: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  warning: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  danger:  { bg: "#fff1f2", color: "#dc2626", border: "#fecdd3" },
  neutral: { bg: "#f5f5f4", color: "#78716c", border: "#d6d3d1" },
  default: { bg: "#fef9ec", color: "#c4923a", border: "#f3d99c" },
  blue:    { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
};

function getVariant(status: string) {
  const s = status.toLowerCase();
  if (["active", "approved", "allow", "completed", "settled"].includes(s)) return "success";
  if (["pending", "review", "attempted"].includes(s)) return "warning";
  if (["suspended", "frozen", "declined", "deny", "failed", "reversed", "expired"].includes(s)) return "danger";
  if (["inactive", "closed", "terminated", "none", "disabled", "not_required"].includes(s)) return "neutral";
  return "default";
}

export function StatusBadge({ status }: { status: string }) {
  const v = variants[getVariant(status)];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: "3px",
      fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
      fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
    }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PolicyTypeBadge({ type }: { type: string }) {
  const v = variants["blue"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: "3px",
      fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
      fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
    }}>
      {type.replace(/_/g, " ")}
    </span>
  );
}
