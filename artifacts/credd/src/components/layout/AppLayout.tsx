import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  ShieldCheck,
  ArrowLeftRight,
  CheckSquare,
  FileTerminal,
  Store,
  Settings,
  Activity,
  Search,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Cards", href: "/cards", icon: CreditCard },
  { name: "Policies", href: "/policies", icon: ShieldCheck },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
  { name: "Merchants", href: "/merchants", icon: Store },
  { name: "Audit Logs", href: "/audit-logs", icon: FileTerminal },
  { name: "Settings", href: "/settings", icon: Settings },
];

function pageTitle(path: string): string {
  const match = navigation.find((n) => n.href === path);
  return match ? match.name : "Overview";
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const title = pageTitle(location);

  return (
    <div className="min-h-screen flex" style={{ background: "#f7f2e9" }}>
      {/* ── Sidebar (black, mirrors landing navbar) ── */}
      <aside
        className="w-[168px] flex-shrink-0 flex flex-col"
        style={{ background: "#0a0a08", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Logo → home */}
        <Link
          href="/"
          className="h-12 flex items-center px-4 gap-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Activity className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#c4923a" }} />
          <span
            className="font-semibold text-sm tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "#c4923a", letterSpacing: "0.04em" }}
          >
            CREDD AI
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-[12px] gap-2.5 rounded transition-colors duration-150",
                  isActive
                    ? "font-medium"
                    : "font-normal"
                )}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: isActive ? "#c4923a" : "rgba(229,220,200,0.5)",
                  background: isActive ? "rgba(196,146,58,0.1)" : "transparent",
                  borderLeft: isActive ? "2px solid #c4923a" : "2px solid transparent",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(229,220,200,0.85)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(229,220,200,0.5)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div
          className="p-3 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#4ade80" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "rgba(229,220,200,0.35)", letterSpacing: "0.1em" }}>
              PRODUCTION
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-12 flex items-center justify-between px-6 flex-shrink-0"
          style={{
            background: "#fff",
            borderBottom: "1px solid #d5cbbf",
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#b0a090", letterSpacing: "0.06em", textTransform: "uppercase" }}>Credd AI</span>
            <ChevronRight className="h-3.5 w-3.5" style={{ color: "#c4bcb0" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 600, color: "#0a0a08", letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</span>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors"
            style={{
              background: "#f7f2e9",
              border: "1px solid #d5cbbf",
            }}
          >
            <Search className="h-3.5 w-3.5" style={{ color: "#a09080" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#a09080" }}>Search...</span>
            <kbd style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
              background: "#ede8df", border: "1px solid #d5cbbf",
              borderRadius: "3px", padding: "1px 5px", color: "#a09080", marginLeft: "8px",
            }}>⌘K</kbd>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: "#f7f2e9" }}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
