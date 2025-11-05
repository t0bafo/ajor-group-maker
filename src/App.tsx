import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GroupSetup from "./pages/GroupSetup";
import InviteMembers from "./pages/InviteMembers";
import GroupDashboard from "./pages/GroupDashboard";
import JoinGroup from "./pages/JoinGroup";
import GroupOverview from "./pages/GroupOverview";
import MemberDashboard from "./pages/MemberDashboard";
import RecordContribution from "./pages/RecordContribution";
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
          <Route path="/setup" element={<GroupSetup />} />
          <Route path="/invite" element={<InviteMembers />} />
          <Route path="/dashboard" element={<GroupDashboard />} />
          <Route path="/join" element={<JoinGroup />} />
          <Route path="/join/overview" element={<GroupOverview />} />
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/record-contribution" element={<RecordContribution />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
