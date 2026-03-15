import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Agents from "@/pages/Agents";
import Accounts from "@/pages/Accounts";
import Cards from "@/pages/Cards";
import Policies from "@/pages/Policies";
import Transactions from "@/pages/Transactions";
import Approvals from "@/pages/Approvals";
import Merchants from "@/pages/Merchants";
import AuditLogs from "@/pages/AuditLogs";
import Api from "@/pages/Api";
import Settings from "@/pages/Settings";
import Docs from "@/pages/Docs";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string;

function DashboardRouter() {
  return (
    <AuthGuard>
      <AppLayout>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/agents" component={Agents} />
          <Route path="/accounts" component={Accounts} />
          <Route path="/cards" component={Cards} />
          <Route path="/policies" component={Policies} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/approvals" component={Approvals} />
          <Route path="/merchants" component={Merchants} />
          <Route path="/audit-logs" component={AuditLogs} />
          <Route path="/api" component={Api} />
          <Route path="/settings" component={Settings} />
        </Switch>
      </AppLayout>
    </AuthGuard>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/docs" component={Docs} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/:rest*" component={DashboardRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "light",
          accentColor: "#c4923a",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;
