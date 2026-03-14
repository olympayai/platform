import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Agents from "@/pages/Agents";
import Accounts from "@/pages/Accounts";
import Cards from "@/pages/Cards";
import Policies from "@/pages/Policies";
import Transactions from "@/pages/Transactions";
import Approvals from "@/pages/Approvals";
import Merchants from "@/pages/Merchants";
import AuditLogs from "@/pages/AuditLogs";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function DashboardRouter() {
  return (
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
        <Route path="/settings" component={Settings} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={DashboardRouter} />
      <Route path="/agents" component={DashboardRouter} />
      <Route path="/accounts" component={DashboardRouter} />
      <Route path="/cards" component={DashboardRouter} />
      <Route path="/policies" component={DashboardRouter} />
      <Route path="/transactions" component={DashboardRouter} />
      <Route path="/approvals" component={DashboardRouter} />
      <Route path="/merchants" component={DashboardRouter} />
      <Route path="/audit-logs" component={DashboardRouter} />
      <Route path="/settings" component={DashboardRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
