import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import olympayLogo from "@/assets/logo.png";
import { usePrivy } from "@privy-io/react-auth";
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
  Search,
  ChevronRight,
  LogOut,
  Code2,
  Menu,
  X,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

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
  { name: "Webhooks", href: "/webhooks", icon: Webhook },
  { name: "API", href: "/api", icon: Code2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

function pageTitle(path: string): string {
  const match = navigation.find((n) => n.href === path);
  return match ? match.name : "Overview";
}

function SidebarContent({
  location,
  userEmail,
  logout,
  onNav,
}: {
  location: string;
  userEmail: string;
  logout: () => void;
  onNav?: () => void;
}) {
  return (
    <>
      {/* Logo → home */}
      <Link
        href="/"
        onClick={onNav}
        className="h-12 flex items-center px-4 gap-2 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <img src={olympayLogo} alt="Olympay" style={{ width: "26px", height: "26px", filter: "brightness(0) saturate(100%) invert(64%) sepia(53%) saturate(601%) hue-rotate(8deg) brightness(98%)", flexShrink: 0 }} />
        <span
          className="font-semibold text-sm tracking-tight"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#c4923a", letterSpacing: "0.04em" }}
        >
          OLYMPAY
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
              onClick={onNav}
              className={cn(
                "flex items-center px-3 py-2 text-[12px] gap-2.5 rounded transition-colors duration-150",
                isActive ? "font-medium" : "font-normal"
              )}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: isActive ? "#c4923a" : "rgba(229,220,200,0.85)",
                background: isActive ? "rgba(196,146,58,0.1)" : "transparent",
                borderLeft: isActive ? "2px solid #c4923a" : "2px solid transparent",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "#e5dcc8";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "rgba(229,220,200,0.85)";
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

      {/* User + logout */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {userEmail && (
          <div style={{ padding: "10px 12px 0" }}>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: "rgba(229,220,200,0.45)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}>Signed in as</p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              color: "rgba(229,220,200,0.85)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>{userEmail}</p>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 12px 12px",
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(229,220,200,0.45)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e05c5c"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(229,220,200,0.45)"; }}
        >
          <LogOut size={11} />
          Sign out
        </button>
      </div>

      {/* Status */}
      <div
        className="p-3 text-center flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#4ade80" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "rgba(229,220,200,0.7)", letterSpacing: "0.1em" }}>
            PRODUCTION
          </span>
        </div>
      </div>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const title = pageTitle(location);
  const { user, logout } = usePrivy();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 768;

  const userEmail = user?.email?.address ?? "";

  /* lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = isMobile && sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, sidebarOpen]);

  /* close sidebar on route change */
  useEffect(() => { setSidebarOpen(false); }, [location]);

  return (
    <div className="min-h-screen flex" style={{ background: "#f7f2e9" }}>

      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <aside
          className="w-[168px] flex-shrink-0 flex flex-col"
          style={{ background: "#0a0a08", borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          <SidebarContent location={location} userEmail={userEmail} logout={logout} />
        </aside>
      )}

      {/* ── Mobile sidebar overlay ── */}
      {isMobile && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: sidebarOpen ? "auto" : "none" }}>
          {/* Blur backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(10,10,8,0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              opacity: sidebarOpen ? 1 : 0,
              transition: "opacity 0.25s ease",
            }}
          />
          {/* Drawer */}
          <aside style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: "220px",
            background: "#0a0a08",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            display: "flex", flexDirection: "column",
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
            boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
          }}>
            <SidebarContent
              location={location}
              userEmail={userEmail}
              logout={logout}
              onNav={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-12 flex items-center justify-between px-4 flex-shrink-0"
          style={{ background: "#fff", borderBottom: "1px solid #d5cbbf" }}
        >
          {/* Left: hamburger (mobile) + breadcrumb */}
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(v => !v)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#6a5040", padding: "4px",
                  display: "flex", alignItems: "center",
                }}
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
            <div className="flex items-center gap-1.5 text-sm">
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6a5040", letterSpacing: "0.06em", textTransform: "uppercase" }}>Olympay</span>
              <ChevronRight className="h-3.5 w-3.5" style={{ color: "#9a8878" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 600, color: "#0a0a08", letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</span>
            </div>
          </div>

          {/* Search - hidden on small mobile */}
          {!isMobile && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors"
              style={{ background: "#f7f2e9", border: "1px solid #d5cbbf" }}
            >
              <Search className="h-3.5 w-3.5" style={{ color: "#6a5040" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#6a5040" }}>Search...</span>
              <kbd style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
                background: "#ede8df", border: "1px solid #d5cbbf",
                borderRadius: "3px", padding: "1px 5px", color: "#6a5040", marginLeft: "8px",
              }}>⌘K</kbd>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ background: "#f7f2e9" }}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
