
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Properties from "./pages/Properties";
import VendorProducts from "./pages/VendorProducts";
import VendorAddProduct from "./pages/VendorAddProduct";
import VendorEditProduct from "./pages/VendorEditProduct";
import VendorOrders from "./pages/VendorOrders";
import VendorAnalytics from "./pages/VendorAnalytics";
import LandownerProperties from "./pages/LandownerProperties";
import LandownerAddProperty from "./pages/LandownerAddProperty";
import LandownerEditProperty from "./pages/LandownerEditProperty";
import LandownerAnalytics from "./pages/LandownerAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/properties" element={<Properties />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Vendor Routes */}
              <Route 
                path="/vendor/products" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorProducts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/add-product" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorAddProduct />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/edit-product/:id" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorEditProduct />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/orders" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor/analytics" 
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorAnalytics />
                  </ProtectedRoute>
                } 
              />
              
              {/* Landowner Routes */}
              <Route 
                path="/landowner/properties" 
                element={
                  <ProtectedRoute requiredRole="landowner">
                    <LandownerProperties />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/landowner/add-property" 
                element={
                  <ProtectedRoute requiredRole="landowner">
                    <LandownerAddProperty />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/landowner/edit-property/:id" 
                element={
                  <ProtectedRoute requiredRole="landowner">
                    <LandownerEditProperty />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/landowner/analytics" 
                element={
                  <ProtectedRoute requiredRole="landowner">
                    <LandownerAnalytics />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
