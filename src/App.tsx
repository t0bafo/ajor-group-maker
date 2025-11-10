import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
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
import GroupLedger from "./pages/GroupLedger";
import NotificationPreferences from "./pages/NotificationPreferences";
import NotificationHistory from "./pages/NotificationHistory";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import MobileTestPage from "./pages/MobileTestPage";
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
          <Route path="/verify-email" element={<VerifyEmail />} />
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
          <Route path="/group-ledger" element={<GroupLedger />} />
          <Route path="/notification-preferences" element={<NotificationPreferences />} />
          <Route path="/notification-history" element={<NotificationHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/mobile-test" element={<MobileTestPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
