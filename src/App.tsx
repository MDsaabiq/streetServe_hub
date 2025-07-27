import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Marketplace } from '@/pages/Marketplace';
import { Properties } from '@/pages/Properties';
import { Dashboard } from '@/pages/Dashboard';
import { VendorOrders } from '@/pages/VendorOrders';
import { LandownerAnalytics } from '@/pages/LandownerAnalytics';
import { VendorAddProduct } from '@/pages/VendorAddProduct';
import { VendorProducts } from '@/pages/VendorProducts';
import { VendorEditProduct } from '@/pages/VendorEditProduct';
import { LandownerAddProperty } from '@/pages/LandownerAddProperty';
import { LandownerProperties } from '@/pages/LandownerProperties';
import { LandownerEditProperty } from '@/pages/LandownerEditProperty';
import { CartProvider } from '@/contexts/CartContext';
import { LeaseRequests } from '@/pages/LeaseRequests';
import { Orders } from '@/pages/Orders';
import { Profile } from '@/pages/Profile';
import { Checkout } from '@/pages/Checkout';
import CartPage from '@/pages/CartPage';
import { ProductReview } from '@/pages/ProductReview';
import { ProductDetails } from '@/pages/ProductDetails';
import { Favorites } from '@/pages/Favorites';

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
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                  <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/vendor/orders" element={<ProtectedRoute><VendorOrders /></ProtectedRoute>} />
                  <Route path="/vendor/products" element={<ProtectedRoute><VendorProducts /></ProtectedRoute>} />
                  <Route path="/vendor/add-product" element={<ProtectedRoute><VendorAddProduct /></ProtectedRoute>} />
                  <Route path="/vendor/edit-product/:id" element={<ProtectedRoute><VendorEditProduct /></ProtectedRoute>} />
                  <Route path="/landowner/analytics" element={<ProtectedRoute><LandownerAnalytics /></ProtectedRoute>} />
                  <Route path="/landowner/add-property" element={<ProtectedRoute><LandownerAddProperty /></ProtectedRoute>} />
                  <Route path="/landowner/properties" element={<ProtectedRoute><LandownerProperties /></ProtectedRoute>} />
                  <Route path="/landowner/edit-property/:id" element={<ProtectedRoute><LandownerEditProperty /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/lease-requests" element={<ProtectedRoute><LeaseRequests /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/review/:productId/:orderId" element={<ProtectedRoute><ProductReview /></ProtectedRoute>} />
                  <Route path="/product/:productId" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
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
