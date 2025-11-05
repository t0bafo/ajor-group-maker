import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import GroupSetup from "./pages/GroupSetup";
import InviteMembers from "./pages/InviteMembers";
import GroupDashboard from "./pages/GroupDashboard";
import JoinGroup from "./pages/JoinGroup";
import JoinViaLink from "./pages/JoinViaLink";
import GroupOverview from "./pages/GroupOverview";
import MemberDashboard from "./pages/MemberDashboard";
import RecordContribution from "./pages/RecordContribution";
import PayoutManagement from "./pages/PayoutManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/group-setup" element={<GroupSetup />} />
          <Route path="/invite-members" element={<InviteMembers />} />
          <Route path="/group-dashboard" element={<GroupDashboard />} />
          <Route path="/join-group" element={<JoinGroup />} />
          <Route path="/join/:code" element={<JoinViaLink />} />
          <Route path="/group-overview" element={<GroupOverview />} />
          <Route path="/member-dashboard" element={<MemberDashboard />} />
          <Route path="/record-contribution" element={<RecordContribution />} />
          <Route path="/payout-management" element={<PayoutManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
