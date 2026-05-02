import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Onboarding from "./pages/Onboarding";
import Courts from "./pages/Courts";
import CourtDetail from "./pages/CourtDetail";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import NewMatch from "./pages/NewMatch";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import OwnerDashboard from "./pages/OwnerDashboard";
import { DeviceFrame } from "./components/playon/DeviceFrame";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DeviceFrame>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/courts" element={<Courts />} />
            <Route path="/courts/:id" element={<CourtDetail />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/new" element={<NewMatch />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/owner" element={<OwnerDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DeviceFrame>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
