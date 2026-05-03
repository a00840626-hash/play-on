import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import OwnerDashboard from "./pages/OwnerDashboard";
import Chat from "./pages/Chat";
import { DeviceFrame } from "./components/playon/DeviceFrame";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const Root = () => {
  const done = typeof window !== "undefined" && localStorage.getItem("playon:onboarding");
  return done ? <Home /> : <Navigate to="/onboarding" replace />;
};

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return children;
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
              <Route path="/" element={<Root />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/courts" element={<Courts />} />
              <Route path="/courts/:id" element={<CourtDetail />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/matches/new" element={<NewMatch />} />
              <Route path="/matches/:id" element={<MatchDetail />} />
              <Route path="/community" element={<Community />} />
              <Route path="/chat/:connectionId" element={<RequireAuth><Chat /></RequireAuth>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DeviceFrame>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
