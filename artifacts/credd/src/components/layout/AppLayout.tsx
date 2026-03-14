import { ReactNode, useState } from "react";
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
  { name: "Overview", href: "/", icon: LayoutDashboard },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const title = pageTitle(location);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-[160px] flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0b0f1a]">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-white/[0.06]">
          <Activity className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
          <span className="font-bold text-base text-white tracking-tight">
            Credd <span className="text-primary">AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-2.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 group gap-2.5",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors duration-150",
                    isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#0b0f1a]/80 backdrop-blur-sm flex-shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-slate-500">Credd AI</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-white font-medium">{title}</span>
          </div>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <kbd className="ml-2 inline-flex items-center text-[10px] font-mono bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-slate-400">
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0d1117]">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
