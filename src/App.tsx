import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound.tsx";
import Courts from "./pages/Courts";
import CourtDetail from "./pages/CourtDetail";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import NewMatch from "./pages/NewMatch";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import OwnerDashboard from "./pages/OwnerDashboard";
import Chat from "./pages/Chat";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import { DeviceFrame } from "./components/playon/DeviceFrame";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const PUBLIC_PATHS = new Set(["/login", "/forgot-password", "/reset-password", "/privacy", "/terms"]);

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setOnboarded(null); return; }
    let cancelled = false;
    supabase.from("profiles").select("onboarded").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (!cancelled) setOnboarded(!!data?.onboarded); });
    return () => { cancelled = true; };
  }, [user]);

  if (loading || (user && onboarded === null)) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!onboarded && location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DeviceFrame>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
              <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/courts" element={<RequireAuth><Courts /></RequireAuth>} />
              <Route path="/courts/:id" element={<RequireAuth><CourtDetail /></RequireAuth>} />
              <Route path="/matches" element={<RequireAuth><Matches /></RequireAuth>} />
              <Route path="/matches/new" element={<RequireAuth><NewMatch /></RequireAuth>} />
              <Route path="/matches/:id" element={<RequireAuth><MatchDetail /></RequireAuth>} />
              <Route path="/community" element={<RequireAuth><Community /></RequireAuth>} />
              <Route path="/chat/:connectionId" element={<RequireAuth><Chat /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/profile/edit" element={<RequireAuth><ProfileEdit /></RequireAuth>} />
              <Route path="/owner" element={<RequireAuth><OwnerDashboard /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DeviceFrame>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
