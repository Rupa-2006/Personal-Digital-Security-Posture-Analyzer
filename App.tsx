import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import PasswordAnalyzerPage from "./pages/PasswordAnalyzerPage";
import BreachLookupPage from "./pages/BreachLookupPage";
import AccountManagerPage from "./pages/AccountManagerPage";
import PhishingDetectorPage from "./pages/PhishingDetectorPage";
import PasswordGeneratorPage from "./pages/PasswordGeneratorPage";
import BruteForceSimPage from "./pages/BruteForceSimPage";
import DigitalFootprintPage from "./pages/DigitalFootprintPage";
import DarkWebMonitorPage from "./pages/DarkWebMonitorPage";
import BadgesPage from "./pages/BadgesPage";
import AIAdvisorPage from "./pages/AIAdvisorPage";
import SecurityReportPage from "./pages/SecurityReportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="password-analyzer" element={<PasswordAnalyzerPage />} />
            <Route path="breach-lookup" element={<BreachLookupPage />} />
            <Route path="accounts" element={<AccountManagerPage />} />
            <Route path="phishing" element={<PhishingDetectorPage />} />
            <Route path="password-gen" element={<PasswordGeneratorPage />} />
            <Route path="brute-force" element={<BruteForceSimPage />} />
            <Route path="footprint" element={<DigitalFootprintPage />} />
            <Route path="dark-web" element={<DarkWebMonitorPage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="ai-advisor" element={<AIAdvisorPage />} />
            <Route path="report" element={<SecurityReportPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
