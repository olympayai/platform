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
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Cards', href: '/cards', icon: CreditCard },
  { name: 'Policies', href: '/policies', icon: ShieldCheck },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Approvals', href: '/approvals', icon: CheckSquare },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileTerminal },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 glass-panel md:border-r border-b md:border-b-0 border-white/5 flex-shrink-0 z-10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Activity className="h-6 w-6 text-primary mr-3" />
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Credd <span className="text-primary">AI</span>
          </span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Platform
          </div>
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                  isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-xs text-slate-400 font-medium">Environment</p>
            <div className="flex items-center mt-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] mr-2"></div>
              <span className="text-sm text-white font-medium">Production</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none bg-[url('/images/fintech-bg.png')] bg-cover bg-center opacity-20 mix-blend-screen"></div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
