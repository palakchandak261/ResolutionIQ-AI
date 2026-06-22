import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import CitizenPortal from "@/pages/citizen/index";
import NewComplaint from "@/pages/citizen/new-complaint";
import CitizenComplaintDetail from "@/pages/citizen/complaint-detail";
import GovCommandCenter from "@/pages/gov/index";
import GovComplaintDetail from "@/pages/gov/complaint-detail";
import Dashboard from "@/pages/dashboard";
import RiskAlerts from "@/pages/risk";
import Admin from "@/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/citizen" component={CitizenPortal} />
        <Route path="/citizen/complaint/new" component={NewComplaint} />
        <Route path="/citizen/complaint/:id" component={CitizenComplaintDetail} />
        <Route path="/gov" component={GovCommandCenter} />
        <Route path="/gov/complaint/:id" component={GovComplaintDetail} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/risk" component={RiskAlerts} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
