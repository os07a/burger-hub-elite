import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Behavior from "@/pages/Behavior";
import Loyalty from "@/pages/Loyalty";
import Staff from "@/pages/Staff";
import Attendance from "@/pages/Attendance";
import Payroll from "@/pages/Payroll";
import Cameras from "@/pages/Cameras";
import Products from "@/pages/Products";
import Inventory from "@/pages/Inventory";
import Suppliers from "@/pages/Suppliers";
import Archive from "@/pages/Archive";
import Profits from "@/pages/Profits";
import ProjectStatus from "@/pages/ProjectStatus";
import SalesIndicator from "@/pages/SalesIndicator";
import BusinessAdvisor from "@/pages/BusinessAdvisor";
import DeliveryApps from "@/pages/DeliveryApps";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project-status" element={<ProjectStatus />} />
            <Route path="/behavior" element={<Behavior />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/profits" element={<Profits />} />
            <Route path="/sales-indicator" element={<SalesIndicator />} />
            <Route path="/advisor" element={<BusinessAdvisor />} />
            <Route path="/delivery-apps" element={<DeliveryApps />} />
            <Route path="/messages" element={<Messages />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
