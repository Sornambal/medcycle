import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import UserDetails from "@/pages/UserDetails";
import Landing from "@/pages/Landing";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import RoleSelection from "@/pages/RoleSelection";
import SenderDashboard from "@/pages/SenderDashboard";
import ReceiverDashboard from "@/pages/ReceiverDashboard";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import AdminDashboard from "@/pages/AdminDashboard";

function AuthenticatedRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/" component={Landing} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      {/* Removed UserDetails route */}
      
      {/* User dashboard routes */}
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/sender/dashboard" component={SenderDashboard} />
      <Route path="/receiver/dashboard" component={ReceiverDashboard} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation/:orderId" component={OrderConfirmation} />
      
      {/* Catch-all route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AuthenticatedRouter />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
