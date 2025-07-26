import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import { Home } from '@/pages/Home';
import { Marketplace } from '@/pages/Marketplace';
import { Properties } from '@/pages/Properties';
import { Dashboard } from '@/pages/Dashboard';
import { VendorOrders } from '@/pages/VendorOrders';
import { LandownerAnalytics } from '@/pages/LandownerAnalytics';
import AddProduct from '@/pages/AddProduct';
import AddProperty from '@/pages/AddProperty';
import { CartProvider } from '@/contexts/CartContext';
import { LeaseRequests } from '@/pages/LeaseRequests';
import { Orders } from '@/pages/Orders';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Toaster />
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                  <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/vendor/orders" element={<ProtectedRoute><VendorOrders /></ProtectedRoute>} />
                  <Route path="/landowner/analytics" element={<ProtectedRoute><LandownerAnalytics /></ProtectedRoute>} />
                  <Route path="/vendor/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                  <Route path="/landowner/add-property" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/lease-requests" element={<ProtectedRoute><LeaseRequests /></ProtectedRoute>} />
                </Routes>
              </main>
            </div>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
