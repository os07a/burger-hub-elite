import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import CommandCenter from "@/pages/CommandCenter";
import Behavior from "@/pages/Behavior";
import Loyalty from "@/pages/Loyalty";
import StaffHub from "@/pages/StaffHub";
import Cameras from "@/pages/Cameras";
import Products from "@/pages/Products";
import MenuAnalysis from "@/pages/MenuAnalysis";
import InventoryHub from "@/pages/InventoryHub";
import SuppliersHub from "@/pages/SuppliersHub";
import Profits from "@/pages/Profits";
import DeliveryApps from "@/pages/DeliveryApps";
import SocialMedia from "@/pages/SocialMedia";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<CommandCenter />} />
              <Route path="/project-status" element={<Navigate to="/?tab=status" replace />} />
              <Route path="/sales-indicator" element={<Navigate to="/?tab=sales" replace />} />
              <Route path="/behavior" element={<Behavior />} />
              <Route path="/loyalty" element={<Loyalty />} />
              <Route path="/staff" element={<StaffHub />} />
              <Route path="/attendance" element={<Navigate to="/staff?tab=attendance" replace />} />
              <Route path="/payroll" element={<Navigate to="/staff?tab=payroll" replace />} />
              <Route path="/cameras" element={<Cameras />} />
              <Route path="/products" element={<Products />} />
              <Route path="/menu-analysis" element={<MenuAnalysis />} />
              <Route path="/inventory" element={<InventoryHub />} />
              <Route path="/opening-inventory" element={<Navigate to="/inventory?tab=opening" replace />} />
              <Route path="/suppliers" element={<SuppliersHub />} />
              <Route path="/archive" element={<Navigate to="/suppliers?tab=archive" replace />} />
              <Route path="/profits" element={<Profits />} />
              <Route path="/advisor" element={<Navigate to="/" replace />} />
              <Route path="/delivery-apps" element={<DeliveryApps />} />
              <Route path="/social-media" element={<SocialMedia />} />
              <Route path="/messages" element={<Messages />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
